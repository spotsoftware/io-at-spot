'use strict';

/**
 * This module is needed to build a common error object
 * that will be sent as a response to the client.
 */
module.exports = function(message, statusCode) {
  var error = new Error(message);
  error.status = statusCode;

  return error;
}
