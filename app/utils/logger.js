/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const fs = require('fs');
const util = require('util');

const configOptions = require('../config/options');
const configFiles = require('../config/files');

const MODULE_NAME = 'utils::logger';

/**
 * Returns a date formatted for the log file names.
 * 
 * @return {string} a date formatted for the log files
 */
function _getCurrentDateStr() {
    const d = new Date().toISOString();
    return d.substr(0, d.indexOf('T'));
}

/**
 * Ensure that the log folder is present. Otherwise the server crashes...
 */
function _ensureLogFolder() {
    if (!fs.existsSync(configFiles.log.baseFolder)) {
        fs.mkdirSync(configFiles.log.baseFolder);
    }
}

/**
 * Tries to log to file.
 * 
 * @param {string} outStr The string to be logged
 * @param {string} additionalStr An optional additional string to be logged
 */
function _saveLog(outStr, additionalStr) {
    const logfile = configFiles.log.access + '-' + _getCurrentDateStr() + configFiles.log.suffix;
    try {
        _ensureLogFolder();
        fs.appendFile(logfile, outStr + ' ' + additionalStr + '\r\n', (err) => {
            if (err) {
                logError(MODULE_NAME, 'Could not append to file "' + logfile + '"', err);
            }
        });
    } catch (exception) {
        logError(MODULE_NAME, 'Could not append to file "' + logfile + '"', exception);
    }
}

/**
 * Returns a formatted string for log printing.
 * 
 * @param {string} mode The mode 
 * @return {string} The head string
 */
function _getOutStrHead(mode, module) {
    return '[ccs] [' + mode + '] [' + (new Date()) + '] [' + module + ']';
}

/**
 * Logs to console and file.
 * 
 * @param {string} mode The mode
 * @param {*} module The module
 * @param {*} str The String to be logged
 * @param {object} obj An optional object to be logged
 */
function _log(mode, module, str, obj) {
    const additional = obj ? JSON.stringify(obj) : '';
    console.log(_getOutStrHead(mode, module) + ' ' + str, additional);
    _saveLog(_getOutStrHead(mode, module) + ' ' + str, additional);
}

function logRequestVerbose(module, request, obj) {
    logRequest(module, request, obj);
    logDebug(module, 'Method', request.method);
    logDebug(module, 'Url', request.url);
    logDebug(module, 'Original Url', request.originalUrl);
    logDebug(module, 'Headers', util.inspect(request.headers, {
        showHidden: true,
        depth: null,
        colors: false
    }));
    logDebug(module, 'Params', request.params);
    logDebug(module, 'Query', request.query);
    logDebug(module, 'Body', request.body);
}

function logResponse(module, response, obj) {
    logDebug(module, 'Status code: ' + JSON.stringify(response.statusCode), obj);
}

function logDebug(module, str, obj) {
    if (configOptions.debug) {
        _log('DBG', module, str, obj);
    }
}

function logInfo(module, str, obj) {
    _log('INF', module, str, obj);
}

function logWarning(module, str, obj) {
    _log('WARN', module, str, obj);
}

function logError(module, str, obj) {
    _log('ERR', module, str, obj);
}

module.exports = {

    /**
     * Logs a request with more information.
     * 
     * @param {*} module The module
     * @param {object} request The request
     * @param {object} obj An optional object to be logged
     */
    logRequestVerbose: logRequestVerbose,

    /**
     * Logs a request.
     * 
     * @param {*} module The module
     * @param {object} response The response
     * @param {object} obj An optional object to be logged
     */
    logResponse: logResponse,

    /**
     * Logs in debug.
     * 
     * @param {*} module The module
     * @param {*} str The String to be logged
     * @param {object} obj An optional object to be logged
     */
    logDebug: logDebug,

    /**
     * Logs in info.
     * 
     * @param {*} module The module
     * @param {*} str The String to be logged
     * @param {object} obj An optional object to be logged
     */
    logInfo: logInfo,

    /**
     * Logs in warning.
     * 
     * @param {*} module The module
     * @param {*} str The String to be logged
     * @param {object} obj An optional object to be logged
     */
    logWarning: logWarning,

    /**
     * Logs in error.
     * 
     * @param {*} module The module
     * @param {*} str The String to be logged
     * @param {object} obj An optional object to be logged
     */
    logError: logError

};