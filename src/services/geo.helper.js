import vincenty from 'node-vincenty';

export default class GeoHelper {
  latLongToVector3(lat, lon, radius, height) {
    const phi = (lat) * (Math.PI / 180);
    const theta = (lon - 180) * (Math.PI / 180);

    const x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
    const y = (radius + height) * Math.sin(phi);
    const z = (radius + height) * Math.cos(phi) * Math.sin(theta);

    return {x, y, z};
  }

  // TODO fix this
  vector3ToLatLong(vector3, radius) {
    const tempRadius = radius + 50;
    const {x, y, z} = vector3;
    var lat = 90 - (Math.acos(y / tempRadius)) * 180 / Math.PI;
    var lng = ((270 + (Math.atan2(x , z)) * 180 / Math.PI) % 360) - 360;
    return {
      lat,
      lng
    };
  }

  getInitialBearing(initialLat, initialLong, destLat, destLong) {
    return vincenty.distVincenty(initialLat, initialLong, destLat, destLong).initialBearing;
  }
}
