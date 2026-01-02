/**
 * Handles the animation loop
 */
export default class Loop {
    constructor(callback) {
        this.callback = callback;
        this.isRunning = false;
        this.animationFrameId = null;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.update();
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    update() {
        if (!this.isRunning) return;

        this.callback();
        this.animationFrameId = requestAnimationFrame(() => this.update());
    }
}
