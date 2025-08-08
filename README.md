# Three.js Character Physics Game

A 3D character physics game built with **Next.js**, **Three.js**, and **Cannon.js** physics engine. Control a character in a 3D environment with physics-based movement, surrounded by 3D text, buildings, and trees.

## 🏗️ Technology Stack

### Core Frameworks

-   **Next.js 15.4.5** - React framework for the web application
-   **React 19.1.0** - UI library
-   **TypeScript** - Type-safe JavaScript
-   **Tailwind CSS** - Utility-first CSS framework

### 3D & Physics

-   **Three.js 0.179.1** - 3D graphics library
-   **Cannon-es 0.20.0** - Physics engine
-   **dat.GUI 0.7.9** - Debug GUI controls

### Key Features

-   3D character with physics-based movement
-   Real-time lighting and shadows
-   Interactive GUI controls
-   3D text with physics
-   Model loading (GLB files)
-   Camera following system

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Main React component
│   ├── layout.tsx            # App layout
│   └── globals.css           # Global styles
├── components/
│   └── threejs/
│       ├── GUI.ts            # Debug GUI controls
│       ├── Lighting.ts       # Lighting system
│       ├── ModelLoader.ts    # 3D model loading
│       └── TextManager.ts    # 3D text management
├── constants/
│   └── game.ts               # Game configuration
├── hooks/
│   └── useGame.ts            # Main game logic hook
├── types/
│   └── threejs.ts            # TypeScript interfaces
└── utils/
    ├── character.ts          # Character movement & physics
    ├── text.ts              # Text utilities
    └── threejs.ts           # Three.js utilities
```

## 🎮 How to Play

1. **Movement:** Use arrow keys to move the character
2. **Running:** Hold Shift + arrow keys to run
3. **GUI Controls:** Use the dat.GUI panel to adjust colors and lighting
4. **Physics:** The character and text letters have physics bodies for realistic movement

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd threejs-character-physics

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the game.

### Build for Production

```bash
npm run build
npm start
```

## 🏗️ Architecture Overview

### 1. Entry Point (`src/app/page.tsx`)

```typescript
const Hero = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useGame(canvasRef); // Custom hook manages the entire 3D scene
    return <canvas ref={canvasRef} className="w-full h-full" />;
};
```

### 2. Core Game Logic (`src/hooks/useGame.ts`)

The heart of the application - a custom React hook that:

-   Sets up the Three.js scene, camera, and renderer
-   Initializes the Cannon.js physics world
-   Manages character movement and animations
-   Handles keyboard input
-   Runs the animation loop
-   Manages component lifecycle

### 3. Configuration (`src/constants/game.ts`)

Centralized configuration for:

-   **GUI parameters** (colors, lighting settings)
-   **Physics constants** (gravity, friction, masses)
-   **Character settings** (movement speeds, camera offset)
-   **Model paths** (3D model file locations)
-   **Animation settings** (FPS, fade durations)

### 4. Type Definitions (`src/types/threejs.ts`)

TypeScript interfaces for:

-   `Letter` - 3D text with physics body
-   `GUIParams` - GUI control parameters
-   `GameRefs` - References to all game objects
-   `CharacterMovement` - Movement state

## 🎯 Key Components & Systems

### 1. Character System

**Location:** `src/utils/character.ts`

-   **Physics-based movement** using arrow keys
-   **Character animations** (Idle, Walk, Run)
-   **Camera following** with smooth interpolation
-   **Physics body creation** for collision detection

### 2. Model Loading System

**Location:** `src/components/threejs/ModelLoader.ts`

-   **GLB model loading** (character, building, trees)
-   **Automatic physics body creation**
-   **Animation mixer setup**
-   **Shadow casting configuration**

### 3. Text System

**Location:** `src/components/threejs/TextManager.ts` + `src/utils/text.ts`

-   **3D text generation** with custom fonts
-   **Physics bodies for each letter**
-   **Dynamic text color changes**
-   **Text positioning and spacing**

### 4. Lighting System

**Location:** `src/components/threejs/Lighting.ts`

-   **Directional light** with shadows
-   **Ambient light** for overall illumination
-   **Light helper** for debugging
-   **Dynamic color changes** via GUI

### 5. GUI System

**Location:** `src/components/threejs/GUI.ts`

-   **Real-time parameter controls**
-   **Color adjustments** for text and lighting
-   **Material property changes**

## 🔧 Adding New Features

### 1. Adding New 3D Models

```typescript
// In src/constants/game.ts
export const MODEL_PATHS = {
  // ... existing paths
  NEW_MODEL: "/assets/models/your-model.glb",
};

