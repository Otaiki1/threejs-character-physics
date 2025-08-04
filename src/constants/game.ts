import { GUIParams, TextParams } from "../types/threejs";

// GUI parameters
export const GUI_PARAMS: GUIParams = {
  textColor: "#b7b7b7",
  planeColor: "#000000",
  dirLightColor: "#ffffff",
  hemiLightSkyColor: "#ffffff",
  hemiLightGroundColor: "#ffffff",
  spotLightColor: "#ffffff",
  spotLightIntensity: 2,
  spotLightDistance: 20,
  spotLightAngle: Math.PI / 2,
  spotLightPenumbra: 0.5,
};

// Text geometry parameters
export const TEXT_PARAMS: TextParams = {
  size: 0.22,
  depth: 0.07,
  curveSegments: 17,
  bevelEnabled: true,
  bevelThickness: 0.02,
  bevelSize: 0.01,
  bevelOffset: 0.015,
  bevelSegments: 9,
};

// Model paths
export const MODEL_PATHS = {
  CHARACTER: "/assets/models/soldier.glb",
  BUILDING: "/assets/models/building.glb",
  TREES: [
    "/assets/models/tree1.glb",
    "/assets/models/tree2.glb",
    "/assets/models/tree5.glb",
    "/assets/models/tree3.glb",
    "/assets/models/tree4.glb",
    "/assets/models/tree6.glb",
    "/assets/models/tree7.glb",
  ],
  FONT: "/assets/fonts/Bruno Ace_Regular.json",
};

// Physics constants
export const PHYSICS_CONFIG = {
  GRAVITY: { x: 0, y: -9.82, z: 0 },
  DEFAULT_FRICTION: 0.4,
  CHARACTER_MASS: 1,
  FLOOR_MASS: 0,
};

// Character movement constants
export const CHARACTER_CONFIG = {
  WALK_SPEED: 2,
  RUN_SPEED: 5,
  SCALE: 0.3,
  CAMERA_OFFSET: { x: 0, y: 1, z: 2 },
  CAMERA_LERP_FACTOR: 0.1,
};

// Building constants
export const BUILDING_CONFIG = {
  SCALE: 0.0009,
  MASS: 0,
};

// Tree constants
export const TREE_CONFIG = {
  SCALE: 0.008,
  BASE_POSITION: { x: 0, y: 0, z: 0 },
};

// Animation constants
export const ANIMATION_CONFIG = {
  FADE_DURATION: 0.2,
  ANIMATION_FPS: 60,
  SUB_STEPS: 3,
};

// Text constants
export const TEXT_CONFIG = {
  WORD: "CHINEDU",
  LETTER_SPACING: 1.5,
  INITIAL_Y_OFFSET: 2,
  Z_OFFSET: 0.5,
};
