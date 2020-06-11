import MemberImportError from 'ghost-admin/errors/member-import-error';
import Service, {inject as service} from '@ember/service';
import validator from 'validator';

const checkEmails = (validatedSet) => {
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
};

const checkStripeLocal = (validatedSet) => {
    const isStripeConfigured = true;
    let result = true;

    if (!isStripeConfigured) {
        validatedSet.forEach((member) => {
            if (member.stripe_customer_id) {
                result = false;
            }
        });
    }

    return result;
};

const checkStripeServer = async (validatedSet) => {
    // NOTE: add server call once local Stripe validations have passed
    //       this should check if stripe_customer_ids in validatedSet exist
    //       in connected Stripe account

    // const url = this.get('ghostPaths.url').api('members/csv');
    // const response = await this.ajax.request(url);
    // if (response.errors) {
    //     return false;
    // }

    return true;
};

export default Service.extend({
    ajax: service(),

    async check(data) {
        if (!data || !data.length) {
            // TODO: double check once copies are ready
            return [new MemberImportError('No data present in selected file.')];
        }

        let validatedSet = [];
        let validationSampleSize = 15;
        let validationResults = [];

        if (data && data.length > validationSampleSize) {
            // validated data size is larger than sample size take 3
            // equal parts from head, tail and middle of the data set
            const partitionSize = validationSampleSize / 3;

            const head = data.slice(0, partitionSize);
            const tail = data.slice((data.length - partitionSize), data.length);

            const middleIndex = Math.floor(data.length / 2);
            const middleStartIndex = middleIndex - 2;
            const middleEndIndex = middleIndex + 3;
            const middle = data.slice(middleStartIndex, middleEndIndex);

            validatedSet.push(head);
            validatedSet.push(middle);
            validatedSet.push(tail);
        } else {
            validatedSet = data;
        }

        let emailValidation = checkEmails(validatedSet);
        if (emailValidation !== true) {
            validationResults.push(new MemberImportError('Emails in provided data don\'t appear to be valid email addresses.'));
        }

        let stripeLocalValidation = checkStripeLocal(validatedSet);
        if (stripeLocalValidation !== true) {
            validationResults.push(new MemberImportError('Stripe customer IDs exist in the data, but no stripe account is connected.'));
        }

        let stripeSeverValidation = await checkStripeServer(validatedSet);
        if (stripeSeverValidation !== true) {
            validationResults.push(new MemberImportError('Stripe customer IDs exist in the data, but we could not find such customer in connected Stripe account'));
        }

        if (validationResults.length) {
            return validationResults;
        } else {
            return true;
        }
    }
});
