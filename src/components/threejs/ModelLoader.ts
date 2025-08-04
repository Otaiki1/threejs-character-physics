import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  MODEL_PATHS,
  BUILDING_CONFIG,
  TREE_CONFIG,
  CHARACTER_CONFIG,
} from "../../constants/game";
import { createPhysicsBodyForMesh } from "../../utils/character";

export class ModelLoader {
  private gltfLoader: GLTFLoader;

  constructor() {
    this.gltfLoader = new GLTFLoader();
  }

  // Load character model
  loadCharacter(
    scene: THREE.Scene,
    world: CANNON.World,
    onCharacterLoaded: (
      character: THREE.Group,
      body: CANNON.Body,
      mixer: THREE.AnimationMixer,
      animationsMap: Map<string, THREE.AnimationAction>
    ) => void
  ) {
    this.gltfLoader.load(
      MODEL_PATHS.CHARACTER,
      (gltf) => {
        const character = gltf.scene;
        const animations = gltf.animations;
        const mixer = new THREE.AnimationMixer(character);
        const animationsMap = new Map<string, THREE.AnimationAction>();

        if (animations && animations.length > 0) {
          animations.forEach((clip: THREE.AnimationClip) => {
            const action = mixer.clipAction(clip);
            animationsMap.set(clip.name, action);
          });
          animationsMap.get("Idle")?.play();
        } else {
          console.log("❌ No animations found in this GLB.");
        }

        character.scale.set(
          CHARACTER_CONFIG.SCALE,
          CHARACTER_CONFIG.SCALE,
          CHARACTER_CONFIG.SCALE
        );
        scene.add(character);

        let characterBody: CANNON.Body | null = null;

        character.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            characterBody = createPhysicsBodyForMesh(child, character.scale, 1);
            world.addBody(characterBody);
          }
        });

        if (characterBody) {
          onCharacterLoaded(character, characterBody, mixer, animationsMap);
        }
      },
      undefined,
      (error) => console.error("Error loading character:", error)
    );
  }

  // Load building model
  loadBuilding(
    scene: THREE.Scene,
    world: CANNON.World,
    onBuildingLoaded: () => void
  ) {
    this.gltfLoader.load(
      MODEL_PATHS.BUILDING,
      (gltf) => {
        const building = gltf.scene;
        building.position.set(0, 0, 0);
        building.rotation.set(0, 0, 0);
        building.scale.set(
          BUILDING_CONFIG.SCALE,
          BUILDING_CONFIG.SCALE,
          BUILDING_CONFIG.SCALE
        );
        scene.add(building);

        building.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;

            const buildingBody = createPhysicsBodyForMesh(
              child,
              building.scale,
              BUILDING_CONFIG.MASS
            );
            world.addBody(buildingBody);
          }
        });

        onBuildingLoaded();
      },
      undefined,
      (error) => console.error("Error loading building:", error)
    );
  }

  // Load tree models
  loadTrees(scene: THREE.Scene) {
    MODEL_PATHS.TREES.forEach((path, index) => {
      this.gltfLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.position.set(
            -index * Math.random() + 0.5,
            0,
            -index * Math.random() + 0.5
          );
          model.scale.set(
            TREE_CONFIG.SCALE,
            TREE_CONFIG.SCALE,
            TREE_CONFIG.SCALE
          );
          model.castShadow = true;
          scene.add(model);
        },
        undefined,
        (error) => {
          console.error(`Error loading ${path}:`, error);
        }
      );
    });
  }
}
