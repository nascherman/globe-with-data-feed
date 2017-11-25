import React from 'react';
import GeoHelper from '../services/geo.helper';
import SceneHelper from '../services/scene.helper';

const SPHERE_RADIUS = 300;
const INITIAL_CAM_POSITION = {
  x: 50.96,
  y: 232.29,
  z: 233.43
};
const INITIAL_SUN_POSITION = {
  x: -1000,
  y: 300,
  z: 0
};
const CONTROL_OPTIONS = {
  minDistance: 200,
  maxDistance: 1000,
  minPolarAngle: 0.1,
  maxPolarAngle: Math.PI - 0.1,
  enableDamping: true,
  dampingFactor: 0.3,
  zoomSpeed: 0.1,
  rotateSpeed: 0.1
};

let testTime = 0;

class Globe extends React.Component {
  constructor(props) {
    super(props);

    this.helper = new SceneHelper(props.width, props.height, CONTROL_OPTIONS);
    this.geoHelper = new GeoHelper();
    this.renderer = this.helper.getRenderer();
    this.scene = this.helper.getScene();
    this.camera = this.helper.getCamera();
    this.sprites = [];
    this.arcs = [];

    // For Debugging
    window.scene = this.scene;
  }

  componentDidMount() {
    this.createScene();
    this.start();
  }

  componentWillUnmount() {
    this.stop();
  }

  start() {
    if (!this.frameId) {
      this.frameId = requestAnimationFrame(this.animate.bind(this));
    }
  }

  stop() {
    cancelAnimationFrame(this.frameId);
  }

  animate() {
    this.renderScene();
    this.frameId = requestAnimationFrame(this.animate.bind(this));
  }

  createScene() {
    const ambient = this.helper.createAmbience(0xFFFFFF, 0.2);
    const light = this.helper.createDirectionalLight(0xFFFFFF, 1);
    const { meshPlanet, meshClouds } = this.createPlanet();
    // test
    this.globe = meshPlanet;

    this.scene.add(meshPlanet);
    this.scene.add(meshClouds);
    this.scene.add(ambient);
    this.scene.add(light);

    this.camera.position.set(
      INITIAL_CAM_POSITION.x,
      INITIAL_CAM_POSITION.y,
      INITIAL_CAM_POSITION.z
    );
    light.position.set(
      INITIAL_SUN_POSITION.x,
      INITIAL_SUN_POSITION.y,
      INITIAL_SUN_POSITION.z
    );

    this.camera.lookAt(this.scene.position);

    const el = document.getElementById('scene');
    el.appendChild(this.renderer.domElement);

    // test
    const aircraftSprite = this.createGlobeSprite(
      43.761539,
      -79.411079,
      '/static/aircraft-sprite.jpg',
      '/static/aircraft-sprite-alpha.png',
      3,
      3,
      0.015,
      10.15,
      meshPlanet
    );
    this.scene.add(aircraftSprite);
    this.sprites.push(aircraftSprite);

    // Test destination line tracing
    const Three = this.helper.getThree();
    const testData = this.geoHelper.latLongToVector3(51.50, -0.076, SPHERE_RADIUS, 10.15);
    const destinationArc = this.createDestinationArc(
      new Three.Vector3(aircraftSprite.position.x, aircraftSprite.position.y, aircraftSprite.position.z),
      new Three.Vector3(testData.x, testData.y, testData.z),
      500,
      0xff0000,
      false
    );
    destinationArc.markers = this.createMarkersForArc(destinationArc);
    const targetMarker = destinationArc.markers.children[1];
    this.scene.add(destinationArc.markers);
    aircraftSprite.arc = destinationArc;
    aircraftSprite.course = new Three.CatmullRomCurve3(destinationArc.geometry.vertices);
    this.scene.add(destinationArc);
    this.arcs.push(destinationArc);
    const testVector = new Three.Vector3(testData.x, testData.y, testData.z);

    this.alignSpriteToGlobe(aircraftSprite, this.globe.position, targetMarker.position);
    // aircraftSprite.rotation.set(
    //   aircraftSprite.rotation.x,
    //   aircraftSprite.rotation.y,
    //   -0.75
    // );
  }

  alignSpriteToGlobe(sprite, planet, targetMarker) {
    const oldPosition = sprite.position.clone();
    sprite.position.copy(planet);
    sprite.lookAt(oldPosition);
    sprite.position.copy(oldPosition);
    sprite.rotation.z -= this.geoHelper.getInitialBearing(
      43.761539,
      -79.411079,
      51.50,
      -0.076
    ) * (Math.PI / 180);
  }

  getUpPositionVector(objectToAdjust, pointToLookAt, pointToOrientXTowards) {
    const Three = this.helper.getThree();
    const v1 = pointToOrientXTowards.clone().sub(objectToAdjust.position).normalize(); // CHANGED
    const v2 = pointToLookAt.clone().sub(objectToAdjust.position).normalize(); // CHANGED
    return new Three.Vector3().crossVectors(v1, v2).normalize(); // CHANGED
  }

