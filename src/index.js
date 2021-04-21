import * as THREE from "three";
import * as CANNON from "cannon";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import MeshParser, { MeshConfiguration } from "./meshparser";
import RigidBody from "./rigidbody";
import World from "./world";
import { BufferGeometry, MeshStandardMaterial, SphereGeometry } from "three";

const world = new World();

// const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
// const cubeMaterial = new THREE.MeshStandardMaterial({
//     color: 0x777777,
//     flatShading: true,
// });
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
// cube.castShadow = true;
// cube.receiveShadow = true;
// console.log(cube);

// const cubePhysicsMaterial = new CANNON.Material();
// const cubePhysics = new CANNON.Body({
//     mass: 0,
//     position: new CANNON.Vec3(0, 0, 0),
//     shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
//     material: cubePhysicsMaterial,
// });

// const cubeRigidBody = new RigidBody(cube, cubePhysics);
// world.objects.set('default-cube', cubeRigidBody);

world.initialize();
world.light.position.x = -20;
world.light.position.y = 10;
world.light.position.z = 30;
const controls = new OrbitControls(world.camera, world.renderer.domElement);

const cubePhysicsMaterial = new CANNON.Material();
const cubePhysics = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(0, 0, 0),
    shape: new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5)),
    material: cubePhysicsMaterial,
});

// MeshParser.getMeshConfiguration('./cube.mesh.json').then((meshConfiguration) => {
//     const cube = MeshParser.buildMesh(meshConfiguration);
//     world.scene.add(cube);
// });

// MeshParser.getMesh('./cube.mesh.json').then((cube) => {
//     world.scene.add(cube);
// });

// todo meshparser multi-mesh optimization middleware

// async function initialize() {
//     world.scene.add(await MeshParser.getMesh("./cube.mesh.json"));
//     world.scene.add(await MeshParser.getMesh("./wall.mesh.json"));
//     world.scene.add(await MeshParser.getMesh("./sphere.mesh.json"));
// }

// const meshURLs = ["./cube.mesh.json", "./wall.mesh.json", "./sphere.mesh.json"];

async function initialize() {
    world.scene.add(...(await MeshParser.getMeshes("./meshes.json")));
}

initialize();
