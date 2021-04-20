import * as THREE from 'three';
import { BoxGeometry } from 'three';

class GeometryConfiguration {
    constructor() {
        this.type = '';
        /** @type {number[]} */
        this.args = [];
    }
}

class MaterialConfiguration {
    constructor() {
        this.type = '';
        this.properties = undefined;
    }
}

const ThreeGeometries = {
    BoxGeometry: THREE.BoxGeometry,
    CircleGeometry: THREE.CircleGeometry,
    ConeGeometry: THREE.ConeGeometry,
    CylinderGeometry: THREE.CylinderGeometry,
    DodecahedronGeometry: THREE.DodecahedronGeometry,
    EdgesGeometry: THREE.EdgesGeometry,
    ExtrudeGeometry: THREE.ExtrudeGeometry,
    IcosahedronGeometry: THREE.IcosahedronGeometry,
    LatheGeometry: THREE.LatheGeometry,
    OctahedronGeometry: THREE.OctahedronGeometry,
    ParametricGeomety: THREE.ParametricGeometry,
    PlaneGeometry: THREE.PlaneGeometry,
    PolyhedronGeometry: THREE.PolyhedronGeometry,
    RingGeometry: THREE.RingGeometry,
    ShapeGeometry: THREE.ShapeGeometry,
    TetrahedronGeometry: THREE.TetrahedronGeometry,
    TextGeometry: THREE.TextGeometry,
    TorusGeometry: THREE.TorusGeometry,
    TorusKnotGeometry: THREE.TorusKnotGeometry,
    TubeGeometry: THREE.TubeGeometry,
    WireframeGeometry: THREE.WireframeGeometry,
};

const ThreeMaterials = {
    LineBasicMaterial: THREE.LineBasicMaterial,
    LineDashedMaterail: THREE.LineDashedMaterial,
    Material: THREE.Material,
    MeshBasicMaterial: THREE.MeshBasicMaterial,
    MeshDepthMaterial: THREE.MeshDepthMaterial,
    MeshDistanceMaterial: THREE.MeshDistanceMaterial,
    MeshLambertMaterial: THREE.MeshLambertMaterial,
    MeshMatcapMaterial: THREE.MeshMatcapMaterial,
    MeshNormalMaterial: THREE.MeshNormalMaterial,
    MeshPhongMaterial: THREE.MeshPhongMaterial,
    MeshPhysicalMaterial: THREE.MeshPhysicalMaterial,
    MeshStandardMaterial: THREE.MeshStandardMaterial,
    MeshToonMaterial: THREE.MeshToonMaterial,
    PointsMaterial: THREE.PointsMaterial,
    RawShaderMaterial: THREE.RawShaderMaterial,
    ShaderMaterial: THREE.ShaderMaterial,
    ShadowMaterial: THREE.ShadowMaterial,
    SpriteMaterial: THREE.SpriteMaterial,
};

export class MeshConfiguration {
    constructor() {
        /** @type {THREE.BufferGeometry} */
        this.geometry = undefined;
        /** @type {THREE.Material} */
        this.material = undefined;
        this.properties = {};
    }
    /**
     * Parse a mesh configuration (x.mesh.json or x.json)
     * @param {any} json
     * @return {MeshConfiguration}
     */
    static getFromConfiguration(json) {
        const meshConfiguration = new MeshConfiguration();
        const meshJSON = json.mesh;

        meshConfiguration.geometry = this.parseMeshGeometry(meshJSON.geometry);
        meshConfiguration.material = this.parseMeshMaterial(meshJSON.material);
        delete meshJSON.geometry;
        delete meshJSON.material;

        for (const [key, value] of Object.entries(meshJSON)) {
            if (value instanceof Array && value.length === 3) {
                meshJSON[key] = new THREE.Vector3(...value);
            }
            if (key === 'customDepthMaterial') {
                meshJSON[key] = new THREE.MeshDepthMaterial(value);
            }
            meshConfiguration.properties[key] = meshJSON[key];
        }

        return meshConfiguration;
    }
    /**
     * Parse the geometry of the mesh configuration
     * @param {GeometryConfiguration} geometryJSON
     * @return {THREE.BufferGeometry}
     */
    static parseMeshGeometry(geometryJSON) {
        return new ThreeGeometries[geometryJSON.type](...geometryJSON.args);
    }
    /**
     * Parse the material of the mesh configuration
     * @param {MaterialConfiguration} materialJSON
     * @return {THREE.Material}
     */
    static parseMeshMaterial(materialJSON) {
        for (const [key, value] of Object.entries(materialJSON.properties)) {
            if (typeof value == 'string' && value.match(/^0x\d{3,6}/)) {
                materialJSON.properties[key] = parseInt(value);
            }
        }
        return new ThreeMaterials[materialJSON.type](materialJSON.properties);
    }
}

export default class MeshParser {
    /**
     *
     * @param {string} url
     * @returns {Promise<THREE.Mesh>}
     */
    static async getMesh(url) {
        const meshConfiguration = await this.getMeshConfiguration(url);
        return this.buildMesh(meshConfiguration);
    }
    /**
     *
     * @param {string} url
     * @return {Promise<MeshConfiguration>}
     */
    static async getMeshConfiguration(url) {
        const json = await fetch(url).then((res) => res.json());
        const meshConfiguration = MeshConfiguration.getFromConfiguration(json);
        return meshConfiguration;
    }
    /**
     * Parse a MeshConfiguration object to a three mesh.
     * @param {MeshConfiguration} meshConfiguration
     * @return {THREE.Mesh}
     */
    static buildMesh(meshConfiguration) {
        const mesh = new THREE.Mesh(meshConfiguration.geometry, meshConfiguration.material);
        for (const [key, value] of Object.entries(meshConfiguration.properties)) {
            if (value instanceof THREE.Vector3) {
                mesh[key].copy(value);
                continue;
            }
            mesh[key] = value;
        }
        return mesh;
    }
}
