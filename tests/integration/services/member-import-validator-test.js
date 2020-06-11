import Pretender from 'pretender';
import {dasherize} from '@ember/string';
import {describe, it} from 'mocha';
import {expect} from 'chai';
import {setupTest} from 'ember-mocha';

function stubCSVImportEndpoint(server) {
    server.post('/ghost/api/v3/admin/members/csv', function (request) {
        return [
            200,
            {'Content-Type': 'application/json'}
        ];
    });
}

describe('Integration: Service: member-import-validator', function () {
    setupTest();

    let server;

    beforeEach(function () {
        server = new Pretender();
    });

    afterEach(function () {
        server.shutdown();
    });

    it('checks correct data without Stripe customer', async function () {
        let service = this.owner.lookup('service:member-import-validator');

        const result = await service.check([{
            name: 'Rish',
            email: 'validemail@example.com'
        }]);

        expect(result).to.equal(true);
    });

    it('returns validation error when no data is provided', async function () {
        let service = this.owner.lookup('service:member-import-validator');

        const result = await service.check([]);

        expect(result.length).to.equal(1);
        expect(result[0].message).to.equal('No data present in selected file.');
    });

    it('returns validation error for data with invalid email', async function () {
        let service = this.owner.lookup('service:member-import-validator');

        const result = await service.check([{
            name: 'Egg',
            email: 'notAnEmail'
        }]);

        expect(result.length).to.equal(1);
        expect(result[0].message).to.equal('Emails in provided data don\'t appear to be valid email addresses.');
    });

    it('returns validation error for data with stripe_customer-id but no connected Stripe', async function () {
        let service = this.owner.lookup('service:member-import-validator');

        const result = await service.check([{
            name: 'Kevin',
            email: 'goodeamil@example.com',
            stripe_customer_id: 'cus_XXXX'
        }]);

        expect(result.length).to.equal(1);
        expect(result[0].message).to.equal('Something about stripe');
    });

    xit('calls correct endpoint and returns correct data', function (done) {
        let rawSlug = 'a test post';
        stubCSVImportEndpoint(server, 'post', rawSlug);

        let service = this.owner.lookup('service:slug-generator');

        service.generateSlug('post', rawSlug).then(function (slug) {
            expect(slug).to.equal(dasherize(rawSlug));
            done();
        });
    });
});
