import React from 'react';

import GeoHelper from '../services/geo.helper';
import SceneHelper from '../services/scene.helper';
import NetworkHelper from '../services/network.helper';

import GlobeSprite from '../objects/globeSprite.object';

const SPHERE_RADIUS = 300;
const ALTITUDE = 10;
const INITIAL_CAM_POSITION = {
  x: 50,
  y: 316,
  z: 302
};
const INITIAL_SUN_POSITION = {
  x: -1000,
  y: 300,
  z: 0
};
const CONTROL_OPTIONS = {
  minDistance: 400,
  maxDistance: 1000,
  minPolarAngle: 0.1,
  maxPolarAngle: Math.PI - 0.1,
  enableDamping: true,
  dampingFactor: 0.3,
  zoomSpeed: 0.1,
  rotateSpeed: 0.1
};

const AIRCRAFT_POSITIONS = {
  start: [43, -79]
};
const AMBIENT_INTESNITY = 1;
const SPOTLIGHT_INTENSITY = 1;
const REVERSE = false;

let testTime = 0;

class Globe extends React.Component {
  constructor(props) {
    super(props);

    this.helper = new SceneHelper(props.width, props.height, CONTROL_OPTIONS);
    this.geoHelper = new GeoHelper();
    this.networkHelper = new NetworkHelper();
    this.renderer = this.helper.getRenderer();
    this.scene = this.helper.getScene();
    this.camera = this.helper.getCamera();
    this.sprites = [];

    // For Debugging
    window.scene = this.scene;
  }

  componentDidMount() {
    this.createScene();
    this.loadData()
      .then((data) => {
        this.populateGlobe(data);
        this.start();
      });
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
    const ambient = this.helper.createAmbience(0xFFFFFF, AMBIENT_INTESNITY);
    const light = this.helper.createDirectionalLight(0xFFFFFF, SPOTLIGHT_INTENSITY);
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

  loadData() {
    return this.networkHelper.get('http://localhost:3000/aircraft');
  }

  populateGlobe(data) {
    const aircraft = data.responseText;

    aircraft.forEach((craft) => {
      const aircraftSprite = new GlobeSprite(
        craft.Lat,
        craft.Long,
        '/static/aircraft-sprite.jpg',
        '/static/aircraft-sprite-alpha.png',
        3,
        3,
        SPHERE_RADIUS + ALTITUDE,
        this.scene
      );

      const estimatedPosition = this.geoHelper.calculateNewPostionFromBearingDistance(
        craft.Lat,
        craft.Long,
        craft.Trak,
        1000
      );
      const destinationCoordinates = this.geoHelper.latLongToVector3(
        estimatedPosition[0],
        estimatedPosition[1],
        SPHERE_RADIUS + ALTITUDE
      );

      aircraftSprite.setDestination(
        destinationCoordinates,
        REVERSE
      );

      this.sprites.push(aircraftSprite);
    });
  }

  renderScene() {
    // TESTING
    // console.log(this.camera.position);
    testTime += 0.0005;
    if (testTime >= 1) {
      testTime = 0;
      this.sprites[0].targetIndex = 1;
      this.sprites.forEach((sprite) => {
        sprite.targetIndex = 1;
      });
    }

    this.sprites.forEach((sprite) => {
      sprite.alignToGlobe(this.globe, testTime);
    });

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
