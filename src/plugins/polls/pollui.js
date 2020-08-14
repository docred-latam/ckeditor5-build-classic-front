import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import imageIcon from './poll-icon.svg';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

export default class PollUI extends Plugin {
	init() {
		const editor = this.editor;
		editor.ui.componentFactory.add( 'poll', locale => {
			const view = new ButtonView( locale );
			view.set( {
				label: 'Insert Poll',
				icon: imageIcon,
				tooltip: true
			} );

			// Disable the placeholder button when the command is disabled.
			const command = editor.commands.get( 'poll' );
			view.bind( 'isEnabled' ).to( command );

			// Execute the command when the dropdown item is clicked (executed).
			this.listenTo( view, 'execute', () => {
				// eslint-disable-next-line
				const pollId = prompt( 'Poll ID' );
				if ( !pollId || isNaN( Number( pollId ) ) ) {
					// eslint-disable-next-line
					alert( 'El ID no es valido' );
					return null;
				}

				editor.execute( 'poll', { value: pollId } );
				editor.editing.view.focus();
			} );

			return view;
		} );
	}
}
