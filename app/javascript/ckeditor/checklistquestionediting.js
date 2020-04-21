import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import RetainedData from './retaineddata';
import InsertChecklistQuestionCommand from './insertchecklistquestioncommand';
import InsertCheckboxCommand from './insertcheckboxcommand';
import SetAttributesCommand from './setattributescommand';
import { ALLOWED_ATTRIBUTES, filterAllowedAttributes } from './customelementattributepreservation';

export default class ChecklistQuestionEditing extends Plugin {
    static get requires() {
        return [ Widget, RetainedData ];
    }

    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertChecklistQuestion', new InsertChecklistQuestionCommand( this.editor ) );
        this.editor.commands.add( 'insertCheckbox', new InsertCheckboxCommand( this.editor ) );
        this.editor.commands.add( 'setAttributes', new SetAttributesCommand( this.editor ) );

        // Add a shortcut to the retained data ID function.
        this._nextRetainedDataId = this.editor.plugins.get('RetainedData').getNextId;

        // Listen for 'delete' events (includes Backspace).
        this.listenTo( this.editor.editing.view.document, 'delete', ( evt, data ) => {
            data.preventDefault();
            evt.stop();
        } );

        // For some reason 'enter' events don't fire when the current selection is a checkboxDiv,
        // so fix that explicitly.
        this.listenTo( this.editor.editing.view.document, 'keydown', ( evt, data ) => {
            const selection = this.editor.model.document.selection;
            const selectedElement = selection.getSelectedElement();

            if ( selectedElement && selectedElement.name == 'checkboxDiv' ) {
                if (data.domEvent.key === 'Backspace') {
                    return;
                }
                if ( data.domEvent.key === 'Enter' ) {
                    // This will end up calling our enter listener below.
                    this.editor.editing.view.document.fire( 'enter', { evt, data } );
                }
                evt.stop();
            }
        }, { priority: 'highest' } );

