import * as THREE from "three";
import * as CANNON from "cannon-es";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { Font } from "three/examples/jsm/loaders/FontLoader.js";
import { Letter, TextParams } from "../types/threejs";
import { TEXT_PARAMS, TEXT_CONFIG } from "../constants/game";

// Create text geometry
export const createTextGeometry = (
    char: string,
    font: Font,
    params: TextParams = TEXT_PARAMS
) => {
    const textGeo = new TextGeometry(char, {
        font,
        ...params,
    });

    textGeo.computeBoundingBox();
    textGeo.center();

    return textGeo;
};

// Calculate text offset
export const calculateTextOffset = (word: string, size: number) => {
    return -(word.length * size) / 2;
};

// Create text letters with physics
export const createTextLetters = (
    word: string,
    font: Font,
    scene: THREE.Scene,
    world: CANNON.World,
    textMaterial: THREE.MeshStandardMaterial,
    params: TextParams = TEXT_PARAMS
): Letter[] => {
    const letters: Letter[] = [];
    const offsetX = calculateTextOffset(word, params.size);

    word.split("").forEach((char, i) => {
        const textGeo = createTextGeometry(char, font, params);
        const textMesh = new THREE.Mesh(textGeo, textMaterial);
        textMesh.castShadow = true;

        const bbox = textGeo.boundingBox!;
        const size = new THREE.Vector3();
        bbox.getSize(size);

        const body = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Box(
                new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2)
            ),
            position: new CANNON.Vec3(
                offsetX + i * params.size * TEXT_CONFIG.LETTER_SPACING,
                TEXT_CONFIG.INITIAL_Y_OFFSET + Math.random(),
                TEXT_CONFIG.Z_OFFSET
            ),
        });

        world.addBody(body);
        scene.add(textMesh);
        letters.push({ mesh: textMesh, body });
    });

    return letters;
};

// Clear existing text letters
export const clearTextLetters = (
    letters: Letter[],
    scene: THREE.Scene,
    world: CANNON.World
) => {
    letters.forEach(({ mesh, body }) => {
        scene.remove(mesh);
        world.removeBody(body);
    });
    return [];
};
