module.exports = function (message, statusCode) {
    var error = new Error(message);
    error.status = statusCode;

    return error;
}