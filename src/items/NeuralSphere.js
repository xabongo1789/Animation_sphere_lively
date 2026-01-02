import * as THREE from 'three';

export default class NeuralSphere {
    constructor(scene) {
        this.scene = scene;
        this.nodes = [];
        this.connections = [];
        this.nodeGeometry = new THREE.IcosahedronGeometry(0.275, 1);
        this.nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });

        // Group to hold everything for easy manipulation
        this.container = new THREE.Group();
        this.scene.add(this.container);

        // Pulses
        this.pulses = [];
    }

    init() {
        // Create the specific 1 -> 5 structure multiple times to fill the screen
        const clusterRoots = [];

        const totalClusters = 56;
        for (let i = 0; i < totalClusters; i++) {
            const offset = this.getPointOnSphere(i, totalClusters);
            const cluster = this.createNeuralCluster(offset);
            clusterRoots.push(cluster);
        }

        // Interconnect the clusters to ensure no independent neurons
        // Use nearest-neighbor approach for more organic connections
        for (let i = 0; i < clusterRoots.length; i++) {
            const current = clusterRoots[i];

            // Find distances to all other clusters
            const distances = [];
            for (let j = 0; j < clusterRoots.length; j++) {
                if (i === j) continue;
                const other = clusterRoots[j];
                const dist = current.root.position.distanceTo(other.root.position);
                distances.push({ index: j, dist: dist });
            }

            // Sort by distance
            distances.sort((a, b) => a.dist - b.dist);

            // Connect to the 3 closest clusters
            // This ensures local connectivity and avoids long, cross-screen lines unless necessary
            for (let k = 0; k < Math.min(3, distances.length); k++) {
                const targetIndex = distances[k].index;
                const target = clusterRoots[targetIndex];

                // createConnection handles drawing the line
                // We don't check for duplicates here (A->B and B->A), 
                // but that's fine, it just adds a bit more intensity to the link.
                this.createConnection(current.root, target.root);
            }
        }
    }

    getPointOnSphere(index, total) {
        // Distribute neurons evenly on a sphere surface using Fibonacci Sphere algorithm
        const radius = 20;
        const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle in radians

        const y = 1 - (index / (total - 1)) * 2; // y goes from 1 to -1
        const r = Math.sqrt(1 - y * y); // radius at y

        const theta = phi * index;

        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;

        return new THREE.Vector3(x * radius, y * radius, z * radius);
    }

    createNeuralCluster(origin) {
        // 1. Root Node (The input)
        const rootNode = this.createNode(origin);

        // 2. Connector Node (The hub)
        // Positioned slightly away from root
        const connectorPos = origin.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        ));
        const connectorNode = this.createNode(connectorPos);

        // Link Root -> Connector
        this.createConnection(rootNode, connectorNode);

        // 3. 5 Leaf Nodes (The output)
        for (let i = 0; i < 5; i++) {
            const leafPos = connectorPos.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            ));
            const leafNode = this.createNode(leafPos);
            // Link Connector -> Leaf
            this.createConnection(connectorNode, leafNode);
        }

        return { root: rootNode, connector: connectorNode };
    }

    createNode(position) {
        const mesh = new THREE.Mesh(this.nodeGeometry, this.nodeMaterial);
        mesh.position.copy(position);
        this.container.add(mesh);
        this.nodes.push(mesh);
        return mesh;
    }

    createConnection(nodeA, nodeB) {
        // Create a static line for the connection structure
        const points = [nodeA.position, nodeB.position];
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({
            color: 0x005555,
            transparent: true,
            opacity: 0.3
        });
        const line = new THREE.Line(geometry, material);
        this.container.add(line);
        this.connections.push({ line, start: nodeA.position, end: nodeB.position });

        // Add a pulse to this connection
        if (Math.random() < 0.4) {
            this.createPulse(nodeA.position, nodeB.position);
        }
    }

    createPulse(start, end) {
        // Visual representation of data moving (a small point or glowing segment)
        const geometry = new THREE.SphereGeometry(0.15, 8, 8);
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);

        this.container.add(mesh);

        this.pulses.push({
            mesh: mesh,
            start: start,
            end: end,
            progress: Math.random(), // Start at random positions
            speed: 0.005 + Math.random() * 0.01 // Random speed
        });
    }

    update() {
        // Animate pulses
        for (const pulse of this.pulses) {
            pulse.progress += pulse.speed;
            if (pulse.progress > 1) {
                pulse.progress = 0;
            }

            // Lerp position
            pulse.mesh.position.lerpVectors(pulse.start, pulse.end, pulse.progress);
        }

        // Slowly rotate the entire matrix for dynamic feel
        this.container.rotation.y += 0.001;
    }
}

