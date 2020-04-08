import ModalComponent from 'ghost-admin/components/modal-base';

export default ModalComponent.extend({
    init() {
        this._super(...arguments);
    },

    didInsertElement() {
        this._super(...arguments);

        console.log('mounted');
    },

    willDestroyElement() {
        this._super(...arguments);

        console.log('UNmounted');
    }
});
