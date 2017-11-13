import React from 'react';
import ThreeHelper from '../services/three.helper';

const SPHERE_RADIUS = 300;

class Globe extends React.Component {
  constructor(props) {
    super(props);

    this.helper = new ThreeHelper(props.width, props.height);
    this.renderer = this.helper.getRenderer();
    this.scene = this.helper.createScene();
    this.camera = this.helper.createCamera(45, props.width, props.height);
    this.helper.setOrbitControls(this.camera);

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
    const ambient = this.helper.createAmbience(0xFFFFFF, 0.3);
    const light = this.helper.createDirectionalLight(0xFFFFFF, 1);

    const { meshPlanet, meshClouds } = this.createPlanet();
    this.scene.add(meshPlanet);
    this.scene.add(meshClouds);
    this.scene.add(ambient);
    this.scene.add(light);
    this.camera.lookAt(this.scene.position);
    this.camera.position.x = -100;

    const el = document.getElementById('scene');
    el.appendChild(this.renderer.domElement);

    // test
    this.scene.add(this.createMarker(43.761539, -79.411079));
  }

  // TODO - render canvas element on a plane
  createMarker(lat, lon) {
    const Three = this.helper.getThree();
    const cube = new Three.Mesh(new Three.CubeGeometry(
      5, 5, 3, 1, 1, 1, new Three.MeshLambertMaterial({color: 0x000000, opacity: 0.6})
    ));
    const { x, y, z } = this.latLongToVector3(lat, lon, SPHERE_RADIUS, 1);
    cube.position.set(x, y, z);

    return cube;
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
      bumpScale: 4,
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

  latLongToVector3(lat, lon, radius, height) {
    const phi = (lat) * (Math.PI / 180);
    const theta = (lon - 180) * (Math.PI / 180);

    const x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
    const y = (radius + height) * Math.sin(phi);
    const z = (radius + height) * Math.cos(phi) * Math.sin(theta);

    return {x, y, z};
  }

  renderScene() {
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div id="scene" />
    );
  }
}

export default Globe;