// In src/components/threejs/ModelLoader.ts
loadNewModel(scene: THREE.Scene, world: CANNON.World) {
  this.gltfLoader.load(
    MODEL_PATHS.NEW_MODEL,
    (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.scale.set(1, 1, 1);
      scene.add(model);

      // Add physics if needed
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const body = createPhysicsBodyForMesh(child, model.scale, 1);
          world.addBody(body);
        }
      });
    }
  );
}
```

### 2. Adding New Character Animations

```typescript
// In src/utils/character.ts
export const handleCharacterAnimations = (
    mixer: THREE.AnimationMixer,
    animationsMap: Map<string, THREE.AnimationAction>,
    isMoving: boolean,
    speed: number,
    isJumping: boolean // New parameter
) => {
    let animationName = "Idle";

    if (isJumping) {
        animationName = "Jump";
    } else if (isMoving) {
        animationName = speed > 2 ? "Run" : "Walk";
    }

    const currentAction = animationsMap.get(animationName);
    // ... rest of animation logic
};
```

### 3. Adding New Input Controls

```typescript
// In src/hooks/useGame.ts
const handleKeyDown = (event: KeyboardEvent) => {
    gameRefs.current.keysPressed[event.code] = true;

    // Add new controls
    if (event.code === "Space") {
        // Handle jump
        handleJump(gameRefs.current.characterBody);
    }
};

// In src/utils/character.ts
export const handleJump = (characterBody: CANNON.Body) => {
    if (characterBody.position.y < 0.1) {
        // Ground check
        characterBody.velocity.y = 5; // Jump force
    }
};
```

### 4. Adding New GUI Controls

```typescript
// In src/types/threejs.ts
export interface GUIParams {
  // ... existing params
  jumpForce: number;
  cameraDistance: number;
}

// In src/constants/game.ts
export const GUI_PARAMS: GUIParams = {
  // ... existing params
  jumpForce: 5,
  cameraDistance: 2,
};

// In src/components/threejs/GUI.ts
private setupControls() {
  // ... existing controls

  // Add new controls
  this.gui.add(this.params, "jumpForce", 1, 10).onChange((value: number) => {
    // Update jump force
  });

  this.gui.add(this.params, "cameraDistance", 1, 10).onChange((value: number) => {
    // Update camera distance
  });
}
```

### 5. Adding New Physics Effects

```typescript
// In src/utils/threejs.ts
export const createWindEffect = (world: CANNON.World) => {
    const windForce = new CANNON.Vec3(0.1, 0, 0);

    world.addEventListener("postStep", () => {
        world.bodies.forEach((body) => {
            if (body.mass > 0) {
                body.applyForce(windForce, body.position);
            }
        });
    });
};
```

### 6. Adding Sound Effects

```bash
npm install howler
```

```typescript
// In src/utils/audio.ts
import { Howl } from "howler";

export const createAudioManager = () => {
    const sounds = {
        jump: new Howl({ src: ["/assets/sounds/jump.mp3"] }),
        walk: new Howl({ src: ["/assets/sounds/walk.mp3"] }),
    };

    return {
        playJump: () => sounds.jump.play(),
        playWalk: () => sounds.walk.play(),
    };
};
```

### 7. Adding Particle Effects

```typescript
// In src/components/threejs/ParticleSystem.ts
export class ParticleSystem {
    private particles: THREE.Points;

    constructor(scene: THREE.Scene) {
        const geometry = new THREE.BufferGeometry();
        const material = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
        });

        this.particles = new THREE.Points(geometry, material);
        scene.add(this.particles);
    }

    createExplosion(position: THREE.Vector3) {
        // Create particle explosion effect
    }
}
```

## 🎨 Development Best Practices

### Code Organization

1. **Keep components modular** - Each system in its own file
2. **Use TypeScript interfaces** - Define clear contracts
3. **Centralize configuration** - All constants in `game.ts`
4. **Separate concerns** - Physics, rendering, and logic in different files
5. **Use custom hooks** - Encapsulate complex logic

### Performance Tips

1. **Use object pooling** for frequently created/destroyed objects
2. **Implement LOD (Level of Detail)** for distant objects
3. **Optimize physics** by using appropriate collision shapes
4. **Batch rendering** for similar materials
5. **Use instancing** for repeated objects (trees, particles)

### File Structure Guidelines

```
src/
├── components/          # Reusable UI components
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
├── constants/          # Configuration constants
├── types/              # TypeScript type definitions
└── assets/             # Static assets (models, textures, sounds)
```

## 🐛 Troubleshooting

### Common Issues

1. **Models not loading**

    - Check file paths in `MODEL_PATHS`
    - Ensure GLB files are in the correct location
    - Verify model format compatibility

2. **Physics not working**

    - Check gravity settings in `PHYSICS_CONFIG`
    - Verify physics body creation
    - Ensure proper mass values

3. **Performance issues**

    - Reduce polygon count in models
    - Optimize lighting settings
    - Use appropriate physics step size

4. **Animation problems**
    - Verify animation names match GLB file
    - Check animation mixer setup
    - Ensure proper animation state management

## 📚 Resources

-   [Three.js Documentation](https://threejs.org/docs/)
-   [Cannon.js Documentation](https://schteppe.github.io/cannon.js/)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Happy coding! 🎮✨**
