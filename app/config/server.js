/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const configOptions = require('../config/options');

const MODULE_NAME = 'config::server';

// Leave server.address blank to expose server to the public.
// Otherwise set server.address to '127.0.0.1'.
let server = {
    address: '',
    port: 3000,
    requestTimeout: 1000 * 60 * 5
};

if (configOptions.dev) {
    server.address = '127.0.0.1';
}

module.exports = server;