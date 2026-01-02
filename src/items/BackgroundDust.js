import * as THREE from 'three';

export default class BackgroundDust {
    constructor(scene) {
        this.scene = scene;
        this.points = null;
    }

    init() {
        const particleCount = 2000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        const colorPalette = [
            new THREE.Color(0x00FFFF), // Cyan
            new THREE.Color(0x00FF88), // Spring Green
            new THREE.Color(0x0088FF), // Azure
        ];

        for (let i = 0; i < particleCount; i++) {
            // Random spread in a large volume
            const x = (Math.random() - 0.5) * 200;
            const y = (Math.random() - 0.5) * 100;
            const z = (Math.random() - 0.5) * 100;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Random color from palette
            const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.2,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
        });

        this.points = new THREE.Points(geometry, material);
        this.scene.add(this.points);
    }

    update() {
        if (this.points) {
            // Slow rotation for ambient feel
            this.points.rotation.y += 0.0005;
            this.points.rotation.x += 0.0002;
        }
    }
}
