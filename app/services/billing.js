import Service from '@ember/service';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default Service.extend({
    router: service(),
    config: service(),
    ghostPaths: service(),

    billingRouteRoot: '#/billing',
    billingWindowOpen: false,

    action: null,
    previousRoute: null,

    init() {
        this._super(...arguments);
    },

    openBillingWindow(currentRoute, childRoute) {
        this.set('previousRoute', currentRoute);

        this.router.transitionTo(childRoute || '/billing');
    },

    closeBillingWindow() {
        this.set('billingWindowOpen', false);
        this.set('action', null);

        let transitionRoute = this.get('previousRoute') || '/';
        this.router.transitionTo(transitionRoute);
    },

    endpoint: computed('config.billingUrl', 'billingWindowOpen', 'action', function () {
        let url = this.config.get('billingUrl');

        if (this.router.currentRoute && this.router.currentRoute.name === 'billing.billing-sub') {
            url += `/${this.router.currentRoute.params.sub}`;
        }

        if (this.get('action')) {
            url += `?action=${this.get('action')}`;
        }

        return url;
    })
});
