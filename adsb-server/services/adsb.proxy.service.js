// const http = require('https');
const request = require('request-promise');
// const QueryHelper = require('../helpers/query.helper');
const GeoCacheHelper = require('../helpers/geo.cache.helper');
const now = require('performance-now');

// const queryHelper = new QueryHelper();
const geoCacheHelper = new GeoCacheHelper(200);
const DEFAULT_CACHE = 'DEFAULT';

class ADSBProxy {


  /**
   * constructor
   *
   * @param  {type} host      the host url
   * @param  {type} cacheTime time to cache responses in milliseconds
   */
  constructor(host, cacheTime) {
    this.host = host;
    this.cacheTime = cacheTime;
    this.timer = {};
  }

  startTimer(lat, long) {
    this.timer[geoCacheHelper.cacheExpression(lat, long) || DEFAULT_CACHE] = now();
  }

  cacheTimeExceeded(lat, long) {
    return (now() - this.timer[geoCacheHelper.cacheExpression(lat, long) || DEFAULT_CACHE])
      > this.cacheTime;
  }

  getAircraftList(lat, long, radius) {
    const cachedData = geoCacheHelper.getCache(lat, long)
      || geoCacheHelper.getCacheDataFromCoordinatesWithinRadiusRange(lat, long);
    // No data is cached for the given coordinates
    if (!cachedData) {
      this.startTimer(lat, long);
      return aircraftListRequest.call(this, lat, long, radius);
    } else { // data is cached and not expired - return cached data
      const cachedCoordinates = geoCacheHelper.decomposeCacheExpression(cachedData.COORDINATE_STAMP);
      if (this.cacheTimeExceeded(cachedCoordinates.lat, cachedCoordinates.long)) {
        geoCacheHelper.clearCache(lat, long);
        this.startTimer(lat, long);
        return aircraftListRequest(lat, long, radius);
      } else {
        return new Promise((resolve) => {
          resolve(geoCacheHelper.getCache(cachedCoordinates.lat, cachedCoordinates.long));
        });
      }
    }

    function aircraftListRequest(lat, lng, radius) {
      let options = {
        uri: `${this.host}/VirtualRadar/AircraftList.json`,
        json: true
      };
      if (lat && lng) {
        const { fNBnd, fSBnd, fWBnd, fEBnd } = geoCacheHelper.getRadiusCoordinates(lat, lng, radius);
        options.qs = {
          lat,
          lng,
          fNBnd,
          fSBnd,
          fWBnd,
          fEBnd,
          trFmt: 'fa',
          refreshTrails: 1
        };
      }

      return request(options)
        .then(data => {
          geoCacheHelper.setCache(lat, lng, data);
          return data;
        });
    }
  }
}

module.exports = ADSBProxy;
