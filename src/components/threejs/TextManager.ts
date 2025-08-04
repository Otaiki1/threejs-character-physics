import * as THREE from "three";
import * as CANNON from "cannon-es";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { Letter } from "../../types/threejs";
import { createTextLetters, clearTextLetters } from "../../utils/text";
import { MODEL_PATHS, TEXT_CONFIG } from "../../constants/game";

export class TextManager {
  private fontLoader: FontLoader;
  private letters: Letter[] = [];
  private textMaterial: THREE.MeshStandardMaterial | null = null;

  constructor() {
    this.fontLoader = new FontLoader();
  }

  // Create text material
  createTextMaterial(color: string) {
    this.textMaterial = new THREE.MeshStandardMaterial({
      color,
      side: THREE.DoubleSide,
    });
    return this.textMaterial;
  }

  // Get text material
  getTextMaterial() {
    return this.textMaterial;
  }

  // Create text
  createText(
    scene: THREE.Scene,
    world: CANNON.World,
    onTextCreated: (letters: Letter[]) => void
  ) {
    // Clear existing letters
    this.letters = clearTextLetters(this.letters, scene, world);

    if (!this.textMaterial) {
      this.textMaterial = this.createTextMaterial("#b7b7b7");
    }

    this.fontLoader.load(MODEL_PATHS.FONT, (font) => {
      this.letters = createTextLetters(
        TEXT_CONFIG.WORD,
        font,
        scene,
        world,
        this.textMaterial!
      );
      onTextCreated(this.letters);
    });
  }

  // Update letter positions
  updateLetters() {
    this.letters.forEach(({ mesh, body }) => {
      mesh.position.copy(body.position as unknown as THREE.Vector3);
      mesh.quaternion.copy(body.quaternion as unknown as THREE.Quaternion);
    });
  }

  // Get letters
  getLetters() {
    return this.letters;
  }

  // Update text material color
  updateTextColor(color: string) {
    if (this.textMaterial) {
      this.textMaterial.color.set(color);
    }
  }
}
