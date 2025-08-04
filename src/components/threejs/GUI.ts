import * as dat from "dat.gui";
import { GUIParams } from "../../types/threejs";
import { Lighting } from "./Lighting";
import * as THREE from "three";

export class GUI {
  private gui: dat.GUI;
  private params: GUIParams;
  private lighting: Lighting;
  private textMaterial: THREE.MeshStandardMaterial | null;
  private planeMaterial: THREE.MeshStandardMaterial | null;

  constructor(
    params: GUIParams,
    lighting: Lighting,
    textMaterial: THREE.MeshStandardMaterial | null,
    planeMaterial: THREE.MeshStandardMaterial | null
  ) {
    this.gui = new dat.GUI();
    this.params = params;
    this.lighting = lighting;
    this.textMaterial = textMaterial;
    this.planeMaterial = planeMaterial;

    this.setupControls();
  }

  private setupControls() {
    // Text color control
    this.gui.addColor(this.params, "textColor").onChange((value: string) => {
      if (this.textMaterial) {
        this.textMaterial.color.set(value);
      }
    });

    // Plane color control
    this.gui.addColor(this.params, "planeColor").onChange((value: string) => {
      if (this.planeMaterial) {
        this.planeMaterial.color.set(value);
      }
    });

    // Directional light color control
    this.gui
      .addColor(this.params, "dirLightColor")
      .onChange((value: string) => {
        this.lighting.updateDirLightColor(value);
      });
  }

  // Update materials
  updateMaterials(
    textMaterial: THREE.MeshStandardMaterial | null,
    planeMaterial: THREE.MeshStandardMaterial | null
  ) {
    this.textMaterial = textMaterial;
    this.planeMaterial = planeMaterial;
  }

  // Destroy GUI
  destroy() {
    this.gui.destroy();
  }

  // Get GUI reference
  getGUI() {
    return this.gui;
  }
}
