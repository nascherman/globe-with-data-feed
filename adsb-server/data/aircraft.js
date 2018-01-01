const ADSBProxy = require('../services/adsb.proxy.service');

const adsbProxy = new ADSBProxy('https://public-api.adsbexchange.com', (60000 * 10));
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
   * operationId: Get List of Aircraft with Specificity
   */
  get: {
    200: function (req, res, callback) {
      const { latitude, longitude, radius } = req.query;
      if (!latitude || !longitude) {
        adsbProxy.getAircraftList()
          .then(list => callback(null, list))
          .catch(e => {
            callback(e);
          });
      } else {
        adsbProxy.getAircraftList(latitude, longitude, radius)
          .then(list => callback(null, list))
          .catch(e => {
            callback(e);
          });
      }

    }
  }
};
