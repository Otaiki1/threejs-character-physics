import * as THREE from "three";
import * as CANNON from "cannon-es";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { MODEL_PATHS } from "../../constants/game";

export interface LoadingProgress {
    total: number;
    loaded: number;
    percentage: number;
    currentItem: string;
}

export class LoadingManager {
    private gltfLoader: GLTFLoader;
    private fontLoader: FontLoader;
    private onProgress?: (progress: LoadingProgress) => void;
    private onComplete?: () => void;

    constructor() {
        this.gltfLoader = new GLTFLoader();
        this.fontLoader = new FontLoader();
    }

    setProgressCallback(callback: (progress: LoadingProgress) => void) {
        this.onProgress = callback;
    }

    setCompleteCallback(callback: () => void) {
        this.onComplete = callback;
    }

    // Load essential models first (character and building)
    async loadEssentialModels(scene: THREE.Scene, world: CANNON.World) {
        const essentialModels = [
            { name: "Character", path: MODEL_PATHS.CHARACTER, priority: 1 },
            { name: "Building", path: MODEL_PATHS.BUILDING, priority: 2 },
            { name: "Font", path: MODEL_PATHS.FONT, priority: 3 },
        ];

        const totalItems = essentialModels.length;
        let loadedItems = 0;

        const loadPromises = essentialModels.map((model) => {
            return new Promise((resolve, reject) => {
                if (model.name === "Font") {
                    this.fontLoader.load(
                        model.path,
                        (font) => {
                            loadedItems++;
                            this.updateProgress(
                                loadedItems,
                                totalItems,
                                model.name
                            );
                            resolve({ type: "font", data: font });
                        },
                        undefined,
                        reject
                    );
                } else {
                    this.gltfLoader.load(
                        model.path,
                        (gltf) => {
                            loadedItems++;
                            this.updateProgress(
                                loadedItems,
                                totalItems,
                                model.name
                            );
                            resolve({
                                type: "model",
                                data: gltf,
                                name: model.name,
                            });
                        },
                        undefined,
                        reject
                    );
                }
            });
        });

        return Promise.all(loadPromises);
    }

    // Load trees in background (non-blocking)
    loadTreesInBackground(scene: THREE.Scene) {
        MODEL_PATHS.TREES.forEach((path, index) => {
            // Add a small delay to prevent overwhelming the network
            setTimeout(() => {
                this.gltfLoader.load(
                    path,
                    (gltf) => {
                        const model = gltf.scene;
                        model.position.set(
                            -index * Math.random() + 0.5,
                            0,
                            -index * Math.random() + 0.5
                        );
                        model.scale.set(0.008, 0.008, 0.008);
                        model.castShadow = true;
                        scene.add(model);
                    },
                    undefined,
                    (error) => {
                        console.warn(
                            `Tree ${index + 1} failed to load:`,
                            error
                        );
                    }
                );
            }, index * 500); // Stagger tree loading
        });
    }

    private updateProgress(loaded: number, total: number, currentItem: string) {
        const progress: LoadingProgress = {
            total,
            loaded,
            percentage: Math.round((loaded / total) * 100),
            currentItem,
        };

        if (this.onProgress) {
            this.onProgress(progress);
        }

        if (loaded === total && this.onComplete) {
            this.onComplete();
        }
    }
}
