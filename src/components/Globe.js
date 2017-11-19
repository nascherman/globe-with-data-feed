import React from 'react';
import ThreeHelper from '../services/three.helper';

const SPHERE_RADIUS = 300;
const INITIAL_CAM_POSITION = {
  x: 62,
  y: 258,
  z: 284
};
const INITIAL_SUN_POSITION = {
  x: -1000,
  y: 300,
  z: 0
};

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
    const ambient = this.helper.createAmbience(0xFFFFFF, 0.2);
    const light = this.helper.createDirectionalLight(0xFFFFFF, 1);
    const { meshPlanet, meshClouds } = this.createPlanet();
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
      700,
      700,
      0.015,
      10.15
    );
    this.scene.add(aircraftSprite);

    // Test destination line tracing
    const Three = this.helper.getThree();
    const testData = this.latLongToVector3(51.50, -0.076, SPHERE_RADIUS, 10.15);
    this.scene.add(this.createDestinationArc(
      new Three.Vector3(aircraftSprite.position.x, aircraftSprite.position.y, aircraftSprite.position.z),
      new Three.Vector3(testData.x, testData.y, testData.z),
      500,
      0xff0000,
      false
    ));
  }

  // TODO - render canvas element on a plane
  createGlobeSprite(lat, lon, map, alpha, width, height, spriteScale, spriteHeight) {
    const Three = this.helper.getThree();
    const loader = new Three.TextureLoader();
    // sprite
    const spriteTexture = loader.load(map);
    const spriteAlpha = loader.load(alpha);

    const sprite = new Three.Mesh(
      new Three.PlaneGeometry(width, height),
      new Three.MeshStandardMaterial({
        alphaMap: spriteAlpha,
        map: spriteTexture,
        transparent: true,
        alphaTest: 0.5,
        side: Three.DoubleSide,
        flatShading: true
      })
    );
    const { x, y, z } = this.latLongToVector3(lat, lon, SPHERE_RADIUS, spriteHeight);
    sprite.position.set(x, y, z);
    sprite.scale.set(spriteScale, spriteScale, spriteScale);
    // TODO set rotation based on sphere
    sprite.rotation.set(-0.72, 0, 0);

    return sprite;
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

  latLongToVector3(lat, lon, radius, height) {
    const phi = (lat) * (Math.PI / 180);
    const theta = (lon - 180) * (Math.PI / 180);

    const x = -(radius + height) * Math.cos(phi) * Math.cos(theta);
    const y = (radius + height) * Math.sin(phi);
    const z = (radius + height) * Math.cos(phi) * Math.sin(theta);

    return {x, y, z};
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
      geometry.vertices.push(pointStart.clone().applyAxisAngle(normal, angleDelta * i));
    }

    return new Three.Line(geometry, material);
  }

  renderScene() {
    // console.log(this.camera.position.x, this.camera.position.y, this.camera.position.z);
    this.renderer.render(this.scene, this.camera);
  }

  render() {
    return (
      <div id="scene" />
    );
  }
}

export default Globe;
