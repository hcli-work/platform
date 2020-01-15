import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { enablePlaceholder } from '@ckeditor/ckeditor5-engine/src/view/placeholder';
import { toWidget, toWidgetEditable } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import InsertVideoContentCommand from './insertvideocontentcommand';

export default class VideoContentEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'insertVideoContent', new InsertVideoContentCommand( this.editor ) );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'videoContent', {
            isObject: true,
            allowIn: 'section',
            allowAttributes: [ 'id', 'class' ]
        } );

        schema.register( 'videoFigure', {
            allowIn: 'content',
            allowAttributes: [ 'class' ]
        } );

        schema.register( 'videoIFrame', {
            allowIn: 'videoFigure',
            allowAttributes: [ 'src', 'allow', 'allowfullscreen', 'frameborder', 'height', 'width' ]
        } );

        schema.register( 'videoFigCaption', {
            allowIn: [ 'videoFigure' ],
            allowAttributes: [ 'class' ]
        } );

        schema.register( 'videoCaption', {
            allowIn: 'videoFigCaption',
            allowContentOf: [ '$block' ],
            allowAttributes: [ 'class' ]
        } );

        schema.register( 'videoDuration', {
            allowIn: 'videoFigCaption',
            allowContentOf: [ '$block' ],
            allowAttributes: [ 'class' ]
        } );

        schema.register( 'videoTranscript', {
            allowIn: 'videoFigCaption',
            allowContentOf: [ '$root' ],
            allowAttributes: [ 'class' ]
        } );
    }

    _defineConverters() {
        const editor = this.editor;
        const conversion = editor.conversion;
        const { editing, data, model } = editor;

        // <videoContent> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['module-block', 'module-block-video']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoContent', {} );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoContent',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'div', {
                    'class': 'module-block module-block-video'
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoContent',
            view: ( modelElement, viewWriter ) => {
                const videoContent = viewWriter.createContainerElement( 'div', {
                    'class': 'module-block module-block-video',
                } );

                return toWidget( videoContent, viewWriter, { label: 'video widget' } );
            }
        } );

        // <videoFigure> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'figure',
                classes: ['media-test']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoFigure', {} );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoFigure',
            view: {
                name: 'figure',
                classes: ['media-test']
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoFigure',
            view: ( modelElement, viewWriter ) => {
                const videoFigure = viewWriter.createContainerElement( 'figure', {
                    'class': 'media-test',
                } );
                return videoFigure;

                return toWidget( videoFigure, viewWriter );
            }
        } );

        // <videoIFrame> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'iframe',
                attributes: {
                    allow: 'encrypted-media',
                    allowfullscreen: 'allowfullscreen',
                    frameborder: '0',
                    height: '315',
                    width: '560'
                }
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoIFrame', {
                    'src': viewElement.getAttribute( 'src' )
                } );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoIFrame',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEmptyElement( 'iframe', {
                    'src': modelElement.getAttribute( 'src' ),
                    'allow': 'encrypted-media',
                    'allowfullscreen': 'allowfullscreen',
                    'frameborder': '0',
                    'height': '315',
                    'width': '560'
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoIFrame',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEmptyElement( 'iframe', {
                    'src': modelElement.getAttribute( 'src' ),
                    'allow': 'encrypted-media',
                    'allowfullscreen': 'allowfullscreen',
                    'frameborder': '0',
                    'height': '315',
                    'width': '560'
                } );
            }
        } );

        // <videoFigCaption> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'figcaption',
                classes: ['video-caption-container']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoFigCaption', {} );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoFigCaption',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createContainerElement( 'figcaption', {
                    'class': 'video-caption-container'
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoFigCaption',
            view: ( modelElement, viewWriter ) => {
                const videoFigCaption = viewWriter.createContainerElement( 'figcaption', {
                    'class': 'video-caption-container'
                } );
                return videoFigCaption;

                return toWidget( videoFigCaption, viewWriter );
            }
        } );

        // <videoCaption> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['video-caption']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoCaption', {} );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoCaption',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'div', {
                    'class': 'video-caption'
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoCaption',
            view: ( modelElement, viewWriter ) => {
                const videoCaption = viewWriter.createEditableElement( 'div', {
                    'class': 'video-caption',
                } );

                enablePlaceholder( {
                    view: editing.view,
                    element: videoCaption,
                    text: 'Video caption',
                } );

                return toWidgetEditable( videoCaption, viewWriter );
            }
        } );

        // <videoDuration> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['media-duration']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoDuration', {} );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoDuration',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'div', {
                    'class': 'media-duration'
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoDuration',
            view: ( modelElement, viewWriter ) => {
                const videoDuration = viewWriter.createEditableElement( 'div', {
                    'class': 'media-duration',
                } );

                enablePlaceholder( {
                    view: editing.view,
                    element: videoDuration,
                    text: 'Video duration',
                } );

                return toWidgetEditable( videoDuration, viewWriter );
            }
        } );

        // <videoTranscript> converters
        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'div',
                classes: ['transcript']
            },
            model: ( viewElement, modelWriter ) => {
                return modelWriter.createElement( 'videoTranscript', {} );
            }
        } );
        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'videoTranscript',
            view: ( modelElement, viewWriter ) => {
                return viewWriter.createEditableElement( 'div', {
                    'class': 'transcript'
                } );
            }
        } );
        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'videoTranscript',
            view: ( modelElement, viewWriter ) => {
                const videoTranscript = viewWriter.createEditableElement( 'div', {
                    'class': 'transcript',
                } );

                enablePlaceholder( {
                    view: editing.view,
                    element: videoTranscript,
                    text: 'Video transcript',
                    isDirectHost: false
                } );

                return toWidgetEditable( videoTranscript, viewWriter );
            }
        } );
    }
}