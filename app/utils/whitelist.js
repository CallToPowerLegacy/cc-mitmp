/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const fs = require('fs');

const configOptions = require('../config/options');
const configServer = require('../config/server');
const configFiles = require('../config/files');
const logger = require('../utils/logger');

const MODULE_NAME = 'utils::whitelist';

function readHostsWhitelist() {
    logger.logDebug(MODULE_NAME, 'readHostsWhitelist');
    let list = [];
    if (fs.existsSync(configFiles.whitelist.hosts)) {
        fs.readFileSync(configFiles.whitelist.hosts).toString().split('\n').forEach((line) => {
            list.push(line);
        });
    } else {
        logger.logError(MODULE_NAME, 'Could not find a hosts whitelist file at "' + configFiles.whitelist.hosts + '"');
    }
    if (configOptions.debug) {
        logger.logInfo(MODULE_NAME, 'Pushing "localhost" to hosts whitelist');
        list.push('localhost:' + configServer.port);
    }
    return list;
}

module.exports = {

    /**
     * Reads in the hosts whitelist
     * 
     * @return {object} The hosts whitelist
     */
    readHostsWhitelist: readHostsWhitelist

};