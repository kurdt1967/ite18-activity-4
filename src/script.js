import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Base
 */
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Load Environment Map (for reflections)
 */
const loader = new THREE.CubeTextureLoader();
const environmentMap = loader.load([
    'path_to_right.jpg',  // Replace with your actual environment map images
    'path_to_left.jpg',
    'path_to_top.jpg',
    'path_to_bottom.jpg',
    'path_to_front.jpg',
    'path_to_back.jpg'
]);
scene.background = environmentMap;

/**
 * GLSL Shaders for Unique Patterns
 */
// Pattern 1: Waves pattern
const vertexShader1 = `
varying vec2 vUv;
uniform float uTime;

void main() {
    vUv = uv;
    vec3 newPosition = position;
    newPosition.z += sin(newPosition.x * 5.0 + uTime) * 0.2;
    newPosition.z += sin(newPosition.y * 5.0 + uTime) * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader1 = `
varying vec2 vUv;
void main() {
    vec3 color = vec3(vUv, 0.5);  // Gradient color
    gl_FragColor = vec4(color, 1.0);
}
`;

// Pattern 2: Checkerboard pattern
const vertexShader2 = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader2 = `
varying vec2 vUv;
void main() {
    float checker = mod(floor(vUv.x * 10.0) + floor(vUv.y * 10.0), 2.0);
    vec3 color = mix(vec3(1.0), vec3(0.0), checker); // Black and white checkerboard
    gl_FragColor = vec4(color, 1.0);
}
`;

// Pattern 3: Radial Gradient pattern
const vertexShader3 = `
varying vec2 vUv;
void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader3 = `
varying vec2 vUv;
void main() {
    float dist = length(vUv - vec2(0.5, 0.5));
    vec3 color = vec3(1.0 - dist, dist, 0.0); // Radial gradient effect
    gl_FragColor = vec4(color, 1.0);
}
`;

// Pattern 4: Circular Ripple pattern
const vertexShader4 = `
varying vec2 vUv;
uniform float uTime;
void main() {
    vUv = uv;
    float dist = length(vUv - vec2(0.5, 0.5));
    vec3 newPosition = position;
    newPosition.z += sin(dist * 10.0 - uTime) * 0.2;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

const fragmentShader4 = `
varying vec2 vUv;
void main() {
    vec3 color = vec3(0.5 + vUv.x, 0.5 - vUv.y, 0.5); // Gradient based on UV
    gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * Create Pyramid Shape (Cone Geometry) with custom face patterns
 */
const geometry = new THREE.ConeGeometry(1, 2, 4); // Pyramid with 4 sides

// Create multiple materials with different shaders
const materials = [
    new THREE.ShaderMaterial({
        vertexShader: vertexShader1,
        fragmentShader: fragmentShader1,
        uniforms: { uTime: { value: 0.0 } },
        transparent: true,
        opacity: 0.8,
        envMap: environmentMap,
        envMapIntensity: 1.0,
        refractionRatio: 0.98,
        side: THREE.DoubleSide,
    }),
    new THREE.ShaderMaterial({
        vertexShader: vertexShader2,
        fragmentShader: fragmentShader2,
        transparent: true,
        opacity: 0.8,
        envMap: environmentMap,
        envMapIntensity: 1.0,
        refractionRatio: 0.98,
        side: THREE.DoubleSide,
    }),
    new THREE.ShaderMaterial({
        vertexShader: vertexShader3,
        fragmentShader: fragmentShader3,
        transparent: true,
        opacity: 0.8,
        envMap: environmentMap,
        envMapIntensity: 1.0,
        refractionRatio: 0.98,
        side: THREE.DoubleSide,
    }),
    new THREE.ShaderMaterial({
        vertexShader: vertexShader4,
        fragmentShader: fragmentShader4,
        uniforms: { uTime: { value: 0.0 } },
        transparent: true,
        opacity: 0.8,
        envMap: environmentMap,
        envMapIntensity: 1.0,
        refractionRatio: 0.98,
        side: THREE.DoubleSide,
    }),
];

// Assign each face of the pyramid a different material
const pyramid = new THREE.Mesh(geometry, materials);
scene.add(pyramid);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 3); // Move back to view the pyramid
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({ canvas: canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const tick = () => {
    // Update uniforms
    materials[0].uniforms.uTime.value += 0.01;
    materials[3].uniforms.uTime.value += 0.01;

    // Rotate the pyramid
    pyramid.rotation.y += 0.01;

    // Update controls
    controls.update();

    // Render the scene
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
