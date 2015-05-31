var log = require('bunyan').createLogger({
    name: 'doorkeeper',
    streams: [{
            type: 'rotating-file',
            level: 'debug',
            path: '/home/pi/io-at-spot/doorkeeper/logs/doorkeeper_debug.log',
            period: '1d', // daily rotation
            count: 1 // keep 1 back copies
    }, {
            type: 'rotating-file',
            level: 'info',
            path: '/home/pi/io-at-spot/doorkeeper/logs/doorkeeper_info.log',
            period: '1d', // daily rotation
            count: 1 // keep 1 back copies
    },
        {
            type: 'rotating-file',
            level: 'warn',
            path: '/home/pi/io-at-spot/doorkeeper/logs/doorkeeper_warn.log',
            period: '1d', // daily rotation
            count: 1 // keep 1 back copies
    },
        {
            type: 'rotating-file',
            level: 'error',
            path: '/home/pi/io-at-spot/doorkeeper/logs/doorkeeper_error.log',
            period: '1y', // yearly rotation
            count: 3 // keep 3 back copies
    },
        {
            type: 'rotating-file',
            level: 'fatal',
            path: '/home/pi/io-at-spot/doorkeeper/logs/doorkeeper_fatal.log',
            period: '1y', // daily rotation
            count: 3 // keep 3 back copies
    }]
});

module.exports = log;