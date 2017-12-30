class GeoCacheHelper {
  constructor(radiusRange, objectRadius) {
    this.radiusRange = radiusRange;
    this.cache = {};
    this.EARTH_RADIUS = objectRadius || 6371; // km
  }

  cacheExpression(lat, long) {
    return `${lat}:${long}`;
  }

  decomposeCacheExpression(expression) {
    const split = expression.split(':');
    return { lat: split[0], long: split[1] };
  }


  /**
   * getCacheDataFromCoordinatesWithinRadiusRange -
   *  iterates through the entire cache to find an item
   *  that is within a given radius of the given coordinates
   *
   * @param  {float} latitude
   * @param  {float} longitude
   * @return {object} either the cached aircraft data or null
   */
  getCacheDataFromCoordinatesWithinRadiusRange(latitude, longitude) {
    let cachedData = null;
    const cacheKeys = Object.keys(this.cache);
    for (let i = 0; i < cacheKeys.length; i += 1) {
      const {lat, long} = this._decomposeCacheExpression(cacheKeys[i]);
      if(this._isWithinRadius(latitude, longitude, lat, long)) {
        cachedData = this.cache[i];
        i = cacheKeys.length;
      }
    }

    return cachedData;
  }


  /**
   * _isWithinRadius - haversine formula for coordinate distance
   *
   * @param  {number} lat1
   * @param  {number} long1
   * @param  {number} lat2
   * @param  {number} long2
   * @return {boolean}       if the points are within the specified radius
   */
  _isWithinRadius(lat1, long1, lat2, long2) {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(long2 - long1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2)
      + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2))
      * Math.sin(dLon/2) & Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (this.EARTH_RADIUS * c) < this.radiusRange;

    function toRad(number) {
      return number * Math.PI / 180;
    }
  }

  getCache(latitude, longitude) {
    return this.cache[this.cacheExpression(latitude, longitude)];
  }

  setCache(latitude, longitude, data) {
    this.cache[this.cacheExpression(latitude, longitude)] = data;
    this.cache[this.cacheExpression(latitude, longitude)].COORDINATE_STAMP
      = this.cacheExpression(latitude, longitude);
  }

  clearCache(latitude, longitude) {
    this.cache[this.cacheExpression(latitude, longitude)] = null;
  }
}

module.exports = GeoCacheHelper;
