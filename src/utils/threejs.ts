import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { PHYSICS_CONFIG, TEXT_PARAMS } from "../constants/game";

// Create loaders
export const createLoaders = () => {
  const gltfLoader = new GLTFLoader();
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath(
    "https://cdn.jsdelivr.net/npm/three@0.176.0/examples/jsm/libs/draco/"
  );
  gltfLoader.setDRACOLoader(dracoLoader);
  const fontLoader = new FontLoader();

  return { gltfLoader, fontLoader };
};

// Create physics world
export const createPhysicsWorld = () => {
  const world = new CANNON.World();
  world.gravity.set(
    PHYSICS_CONFIG.GRAVITY.x,
    PHYSICS_CONFIG.GRAVITY.y,
    PHYSICS_CONFIG.GRAVITY.z
  );
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.defaultContactMaterial.friction = PHYSICS_CONFIG.DEFAULT_FRICTION;
  return world;
};

// Create floor plane
export const createFloor = (width: number, height: number) => {
  const floorGeometry = new THREE.PlaneGeometry(width, height);
  const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });
  const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);

  floorMesh.rotation.x = -Math.PI / 2;
  floorMesh.position.y = 0;
  floorMesh.receiveShadow = true;

  const floorBody = new CANNON.Body({
    mass: PHYSICS_CONFIG.FLOOR_MASS,
    shape: new CANNON.Plane(),
  });
  floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  floorBody.position.y = 0;

  return { floorMesh, floorBody };
};

// Update mesh position from physics body
export const updateMeshFromBody = (mesh: THREE.Mesh, body: CANNON.Body) => {
  mesh.position.copy(body.position as unknown as THREE.Vector3);
  mesh.quaternion.copy(body.quaternion as unknown as THREE.Quaternion);
};
