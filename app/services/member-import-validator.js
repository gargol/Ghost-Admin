import MemberImportError from 'ghost-admin/errors/member-import-error';
import Service, {inject as service} from '@ember/service';
import validator from 'validator';
import {isEmpty} from '@ember/utils';

export default Service.extend({
    ajax: service(),
    membersUtils: service(),
    ghostPaths: service(),

    async check(data) {
        if (!data || !data.length) {
            return [new MemberImportError('File is empty, nothing to import. Please select a different file.')];
        }

        let sampledData = this._sampleData(data);
        let mapping = this._detectDataTypes(sampledData);

        let validationResults = [];

        const hasStripeId = !!mapping.stripe_customer_id;

        // check can be done on whole set as it won't be too slow
        const emailValidation = this._checkEmails(data);

        if (emailValidation !== true) {
            validationResults.push(new MemberImportError('Emails in provided data don\'t appear to be valid email addresses.'));
        }

        if (hasStripeId) {
            // check can be done on whole set as it won't be too slow
            if (!this.membersUtils.isStripeEnabled) {
                validationResults.push(new MemberImportError(`<strong>Missing Stripe connection</strong><br>You need to <a href="#/settings/labs">connect to Stripe</a> to import Stripe customers.`));
            } else {
                let stripeSeverValidation = await this._checkStripeServer(sampledData);
                if (stripeSeverValidation !== true) {
                    validationResults.push(new MemberImportError(`<strong>Wrong Stripe account</strong><br>The CSV contains Stripe customers from a different Stripe account. Make sure you're connected to the correct <a href="#/settings/labs">Stripe account</a>.`));
                }
            }
        }

        if (validationResults.length) {
            return validationResults;
        } else {
            return true;
        }
    },

    /**
     * Method implements foollowing sampling logic:
     * Locate 10 non-empty cells from the start/middle(ish)/end of each column (30 non-empty values in total).
     * If the data contains 30 rows or fewer, all rows should be validated.
     *
     * @param {Array} data JSON objects mapped from CSV file
     */
    _sampleData(data, validationSampleSize = 30) {
        let validatedSet = [{}];

        if (data && data.length > validationSampleSize) {
            let sampleKeys = Object.keys(data[0]);

            sampleKeys.forEach(function (key) {
                const nonEmptyKeyEntries = data.filter(entry => !isEmpty(entry[key]));
                let sampledEntries = [];

                if (nonEmptyKeyEntries.length <= validationSampleSize) {
                    sampledEntries = nonEmptyKeyEntries;
                } else {
                    // take 3 equal parts from head, tail and middle of the data set
                    const partitionSize = validationSampleSize / 3;

                    const head = data.slice(0, partitionSize);
                    const tail = data.slice((data.length - partitionSize), data.length);

                    const middleIndex = Math.floor(data.length / 2);
                    const middleStartIndex = middleIndex - 2;
                    const middleEndIndex = middleIndex + 3;
                    const middle = data.slice(middleStartIndex, middleEndIndex);

                    validatedSet.push(...head);
                    validatedSet.push(...middle);
                    validatedSet.push(...tail);
                }

                sampledEntries.forEach((entry, index) => {
                    if (!validatedSet[index]) {
                        validatedSet[index] = {};
                    }

                    validatedSet[index][key] = entry[key];
                });
            });
        } else {
            validatedSet = data;
        }

        return validatedSet;
    },

    /**
     * Detects validated data types:
     *  1. email
     *  2. stripe_customer_id
     *
     * Returned "mapping" object contains mappings that could be accepted by the API
     * to map validated types.
     * @param {Array} data sampled data containing non empty values
     */
    _detectDataTypes(data) {
        let mapping = {};
        let i = 0;
        // loopping through all sampled data until needed data types are detected
        while (i <= (data.length - 1)) {
            if (mapping.email && mapping.stripe_customer_id) {
                break;
            }

            let entry = data[i];
            for (const [key, value] of Object.entries(entry)) {
                if (!mapping.email && validator.isEmail(value)) {
                    mapping.email = key;
                    continue;
                }

                if (!mapping.stripe_customer_id && value && value.startsWith && value.startsWith('cus_')) {
                    mapping.stripe_customer_id = key;
                    continue;
                }
            }

            i += 1;
        }

        return mapping;
    },

    _containsRecordsWithStripeId(validatedSet) {
        let memberWithStripeId = validatedSet.find(m => !!(m.stripe_customer_id));
        return !!memberWithStripeId;
    },

    _checkEmails(validatedSet) {
        let result = true;

        validatedSet.forEach((member) => {
            if (!member.email) {
                result = false;
            }

            if (member.email && !validator.isEmail(member.email)) {
                result = false;
            }
        });

        return result;
    },

    _hasDuplicateStripeIds(validatedSet) {
        const customersMap = validatedSet.reduce((acc, member) => {
            if (member.stripe_customer_id && member.stripe_customer_id !== 'undefined') {
                if (acc[member.stripe_customer_id]) {
                    acc[member.stripe_customer_id] += 1;
                } else {
                    acc[member.stripe_customer_id] = 1;
                }
            }

            return acc;
        }, {});

        for (const key in customersMap) {
            if (customersMap[key] > 1) {
                return true;
            }
        }
    },

    _checkContainsStripeIDs(validatedSet) {
        let result = true;

        if (!this.membersUtils.isStripeEnabled) {
            validatedSet.forEach((member) => {
                if (member.stripe_customer_id) {
                    result = false;
                }
            });
        }

        return result;
    },

    async _checkStripeServer(validatedSet) {
        const url = this.ghostPaths.get('url').api('members/upload/validate');

        let response;
        try {
            response = await this.ajax.post(url, {
                data: {
                    members: validatedSet
                }
            });
        } catch (e) {
            return false;
        }

        if (response.errors) {
            return false;
        }

        return true;
    }
});
