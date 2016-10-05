'use strict';

/**
 * This module is needed to build a common error object
 * that will be sent as a response to the client.
 */
module.exports = function (message, status) {
	return {
		'message': message,
		'status': status
	};
}
