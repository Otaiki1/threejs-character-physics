import * as THREE from "three";
import * as CANNON from "cannon-es";
import { CHARACTER_CONFIG } from "../constants/game";

// Create physics body for mesh
export const createPhysicsBodyForMesh = (
  mesh: THREE.Mesh,
  scale: THREE.Vector3,
  mass: number = 1
) => {
  const bbox = new THREE.Box3().setFromObject(mesh);
  const size = new THREE.Vector3();
  const center = new THREE.Vector3();
  bbox.getSize(size);
  bbox.getCenter(center);

  const halfExtents = new CANNON.Vec3(
    (size.x * scale.x) / 2,
    (size.y * scale.y) / 2,
    (size.z * scale.z) / 2
  );
  const shape = new CANNON.Box(halfExtents);

  const body = new CANNON.Body({
    mass,
    shape,
    position: new CANNON.Vec3(
      center.x * scale.x,
      center.y * scale.y,
      center.z * scale.z
    ),
  });

  return body;
};

// Handle character movement
export const handleCharacterMovement = (
  keysPressed: { [key: string]: boolean },
  characterBody: CANNON.Body,
  character: THREE.Group,
  walkSpeed: number = CHARACTER_CONFIG.WALK_SPEED,
  runSpeed: number = CHARACTER_CONFIG.RUN_SPEED
) => {
  const speed =
    keysPressed["ShiftLeft"] || keysPressed["ShiftRight"]
      ? runSpeed
      : walkSpeed;

  const velocity = new CANNON.Vec3(0, characterBody.velocity.y, 0);

  let isMoving = false;
  let direction = new THREE.Vector3();

  // Handle direction inputs and character rotation
  if (keysPressed["ArrowUp"]) {
    velocity.z = -speed;
    direction.set(0, 0, -1);
    character.rotation.y = 0; // Face forward
    isMoving = true;
  }
  if (keysPressed["ArrowDown"]) {
    velocity.z = speed;
    direction.set(0, 0, 1);
    character.rotation.y = Math.PI; // Face backward
    isMoving = true;
  }
  if (keysPressed["ArrowLeft"]) {
    velocity.x = -speed;
    direction.set(-1, 0, 0);
    character.rotation.y = Math.PI / 2; // Face left
    isMoving = true;
  }
  if (keysPressed["ArrowRight"]) {
    velocity.x = speed;
    direction.set(1, 0, 0);
    character.rotation.y = -Math.PI / 2; // Face right
    isMoving = true;
  }

  // Update physics velocity
  characterBody.velocity = velocity;

  // Update character position from physics
  character.position.copy(characterBody.position as unknown as THREE.Vector3);

  return { isMoving, direction, speed };
};

// Handle character animations
export const handleCharacterAnimations = (
  mixer: THREE.AnimationMixer,
  animationsMap: Map<string, THREE.AnimationAction>,
  isMoving: boolean,
  speed: number
) => {
  const currentAction = animationsMap.get(
    !isMoving ? (speed > 2 ? "Run" : "Walk") : "Idle"
  );
  const previousAction = Array.from(animationsMap.values()).find(
    (action) => action.isRunning() && action !== currentAction
  );

  if (previousAction && currentAction && previousAction !== currentAction) {
    previousAction.fadeOut(0.2);
    currentAction.reset().fadeIn(0.2).play();
  } else if (currentAction && !currentAction.isRunning()) {
    currentAction.reset().fadeIn(0.2).play();
  }
};

// Update camera to follow character
export const updateCamera = (
  character: THREE.Group,
  camera: THREE.PerspectiveCamera,
  offset: THREE.Vector3 = new THREE.Vector3(
    CHARACTER_CONFIG.CAMERA_OFFSET.x,
    CHARACTER_CONFIG.CAMERA_OFFSET.y,
    CHARACTER_CONFIG.CAMERA_OFFSET.z
  ),
  lerpFactor: number = CHARACTER_CONFIG.CAMERA_LERP_FACTOR
) => {
  const characterPosition = character.position;
  const cameraPosition = characterPosition.clone().add(offset);
  camera.position.lerp(cameraPosition, lerpFactor);
  camera.lookAt(characterPosition);
};
