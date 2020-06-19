import Command from '@ckeditor/ckeditor5-core/src/command';

export default class PollCommand extends Command {
	execute( { value } ) {
		const editor = this.editor;

		editor.model.change( writer => {
			// Create a <poll> element with the "name" attribute...
			const poll = writer.createElement( 'poll', { 'data-id': value } );

			// ... and insert it into the document.
			editor.model.insertContent( poll );

			// Put the selection on the inserted element.
			writer.setSelection( poll, 'on' );
		} );
	}

	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;

		this.isEnabled = model.schema.checkChild( selection.focus.parent, 'poll' );
	}
}
