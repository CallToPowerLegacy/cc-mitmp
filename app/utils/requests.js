/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const fs = require('fs');

const configOptions = require('../config/options');
const configServer = require('../config/server');
const logger = require('../utils/logger');

const MODULE_NAME = 'utils::requests';

/**
 * Extracts options from the request and returns new request options.
 * 
 * @param {object} req The request
 * @return {object} Object containing the new request options
 */
function getRequestOptions(req) {
    logger.logDebug(MODULE_NAME, 'getRequestOptions');
    return {
        'url': configOptions.baseUrl + req.url,
        'method': req.method,
        'headers': req.headers,
        'body': req.body,
        'json': true,
        'followAllRedirects': true,
        'followRedirect': true,
        'followOriginalHttpMethod': true,
        'timeout': configServer.requestTimeout
    };
}

module.exports = {

    /**
     * Extracts options from the request and returns new request options.
     * 
     * @param {object} req The request
     * @return {object} Object containing the new request options
     */
    getRequestOptions: getRequestOptions

};