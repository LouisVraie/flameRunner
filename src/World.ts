import { AbstractMesh, Color3, DirectionalLight, FreeCamera, HavokPlugin, HemisphericLight, Mesh, MeshBuilder, PhysicsAggregate, PhysicsImpostor, PhysicsShapeType, Scene, SceneLoader, Vector3 } from "@babylonjs/core";
import Player from "./Player";
import Group from "./Group";

class World{
    private _scene: Scene;
    private _worldMesh: AbstractMesh;
    private _physicsPlugin: HavokPlugin;
    private _players: Player[] = [];

    constructor(scene: Scene) {
        this._scene = scene;
    }

    createWorld(worldMesh: AbstractMesh): void {
        this._worldMesh = worldMesh;
        this._worldMesh.scaling = new Vector3(10, 10, 10); // Adjust scaling as needed
        this._worldMesh.position.y = 0; // Adjust position as needed
        this._worldMesh.position.x = 0;
        this._worldMesh.position.z = 0;
        // this._worldMesh.physicsImpostor = new PhysicsImpostor(this._worldMesh, PhysicsImpostor.MeshImpostor, { mass: 0, restitution: 0.9 }, this._scene);
        const worldAggregate = new PhysicsAggregate(this._worldMesh, PhysicsShapeType.MESH, { mass: 0 }, this._scene);
    }

    addGLBMeshToScene(scene: Scene, glbFilePath: string, onSuccess?: () => void, onError?: (message: string) => void): void {
        SceneLoader.ImportMesh('', glbFilePath, '', this._scene, 
            (meshes) => {
                // onSuccess callback
                if (onSuccess) {
                    onSuccess();
                    
                    // Ajouter physicsAggregate après le chargement réussi du mesh
                    const physicsImpostor = new Mesh('physicsAggregate', scene);
                    for (const mesh of meshes) {
                        mesh.setParent(physicsImpostor);
                    }
                    physicsImpostor.physicsImpostor = new PhysicsImpostor(physicsImpostor, PhysicsImpostor.MeshImpostor, { mass: 0 }, scene);

                }
            },
            (event) => {
                // onProgress callback
                console.log(`Loading ${event.loaded}/${event.total}`);
            },
            (scene, message, exception) => {
                // onError callback
                const errorMessage = message ?? (exception?.message ?? "An error occurred while loading the mesh.");
                console.error(errorMessage);
                if (onError) {
                    onError(errorMessage);
                }
            }
        );
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