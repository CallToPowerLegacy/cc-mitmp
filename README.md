# COYO Cloud - Man In The Middle Proxy

A request proxy between third-party-applications and the COYO cloud.

## Original intent

Originally, this repository resolved the issue COYOFOUR-5799 [0]:
> Java 1.7 cannot handle requests with TLS1.2, so all of the requests of the customer center (which was written in Java7) will go through this mitmp.

Now it has been rewritten to be able to work with the (old) Customer Center [1] and Hubspot (Website) [2].

## How it works

* This application starts a server.
* The server receives a request (GET, POST, PUT, OPTIONS, ...) of a user
* The server sends all headers as well as the request body of the original request to the COYO Cloud
* The server receives the response of the COYO Cloud
* The server logs access/errors
* The server sends the original response back to the user

## Things to be considered

* The application only parses `application/json` payloads
* Logs can be found in `/logs/log-<DATE>.log`

## Mappings

### Info

Base: `/cc-mitmp`

#### Info

`/info`

cc-mitmp application information

### Client Success

Base: `/clientsuccess`

#### Backup

`/backup`

* GET: Backs up all clients and all subscriptions (including notes).

#### Clients

`/clients`

* GET: List all clients
* GET `/<id>`: List a specific client
* POST: Create a client
* PUT `/<id>`: Update a client
* DELETE `/<id>`: Delete a client

#### Products

`/products`

* GET: List all products
* GET `/<id>`: List a specific product

#### Subscriptions

`/subscriptions`

* GET `/<clientId>`: List a specific subscription
* POST: Create a subscription
* PUT `/<subscriptionId>`: Update a subscription
* DELETE `/<subscriptionId>`: Delete a subscription

### COYO Cloud aka 'everything else'

Every other request is mapped to the COYO cloud exactly as is.

## Usage

### Install dependencies

* `cd app`
* `npm install`
* `npm install -g forever`

### Configuration

Change the configurations in `config/*.js` if necessary.

### Production: Run server.js in the background

The application server will be started as a daemon, and forever is taking care about failures and issues.

* `cd app`
* `export NODE_ENV=production`
* `forever stopall`
* `forever start server.js`

### Development: Run server.js

The application server will be started, but not as a daemon.

* `cd app`
* `npm run dev` for live updates or `node server.js`

## Sources

[0] https://coyoapp.atlassian.net/browse/COYOFOUR-5799

[1] https://bitbucket.org/mindsmash/coyo.customercenter

[2] http://coyoapp-3847057.hs-sites.com/de/home
