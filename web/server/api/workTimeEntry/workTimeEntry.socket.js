/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Worktimeentry = require('./workTimeEntry.model');

exports.register = function (socket) {

    Worktimeentry.schema.post('save', function (doc) {
        onSave(socket, doc);
    });

    Worktimeentry.schema.post('remove', function (doc) {
        onRemove(socket, doc);
    });
}

function onSave(socket, doc, cb) {
    socket.emit(doc._organization + ':workTimeEntry:save', doc);
}

function onRemove(socket, doc, cb) {
    socket.emit(doc._organization + ':workTimeEntry:remove', doc);
}