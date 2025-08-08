import { useEffect, useRef } from "react";
import { GameRefs } from "../types/threejs";

export const useGame = (
    canvasRef: React.RefObject<HTMLCanvasElement | null>
) => {
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
        if (!canvasRef.current || typeof window === "undefined") return;

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
            } = await import("../utils/character");
            const { Lighting } = await import("../components/threejs/Lighting");
            const { GUI } = await import("../components/threejs/GUI");
            const { ModelLoader } = await import(
                "../components/threejs/ModelLoader"
            );
            const { TextManager } = await import(
                "../components/threejs/TextManager"
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

            // Floor setup
            // const { floorMesh, floorBody } = createFloor(
            //   window.innerWidth / 100,
            //   window.innerHeight / 100
            // );
            // gameRefs.current.planeMaterial =
            //   floorMesh.material as THREE.MeshStandardMaterial;
            // scene.add(floorMesh);
            // world.addBody(floorBody);

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

            // Load trees
            modelLoader.loadTrees(scene);

            // Load building and then character and text
            modelLoader.loadBuilding(scene, world, () => {
                // Create text after building loads
                textManager.createText(scene, world, (letters) => {
                    gameRefs.current.letters = letters;
                });

                // Load character after building loads
                modelLoader.loadCharacter(
                    scene,
                    world,
                    (character, body, mixer, animationsMap) => {
                        gameRefs.current.character = character;
                        gameRefs.current.characterBody = body;
                        gameRefs.current.mixer = mixer;
                        gameRefs.current.animationsMap = animationsMap;
                    }
                );
            });

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

    return gameRefs;
};
