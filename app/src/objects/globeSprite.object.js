const THREE = require('three');
const GeoHelper = require('../services/geo.helper').default;
const MathHelper = require('../services/math.helper').default;

export default class GlobeSprite {
  constructor(
    craftData,
    width,
    height,
    altitude,
    scene,
    reverse,
    hoursPerTick,
    object,
    cb
  ) {
    const { Lat, Long, Trak, Spd } = craftData;

    this.scene = scene;
    this.geoHelper = new GeoHelper();
    this.mathHelper = new MathHelper();

    object = object.children[0];
    object.scale.set(0.5, 0.5, 0.5);
    object.castShadow = true;
    object.material = new THREE.MeshPhongMaterial({
      color: 0x555555,
      specular: 0xffffff,
      shininess: 50,
      flatShading: THREE.SmoothShading
    });

    object.craftData = craftData;
    this.sprite = object;

    this.scene.add(this.sprite);
    this.setPosition(Lat, Long, altitude);

    const estimatedPosition = this.geoHelper.calculateNewPostionFromBearingDistance(
      Lat,
      Long,
      Trak,
      hoursPerTick * (Spd * 1.85)
    );
    const destinationCoordinates = this.geoHelper.latLongToVector3(
      estimatedPosition[0],
      estimatedPosition[1],
      altitude
    );

    this.setDestination(
      destinationCoordinates,
      reverse
    );

    cb(this);
  }

  setPosition(latitude, longitude, altitude) {
    const { x, y, z } = this.geoHelper.latLongToVector3(latitude, longitude, altitude);
    this.sprite.position.set(x, y, z);
  }

  setDestination(endVector, clockWise) {
    const originVector = new THREE.Vector3(
      this.sprite.position.x,
      this.sprite.position.y,
      this.sprite.position.z
    );

    this._createDestinationArc(originVector, endVector, 500, 0xff0000, clockWise);
  }

  _createDestinationArc(startVector, endVector, smoothness, color, clockWise) {
    const cb = new THREE.Vector3();
    const ab = new THREE.Vector3();
    const normal = new THREE.Vector3();
    cb.subVectors(new THREE.Vector3(), endVector);
    ab.subVectors(startVector, endVector);
    cb.cross(ab);
    normal.copy(cb).normalize();

    let angle = startVector.angleTo(endVector);
    if (clockWise) {
      angle -= Math.PI * 2;
    }

    const angleDelta = angle / (smoothness - 1);
    const geometry = new THREE.Geometry();
    const material = new THREE.LineBasicMaterial({
      color: 0xff0000,
      visible: false
    });

    for (let i = 0; i < smoothness; i += 1) {
      const vertex = startVector.clone().applyAxisAngle(normal, angleDelta * i);
      geometry.vertices.push(vertex);
    }

    const destinationArc = new THREE.Line(geometry, material);
    this.course = new THREE.CatmullRomCurve3(destinationArc.geometry.vertices);
    this.scene.add(destinationArc);
    this.arc = destinationArc;
  }

  alignToGlobe(globe, delta) {
    const { x, y, z } = this.course.getPoint(delta);
    this.sprite.lookAt(this.course.getPoint(delta));
    this.sprite.position.set(x, y, z);
  }
}
