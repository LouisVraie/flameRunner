import { Scene, Vector3, AbstractMesh, TransformNode, SceneLoader, Mesh, MeshBuilder, ActionManager } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Modifier from "./Modifier";
import { PhysicsAggregate } from "@babylonjs/core";
import World, { FILTER_GROUP_GROUND, FILTER_GROUP_OBSTACLE } from "./World";

import batMesh from '../assets/models/animals/bat.glb';
import beeMesh from '../assets/models/animals/bee.glb';


interface FlyingAnimalParameters {
    id: string;
    meshPath: string;
    size: number;
    width: number;
    height: number;
}

class FlyingAnimal extends Obstacle {
    private _modifier: Modifier;
    private _hitbox: Mesh;
    private _mesh: Mesh;
    private model: number;
    private _meshPath: string;
    private _hitboxAggregate: PhysicsAggregate;
    private _location : Vector3;
    private _direction: string
    private _dispawnerList: AbstractMesh[];
    private _lastPosition: Vector3;
    private world: World;

    private _speed : number;

    private bat: FlyingAnimalParameters = {
        id: "bat",
        meshPath: batMesh,
        size: .8,
        width: .8,
        height: .8
    }

    private bee: FlyingAnimalParameters = {
        id: "bee",
        meshPath: beeMesh,
        size: 1.5,
        width: .5,
        height: .5
    }


    private animals: FlyingAnimalParameters[] = [this.bee, this.bat]

    private static readonly ANIMAL_SCALING: number = 0.4;

    constructor(scene: Scene, dispawnerList: AbstractMesh[], model: number, position: Vector3, direction: string, world: World) {
        super(scene);
        
        this._location = position;
        this._direction = direction;
        this._dispawnerList = dispawnerList;
        this._lastPosition = position;
        this._speed = Math.floor(Math.random() * (15 - 10) + 15);
        this.model = model;
        this.world = world;
        // if(this.model < this.animals.length || this.model > this.animals.length){
        //     this.model = 0;
        // }
    }

    //////////////////////////////////////////////////////////
    // getters and setters
    //////////////////////////////////////////////////////////
    // Mesh
    public getMesh(): Mesh {
        return this._mesh;
    }

    public getLastPosition() : Vector3{
        return this._lastPosition;
    }

    public setLastPosition(pos:Vector3){
        this._lastPosition= pos;
    }

    public getHitbox() : Mesh {
        return  this._hitbox;
    }

    public getHitboxAggregate(): PhysicsAggregate {
        return  this._hitboxAggregate;
    }

    //////////////////////////////////////////////////////////
    // methods
    //////////////////////////////////////////////////////////
    
    public async createObstacle(): Promise<void> {
        const parent = new TransformNode("flyingAnimal", this._scene);
        
        let animal = this.animals.at(this.model);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", animal.meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateBox("flyingAnimalHitbox", { size: animal.size, width: animal.width, height: animal.height}, this._scene);
        this._hitbox.visibility = 0.4/*.4*/;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        this._mesh.scaling = new Vector3(FlyingAnimal.ANIMAL_SCALING, FlyingAnimal.ANIMAL_SCALING, FlyingAnimal.ANIMAL_SCALING);
        
        this.world._setShadows(this._mesh);

        this._mesh.parent = this._hitbox;

        if(animal.id === "bee"){
            this._mesh.position = new Vector3(0, -(animal.height)/2, animal.size*0.1);
        }
        else{
            this._mesh.position = new Vector3(0, -(animal.height)/2, animal.size*0.5);
        }

        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(FlyingAnimal.ANIMAL_SCALING, FlyingAnimal.ANIMAL_SCALING, FlyingAnimal.ANIMAL_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
    
        this._lastPosition = this._hitbox.absolutePosition.clone();

        

        switch(this._direction){
            case "Left": this._hitbox.rotate(new Vector3(0, 1, 0), Math.PI);
            break;
            case "Right": this._hitbox.rotate(new Vector3(0, 1, 0), 0);
            break;
            case "Forth": this._hitbox.rotate(new Vector3(0, 1, 0), -Math.PI/2);
            break;
            case "Back": ;
            break;
        }

        this.setTangible(true);
        this.setParentNode(parent);
    }
    
    public move(): void {

        // Calculer le déplacement en fonction du temps écoulé depuis la dernière trame
        const deltaDistance = this._speed * this._scene.getEngine().getDeltaTime() / 1000;

        let moveDirection = new Vector3(0, 0, -deltaDistance);
        
        // switch(this._direction){
        //     case "Left": moveDirection = new Vector3(0, 0, deltaDistance);
        //     break;
        //     case "Right": moveDirection = new Vector3(0, 0, -deltaDistance);
        //     break;
        //     case "Forth": moveDirection = new Vector3(deltaDistance, 0, 0);
        //     break;
        //     case "Back": moveDirection = new Vector3(-deltaDistance, 0, 0);
        //     break;
        // }
        
        this._hitbox.translate(moveDirection, deltaDistance);
       
        // Mettre à jour la position du véhicule
        this.updatePosition(this._hitbox.getAbsolutePosition());            
    }
    

    public updatePosition(position: Vector3): void {

        this.setLastPosition(position.clone());
        //this._lastPosition = position.clone();
    }

    // Create a text of the cube
    public disposeObstacle(): void {
        if (this._mesh) {
            this._mesh.dispose();
        }
        if(this._hitbox){
            this._hitbox.dispose();
        }
        if (this.getParentNode()) {
            this.getParentNode().dispose();
        }
    }
}

export default FlyingAnimal;
