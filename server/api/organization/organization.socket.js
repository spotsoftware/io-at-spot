/**
 * Broadcast updates to client when the model changes
 */

'use strict';

var Organization = require('./organization.model');

exports.register = function(socket) {
  Organization.schema.post('save', function (doc) {
    onSave(socket, doc);
  });
  Organization.schema.post('remove', function (doc) {
    onRemove(socket, doc);
  });
}

function onSave(socket, doc, cb) {
  socket.emit('organization:save', doc);
}

function onRemove(socket, doc, cb) {
  socket.emit('organization:remove', doc);
}