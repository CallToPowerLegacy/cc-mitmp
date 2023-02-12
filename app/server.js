/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const express = require('express');
const request = require('request');
const bodyParser = require('body-parser');

var timeout = require('connect-timeout');

const logger = require('./utils/logger');
const utilsWhitelist = require('./utils/whitelist');
const utilsRequests = require('./utils/requests');
const configAppInfo = require('./config/app-info');
const configOptions = require('./config/options');
const configServer = require('./config/server');
const configMappings = require('./config/mappings');
const configRequestHeaders = require('./config/request-headers');
const configResponseHeaders = require('./config/response-headers');
const mappingClientSuccess = require('./mappings/clientsuccess');
const mappingInfo = require('./mappings/info');

const MODULE_NAME = 'server';

const app = express();

app.use(bodyParser.json({
    type: 'application/json'
}));

app.use(timeout(configServer.requestTimeout));

// load middleware functions at a path for all request methods
app.all('*', (req, res) => {
    logger.logDebug(MODULE_NAME, 'Incoming request: ' + req.method + ' ' + req.url, req.body);

    // Check mapping to server info path
    if (req.url.startsWith(configMappings.path.id)) {
        logger.logDebug(MODULE_NAME, 'Mapping to internal path');
        mappingInfo.handleRequest(req, res);
        return;
    }
    if (req.url.startsWith(configMappings.clientsuccess.path)) {
        logger.logDebug(MODULE_NAME, 'Mapping to client success path');
        mappingClientSuccess.handleRequest(req, res);
        return;
    }

    // Redirect all other requests
    logger.logDebug(MODULE_NAME, 'Redirecting the request');
    req.headers.host = configOptions.baseUrl.replace('https://', '');
    if (configOptions.setAuthHeaderOnWhitelistedHosts) {
        const hostsWhitelist = utilsWhitelist.readHostsWhitelist();
        logger.logDebug(MODULE_NAME, 'Hosts Whitelist', hostsWhitelist);
        for (let i in hostsWhitelist) {
            for (let j in req.rawHeaders) {
                if (req.rawHeaders[j] === hostsWhitelist[i]) {
                    logger.logDebug(MODULE_NAME, 'Setting authorization header for host', hostsWhitelist[i]);
                    delete req.headers['Authorization'];
                    delete req.headers['authorization'];
                    req.headers['authorization'] = configRequestHeaders['Authorization'];
                }
            }
        }
    }
    if (req.headers['content-length'] || req.headers['Content-Length']) {
        delete req.headers['Content-Length'];
        req.headers['content-length'] = Buffer.byteLength(JSON.stringify(req.body), 'utf8');
    }

    logger.logDebug(MODULE_NAME, 'Setting response headers', configResponseHeaders);
    for (let key in configResponseHeaders) {
        res.setHeader(key, configResponseHeaders[key]);
    }

    if (configOptions.redirectRequests.coyoCloud) {
        const reqoptions = utilsRequests.getRequestOptions(req);
        const requestTime = new Date().getTime();
        logger.logInfo(MODULE_NAME, 'Proxying request [' + requestTime + ']: ' + req.method + ' ' + req.url, req.body);
        logger.logDebug(MODULE_NAME, 'Request options:', reqoptions);

        request(reqoptions)
            .on('response', (response) => {
                if (configOptions.ignoreOptionsCalls && req.method === 'OPTIONS') {
                    logger.logDebug(MODULE_NAME, 'Ignoring OPTIONS call');
                    response.statusCode = 200;
                }
                logger.logInfo(MODULE_NAME, 'Response status code of proxied request [' + requestTime + ']:', response.statusCode);
            })
            .on('error', (error) => {
                logger.logError(MODULE_NAME, 'An error occurred for proxied request [' + requestTime + ']:', error);
                res.status(500).send(JSON.stringify(error));
            })
            .pipe(res);
    } else {
        logger.logDebug(MODULE_NAME, 'Ignorig request: ' + req.method + ' ' + req.url, req.body);
        if (configOptions.fakeRequestTimeout > 0) {
            setTimeout(function () {
                res.send(JSON.stringify({
                    id: "fakeId"
                }));
            }, configOptions.fakeRequestTimeout);
        } else {
            res.send(JSON.stringify({
                id: "fakeId"
            }));
        }
    }
});

logger.logInfo(MODULE_NAME, 'Starting ' + configAppInfo.shortName + ' server...');
logger.logDebug(MODULE_NAME, 'Options', configOptions);

const server = app.listen(configServer.port, configServer.address, () => {
    logger.logInfo(MODULE_NAME, 'Server started on "' + configServer.address + ':' + configServer.port + '"');
});
server.timeout = configServer.requestTimeout;
