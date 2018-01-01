const THREE = require('three');

export default class GeoHelper {
  latLongToVector3(lat, lon, radius) {
    const phi = (lat) * (Math.PI / 180);
    const theta = (lon - 180) * (Math.PI / 180);

    const x = -(radius) * Math.cos(phi) * Math.cos(theta);
    const y = (radius) * Math.sin(phi);
    const z = (radius) * Math.cos(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
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

  //lat, lng in degrees. Bearing in degrees. Distance in Km
  calculateNewPostionFromBearingDistance(lat, lng, bearing, distance) {
    var R = 6371; // Earth Radius in Km

    var lat2 = Math.asin(Math.sin(Math.PI / 180 * lat) * Math.cos(distance / R) + Math.cos(Math.PI / 180 * lat) * Math.sin(distance / R) * Math.cos(Math.PI / 180 * bearing));
    var lon2 = Math.PI / 180 * lng + Math.atan2(Math.sin( Math.PI / 180 * bearing) * Math.sin(distance / R) * Math.cos( Math.PI / 180 * lat ), Math.cos(distance / R) - Math.sin( Math.PI / 180 * lat) * Math.sin(lat2));

    return [180 / Math.PI * lat2 , 180 / Math.PI * lon2];
  };
}
