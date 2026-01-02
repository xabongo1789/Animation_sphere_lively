import * as THREE from 'three';

export default class NeuralSphere {
    constructor(scene) {
        this.scene = scene;

        // Data storage for generation
        this.nodePositions = [];
        this.connectionPoints = [];
        this.pulseData = [];

        // Geometries/Materials
        this.nodeGeometry = new THREE.IcosahedronGeometry(0.275, 1);
        this.nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ffff, wireframe: true });

        this.pulseGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        this.pulseMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });

        this.lineMaterial = new THREE.LineBasicMaterial({
            color: 0x005555,
            transparent: true,
            opacity: 0.3
        });

        // Group to hold everything
        this.container = new THREE.Group();
        this.scene.add(this.container);

        // Rendering Objects
        this.nodesMesh = null;
        this.connectionsLines = null;
        this.pulsesMesh = null;

        // Helper for matrix updates
        this.dummy = new THREE.Object3D();
    }

    init() {
        // --- 1. GENERATE DATA (LOGIC ONLY) ---
        const clusterRoots = [];
        const totalClusters = 56;

        for (let i = 0; i < totalClusters; i++) {
            const offset = this.getPointOnSphere(i, totalClusters);
            const cluster = this.createNeuralCluster(offset);
            clusterRoots.push(cluster);
        }

        // Interconnect clusters
        for (let i = 0; i < clusterRoots.length; i++) {
            const current = clusterRoots[i];

            // Calc distances
            const distances = [];
            for (let j = 0; j < clusterRoots.length; j++) {
                if (i === j) continue;
                const other = clusterRoots[j];
                const dist = current.root.position.distanceTo(other.root.position);
                distances.push({ index: j, dist: dist });
            }
            distances.sort((a, b) => a.dist - b.dist);

            // Connect to 3 closest
            for (let k = 0; k < Math.min(3, distances.length); k++) {
                const target = clusterRoots[distances[k].index];
                this.createConnection(current.root, target.root);
            }
        }

        // --- 2. BUILD MESHES FROM DATA ---

        // A. Nodes (InstancedMesh)
        if (this.nodePositions.length > 0) {
            this.nodesMesh = new THREE.InstancedMesh(
                this.nodeGeometry,
                this.nodeMaterial,
                this.nodePositions.length
            );

            for (let i = 0; i < this.nodePositions.length; i++) {
                this.dummy.position.copy(this.nodePositions[i]);
                this.dummy.updateMatrix();
                this.nodesMesh.setMatrixAt(i, this.dummy.matrix);
            }
            this.nodesMesh.instanceMatrix.needsUpdate = true;
            this.container.add(this.nodesMesh);
        }

        // B. Connections (LineSegments)
        if (this.connectionPoints.length > 0) {
            const geometry = new THREE.BufferGeometry().setFromPoints(this.connectionPoints);
            this.connectionsLines = new THREE.LineSegments(geometry, this.lineMaterial);
            this.container.add(this.connectionsLines);
        }

        // C. Pulses (InstancedMesh)
        if (this.pulseData.length > 0) {
            this.pulsesMesh = new THREE.InstancedMesh(
                this.pulseGeometry,
                this.pulseMaterial,
                this.pulseData.length
            );
            // Initial positions will be set in update()
            this.container.add(this.pulsesMesh);
        }
    }

    getPointOnSphere(index, total) {
        const radius = 20;
        const phi = Math.PI * (3 - Math.sqrt(5));
        const y = 1 - (index / (total - 1)) * 2;
        const r = Math.sqrt(1 - y * y);
        const theta = phi * index;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        return new THREE.Vector3(x * radius, y * radius, z * radius);
    }

    createNeuralCluster(origin) {
        // 1. Root
        const rootNode = this.createNode(origin);

        // 2. Connector
        const connectorPos = origin.clone().add(new THREE.Vector3(
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5
        ));
        const connectorNode = this.createNode(connectorPos);

        this.createConnection(rootNode, connectorNode);

        // 3. Leaves
        for (let i = 0; i < 5; i++) {
            const leafPos = connectorPos.clone().add(new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8
            ));
            const leafNode = this.createNode(leafPos);
            this.createConnection(connectorNode, leafNode);
        }

        return { root: rootNode, connector: connectorNode };
    }

    createNode(position) {
        // Just store position, don't create mesh
        this.nodePositions.push(position);
        return { position: position };
    }

    createConnection(nodeA, nodeB) {
        // Store points for LineSegments
        this.connectionPoints.push(nodeA.position);
        this.connectionPoints.push(nodeB.position);

        // Chance for pulse
        if (Math.random() < 0.4) {
            this.createPulse(nodeA.position, nodeB.position);
        }
    }

    createPulse(start, end) {
        this.pulseData.push({
            start: start,
            end: end,
            progress: Math.random(),
            speed: 0.005 + Math.random() * 0.01
        });
    }

    update() {
        // Update Pulses
        if (this.pulsesMesh && this.pulseData.length > 0) {
            for (let i = 0; i < this.pulseData.length; i++) {
                const p = this.pulseData[i];

                p.progress += p.speed;
                if (p.progress > 1) p.progress = 0;

                this.dummy.position.lerpVectors(p.start, p.end, p.progress);
                this.dummy.updateMatrix();

                this.pulsesMesh.setMatrixAt(i, this.dummy.matrix);
            }
            this.pulsesMesh.instanceMatrix.needsUpdate = true;
        }

        // Rotate Container
        this.container.rotation.y += 0.001;
    }
}
