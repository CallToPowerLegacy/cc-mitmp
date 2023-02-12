/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const logger = require('../utils/logger');
const configAppInfo = require('../config/app-info');
const configMappings = require('../config/mappings');

const MODULE_NAME = 'mappings::info';

function handleRequest(req, res) {
    logger.logDebug(MODULE_NAME, 'Handling request');
    const path = req.url.substr(configMappings.path.id.length, req.url.length);
    switch (path) {
        case configMappings.path.info:
            logger.logInfo(MODULE_NAME, 'Sending app config info');
            res.send(configAppInfo);
            break;
        default:
            res.send('Move along, nothing to see here...');
            break;
    }
    logger.logResponse(MODULE_NAME, res);
}

module.exports = {
    handleRequest: handleRequest
};