import * as THREE from "three";
import * as CANNON from "cannon-es";

// Interface for letter object with mesh and physics body
export interface Letter {
  mesh: THREE.Mesh;
  body: CANNON.Body;
}

// Interface for GUI parameters
export interface GUIParams {
  textColor: string;
  planeColor: string;
  dirLightColor: string;
  hemiLightSkyColor: string;
  hemiLightGroundColor: string;
  spotLightColor: string;
  spotLightIntensity: number;
  spotLightDistance: number;
  spotLightAngle: number;
  spotLightPenumbra: number;
}

// Interface for text geometry parameters
export interface TextParams {
  size: number;
  depth: number;
  curveSegments: number;
  bevelEnabled: boolean;
  bevelThickness: number;
  bevelSize: number;
  bevelOffset: number;
  bevelSegments: number;
}

// Interface for character movement state
export interface CharacterMovement {
  isMoving: boolean;
  direction: THREE.Vector3;
  speed: number;
}

// Interface for game refs
export interface GameRefs {
  gui: dat.GUI | null;
  letters: Letter[];
  textMaterial: THREE.MeshStandardMaterial | null;
  planeMaterial: THREE.MeshStandardMaterial | null;
  dirLight: THREE.DirectionalLight | null;
  hemiLight: THREE.HemisphereLight | null;
  spotLight: THREE.SpotLight | null;
  character: THREE.Group | null;
  characterBody: CANNON.Body | null;
  mixer: THREE.AnimationMixer | null;
  animationsMap: Map<string, THREE.AnimationAction>;
  keysPressed: { [key: string]: boolean };
  camera: THREE.PerspectiveCamera | null;
}
