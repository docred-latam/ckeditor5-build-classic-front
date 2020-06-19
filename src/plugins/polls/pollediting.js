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

		schema.register( 'poll', {
			// Allow wherever text is allowed:
			allowWhere: '$text',

			// The placeholder will act as an inline node:
			isInline: true,

			// The inline widget is self-contained so it cannot be split by the caret and can be selected:
			isObject: true,

			allowAttributes: [ 'name', 'data-id' ]
		} );
	}

	_defineConverters() {
		const conversion = this.editor.conversion;

		conversion.for( 'upcast' ).elementToElement( {
			view: {
				name: 'div',
				classes: [ 'poll' ]
			},
			model: ( viewElement, modelWriter ) => {
				// Extract the "name" from "{name}".
				const name = viewElement.getChild( 0 ).data.slice( 1, -1 );
				return modelWriter.createElement( 'poll', { name } );
			}
		} );

		// Helper method for both downcast converters.
		const createPlaceholderView = ( modelItem, viewWriter ) => {
			const id = modelItem.getAttribute( 'data-id' );

			const pollView = viewWriter.createContainerElement( 'div', {
				class: 'poll',
				'data-id': id
			} );

			// Insert the placeholder name (as a text).
			const innerText = viewWriter.createText( '{ Poll ID: ' + id + '}' );
			viewWriter.insert( viewWriter.createPositionAt( pollView, 0 ), innerText );

			return pollView;
		};

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
