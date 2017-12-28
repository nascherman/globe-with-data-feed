import React, { PropTypes } from 'react';

import GeoHelper from '../services/geo.helper';
import SceneHelper from '../services/scene.helper';
import NetworkHelper from '../services/network.helper';

import GlobeSprite from '../objects/globeSprite.object';

const SPHERE_RADIUS = 300;
const ALTITUDE = 3;
const INITIAL_CAM_POSITION = {
  x: 50,
  y: 316,
  z: 302
};
const INITIAL_SUN_POSITION = {
  x: 3200,
  y: 0,
  z: 0
};
const CONTROL_OPTIONS = {
  minDistance: 350,
  maxDistance: 1000,
  minPolarAngle: 0.1,
  maxPolarAngle: Math.PI - 0.1,
  enableDamping: true,
  dampingFactor: 0.3,
  zoomSpeed: 0.1,
  rotateSpeed: 0.1
};

const AMBIENT_INTESNITY = 0.2;
const SPOTLIGHT_INTENSITY = 1;
const REVERSE = false;
const HOURS_PER_TICK = 0.1;
const MAX_SPRITE_INSTANCES = 200;

class Globe extends React.Component {
  constructor(props) {
    super(props);
    this.sprites = [];
    this.props = props;

    this.geoHelper = new GeoHelper();
    this.networkHelper = new NetworkHelper();
  }

  componentDidMount() {
    const width = (this.props.width / 100) * document.getElementById('index').clientWidth;
    const height = (this.props.height / 100) * document.getElementById('index').clientHeight;

    this.helper = new SceneHelper(
      width,
      height,
      CONTROL_OPTIONS
    );

    this.renderer = this.helper.getRenderer();
    this.camera = this.helper.getCamera();
    this.clock = this.helper.getClock();
    this.scene = this.helper.getScene();
    // For Debugging
    window.scene = this.scene;
    window.controls = this.helper.getControls();

    this.createScene();
    this.loadData()
      .then((data) => {
        this.populateGlobe(data);
        this.clock.start();
        this.start();
      });
  }

  componentWillUnmount() {
    this.clock.stop();
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
    this.globe = meshPlanet;

    this.scene.add(meshPlanet);
    this.scene.add(meshClouds);
    this.scene.add(ambient);

    const pivot = this.helper.createGroup();
    this.scene.add(pivot);
    pivot.add(light);

    pivot.rotation.set(0, -1.5, 0.35);
    this.sunPivot = pivot;

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

    this.renderer.domElement.addEventListener('click', this._clickHandler.bind(this));
    window.addEventListener('resize', this._resizeHandler.bind(this));
  }

  _resizeHandler() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  _clickHandler(event) {
    const intersects = this.helper.getMouseClickIntersects(
      event,
      this.camera,
      this.sprites.map(sprite => sprite.sprite)
    );
    if (intersects[0] && intersects[0].object && intersects[0].object.craftData) {
      if (!this.props.tooltip) {
        this.props.toggleTooltipVisibility(true);
      }
      this.props.setCraft(intersects[0].object.craftData);
    } else {
      this.props.toggleTooltipVisibility(false);
    }
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
    meshPlanet.receiveShadow = true;
    // Clouds
    const cloudsTexture = loader.load('/static/earthcloudmap.jpg');
    const mat2 = new Three.MeshPhongMaterial({
      color: 0xffffff,
      map: cloudsTexture,
      transparent: true,
      opacity: 0.25
    });

    const meshClouds = new Three.Mesh(spGeo, mat2);
    meshClouds.scale.set(1.02, 1.02, 1.02);

    return { meshPlanet, meshClouds };
  }

  loadData() {
    return this.networkHelper.get('http://localhost:3000/aircraft');
  }

  populateGlobe(data) {
    this.helper.loadOBJ('/static/lp-airplane.obj', (object) => {
      object.children[0].geometry.rotateY(Math.PI + Math.PI / 2);
      const aircraft = data.responseText;
      if (aircraft.length > MAX_SPRITE_INSTANCES) {
        const selectedInstances = [];
        for (let i = 0; i < MAX_SPRITE_INSTANCES; i += 1) {
          const aircraftObject = object.clone();
          const selectionIndex = parseInt(Math.random() * (aircraft.length - 1));
          if (selectedInstances.indexOf(selectionIndex) !== -1) {
            i -= 1;
          } else {
            selectedInstances.push(selectionIndex);
            this._addSprite(aircraft[selectionIndex], aircraftObject);
          }
        }
      } else {
        aircraft.forEach((craftData) => {
          const aircraftObject = object.clone();
          this._addSprite(craftData, aircraftObject);
        });
      }
    });
  }

  _addSprite(craftData, object) {
    const _self = this;
    const aircraftSprite = new GlobeSprite(
      craftData,
      '/static/aircraft-sprite.jpg',
      '/static/aircraft-sprite-alpha.png',
      3,
      3,
      SPHERE_RADIUS + ALTITUDE,
      this.scene,
      REVERSE,
      HOURS_PER_TICK,
      object,
      (sprite) => {
        _self.sprites.push(sprite);
      }
    );


  }

  renderScene() {
    // TESTING
    const tickPercentage = this.clock.getElapsedTime() / (60 * (60 * HOURS_PER_TICK));
    // TODO handle resetting of data
    if (tickPercentage >= 1) {
      // tickPercentage = 0;
    }

    this.sprites.forEach((sprite) => {
      sprite.alignToGlobe(this.globe, tickPercentage);
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

Globe.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  setCraft: PropTypes.func
};

export default Globe;
