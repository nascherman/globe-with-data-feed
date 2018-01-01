import ThreeHelper from '../services/three.helper';

export default class SceneHelper extends ThreeHelper {
  constructor(width, height, controlOptions) {
    super(width, height);
    this.scene = this.createScene();
    this.camera = this.createCamera(45, width, height);
    this.controls = this.setOrbitControls(this.camera, controlOptions);

    this.scene.add(this.camera);
  }

  getScene() {
    return this.scene;
  }

  getCamera() {
    return this.camera;
  }

  getRenderer() {
    return this.renderer;
  }

  getControls() {
    return this.controls;
  }
}
