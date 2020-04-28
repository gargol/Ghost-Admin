import Route from '@ember/routing/route';
import {inject as service} from '@ember/service';

export default Route.extend({
    billing: service(),

    queryParams: {
        action: {refreshModel: true}
    },

    beforeModel(transition) {
        this.billing.set('previousTransition', transition);
    },

    model(params) {
        console.log('activating billing route model');
        if (params.action) {
            this.billing.set('action', params.action);
        }

        this.billing.set('billingWindowOpen', true);
    },

    actions: {
        willTransition() {
            this.billing.set('billingWindowOpen', false);
        }
    }
});
