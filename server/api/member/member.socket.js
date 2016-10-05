/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Member = require('./member.model.schema');

exports.register = function (socket) {
    Member.post('save', function (doc) {
        onSave(socket, doc);
    });
    Member.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    socket.emit('member:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit('member:remove', doc);
}