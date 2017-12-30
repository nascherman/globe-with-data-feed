'use strict';
var dataProvider = require('../data/aircraft.js');
/**
 * Operations on /aircraft
 */
module.exports = {
    /**
     * summary: Get aircraft list
     * description: Returns a list of aircraft from the ODB
     * parameters:
     * produces:
     * responses: 200
     */
  get: (req, res, next) => {
    var status = 200;
    var provider = dataProvider['get']['200'];
    provider(req, res, function (err, data) {
      if (err) {
        next(err);
        return;
      }
      res.status(status).send(data);
    });
  }
};
