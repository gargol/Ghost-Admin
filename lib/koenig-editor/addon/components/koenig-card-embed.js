import Component from '@ember/component';
import layout from '../templates/components/koenig-card-embed';
import {NO_CURSOR_MOVEMENT} from './koenig-editor';
import {isBlank} from '@ember/utils';
import {inject as service} from '@ember/service';
import {set} from '@ember/object';
import {task} from 'ember-concurrency';

export default Component.extend({
    ajax: service(),
    ghostPaths: service(),

    layout,

    // attrs
    payload: null,
    isSelected: false,
    isEditing: false,

    // internal properties
    hasError: false,

    // closure actions
    selectCard() {},
    deselectCard() {},
    editCard() {},
    saveCard() {},
    deleteCard() {},

    actions: {
        onSelect() {
            let input = this.element.querySelector('input');
            if (input) {
                input.focus();
            }
        },

        onDeselect() {
            this._deleteIfEmpty();
        },

        updateUrl(event) {
            let url = event.target.value;
            set(this.payload, 'url', url);
        },

        urlKeydown(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.convertUrl.perform(this.payload.url);
            }

            if (event.key === 'Escape') {
                this.deleteCard();
            }
        },

        retry() {
            this.set('hasError', false);
        },

        insertAsLink() {
            this.editor.run((postEditor) => {
                let {builder} = postEditor;
                let cardSection = this.env.postModel;
                let p = builder.createMarkupSection('p');
                let link = builder.createMarkup('a', {href: this.payload.url});

                postEditor.replaceSection(cardSection, p);
                postEditor.insertTextWithMarkup(p.toRange().head, this.payload.url, [link]);
            });
        }
    },

    convertUrl: task(function* (url) {
        if (isBlank(url)) {
            this.deleteCard();
            return;
        }

        try {
            let oembedEndpoint = this.ghostPaths.url.api('oembed');
            let response = yield this.ajax.request(oembedEndpoint, {
                data: {
                    url
                }
            });

            if (!response.html) {
                throw 'No HTML returned';
            }

            set(this.payload, 'html', response.html);
            this.saveCard(this.payload, false);
        } catch (err) {
            this.set('hasError', true);
        }
    }),

    _deleteIfEmpty() {
        if (isBlank(this.payload.html) && !this.convertUrl.isRunning) {
            this.deleteCard(NO_CURSOR_MOVEMENT);
        }
    }
});
