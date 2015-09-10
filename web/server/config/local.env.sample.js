'use strict';

// Use local.env.js for environment variables that grunt will set when the server starts locally.
// Use for your api keys, secrets, etc. This file should not be tracked by git.
//
// You will need to set these on the server you deploy to.

module.exports = {
    DOMAIN: 'http://localhost:9000',
    DEVICE_PORT: '9001',
    SESSION_SECRET: 'use-your-secret',
    GOOGLE_ID: 'use-your-google-id',
    GOOGLE_SECRET: 'use-your-google-secret',
    // Control debug level for modules using visionmedia/debug
    DEBUG: '',
    GMAIL_USER: 'use-your-gmail-account',
    GMAIL_PASSWORD: 'use-your-gmail-password',
    ADMIN_EMAIL: 'admin@admin.com',
    ADMIN_PASSWORD: 'admin'
};