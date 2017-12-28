const THREE = require('three');

const OrbitControls = require('three-orbit-controls')(THREE);

// For Debugging
window.THREE = THREE;
require('../util/three-obj-loader');

export default class ThreeHelper {
  constructor(width, height) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x111111);
  }

  createScene() {
    return new THREE.Scene();
  }

  createCamera(fov, width, height) {
    return new THREE.PerspectiveCamera(fov, width / height, 0.1, 10000);
  }

  createAmbience(colour, intensity) {
    return new THREE.AmbientLight(colour, intensity);
  }

  createDirectionalLight(colour, intensity) {
    const spotlight = new THREE.SpotLight(colour);
    spotlight.castShadow = true;
    spotlight.intensity = intensity;
    spotlight.angle = 0.12;
    spotlight.shadow.camera.near = 0.5;
    spotlight.shadow.camera.far = 5000;
    spotlight.shadowMapWidth = 8192;
    spotlight.shadowMapHeight = 8192;
    return spotlight;
  }

  createGroup() {
    return new THREE.Group();
  }

  setOrbitControls(camera, options) {
    let controls = new OrbitControls(camera);
    Object.assign(controls, options)
    return controls;
  }

  getThree() {
    return THREE;
  }

  getClock() {
    return new THREE.Clock();
  }

  getMouseClickIntersects(event, camera, objects) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(); // create once
    mouse.x = (event.clientX / this.renderer.domElement.clientWidth) * 2 - 1;
    mouse.y = -(event.clientY / this.renderer.domElement.clientHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    return raycaster.intersectObjects(objects, true);
  }

  loadOBJ(url, cb) {
    const loader = new THREE.OBJLoader();
    loader.load(url, cb);
  }
}
