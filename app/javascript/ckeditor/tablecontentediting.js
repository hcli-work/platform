import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertTableContentCommand from './inserttablecontentcommand';

export default class TableContentEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertTableContent', new InsertTableContentCommand( this.editor ) );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'tableContent', {
            isObject: true,
            allowIn: 'section'
        } );

        schema.extend( 'slider', {
            allowIn: 'tableCell'
        } );
    }

    _defineConverters() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const { editing, data, model } = editor;

        // <tableContent> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['module-block', 'module-block-table']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'tableContent' );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'tableContent',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'div', {
                    'class': 'module-block module-block-table',
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'tableContent',
            view: ( modelElement, viewWriter ) => {
                const id = modelElement.getAttribute( 'id' );

                const tableContent = viewWriter.createContainerElement( 'div', {
                    'class': 'module-block module-block-table',
                } );

                return toWidget( tableContent, viewWriter, { label: 'table widget' } );
            }
        } );
    }
}
