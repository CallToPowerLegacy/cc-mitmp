/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const MODULE_NAME = 'config::files';

const files = {
    whitelist: {
        hosts: './hosts.whitelist'
    },
    log: {
        baseFolder: './log',
        access: './log/log',
        suffix: '.log'
    }
};

module.exports = files;