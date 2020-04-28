import Service from '@ember/service';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';

export default Service.extend({
    router: service(),
    config: service(),
    ghostPaths: service(),

    billingRouteRoot: '#/billing',
    billingWindowOpen: false,
    upgrade: false,
    action: null,
    previousRoute: null,

    init() {
        this._super(...arguments);
    },

    openBillingWindow(currentRoute) {
        this.set('previousRoute', currentRoute);

        this.router.transitionTo('/billing');
    },

    closeBillingWindow() {
        this.set('billingWindowOpen', false);
        this.set('action', null);

        let transitionRoute = this.get('previousRoute') || '/';
        this.router.transitionTo(transitionRoute);
    },

    endpoint: computed('config.billingUrl', 'billingWindowOpen', 'action', function () {
        let url = this.config.get('billingUrl');

        if (this.get('upgrade')) {
            url = this.ghostPaths.url.join(url, 'plans');
        }

        if (this.get('action')) {
            url += `?action=${this.get('action')}`;
        }

        return url;
    })
});
