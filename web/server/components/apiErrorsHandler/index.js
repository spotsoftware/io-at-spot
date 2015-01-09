'use strict';

/**
 * This module handles the APIs errors.
 * It returns the correct status code with a related readable message.
 */
module.exports = function errorHandler(err, req, res, next) {
	var status = err.status || 500;
	var message = err.message || "Internal server error.";
	var validation = err.validation || null;

	res.status(status).json({
		error: message,
		validation: validation
	});
};
