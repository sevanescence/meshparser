import * as THREE from 'three';
import * as CANNON from 'cannon';
import RigidBody from './rigidbody';

export default class World {
    /** @param {string} containerId */
    constructor(containerId) {
        this.container = document.getElementById(containerId) || document.body;
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.container.appendChild(this.renderer.domElement);
        this.camera = new THREE.PerspectiveCamera(60, this.container.clientWidth / this.container.clientHeight, 0.01, 1000);
        this.scene = new THREE.Scene();
        this.physics = new CANNON.World();

        /** @type {Map<string, RigidBody>} */
        this.objects = new Map();

        this.initialize = this.initialize.bind(this);
        this.initPhysics = this.initPhysics.bind(this);
        this.initBodies = this.initBodies.bind(this);
        this.animate = this.animate.bind(this);
        this.cb = this.cb.bind(this);
    }

    /**
     * Initialize a rigidbody into the world.
     * @param {string} id
     * @param {RigidBody} rigidbody
     */
    addRigidBody(id, rigidbody) {
        this.objects.set(id, rigidbody);
        rigidbody.initialize(this.scene, this.physics);
    }

    initialize() {
        this.renderer.setClearColor(0x222222);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.camera.position.set(0, 5, 20);

        this.ambient = new THREE.AmbientLight(0xffffff, 1);
        this.scene.add(this.ambient);

        this.light = new THREE.DirectionalLight(0xffffff, 1);
        this.light.position.set(0, 0, 0);
        this.light.castShadow = true;
        const distance = 32;
        this.light.shadow.camera.left = -distance;
        this.light.shadow.camera.right = distance;
        this.light.shadow.camera.top = distance;
        this.light.shadow.camera.bottom = -distance;
        this.light.shadow.mapSize.x = 4096;
        this.light.shadow.mapSize.y = 4096;
        this.scene.add(this.light);

        this.helper = new THREE.CameraHelper(this.light.shadow.camera);
        this.scene.add(this.helper);

        this.initPhysics();
        this.initBodies();
        this.animate(0);
    }

    initPhysics() {
        this.physics.gravity.set(0, 0, -9.82);
    }

    initBodies() {
        for (let body of this.objects.values()) {
            body.object.receiveShadow = true;
            body.object.castShadow = true;
            this.scene.add(body.object);
            this.physics.addBody(body.physics);
        }
    }

    /**
     * Called every time World#animate() is called
     * @callback frameCallback
     * @param {number} time
     */

    /**
     *
     * @param {frameCallback} cb
     */
    onFrame(cb) {
        this.cb = cb;
    }

    /**
     * onFrame callback
     * @param {number} time
     */
    cb(time) {}

    animate(time) {
        this.physics.step(1 / 60);
        for (let body of this.objects.values()) {
            body.synchronize();
        }
        this.renderer.render(this.scene, this.camera);

        this.cb(time);
        requestAnimationFrame(this.animate);
    }
}
