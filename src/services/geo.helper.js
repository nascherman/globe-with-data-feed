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
  vector3ToLatLong(position, radius) {
    const lat = 90 - (Math.acos(position.y / radius)) * 180 / Math.PI;
    const long = ((180 + (Math.atan2(position.x , position.z)) * 180 / Math.PI) % 360);
    return { lat, long };
  }

  getInitialBearing(initialLat, initialLong, destLat, destLong) {
    return vincenty.distVincenty(initialLat, initialLong, destLat, destLong).initialBearing;
  }
}
