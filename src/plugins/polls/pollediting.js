import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import PollCommand from './pollcommand';

import './theme/poll.css';
import imageIcon from './poll-icon.svg';

export default class PollEditing extends Plugin {
	static get requires() {
		return [ Widget ];
	}

	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'poll', new PollCommand( this.editor ) );

		this.editor.editing.mapper.on(
			'viewToModelPosition',
			viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'poll' ) )
		);

		this.editor.ui.componentFactory.add( 'insertPoll', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Insert Poll',
				icon: imageIcon,
				tooltip: true
			} );

			return view;
		} );
	}

	_defineSchema() {
		const schema = this.editor.model.schema;

		// Configure the schema.
		schema.register( 'poll', {
			isObject: true,
			isBlock: true,
			allowWhere: [ '$block', '$text' ],
			allowAttributes: [ 'name', 'data-id' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		// Helper method for both downcast converters.
		const createPlaceholderView = ( modelItem, viewWriter ) => {
			const id = modelItem.getAttribute( 'data-id' ) || 'undefined';

			const pollView = viewWriter.createContainerElement( 'figure', {
				class: 'poll',
				'data-id': id
			} );

			// Insert the placeholder name (as a text).
			const innerText = viewWriter.createText( '{ Poll ID: ' + id + '}' );
			viewWriter.insert( viewWriter.createPositionAt( pollView, 0 ), innerText );

			return pollView;
		};

		conversion.elementToElement( {
			view: {
				name: 'figure',
				classes: 'poll'
			},
			model: ( viewElement, modelWriter ) => {
				const id = viewElement.getChild( 0 ).parent.getAttribute( 'data-id' );
				return modelWriter.createElement( 'poll', { 'data-id': id } );
			}
		} );

		conversion.for( 'editingDowncast' ).elementToElement( {
			model: 'poll',
			view: ( modelItem, viewWriter ) => {
				const widgetElement = createPlaceholderView( modelItem, viewWriter );

				// Enable widget handling on a placeholder element inside the editing view.
				return toWidget( widgetElement, viewWriter );
			}
		} );

		conversion.for( 'dataDowncast' ).elementToElement( {
			model: 'poll',
			view: createPlaceholderView
		} );
	}
}
