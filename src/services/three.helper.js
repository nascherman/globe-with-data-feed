const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);

// For Debugging
window.THREE = THREE;

export default class ThreeHelper {
  constructor(width, height) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.shadowMap.enabled = true;
    this.renderer.setSize(width, height);
    this.renderer.setClearColor(0x111111);
  }

  getRenderer() {
    return this.renderer;
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
    return new THREE.DirectionalLight(colour, intensity);
  }

  setOrbitControls(camera) {
    return new OrbitControls(camera);
  }


  getThree() {
    return THREE;
  }
}
