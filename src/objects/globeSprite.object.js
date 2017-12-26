const THREE = require('three');
const GeoHelper = require('../services/geo.helper').default;
const MathHelper = require('../services/math.helper').default;

export default class GlobeSprite {
  constructor(
    craftData,
    texture,
    alpha,
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

    this.targetIndex = 1;
    this.scene = scene;
    this.geoHelper = new GeoHelper();
    this.mathHelper = new MathHelper();

    object = object.children[0];
    object.scale.set(0.5, 0.5, 0.5);
    object.material = new THREE.MeshPhongMaterial({
      ambient: 0x555555,
      color: 0x555555,
      specular: 0xffffff,
      shininess: 50,
      shading: THREE.SmoothShading
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
      color: 0xff0000
    });

    for (let i = 0; i < smoothness; i += 1) {
      const vertex = startVector.clone().applyAxisAngle(normal, angleDelta * i);
      geometry.vertices.push(vertex);
    }

    const destinationArc = new THREE.Line(geometry, material);
    destinationArc.markers = this._createMarkersForArc(destinationArc);

    this.course = new THREE.CatmullRomCurve3(destinationArc.geometry.vertices);
    this.scene.add(destinationArc);
    this.arc = destinationArc;
  }

  _createMarkersForArc(destinationArc, SPACING = 75) {
    const markers = new THREE.Object3D();
    for (let i = 0; i < destinationArc.geometry.vertices.length; i += 1) {
      const vertex = destinationArc.geometry.vertices[i];
      // TEST
      let markerMesh;
      if (i === 0 || i === (destinationArc.geometry.vertices.length - 1)) {
        markerMesh = new THREE.Object3D();
        markerMesh.position.set(vertex.x, vertex.y, vertex.z);
        markerMesh.name = i === 0 ? 'StartMarker' : 'EndMarker';
        this.scene.add(markerMesh);
        markers.add(markerMesh);
      } else if (i % SPACING === 0) {
        markerMesh = new THREE.Mesh(
          new THREE.SphereGeometry(1, 9, 9),
          new THREE.MeshBasicMaterial({ color: 0xff0000 })
        );
        markerMesh.position.set(vertex.x, vertex.y, vertex.z);
        markerMesh.name = `MarkerIdentity_${i}`;
        this.scene.add(markerMesh);
        markers.add(markerMesh);
      }
    }

    return markers;
  }

  alignToGlobe(globe, delta, camera) {
    const { x, y, z } = this.course.getPoint(delta);
    const targetMarker = this.arc.markers.children[this.targetIndex];

    this.sprite.position.set(x, y, z);
    if (this.mathHelper.isVector3Equal(targetMarker.position, this.sprite.position)) {
      this.targetIndex =
        this.targetIndex === this.arc.markers.children.length - 1 ?
        1 : this.targetIndex + 1;
    }

    this.sprite.lookAt(camera.position);
    const oldRotation = this.sprite.rotation.clone();
    this.sprite.lookAt(targetMarker.position);
    this.sprite.rotation.set(
      this.sprite.rotation.x,
      this.sprite.rotation.y,
      oldRotation.z
    );
  }
}