        // Override the default 'enter' key behavior to allow inserting new checklist options.
        this.listenTo( this.editor.editing.view.document, 'enter', ( evt, data ) => {
            const selection = this.editor.model.document.selection;
            const positionParent = selection.getLastPosition().parent;
            const selectedElement = selection.getSelectedElement();

            if ( positionParent.name == 'checkboxLabel' || ( selectedElement && selectedElement.name == 'checkboxDiv' ) ) {
                this.editor.execute( 'insertCheckbox' )
                data.preventDefault();
                evt.stop();
            }
        } );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'checklistQuestion', {
            isObject: true,
            allowIn: 'section',
        } );

        schema.register( 'checkboxDiv', {
            isObject: true,
            allowIn: [ 'questionFieldset' ],
        } );

        schema.register( 'checkboxInput', {
            isInline: true,
            isObject: true,
            allowIn: [ 'checkboxDiv', 'tableCell', '$root' ],
            allowAttributes: [ 'id', 'name', 'value', 'data-correctness' ].concat(ALLOWED_ATTRIBUTES),
        } );

        schema.register( 'checkboxLabel', {
            isObject: true,
            isInline: true,
            allowIn: 'checkboxDiv',
            allowContentOf: '$block',
            allowAttributes: [ 'for' ]
        } );

        schema.register( 'checkboxInlineFeedback', {
            isObject: true,
            allowIn: 'checkboxDiv',
            allowContentOf: '$block'
        } );

        schema.addChildCheck( ( context, childDefinition ) => {
            // Disallow adding questions inside answerText boxes.
            if ( context.endsWith( 'answerText' ) && childDefinition.name == 'checklistQuestion' ) {
                return false;
            }
        } );
    }

    _defineConverters() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const { editing, data, model } = editor;

        // <checklistQuestion> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['module-block', 'module-block-checkbox']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'checklistQuestion' );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'checklistQuestion',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'div', {
                    'class': 'module-block module-block-checkbox',
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'checklistQuestion',
            view: ( modelElement, viewWriter ) => {
                const checklistQuestion = viewWriter.createContainerElement( 'div', {
                    'class': 'module-block module-block-checkbox',
                } );

                return toWidget( checklistQuestion, viewWriter, { label: 'checklist-question widget' } );
            }
        } );

        // <checkboxDiv> converters
        conversion.for( 'upcast' ).elementToElement( {
            model: 'checkboxDiv',
            view: {
                name: 'div',
                classes: ['module-checkbox-div']
            }

        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'checkboxDiv',
            view: {
                name: 'div',
                classes: ['module-checkbox-div']
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'checkboxDiv',
            view: ( modelElement, viewWriter ) => {
                const div = viewWriter.createContainerElement( 'div', {
                    'class': 'module-checkbox-div'
                } );

                return toWidget( div, viewWriter, { label: 'checklist option widget' } );
            }
        } );

        // <checkboxInput> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'input',
                attributes: {
                    type: 'checkbox'
                }
            },
            model: ( viewElement, modelWriter ) => {
                const id = viewElement.getAttribute('data-bz-retained') || this._nextRetainedDataId();

                return modelWriter.createElement( 'checkboxInput', new Map( [
                    ...filterAllowedAttributes(viewElement.getAttributes()),
                    [ 'id', id ],
                    [ 'data-bz-retained', id ],
                    [ 'data-correctness', viewElement.getAttribute('data-correctness') || '' ]
                ] ) );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'checkboxInput',
            view: ( modelElement, viewWriter ) => {
                const id = modelElement.getAttribute('data-bz-retained') || this._nextRetainedDataId();

                return viewWriter.createEmptyElement( 'input', new Map( [
                    ...filterAllowedAttributes(modelElement.getAttributes()),
                    [ 'type', 'checkbox' ],
                    [ 'id', id ],
                    [ 'data-bz-retained', id ],
                    [ 'data-correctness', modelElement.getAttribute('data-correctness') || '' ]
                ] ) );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'checkboxInput',
            view: ( modelElement, viewWriter ) => {
                const id = modelElement.getAttribute('data-bz-retained') || this._nextRetainedDataId();

                return viewWriter.createEmptyElement( 'input', new Map( [
                    ...filterAllowedAttributes(modelElement.getAttributes()),
                    [ 'type', 'checkbox' ],
                    [ 'id', id ],
                    [ 'data-bz-retained', id ],
                    [ 'data-correctness', modelElement.getAttribute('data-correctness') || '' ],
                    [ 'disabled', 'disabled' ],
                ] ) );

                return input;
            }
        } );

        // <checkboxLabel> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'label'
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'checkboxLabel', {
                    // HACK: Get the id of the checkbox this label corresponds to.
                    'for': viewElement.parent.getChild(0).getAttribute('id')
                } );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'checkboxLabel',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'label', {
                    // HACK: Get the id of the checkbox this label corresponds to.
                    'for': modelElement.parent.getChild(0).getAttribute('id')
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'checkboxLabel',
            view: ( modelElement, viewWriter ) => {
                const label = viewWriter.createEditableElement( 'label', {
                    // NOTE: We don't set the 'for' attribute in the editing view, so that clicking in the label
                    // editable to type doesn't also toggle the checkbox.
                } );

                enablePlaceholder( {
                    view: editing.view,
                    element: label,
                    text: 'Answer text'
                } );

                return toWidgetEditable( label, viewWriter );
            }
        } );

        // <checkboxInlineFeedback> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'p',
                classes: ['inline', 'feedback']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'checkboxInlineFeedback' );
            }

        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'checkboxInlineFeedback',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'p', {
                    'class': 'feedback inline',
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'checkboxInlineFeedback',
            view: ( modelElement, viewWriter ) => {
                const p = viewWriter.createEditableElement( 'p', {
                    'class': 'feedback inline',
                } );

                enablePlaceholder( {
                    view: editing.view,
                    element: p,
                    text: 'Inline feedback (optional)'
                } );

                return toWidgetEditable( p, viewWriter );
            }
        } );
    }
}
