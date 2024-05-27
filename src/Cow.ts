import { Scene, Vector3, AbstractMesh, Animation, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager, ExecuteCodeAction , PhysicsAggregate, Quaternion } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Modifier from "./Modifier";

import World, { FILTER_GROUP_GROUND, FILTER_GROUP_OBSTACLE, FILTER_GROUP_LIMIT } from "./World";

import mesh1 from '../assets/models/animals/bison.glb';


interface CowParameters {
    id: string;
    meshPath: string;
    size: number,
    width: number,
    height: number
}

class Cow extends Obstacle {
    private _modifier: Modifier;
    private _hitbox: Mesh;
    private _mesh: Mesh;
    private _meshPath: string;
    private _hitboxAggregate: PhysicsAggregate;
    private _location : Vector3;
    private _direction: string
    private _dispawnerList: AbstractMesh[];
    private _lastPosition: Vector3;
    private world: World;

    private _speed : number;


    private cow1: CowParameters = {
        id: "cow1",
        meshPath: mesh1,
        size: 2.7,
        width: 0.8,
        height: 1.8
    }




    private cows: CowParameters[] = [this.cow1]

    private static readonly COW_SCALING: number = 0.8;

    constructor(scene: Scene, dispawnerList: AbstractMesh[], position: Vector3, world: World) {
        super(scene);
        
        this._location = position;
        this._dispawnerList = dispawnerList;
        this._lastPosition = position;
        this.world = world;
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

    

    public getHitbox() : Mesh {
        return  this._hitbox;
    }

    public getHitboxAggregate(): PhysicsAggregate {
        return  this._hitboxAggregate;
    }

    public setLastPosition(pos:Vector3){
        this._lastPosition= pos;
    }


    //////////////////////////////////////////////////////////
    // methods
    //////////////////////////////////////////////////////////
    
    
    public async createObstacle(): Promise<void> {
        const parent = new TransformNode("cow", this._scene);

        //const random = Math.floor(Math.random() * this.cows.length);
        const cow = this.cows.at(0);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", cow.meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateBox("cowHitbox", { size: cow.size, width: cow.width, height: cow.height}, this._scene);
       
        //this._hitbox.visibility = 0.4
        this._hitbox.isVisible = false;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        this._mesh.scaling = new Vector3(Cow.COW_SCALING, Cow.COW_SCALING, Cow.COW_SCALING);
        
        this._mesh.parent = this._hitbox;
        this._mesh.position = new Vector3(0, -cow.height/2, 0);

        this._mesh.isPickable = false; 
        this._mesh.doNotSyncBoundingInfo = true;

        // this._mesh.rotate(new Vector3(1, 1, 0), Math.PI)
        //this._hitbox.rotate(new Vector3(0, 1, 0), -Math.PI/2)

        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(Cow.COW_SCALING, Cow.COW_SCALING, Cow.COW_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        

        this._hitboxAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.BOX, { mass: 1000, friction:0, restitution: 3 }, this._scene);
        this._hitboxAggregate.body.setMotionType(PhysicsMotionType.STATIC)
        this._hitboxAggregate.body.disablePreStep = false;

        this.setTangible(true);
        this.setParentNode(parent);

    }


    // Create a text of the cube
    public disposeObstacle(): void {
        
        if(this._hitboxAggregate){
            this._hitboxAggregate.dispose();
        }
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

export default Cow;
