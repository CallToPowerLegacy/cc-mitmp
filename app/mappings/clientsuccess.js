/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const logger = require('../utils/logger');
const configClientSuccess = require('../config/clientsuccess');
const configMappings = require('../config/mappings');
const configOptions = require('../config/options');
const utilsWhitelist = require('../utils/whitelist');

const MODULE_NAME = 'mappings::clientsuccess';

const clientsuccess = require('clientsuccess-api')
    .clientsuccess(configClientSuccess.username, configClientSuccess.password);

// Backup
let clients = [];
let backupRunning = false;
let nrOfRemainingClients = 0;
let currPercentage = -1; // rounded percentage
let backup = {
    date: new Date(),
    clients: [],
    error: {
        clients: [],
        subscriptions: []
    }
};
// Fake answer
let fakeAnswerStatusCode = 200;
let fakeAnswer = {
    id: 'fakeId',
    externalId: 'externalFakeId'
};

function handleClientsRequest(req, path) {
    logger.logDebug(MODULE_NAME, 'Handling clients request');
    let request, status, msg;
    const id = path.substr(configMappings.clientsuccess.actions.clients.length + 1, path.length);
    let requestRedirected = false;
    if (req.method === 'GET') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.GET;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Requesting client with ID ' + id);
                request = clientsuccess.clients.read(id);
            } else {
                logger.logInfo(MODULE_NAME, 'Requesting clients');
                request = clientsuccess.clients.list();
            }
        }
    } else if (req.method === 'POST') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.POST;
        if (requestRedirected) {
            logger.logInfo(MODULE_NAME, 'Creating client', req.body);
            request = clientsuccess.clients.create(req.body);
        }
    } else if (req.method === 'PUT') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.PUT;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Updating client with ID ' + id, req.body);
                request = clientsuccess.clients.update(id, req.body);
            } else {
                logger.logInfo(MODULE_NAME, 'Updating client - ID not given.');
                status = 403;
                msg = 'No ID given.';
            }
        }
    } else if (req.method === 'PATCH') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.PATCH;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Updating custom field for client with ID ' + id, req.body);
                request = clientsuccess.clients.customfield(id, req.body);
            } else {
                logger.logInfo(MODULE_NAME, 'Updating custom field for client - ID not given.');
                status = 403;
                msg = 'No ID given.';
            }
        }
    } else if (req.method === 'DELETE') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.DELETE;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Deleting client with ID ' + id);
                request = clientsuccess.clients.delete(id);
            } else {
                logger.logInfo(MODULE_NAME, 'Requesting client - ID not given.');
                status = 403;
                msg = 'No ID given.';
            }
        }
    } else {
        logger.logInfo(MODULE_NAME, 'Request method "' + req.method + '" not supported.');
        status = 404;
        msg = 'Methods available: ' + JSON.stringify(['GET', 'POST', 'PUT', 'DELETE']);
    }
    return {
        request: request,
        status: status,
        msg: msg,
        requestRedirected: requestRedirected
    };
}

function handleProductsRequest(req, path) {
    logger.logDebug(MODULE_NAME, 'Handling products request');
    let request, status, msg;
    const id = path.substr(configMappings.clientsuccess.actions.products.length + 1, path.length);
    let requestRedirected = false;
    if (req.method === 'GET') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.GET;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Requesting product with ID ' + id);
                request = clientsuccess.products.read(id);
            } else {
                logger.logInfo(MODULE_NAME, 'Requesting products');
                request = clientsuccess.products.list();
            }
        }
    } else {
        logger.logInfo(MODULE_NAME, 'Request method "' + req.method + '" not supported.');
        status = 404;
        msg = 'Methods available: ' + JSON.stringify(['GET']);
    }
    return {
        request: request,
        status: status,
        msg: msg,
        requestRedirected: requestRedirected
    };
}

