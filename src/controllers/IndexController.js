import MainScene from '../scenes/MainScene.js';
import Loop from '../utils/Loop.js';

export default class IndexController {
    constructor() {
        this.scene = null;
        this.loop = null;
    }

    init() {
        console.log('Initializing Neural Matrix Application...');

        // Initialize Scene
        this.scene = new MainScene();
        this.scene.init();

        // Initialize Loop
        this.loop = new Loop(() => this.onUpdate());
        this.loop.start();

        // Handle Resize
        window.addEventListener('resize', () => this.onResize());
    }

    onUpdate() {
        if (this.scene) {
            this.scene.update();
            this.scene.render();
        }
    }

    onResize() {
        if (this.scene) {
            this.scene.resize(window.innerWidth, window.innerHeight);
        }
    }
}
