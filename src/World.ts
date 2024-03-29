import { AbstractMesh, Color3, DirectionalLight, FreeCamera, HavokPlugin, HemisphericLight, Mesh, MeshBuilder, PhysicsAggregate, PhysicsImpostor, PhysicsMotionType, PhysicsShapeType, Scene, SceneLoader, ScenePerformancePriority, ShadowGenerator, SpotLight, TransformNode, Vector3 } from "@babylonjs/core";
import Player from "./Player";
import Group from "./Group";

import map from "../assets/models/world.glb";
import HavokPhysics from "@babylonjs/havok";

const worldMap = {
    name: "map",
    model: map
}

class World{
    private _scene: Scene;
    private _worldMesh: AbstractMesh;
    private _physicsPlugin: HavokPlugin;
    private _players: Player[] = [];
    private _gameObject: TransformNode;

    constructor(scene: Scene) {
        this._scene = scene;

        this._gameObject = new TransformNode("world", this._scene);
        this._gameObject.position = Vector3.Zero();
    }

    async getInitializedHavok() {
        return await HavokPhysics();
    }

    async createScene(){
        const havokInstance = await this.getInitializedHavok();
        this._scene.collisionsEnabled = true;
        this._scene.performancePriority = ScenePerformancePriority.BackwardCompatible;

        const hk = new HavokPlugin(true, havokInstance);
        this._scene.enablePhysics(new Vector3(0, -9.81, 0), hk)
    }

    async loadWorld(){
        let result = await SceneLoader.ImportMeshAsync("", "", worldMap.model, this._scene);
        
        this._gameObject = result.meshes[0];
        this._gameObject.name = "world";
        this._gameObject.setParent(null);
        this._gameObject.scaling.scaleInPlace(2.5);
        this._gameObject.position.set(0,0,0);

        for (let childMesh of result.meshes) {

            childMesh.refreshBoundingInfo(true);
            if (childMesh.getTotalVertices() > 0) {
                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.4, restitution : 0.1});
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                childMesh.receiveShadows = true;
           }
        }
    }

    async initGame(){
        await this.createScene();
    }
  

    addFreeCamera(name: string,  position: Vector3, zoom : boolean) : void {
        const camera = new FreeCamera(name, position, this._scene);
        if(zoom){
            camera.inputs.addMouseWheel();
        }
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);
    }

    addSphere(name: string, segment: number, diameter: number, posX : number, posY : number, posZ : number, physics : boolean): void{
        const  sphere = MeshBuilder.CreateSphere(name, {segments: segment, diameter: diameter}, this._scene);
        sphere.name = name;
        sphere.position.x = posX;
        sphere.position.y = posY;
        sphere.position.z = posZ;

        if(physics){
            const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.1 }, this._scene);
        }
    }

    addHemisphericLight(name: string, position: Vector3, intensity: number): void{
        const light = new HemisphericLight(name, position, this._scene);
        light.intensity = intensity;
    }

    addDiffuseLight(name: string, position: Vector3, color: Color3): void {
        const light = new DirectionalLight(name, new Vector3(0, -1, 0), this._scene);
        light.position = position;
        light.diffuse = color;
    }

    addPlayer(identifier: string): void {
        const player = new Player(this._scene, identifier);
        player.addCharacterAsync("Wall-E", Group.getSprinter()).then(() => {
            player.updatePlayer();
            this._players.push(player);
        });
    }

    moveCharacter(characterMesh: AbstractMesh, direction: Vector3): void {
        const speed = 0.1;
        characterMesh.moveWithCollisions(direction.multiplyByFloats(speed, speed, speed));
    }

    setPhysicsPlugin(gravity : Vector3, plugin: HavokPlugin): void {
        this._physicsPlugin = plugin;
        this._scene.enablePhysics(gravity, this._physicsPlugin);
    }
}

export default World;