function handleSubscriptionsRequest(req, path) {
    logger.logDebug(MODULE_NAME, 'Handling subscriptions request');
    let request, status, msg;
    const id = path.substr(configMappings.clientsuccess.actions.subscriptions.length + 1, path.length);
    let requestRedirected = false;
    if (req.method === 'GET') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.GET;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Requesting subscription for client with ID ' + id);
                request = clientsuccess.subscriptions.list(id);
            } else {
                logger.logInfo(MODULE_NAME, 'Requesting subscriptions - ID not given.');
                status = 404;
                msg = 'Client ID could not be found';
            }
        }
    } else if (req.method === 'POST') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.POST;
        if (requestRedirected) {
            logger.logInfo(MODULE_NAME, 'Creating subscription', req.body);
            request = clientsuccess.subscriptions.create(req.body);
        }
    } else if (req.method === 'PUT') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.PUT;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Updating subscription with ID ' + id, req.body);
                request = clientsuccess.subscriptions.update(id, req.body);
            } else {
                logger.logInfo(MODULE_NAME, 'Updating client - ID not given.');
                status = 403;
                msg = 'No ID given.';
            }
        }
    } else if (req.method === 'DELETE') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.DELETE;
        if (requestRedirected) {
            if (id && id.length > 0) {
                logger.logInfo(MODULE_NAME, 'Deleting subscription with ID ' + id);
                request = clientsuccess.subscriptions.delete(id);
            } else {
                logger.logInfo(MODULE_NAME, 'Requesting client - ID not given.');
                status = 403;
                msg = 'No ID given.';
            }
        }
    } else {
        logger.logInfo(MODULE_NAME, 'Request method "' + req.method + '" not supported.');
        status = 404;
        msg = 'Methods available: ' + JSON.stringify(['GET', 'POST', 'PUT', 'DELETE']);
    }
    return {
        request: request,
        status: status,
        msg: msg,
        requestRedirected: requestRedirected
    };
}

function handleClientTypesRequest(req, path) {
    logger.logDebug(MODULE_NAME, 'Handling client types request');
    let request, status, msg;
    let requestRedirected = false;
    if (req.method === 'GET') {
        requestRedirected = configOptions.redirectRequests.clientSuccess.GET;
        if (requestRedirected) {
            logger.logInfo(MODULE_NAME, 'Requesting client types');
            request = clientsuccess.clientTypes();
        }
    } else {
        logger.logInfo(MODULE_NAME, 'Request method "' + req.method + '" not supported.');
        status = 404;
        msg = 'Methods available: ' + JSON.stringify(['GET']);
    }
    return {
        request: request,
        status: status,
        msg: msg,
        requestRedirected: requestRedirected
    };
}

function resetBackup() {
    backupRunning = false;
    currPercentage = -1;
}

function checkDone(callback) {
    let newPercentage = Math.round(clients.length > 0 ? ((clients.length - nrOfRemainingClients) / clients.length * 100) : 0);
    if (newPercentage != currPercentage) {
        currPercentage = newPercentage;
        logger.logInfo(MODULE_NAME, 'Backup status: ' + currPercentage + '%');
    }
    if (callback && nrOfRemainingClients <= 0) {
        logger.logInfo(MODULE_NAME, 'Backup done');
        resetBackup();
        backup.date = new Date();
        callback(200, backup);
    }
}

function clientAnsweredSuccess(client, callback) {
    clientsuccess.subscriptions.list(client.id).then(responseSub => {
        let subscriptions = responseSub.data;
        client.subscriptions = subscriptions;
        backup.clients.push(client);
        --nrOfRemainingClients;
        checkDone(callback);
    })
    .catch(err => {
        backup.error.subscriptions.push(client);
        backup.clients.push(client);
        --nrOfRemainingClients;
        checkDone(callback);
    });
}

function clientAnsweredError(err, client, callback) {
    backup.error.clients.push(client);
    --nrOfRemainingClients;
    checkDone(callback);
}

function handleBackupRequest(req, path, callback) {
    logger.logDebug(MODULE_NAME, 'Handling backup request');
    if (!backupRunning) {
        backupRunning = true;
        clientsuccess.clients.list().then(response => {
            clients = response.data;
            nrOfRemainingClients = clients.length;
            logger.logInfo(MODULE_NAME, 'Starting backup...');
            for (let clientId in clients) {
                let client = clients[clientId];
                clientsuccess.clients.read(client.id)
                    .then(response => clientAnsweredSuccess(response.data, callback))
                    .catch(err => clientAnsweredError(err, client, callback));
            }
        })
        .catch(err => {
            logger.logError(MODULE_NAME, 'Error in request', err);
            resetBackup();
            if (callback) {
                callback(err.response.status, err.response.data);
            }
        });
    } else {
        if (callback) {
            callback(409, 'Backup already running.');
        }
    }
}

