import * as THREE from 'three';
import * as CANNON from 'cannon';

export default class RigidBody {
    /**
     * @param {THREE.Object3D} object
     * @param {CANNON.Body} physics
     */
    constructor(object, physics) {
        this.object =
            object ||
            (() => {
                throw 'Object not defined.';
            })();
        this.physics =
            physics ||
            (() => {
                throw 'Physics not defined. If your object has no physics, use a static body.';
            })();
        this.quaternion = this.object.quaternion;
        this.position = this.object.position;
    }
    cacheState() {
        this.pos = {
            x: this.physics.position.x,
            y: this.physics.position.z,
            z: this.physics.position.y,
        };
        this.vel = {
            x: this.physics.velocity.x,
            y: this.physics.velocity.z,
            z: this.physics.velocity.y,
        };
        this.rot = this.physics.quaternion;
    }
    restore() {
        this.setPosition(...Object.values(this.pos));
        this.setVelocity(...Object.values(this.vel));
        this.physics.quaternion.copy(this.rot);
    }
    // y = z, z = y
    setPosition(x, y, z) {
        const vec = new CANNON.Vec3(x, z, y);
        this.physics.position.copy(vec);
    }
    setVelocity(x, y, z) {
        this.physics.velocity.setZero();
        this.physics.initVelocity.setZero();
        this.physics.angularVelocity.setZero();
        this.physics.initAngularVelocity.setZero();
        const vec = new CANNON.Vec3(x, z, y);
        this.physics.velocity.copy(vec);
    }
    /** Synchronizes object position with physics */
    synchronize() {
        this.quaternion.x = -this.physics.quaternion.x;
        this.quaternion.y = -this.physics.quaternion.z;
        this.quaternion.z = -this.physics.quaternion.y;
        this.quaternion.w = this.physics.quaternion.w;

        this.position.x = this.physics.position.x;
        this.position.y = this.physics.position.z;
        this.position.z = this.physics.position.y;
    }
    /**
     * @param {THREE.Scene} scene - Provided because scene cannot be accessed from object
     *
     * Delete this object from the world.
     */
    delete(scene) {
        scene.remove(this.object);
        this.physics.world.remove(this.physics);
    }
    /**
     * @param {THREE.Scene} scene
     * @param {CANNON.World} world
     *
     * @return {void}
     *
     * Add rigid body to the world.
     */
    initialize(scene, world) {
        scene.add(this.object);
        world.addBody(this.physics);
    }
}