  createMarkersForArc(destinationArc) {
    const Three = this.helper.getThree();
    const markers = new Three.Object3D();
    for (let i = 0; i < destinationArc.geometry.vertices.length; i += 1) {
      const vertex = destinationArc.geometry.vertices[i];
      // TEST
      const sphereMesh = new Three.Mesh(
        new Three.SphereGeometry(1, 9, 9),
        new Three.MeshBasicMaterial({ color: 0xff0000 })
      );

      if (i % 75 === 0) {
        sphereMesh.position.set(vertex.x, vertex.y, vertex.z);
        markers.add(sphereMesh);
      }
    }

    return markers;
  }

  // TODO - render canvas element on a plane
  createGlobeSprite(lat, lon, map, alpha, width, height, spriteScale, spriteHeight, planet) {
    const Three = this.helper.getThree();
    const loader = new Three.TextureLoader();
    // sprite
    const spriteTexture = loader.load(map);
    const spriteAlpha = loader.load(alpha);

    const sprite = new Three.Mesh(
      new Three.PlaneGeometry(width, height),
      new Three.MeshStandardMaterial({
        // alphaMap: spriteAlpha,
        map: spriteTexture,
        transparent: true,
        alphaTest: 0.5,
        side: Three.DoubleSide,
        flatShading: true
      })
    );
    const { x, y, z } = this.geoHelper.latLongToVector3(lat, lon, SPHERE_RADIUS, spriteHeight);
    sprite.position.set(x, y, z);

    return sprite;
  }

  mapSpriteVertices(sprite, planet) {
    const Three = this.helper.getThree();
    for (let vertexIndex = 0; vertexIndex < sprite.geometry.vertices.length; vertexIndex += 1) {
      const localVertex = sprite.geometry.vertices[vertexIndex].clone();
      localVertex.z = 201;
      const directionVector = new Three.Vector3();
      directionVector.subVectors(planet.position, localVertex);
      directionVector.normalize();
      //const ray = new THREE.Raycaster(localVertex, new THREE.Vector3(0, 0, -1));
      const ray = new Three.Raycaster(localVertex, directionVector);
      const collisionResults = ray.intersectObject(planet);
      if (collisionResults.length > 0) {
          sprite.geometry.vertices[vertexIndex].z = collisionResults[0].point.z + 5;
      }
    }

    sprite.geometry.verticesNeedUpdate = true;
    sprite.geometry.normalsNeedUpdate = true;
  }

  createPlanet() {
    const Three = this.helper.getThree();
    const loader = new Three.TextureLoader();
    // Earth
    const spGeo = new Three.SphereGeometry(SPHERE_RADIUS, 50, 50);
    const planetTexture = loader.load('/static/earthmap1k.jpg');
    const planetMap = loader.load('/static/earthbump8k.jpg');
    const alphaMap = loader.load('/static/cities8k.png');
    const mat1 = new Three.MeshPhongMaterial({
      map: planetTexture,
      specular: 0xffffff,
      specularMap: alphaMap,
      bumpMap: planetMap,
      bumpScale: 1.5,
      shininess: 1
    });

    const meshPlanet = new Three.Mesh(spGeo, mat1);

    // Clouds
    const cloudsTexture = loader.load('/static/earthcloudmap.jpg');
    const mat2 = new Three.MeshPhongMaterial({
      color: 0xffffff,
      map: cloudsTexture,
      transparent: true,
      opacity: 0.25
    });

    const meshClouds = new Three.Mesh(spGeo, mat2);
    meshClouds.scale.set(1.015, 1.015, 1.015);

    return { meshPlanet, meshClouds };
  }

  createDestinationArc(pointStart, pointEnd, smoothness, color, clockWise) {
    const Three = this.helper.getThree();
    const cb = new Three.Vector3();
    const ab = new Three.Vector3();
    const normal = new Three.Vector3();
    cb.subVectors(new Three.Vector3(), pointEnd);
    ab.subVectors(pointStart, pointEnd);
    cb.cross(ab);
    normal.copy(cb).normalize();

    let angle = pointStart.angleTo(pointEnd);
    if (clockWise) {
      angle -= Math.PI * 2;
    }

    const angleDelta = angle / (smoothness - 1);
    const geometry = new Three.Geometry();
    const material = new Three.LineBasicMaterial({
      color: 0xff0000
    });

    for (let i = 0; i < smoothness; i += 1) {
      const vertex = pointStart.clone().applyAxisAngle(normal, angleDelta * i);
      geometry.vertices.push(vertex);
    }

    return new Three.Line(geometry, material);
  }

  renderScene() {
    // TESTING
    // console.log(this.camera.position);
    testTime += 0.0005;
    if (testTime > 1) {
      testTime = 0;
    }
    const tempSprite = this.sprites[0];
    if (tempSprite) {
      const {x, y, z} = tempSprite.course.getPoint(testTime);
      // tempSprite.position.set(x, y, z);
      const targetMarker = tempSprite.arc.markers.children[1];
      this.alignSpriteToGlobe(tempSprite, this.globe.position, targetMarker.position);
      // const { lat, long } = this.geoHelper.vector3ToLatLong(tempSprite.position, SPHERE_RADIUS);
    //   if (testTime) {
    //     console.log(lat, long);
    //   }
    //
    //   tempSprite.rotation.z -= this.geoHelper.getInitialBearing(
    //     lat,
    //     long,
    //     51.50,
    //     -0.076
    //   ) * (Math.PI / 180);
    }

    this.helper.controls.update();
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div id="scene" />
    );
  }
}

export default Globe;