function handleDeleteAllSubscriptionsRequest(req, path, callback) {
    logger.logDebug(MODULE_NAME, 'Handling delete all subscriptions request');
    // This is just very basic
    // clientsuccess.clients.list().then(responseClients => {
    //     clients = responseClients.data;
    //     logger.logInfo(MODULE_NAME, 'Starting deleting all subscriptions for ' + clients.length + ' clients...');
    //     for (let clientId in clients) {
    //         clientsuccess.subscriptions.list(clients[clientId].id)
    //             .then(responseSubscription => {
    //                 let subscriptions = responseSubscription.data;
    //                 for (let subscriptionId in subscriptions) {
    //                     let subscription = subscriptions[subscriptionId];
    //                     clientsuccess.subscriptions.delete(subscription.id)
    //                     .then(responseSubscription => {
    //                         console.log('Deleted subscription "' + subscription.id + '" for client "' +  clients[clientId].id + '"');
    //                     })
    //                     .catch(err => {
    //                         console.log('Failed to delete subscription "' + subscription.id + '" for client "' +  clients[clientId].id + '"');
    //                         console.log(err);
    //                     });
    //                 }
    //             })
    //             .catch(err => {
    //                 console.log('Failed to get client', clientId);
    //             });
    //         // TODO: Delete subscriptions
    //         // clientsuccess.subscriptions.delete();
    //     }
    // })
    // .catch(err => {
    //     logger.logError(MODULE_NAME, 'Error in request', err);
    // });
    // if (callback) {
    //     callback(202, 'Deleting all subscriptions in background.');
    // }
    logger.logDebug(MODULE_NAME, 'Not available.');
    if (callback) {
        callback(404, 'Not available');
    }
}

function isAuthenticated(req) {
    // Just whitelisting is not the best way to protect a server.
    // let whitelisted = false;
    // const hostsWhitelist = utilsWhitelist.readHostsWhitelist();
    // logger.logDebug(MODULE_NAME, 'Hosts Whitelist', hostsWhitelist);
    // for (let i in hostsWhitelist) {
    //     if (req.headers.host === hostsWhitelist[i]) {
    //         whitelisted = true;
    //         break;
    //     }
    // }
    return req.headers['api-authentication'] === configClientSuccess.apiPassword;
}

function handleRequest(req, res) {
    logger.logDebug(MODULE_NAME, 'Checking whether user is authenticated...');
    if (!isAuthenticated(req)) {
        logger.logDebug(MODULE_NAME, 'Not authenticated');
        res.status(401);
        res.send('Client success API needs authentication.');
        return;
    }
    const path = req.url.substr(configMappings.clientsuccess.path.length, req.url.length);
    logger.logDebug(MODULE_NAME, 'Handling request', path);
    let result = {
        request: undefined,
        status: 403,
        msg: 'Move along, nothing to see here...',
        requestRedirected: false
    };

    if (path.startsWith(configMappings.clientsuccess.actions.clients)) {
        result = handleClientsRequest(req, path);
    } else if (path.startsWith(configMappings.clientsuccess.actions.products)) {
        result = handleProductsRequest(req, path);
    } else if (path.startsWith(configMappings.clientsuccess.actions.subscriptions)) {
        result = handleSubscriptionsRequest(req, path);
    } else if (path.startsWith(configMappings.clientsuccess.actions.clientTypes)) {
        result = handleClientTypesRequest(req, path);
    } else if (path.startsWith(configMappings.clientsuccess.actions.backup)) {
        if (configOptions.redirectRequests.clientSuccess.GET) {
            handleBackupRequest(req, path, (status, msg) => {
                res.status(status);
                res.send(msg);
            });
            return;
        }
    } else if (path.startsWith(configMappings.clientsuccess.actions.deleteAllSubscriptions)) {
        if (configOptions.redirectRequests.clientSuccess.GET) {
            handleDeleteAllSubscriptionsRequest(req, path, (status, msg) => {
                res.status(status);
                res.send(msg);
            });
            return;
        }
    } else {
        logger.logError(MODULE_NAME, 'Could not handle request: ' + req.method + ' ' + req.url, req.body);
        result.requestRedirected = true;
    }

    if (result.requestRedirected) {
        if (result.request) {
            result.request.then(response => {
                logger.logInfo(MODULE_NAME, 'Handled request, status code: ' + response.status);
                res.status(response.status);
                res.send(response.data);
            });
            result.request.catch(err => {
                logger.logError(MODULE_NAME, 'Error in request, status code: ' + err.response.status, err.response.data);
                res.status(err.response.status);
                res.send(err.response.data);
            });
        } else {
            res.status(result.status);
            res.send(result.msg);
        }
    } else {
        if (configOptions.fakeRequestTimeout > 0) {
            setTimeout(function () {
                logger.logInfo(MODULE_NAME, 'Request not redirected, sending fake answer with status code ' + fakeAnswerStatusCode);
                res.status(fakeAnswerStatusCode);
                res.send(JSON.stringify(fakeAnswer));
            }, configOptions.fakeRequestTimeout);
        } else {
            logger.logInfo(MODULE_NAME, 'Request not redirected, sending fake answer with status code ' + fakeAnswerStatusCode);
            res.status(fakeAnswerStatusCode);
            res.send(JSON.stringify(fakeAnswer));
        }
    }
}

module.exports = {
    /**
     * Handles a given request.
     * 
     * @param req the request
     * @param res the response
     */
    handleRequest: handleRequest
};