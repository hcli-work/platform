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
            allowAttributes: [ 'blockClasses' ],
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
        } ).add( dispatcher => {
            // We need an additional attribute converter on the editingDowncast to update the module-block
            // class live in the editing view when it's changed by setAttributes. For some reason,
            // attributeToAttribute doesn't work with classes, so we use the lower-level event dispatcher.
            // See https://github.com/bebraven/platform/pull/172 if we have a chance to look into this more
            // later.
            dispatcher.on( 'attribute', ( evt, data, conversionApi ) => {
                // Ignore everything but the 'blockClasses' model attribute.
                if ( data.attributeKey !== 'blockClasses' ) {
                    return;
                }

                const viewWriter = conversionApi.writer;
                const viewElement = conversionApi.mapper.toViewElement( data.item );

                // In the model-to-view conversion we convert changes.
                // An attribute can be added or removed or changed.
                // The below code only handles adding/removing, because we don't want to delete the class.
                if ( data.attributeNewValue ) {
                    viewWriter.setAttribute( 'class', data.attributeNewValue, viewElement );
                }
            } );
        } );
    }
}
