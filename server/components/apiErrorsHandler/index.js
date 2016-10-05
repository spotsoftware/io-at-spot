'use strict';

/**
 * This module handles the APIs errors.
 * It returns the correct status code with a related readable message.
 */
module.exports = function (err, req, res, next) {

    var status = err.status || 500;

    console.log('Error handling!', err);

    res.status(status).json({
        message: err.message || "Internal server error.",
        status: status,
        validation: err.validation || null
    });
};