import createComponentCard from '../utils/create-component-card';

export default [
    createComponentCard('hr', {hasEditMode: false, selectAfterInsert: false}),
    createComponentCard('image', {hasEditMode: false}),
    createComponentCard('markdown'),
    createComponentCard('card-markdown'), // backwards-compat with markdown editor
    createComponentCard('html'),
    createComponentCard('code'),
    createComponentCard('embed', {hasEditMode: false})
];

export const CARD_MENU = [
    {
        title: 'Basic',
        items: [{
            label: 'Markdown',
            icon: 'koenig/markdown',
            matches: ['markdown', 'md'],
            type: 'card',
            replaceArg: 'markdown'
        },
        {
            label: 'Image',
            icon: 'koenig/image',
            matches: ['image', 'img'],
            type: 'card',
            replaceArg: 'image'
        },
        {
            label: 'HTML',
            icon: 'koenig/html',
            matches: ['html'],
            type: 'card',
            replaceArg: 'html'
        },
        {
            label: 'Code Block',
            icon: 'koenig/code-block',
            matches: ['code'],
            type: 'card',
            replaceArg: 'code'
        },
        {
            label: 'Divider',
            icon: 'koenig/divider',
            matches: ['divider', 'horizontal-rule', 'hr'],
            type: 'card',
            replaceArg: 'hr'
        }]
    },
    {
        title: 'Embed',
        items: [{
            label: 'YouTube',
            icon: 'koenig/youtube',
            matches: ['youtube'],
            type: 'card',
            replaceArg: 'embed'
        },
        {
            label: 'Twitter',
            icon: 'koenig/twitter',
            matches: ['twitter'],
            type: 'card',
            replaceArg: 'embed'
        },
        {
            label: 'Facebook',
            icon: 'koenig/facebook',
            matches: ['facebook'],
            type: 'card',
            replaceArg: 'embed'
        },
        {
            label: 'SoundCloud',
            icon: 'koenig/soundcloud',
            matches: ['soundcloud'],
            type: 'card',
            replaceArg: 'embed'
        },
        {
            label: 'CodePen',
            icon: 'koenig/codepen',
            matches: ['codepen'],
            type: 'card',
            replaceArg: 'embed'
        },
        {
            label: 'Other...',
            icon: 'koenig/code-block',
            matches: ['embed'],
            type: 'card',
            replaceArg: 'embed'
        }]
    }
];
