import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

import NeuralSphere from '../items/NeuralSphere.js'; // Renamed for sphere
import BackgroundDust from '../items/BackgroundDust.js'; // To be implemented

export default class MainScene {
    constructor() {
        this.container = document.body;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.composer = null;

        // Items
        this.neuralSphere = null;
        this.dust = null;

        // Settings
        this.params = {
            bloomStrength: 1.5,
            bloomRadius: 0.4,
            bloomThreshold: 0,
        };
    }

    init() {
        this.createScene();
        this.createCamera();
        this.createRenderer();
        this.createPostProcessing();
        this.createItems();
    }

    createScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x000000); // OLED Black

        // Add some basic fog for depth (optional, very subtle)
        this.scene.fog = new THREE.FogExp2(0x000000, 0.002);
    }

    createCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.camera.position.z = 50;
        this.camera.position.y = 10;
        this.camera.lookAt(0, 0, 0);
    }

    createRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Dynamic Pixel Ratio
        this.renderer.toneMapping = THREE.ReinhardToneMapping;
        this.container.appendChild(this.renderer.domElement);
    }

    createPostProcessing() {
        const renderScene = new RenderPass(this.scene, this.camera);

        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            this.params.bloomStrength,
            this.params.bloomRadius,
            this.params.bloomThreshold
        );

        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
    }

    createItems() {
        // We will initialize the Items here
        this.neuralSphere = new NeuralSphere(this.scene);
        this.neuralSphere.init();

        this.dust = new BackgroundDust(this.scene);
        this.dust.init();
    }

    update() {
        if (this.neuralSphere) this.neuralSphere.update();
        if (this.dust) this.dust.update();
    }

    render() {
        if (this.composer) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    resize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        if (this.composer) {
            this.composer.setSize(width, height);
        }
    }
}
