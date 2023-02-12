/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const MODULE_NAME = 'config::options';

let options = {
    baseUrl: 'https://coyocloud.com',
    dev: false,
    debug: false,
    ignoreOptionsCalls: true,
    setAuthHeaderOnWhitelistedHosts: true,
    redirectRequests: {
        coyoCloud: true,
        clientSuccess: {
            GET: true,
            POST: true,
            PUT: true,
            PATCH: true,
            DELETE: true
        }
    },
    fakeRequestTimeout: 0
};

if (options.dev) {
    options.debug = true;
    options.ignoreOptionsCalls = true;
    options.setAuthHeaderOnWhitelistedHosts = true;
    options.redirectRequests = {
        coyoCloud: false,
        clientSuccess: {
            GET: true,
            POST: false,
            PUT: false,
            PATCH: false,
            DELETE: false
        }
    };
    options.fakeRequestTimeout = 0;
}

module.exports = options;