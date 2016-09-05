/* global io */
'use strict';

angular.module('ioAtSpotApp')
    .factory('socket', function (socketFactory) {

        // socket.io now auto-configures its connection when we ommit a connection url
        var ioSocket = io('', {
            // Send auth token on connection, you will need to DI the Auth service above
            // 'query': 'token=' + Auth.getToken()
            path: '/socket.io-client'
        });

        var socket = socketFactory({
            ioSocket: ioSocket
        });

        return {
            socket: socket,

            /**
             * Register listeners to sync an array with updates on a model
             *
             * Takes the array we want to sync, the model name that socket updates are sent from,
             * and an optional callback function after new items are updated.
             *
             * @param {String} modelName
             * @param {id} filter
             * @param {Function} cb
             */
            syncUpdates: function (modelName, id, cb) {

                cb = cb || angular.noop;

                /**
                 * Syncs item creation/updates on 'model:save'
                 */
                socket.on(id + ":" + modelName + ':save', function (item) {
                    //                    var oldItem = _.find(array, {
                    //                        _id: item._id
                    //                    });
                    //                    var index = array.indexOf(oldItem);
                    //                    var event = 'created';
                    //
                    //                    // replace oldItem if it exists
                    //                    // otherwise just add item to the collection
                    //                    if (oldItem) {
                    //                        array.splice(index, 1, item);
                    //                        event = 'updated';
                    //                    } else {
                    //                        array.push(item);
                    //                    }

                    cb(event, item);
                });

                /**
                 * Syncs removed items on 'model:remove'
                 */
                socket.on(id + ":" + modelName + ':remove', function (item) {
                    var event = 'deleted';
                    _.remove(array, {
                        _id: item._id
                    });
                    cb(event, item);
                });
            },

            /**
             * Removes listeners for a models updates on the socket
             *
             * @param modelName
             * @param id
             */
            unsyncUpdates: function (modelName, id) {
                socket.removeAllListeners(id + ':' + modelName + ':save');
                socket.removeAllListeners(id + ':' + modelName + ':remove');
            }
        };
    });
