const vincenty = require('node-vincenty');

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
    const {x, y, z} = vector3;
    let lat = 90 - (Math.acos(y / radius)) * 180 / Math.PI;
    let lng = ((270 + (Math.atan2(x, z)) * 180 / Math.PI) % 360) - 360;

    if (lng < -180) {
      lng = 180 - ((lng * -1) - 180);
    } else if (lng > 180) {
      lng = -(180 - (lng - 180));
    }

    if (lat < -90) {
      lat = 90 - ((lat * -1) - 90);
    } else if (lat > 90) {
      lat = -(90 - (lat - 180));
    }

    return {
      lat,
      lng
    };
  }

  getInitialBearing(initialLat, initialLong, destLat, destLong) {
    return vincenty.distVincenty(initialLat, initialLong, destLat, destLong).initialBearing;
  }
}
