const http = require('https');
const QueryHelper = require('../helpers/query.helper');
const GeoCacheHelper = require('../helpers/geo.cache.helper');
const now = require('performance-now');

const queryHelper = new QueryHelper();
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
  }

  startTimer(lat, long) {
    this.timer[geoCacheHelper.cacheExpression(lat, long) || DEFAULT_CACHE] = now();
  }

  cacheTimeExceeded(lat, long) {
    return (now() - this.timer[geoCacheHelper.cacheExpression(lat, long) || DEFAULT_CACHE])
      > this.cacheTime;
  }

  getAircraftList(lat, long) {
    const cachedData = geoCacheHelper.getCache(lat, long)
      || geoCacheHelper.getCacheDataFromCoordinatesWithinRadiusRange(lat, long);
    // No data is cached for the given coordinates
    if (!cachedData) {
      this.startTimer(lat, long);
      return aircraftListRequest(lat, long);
    } else { // data is cached and not expired - return cached data
      const cachedCoordinates = geoCacheHelper.decomposeCacheExpression(cachedData.COORDINATE_STAMP);
      if (this.cacheTimeExceeded(cachedCoordinates.lat, cachedCoordinates.long)) {
        geoCacheHelper.clearCache(lat, long);
        this.startTime(lat, long);
        return aircraftListRequest(lat, long);
      } else {
        return new Promise((resolve) => {
          resolve(geoCacheHelper.getCache(cachedCoordinates.lat, cachedCoordinates.long));
        });
      }
    }

    function aircraftListRequest(lat, long) {
      return new Promise((resolve, reject) => {
        const path = '/VirtualRadar/AircraftList.json';
        const queryParams = queryHelper.constructQueryParams({ lat, long });

        http.get(`${this.host}${path}${queryParams}`, (response) => {
          let result = '';
          response.on('data', (chunk) => {
            result += chunk;
          });

          response.on('end', () => {
            const data = JSON.parse(result);
            geoCacheHelper.setCache(lat, long, data);
            resolve(data);
          });
        }).on('error', err => {
          reject(err);
        });
      });
    }
  }
}

module.exports = ADSBProxy;
