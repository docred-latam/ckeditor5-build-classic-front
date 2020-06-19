import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import PollEditing from './pollediting';
import PollUI from './pollui';

export default class Poll extends Plugin {
	static get requires() {
		return [ PollEditing, PollUI ];
	}
}
