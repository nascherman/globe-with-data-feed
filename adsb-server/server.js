'use strict';

const Http = require('http');
const Express = require('express');
const BodyParser = require('body-parser');
const Swaggerize = require('swaggerize-express');
const Path = require('path');
const apicache = require('apicache');
const cors = require('cors');

const cache = apicache.middleware;

const App = Express();

const Server = Http.createServer(App);

App.use(BodyParser.json());
App.use(BodyParser.urlencoded({
  extended: true
}));
App.use(cache('10 minutes'));
App.use(cors());


App.use(Swaggerize({
  api: Path.resolve('./config/swagger.json'),
  handlers: Path.resolve('./handlers')
}));

Server.listen(8008, function () {
  App.swagger.api.host = this.address().address + ':' + this.address().port;
  /* eslint-disable no-console */
  console.log('App running on %s:%d', this.address().address, this.address().port);
  /* eslint-disable no-console */
});
