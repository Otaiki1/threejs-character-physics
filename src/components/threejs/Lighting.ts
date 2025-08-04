import * as THREE from "three";
import { GUIParams } from "../../types/threejs";

export class Lighting {
  private dirLight: THREE.DirectionalLight;
  private ambLight: THREE.AmbientLight;
  private helper: THREE.DirectionalLightHelper;

  constructor(scene: THREE.Scene, params: GUIParams) {
    // Directional light
    this.dirLight = new THREE.DirectionalLight(0xffffff, 10);
    this.dirLight.position.set(-30, 10, -11.5);
    this.dirLight.castShadow = true;
    scene.add(this.dirLight);

    // Helper for directional light
    this.helper = new THREE.DirectionalLightHelper(this.dirLight, 5);
    scene.add(this.helper);

    // Ambient light
    this.ambLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(this.ambLight);
  }

  // Update directional light color
  updateDirLightColor(color: string) {
    this.dirLight.color.set(color);
  }

  // Get directional light reference
  getDirLight() {
    return this.dirLight;
  }

  // Get ambient light reference
  getAmbLight() {
    return this.ambLight;
  }

  // Get helper reference
  getHelper() {
    return this.helper;
  }
}
