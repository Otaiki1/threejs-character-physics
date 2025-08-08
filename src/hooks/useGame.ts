import { useEffect, useRef, useState } from "react";
import { GameRefs } from "../types/threejs";
import { LoadingProgress } from "../components/threejs/LoadingManager";

export const useGame = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
    const [loadingProgress, setLoadingProgress] =
        useState<LoadingProgress | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const gameRefs = useRef<GameRefs>({
        gui: null,
        letters: [],
        textMaterial: null,
        planeMaterial: null,
        dirLight: null,
        hemiLight: null,
        spotLight: null,
        character: null,
        characterBody: null,
        mixer: null,
        animationsMap: new Map(),
        keysPressed: {},
        camera: null,
    });

    useEffect(() => {
        if (!canvasRef.current || typeof window === "undefined" || !window)
            return;

        // Dynamic imports to ensure client-side only execution
        const initGame = async () => {
            const THREE = await import("three");
            const CANNON = await import("cannon-es");
            const { GUI_PARAMS, PHYSICS_CONFIG, ANIMATION_CONFIG } =
                await import("../constants/game");
            const {
                createLoaders,
                createPhysicsWorld,
                createFloor,
                updateMeshFromBody,
            } = await import("../utils/threejs");
            const {
                handleCharacterMovement,
                handleCharacterAnimations,
                updateCamera,
                createPhysicsBodyForMesh,
            } = await import("../utils/character");
            const { Lighting } = await import("../components/threejs/Lighting");
            const { GUI } = await import("../components/threejs/GUI");
            const { ModelLoader } = await import(
                "../components/threejs/ModelLoader"
            );
            const { TextManager } = await import(
                "../components/threejs/TextManager"
            );
            const { LoadingManager } = await import(
                "../components/threejs/LoadingManager"
            );

            // Scene setup
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0xaef1ff);

            // Camera setup
            const camera = new THREE.PerspectiveCamera(
                70,
                window.innerWidth / window.innerHeight,
                0.01,
                1000
            );
            camera.position.set(0, 1, 2);
            gameRefs.current.camera = camera;

            // Physics world setup
            const world = createPhysicsWorld();

            // Renderer setup
            const renderer = new THREE.WebGLRenderer({
                canvas: canvasRef.current!,
                antialias: true,
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(window.devicePixelRatio);
            renderer.shadowMap.enabled = true;

            // Create components
            const lighting = new Lighting(scene, GUI_PARAMS);
            const modelLoader = new ModelLoader();
            const textManager = new TextManager();
            const loadingManager = new LoadingManager();

            // Set up loading callbacks
            loadingManager.setProgressCallback((progress) => {
                setLoadingProgress(progress);
            });

            loadingManager.setCompleteCallback(() => {
                setIsLoading(false);
            });

            // Create text material
            gameRefs.current.textMaterial = textManager.createTextMaterial(
                GUI_PARAMS.textColor
            );

            // Create GUI
            const gui = new GUI(
                GUI_PARAMS,
                lighting,
                gameRefs.current.textMaterial,
                gameRefs.current.planeMaterial
            );
            gameRefs.current.gui = gui.getGUI();

            // Load essential models first
            const loadedModels = await loadingManager.loadEssentialModels(
                scene,
                world
            );

            // Process loaded models
            let character: any = null,
                building: any = null,
                font: any = null;

            loadedModels.forEach((model: any) => {
                if (model.type === "model") {
                    if (model.name === "Character") {
                        character = model.data;
                    } else if (model.name === "Building") {
                        building = model.data;
                    }
                } else if (model.type === "font") {
                    font = model.data;
                }
            });

            // Set up character
            if (character) {
                const characterScene = character.scene;
                const animations = character.animations;
                const mixer = new THREE.AnimationMixer(characterScene);
                const animationsMap = new Map<string, any>();

                if (animations && animations.length > 0) {
                    animations.forEach((clip: any) => {
                        const action = mixer.clipAction(clip);
                        animationsMap.set(clip.name, action);
                    });
                    animationsMap.get("Idle")?.play();
                }

                characterScene.scale.set(0.3, 0.3, 0.3);
                scene.add(characterScene);

                let characterBody: any = null;
                characterScene.traverse((child: any) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        characterBody = createPhysicsBodyForMesh(
                            child,
                            characterScene.scale,
                            1
                        );
                        world.addBody(characterBody);
                    }
                });

                if (characterBody) {
                    gameRefs.current.character = characterScene;
                    gameRefs.current.characterBody = characterBody;
                    gameRefs.current.mixer = mixer;
                    gameRefs.current.animationsMap = animationsMap;
                }
            }

            // Set up building
            if (building) {
                const buildingScene = building.scene;
                buildingScene.position.set(0, 0, 0);
                buildingScene.rotation.set(0, 0, 0);
                buildingScene.scale.set(0.0009, 0.0009, 0.0009);
                scene.add(buildingScene);

                buildingScene.traverse((child: any) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        const buildingBody = createPhysicsBodyForMesh(
                            child,
                            buildingScene.scale,
                            0
                        );
                        world.addBody(buildingBody);
                    }
                });
            }

            // Create text with loaded font
            if (font) {
                textManager.createText(scene, world, (letters) => {
                    gameRefs.current.letters = letters;
                });
            }

            // Load trees in background (non-blocking)
            loadingManager.loadTreesInBackground(scene);

            // Keyboard event handlers
            const handleKeyDown = (event: KeyboardEvent) => {
                gameRefs.current.keysPressed[event.code] = true;
            };

            const handleKeyUp = (event: KeyboardEvent) => {
                gameRefs.current.keysPressed[event.code] = false;
            };

            window.addEventListener("keydown", handleKeyDown);
            window.addEventListener("keyup", handleKeyUp);

            // Animation loop
            const clock = new THREE.Clock();
            const animate = () => {
                const delta = clock.getDelta();
                world.step(
                    1 / ANIMATION_CONFIG.ANIMATION_FPS,
                    delta,
                    ANIMATION_CONFIG.SUB_STEPS
                );

                // Handle character movement and animations
                if (
                    gameRefs.current.character &&
                    gameRefs.current.characterBody
                ) {
                    const { isMoving, speed } = handleCharacterMovement(
                        gameRefs.current.keysPressed,
                        gameRefs.current.characterBody,
                        gameRefs.current.character
                    );

                    // Handle animations
                    if (
                        gameRefs.current.mixer &&
                        gameRefs.current.animationsMap
                    ) {
                        handleCharacterAnimations(
                            gameRefs.current.mixer,
                            gameRefs.current.animationsMap,
                            isMoving,
                            speed
                        );
                    }
                }

                // Update letter positions
                gameRefs.current.letters.forEach(({ mesh, body }) => {
                    updateMeshFromBody(mesh, body);
                });

                // Update animation mixer
                if (gameRefs.current.mixer) {
                    gameRefs.current.mixer.update(delta);
                }

                // Update camera position
                if (gameRefs.current.character && gameRefs.current.camera) {
                    updateCamera(
                        gameRefs.current.character,
                        gameRefs.current.camera
                    );
                }

                renderer.render(scene, camera);
            };

            renderer.setAnimationLoop(animate);

            // Handle window resize
            const onWindowResize = () => {
                if (gameRefs.current.camera) {
                    gameRefs.current.camera.aspect =
                        window.innerWidth / window.innerHeight;
                    gameRefs.current.camera.updateProjectionMatrix();
                }
                renderer.setSize(window.innerWidth, window.innerHeight);
            };
            window.addEventListener("resize", onWindowResize);

            // Cleanup function
            return () => {
                renderer.setAnimationLoop(null);
                window.removeEventListener("resize", onWindowResize);
                window.removeEventListener("keydown", handleKeyDown);
                window.removeEventListener("keyup", handleKeyUp);
                if (gameRefs.current.gui) {
                    gui.destroy();
                }
            };
        };

        // Call the async function
        const cleanup = initGame();

        // Return cleanup function
        return () => {
            cleanup.then((cleanupFn) => {
                if (cleanupFn) cleanupFn();
            });
        };
    }, [canvasRef]);

    return { gameRefs, loadingProgress, isLoading };
};
