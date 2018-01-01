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
      const {lat, long} = this.decomposeCacheExpression(cacheKeys[i]);
      if(this._isWithinRadius(
        parseFloat(latitude),
        parseFloat(longitude),
        parseFloat(lat),
        parseFloat(long)
      ) && lat && long) {
        cachedData = this.cache[cacheKeys[i]];
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
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(long2 - long1);

    const a = Math.sin(dLat/2) * Math.sin(dLat/2)
      + Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2))
      * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return (this.EARTH_RADIUS * c) < this.radiusRange;
  }

  toRad(number) {
    return number * Math.PI / 180;
  }

  toDegrees(radians) {
    return radians * 180 / Math.PI;
  }

  getRadiusCoordinates(lat, long, radius = this.radiusRange) {
    const fNBnd = this._getCoordinatesGivenBearingDistance(lat, long, 0, radius).lat;
    const fSBnd = this._getCoordinatesGivenBearingDistance(lat, long, 180, radius).lat;
    const fEBnd = this._getCoordinatesGivenBearingDistance(lat, long, 90, radius).long;
    const fWBnd = this._getCoordinatesGivenBearingDistance(lat, long, 270, radius).long;

    return {fNBnd, fSBnd, fEBnd, fWBnd };
  }

  _getCoordinatesGivenBearingDistance(lat, long, brng, radius) {
    const lat1 = this.toRad(lat);
    const lon1 = this.toRad(long);

    let lat2 = Math.asin(Math.sin(lat1) * Math.cos(radius/this.EARTH_RADIUS)
      + Math.cos(lat1) * Math.sin(radius/this.EARTH_RADIUS) * Math.cos(brng));
    let lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(radius/this.EARTH_RADIUS)
      * Math.cos(lat1), Math.cos(radius/this.EARTH_RADIUS) - Math.sin(lat1) * Math.sin(lat2));

    lat2 = this.toDegrees(lat2);
    lon2 = this.toDegrees(lon2);

    return { lat: lat2, long: lon2 };
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
