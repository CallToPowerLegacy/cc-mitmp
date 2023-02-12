/**
 * COYO Cloud - Man In The Middle Proxy
 * 
 * (c) Copyright 2017-2018 Denis Meyer, COYO GmbH. All rights reserved.
 */

const MODULE_NAME = 'config::mappings';

const mappings = {
    path: {
        id: '/cc-mitmp',
        info: '/info'
    },
    clientsuccess: {
        path: '/clientsuccess',
        actions: {
            clients: '/clients',
            products: '/products',
            subscriptions: '/subscriptions',
            clientTypes: '/client-segments',
            backup: '/backup',
            deleteAllSubscriptions: '/deleteallsubscriptions'
        }
    }
};

module.exports = mappings;