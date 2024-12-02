import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new dat.GUI({ width: 340 });

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

// Set background to white
scene.background = new THREE.Color(0xffffff);

/**
 * Shader for Sun Effect with Protruding Waves
 */
// Vertex Shader (Displacement for Waves)
const vertexShader = `
uniform float uTime;
uniform float uWaveSpeed;
uniform float uSmallWaveFrequency;
uniform float uSmallWaveSpeed;
uniform float uWaveHeight;
varying vec2 vUv;

void main() {
    vUv = uv;

    // Sine wave displacement on the sphere surface
    float wave = sin(position.x * 10.0 + uTime * uWaveSpeed) * 0.05;
    float smallWave = sin(position.y * uSmallWaveFrequency + uTime * uSmallWaveSpeed) * 0.03;
    float displacement = wave + smallWave;
    displacement *= uWaveHeight;  // Amplify the wave effect

    // Apply the displacement
    vec3 newPosition = position + normal * displacement;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
`;

// Fragment Shader (Surface Color and Depth Effect)
const fragmentShader = `
uniform float uTime;
uniform vec3 uSurfaceColor;
uniform vec3 uDepthColor;
uniform float uColorMultiplier;
varying vec2 vUv;

void main() {
    // Surface color modulation based on time and UV
    vec3 color = mix(uSurfaceColor, uDepthColor, vUv.y);
    
    // Apply color multiplier to adjust intensity
    color *= uColorMultiplier;

    gl_FragColor = vec4(color, 1.0);
}
`;

/**
 * Sun Geometry and Material
 */
const geometry = new THREE.SphereGeometry(1, 64, 64); // Sphere geometry for the Sun

// Material with the custom shaders
const material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
        uTime: { value: 0.0 },
        uWaveSpeed: { value: 1.0 },
        uSmallWaveFrequency: { value: 10.0 },
        uSmallWaveSpeed: { value: 2.0 },
        uWaveHeight: { value: 0.15 }, // Wave height (how high the surface protrudes)
        uColorMultiplier: { value: 1.0 },
        uSurfaceColor: { value: new THREE.Color(1.0, 0.5, 0.0) }, // Default surface color (yellow-orange)
        uDepthColor: { value: new THREE.Color(1.0, 0.0, 0.0) },   // Default depth color (red)
    },
    emissive: new THREE.Color(1, 1, 0), // Glowing yellow
    emissiveIntensity: 1.5, // Brightness of the glow
    side: THREE.DoubleSide,
    transparent: true,
});

// Mesh
const sun = new THREE.Mesh(geometry, material);
scene.add(sun);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(3, 3, 3); // Move back to view the sun
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * GUI Controls
 */
// Controls for modifying sun appearance
gui.add(material.uniforms.uWaveSpeed, 'value', 0.1, 5, 0.1).name('Wave Speed');
gui.add(material.uniforms.uSmallWaveFrequency, 'value', 1, 30, 1).name('Small Wave Frequency');
gui.add(material.uniforms.uSmallWaveSpeed, 'value', 0.1, 5, 0.1).name('Small Wave Speed');
gui.add(material.uniforms.uWaveHeight, 'value', 0.05, 0.5, 0.01).name('Wave Height');
gui.add(material.uniforms.uColorMultiplier, 'value', 0.1, 5, 0.1).name('Color Multiplier');
gui.addColor(material.uniforms.uSurfaceColor, 'value').name('Surface Color');
gui.addColor(material.uniforms.uDepthColor, 'value').name('Depth Color');

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    // Update shader time
    material.uniforms.uTime.value = elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
