import { Scene, Vector3, AbstractMesh, Animation, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager, ExecuteCodeAction , PhysicsAggregate, Quaternion } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Modifier from "./Modifier";

import World, { FILTER_GROUP_GROUND, FILTER_GROUP_OBSTACLE, FILTER_GROUP_LIMIT } from "./World";

import mesh1 from '../assets/models/animals/carp.glb';
import mesh2 from '../assets/models/animals/tuna.glb';


interface FishParameters {
    id: string;
    meshPath: string;
    diameterX: number;
    diameterY: number;
    diameterZ: number;
}

class Fish extends Obstacle {
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


    private fish1: FishParameters = {
        id: "fish1",
        meshPath: mesh1,
        diameterX: 0.5,
        diameterY: 0.4,
        diameterZ: 1.5
    }

    private fish2: FishParameters = {
        id: "fish2",
        meshPath: mesh2,
        diameterX: 0.5,
        diameterY: 0.8,
        diameterZ: 2.5
    }



    private rocks: FishParameters[] = [this.fish1, this.fish2]

    private static readonly FISH_SCALING: number = 1.5;

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
        const parent = new TransformNode("fish", this._scene);

        const random = Math.floor(Math.random() * this.rocks.length);
        const rock = this.rocks.at(random);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", rock.meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateSphere("fishHitbox", { diameterX: rock.diameterX, diameterY: rock.diameterY, diameterZ: rock.diameterZ}, this._scene);
       
        //this._hitbox.visibility = 0.4
        this._hitbox.isVisible = false;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        
        this._mesh.scaling = new Vector3(Fish.FISH_SCALING, Fish.FISH_SCALING, Fish.FISH_SCALING);
        
        this._mesh.parent = this._hitbox;
        this._mesh.position = new Vector3(0, 0, 0);

        this._mesh.isPickable = false; 
        this._mesh.doNotSyncBoundingInfo = true;

        this._mesh.rotate(new Vector3(1, 1, 0), Math.PI)

        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(Fish.FISH_SCALING, Fish.FISH_SCALING, Fish.FISH_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        
        
        
        // this._hitboxAggregate.body.setMassProperties({
        //     inertia: new Vector3(0, 1, 0)
        // });
        //this._lastPosition = this._hitbox.absolutePosition.clone();

    

        // Define the position and orientation animations that will be populated
        // according to the Path3D properties 
        const frameRate = 60;
        const posAnim = new Animation("cameraPos", "position", frameRate, Animation.ANIMATIONTYPE_VECTOR3);
        const posKeys = [];
        const rotAnim = new Animation("cameraRot", "rotationQuaternion", frameRate, Animation.ANIMATIONTYPE_QUATERNION);
        const rotKeys = [];

        for (let i = 0; i < this.world.getFishCurve().length; i++) {
            const position = this.world.getFishCurve().at(i);
            const tangent = this.world.getFishTangents().at(i);
            const binormal = this.world.getFishBinormals().at(i)

            const rotation = Quaternion.FromLookDirectionRH(tangent, binormal);

            posKeys.push({frame: i * frameRate, value: position});
            rotKeys.push({frame: i * frameRate, value: rotation});
            
        }

        posAnim.setKeys(posKeys);
        rotAnim.setKeys(rotKeys);


        this._hitbox.animations.push(posAnim);
        this._hitbox.animations.push(rotAnim);

        const randomValue = Math.random() * (8.0 - 6.0) + 6.0;
        
        this._scene.beginAnimation(this._hitbox, 0, 15000, true, Math.round(randomValue * 10) / 10);
        

        // switch(this._direction){
        //     case "Left": this._hitbox.rotate(new Vector3(0, 1, 0), Math.PI);
        //     break;
        //     case "Right": this._hitbox.rotate(new Vector3(0, 1, 0), 0);
        //     break;
        //     case "Forth": this._hitbox.rotate(new Vector3(0, 1, 0), -Math.PI/2);
        //     break;
        //     case "Back": 
        //     break;
        // }

    
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

export default Fish;
