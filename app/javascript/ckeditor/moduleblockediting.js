import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import { toWidget } from '@ckeditor/ckeditor5-widget/src/utils';


export default class ModuleBlockEditing extends Plugin {
    static get requires() {
        return [ Widget, Clipboard ];
    }

    init() {
        this._defineSchema();
        this._defineConverters();

        // Override default paste behavior
        this.listenTo(this.editor.editing.view.document, 'clipboardInput', ( evt, data ) => {
            const dataTransfer = data.dataTransfer;

            // All of our data is in HTML, as opposed to plain text
            const htmlData = dataTransfer.getData('text/html');
            if (!htmlData) {
                return;
            }

            // Convert the HTML to a view
            const content = this.editor.plugins.get('Clipboard')._htmlDataProcessor.toView(
                htmlData,
            );

            // Fire off an event that we'll intercept below
            this.fire( 'inputTransformation', { content, dataTransfer } );

            // You have to stop the event so other handlers don't run and overwrite content.
            evt.stop();
        });

        this.listenTo(this, 'inputTransformation', ( evt, data ) => {
            const modelFragment = this.editor.data.toModel(
                data.content,
                'section', // set this so the correct converters are called
            );

            if (modelFragment.childCount == 0) {
                return; // we couldn't create a model for this view
            }

            // Add the fragment into the model
            this.editor.model.insertContent(modelFragment);
        });
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'moduleBlock', {
            isObject: true,
            allowIn: 'section',
            allowAttribute: [ 'blockClasses' ],
        } );

        // Allow question, answer, and content divs inside module-block divs.
        schema.extend( 'question', {
            allowIn: [ 'moduleBlock' ],
        } );

        schema.extend( 'answer', {
            allowIn: [ 'moduleBlock' ],
        } );

        schema.extend( 'content', {
            allowIn: [ 'moduleBlock' ],
        } );
    }

    _defineConverters() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const { editing, data, model } = editor;

        // <moduleBlock> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['module-block']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'moduleBlock', {
                    'blockClasses': viewElement.getAttribute('class') || 'module-block',
                });
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'moduleBlock',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createContainerElement( 'div', {
                    'class': modelElement.getAttribute('blockClasses') || 'module-block',
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'moduleBlock',
            view: ( modelElement, viewWriter ) => {
                const moduleBlock = viewWriter.createContainerElement( 'div', {
                    'class': modelElement.getAttribute('blockClasses') || 'module-block',
                } );

                return toWidget( moduleBlock, viewWriter, { label: 'module-block widget', hasSelectionHandle: true } );
            }
        } );
    }
}
