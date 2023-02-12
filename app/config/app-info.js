/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const pjson = require('../package.json');

const MODULE_NAME = 'config::app-info';

const appInfo = {
    name: 'COYO Cloud - Man In The Middle Proxy',
    shortName: 'cc-mitmp',
    version: pjson.version
};

module.exports = appInfo;