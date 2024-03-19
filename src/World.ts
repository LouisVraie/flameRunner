import { AbstractMesh, Color3, DirectionalLight, FreeCamera, HavokPlugin, HemisphericLight, MeshBuilder, PhysicsAggregate, PhysicsImpostor, PhysicsShapeType, Scene, Vector3 } from "@babylonjs/core";

class World{
    private _scene: Scene;
    private _worldMesh: AbstractMesh;
    private _physicsPlugin: HavokPlugin;

    constructor(scene: Scene) {
        this._scene = scene;
    }

    createWorld(worldMesh: AbstractMesh): void {
        this._worldMesh = worldMesh;
        this._worldMesh.scaling = new Vector3(10, 10, 10); // Adjust scaling as needed
        this._worldMesh.position.y = 0; // Adjust position as needed
        this._worldMesh.physicsImpostor = new PhysicsImpostor(this._worldMesh, PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.9 }, this._scene);
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
            const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.75 }, this._scene);
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

    addCharacter(characterMesh: AbstractMesh): void {
        // Add character to the scene
        this._scene.addMesh(characterMesh);
        // Apply physics to the character
        characterMesh.physicsImpostor = new PhysicsImpostor(characterMesh, PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0.1 }, this._scene);
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