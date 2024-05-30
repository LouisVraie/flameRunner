import { Scene, Vector3, AbstractMesh, Animation, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager, ExecuteCodeAction , PhysicsAggregate, Quaternion } from "@babylonjs/core";
import Obstacle from "../Obstacle";
import Modifier from "../Modifier";

import World, { FILTER_GROUP_GROUND, FILTER_GROUP_OBSTACLE, FILTER_GROUP_LIMIT } from "../World";

import mesh1 from '../../assets/models/animals/carp.glb';
import mesh2 from '../../assets/models/animals/tuna.glb';


interface FishParameters {
    id: string;
    meshPath: string;
    size: number;
    width: number;
    height: number;
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
        size: 1.5,
        width: 0.2,
        height: 0.5
    }

    private fish2: FishParameters = {
        id: "fish2",
        meshPath: mesh2,
        size: 2.2,
        width: 0.4,
        height: 0.6
    }

    



    private fishs: FishParameters[] = [this.fish1, this.fish2]

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

        const random = Math.floor(Math.random() * this.fishs.length);
        const fish = this.fishs.at(random);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", fish.meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateBox("fishHitbox", { size: fish.size, width: fish.width, height: fish.height}, this._scene);
       
        this._hitbox.isVisible = false;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        
        //this._mesh.scaling = new Vector3(Fish.FISH_SCALING, Fish.FISH_SCALING, Fish.FISH_SCALING);
        
        this._mesh.parent = this._hitbox;
        this._mesh.position = new Vector3(0, fish.width/3, 0);

        this._mesh.isPickable = false; 
        this._mesh.doNotSyncBoundingInfo = true;

        this._mesh.rotate(new Vector3(0, 0, 1), Math.PI)

        this._hitbox.isPickable = false;
        //this._hitbox.scaling = new Vector3(Fish.FISH_SCALING, Fish.FISH_SCALING, Fish.FISH_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        
        this._hitboxAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.BOX, { mass: 1000, friction:0, restitution: 2 }, this._scene);
        this._hitboxAggregate.body.setMotionType(PhysicsMotionType.STATIC);
        this._hitboxAggregate.body.disablePreStep = false;

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
        
        this.setFishActionManager();
    
        this.setTangible(true);
        this.setParentNode(parent);
    }

    setFishActionManager(){
        this.world.getPlayers().forEach(player =>{
            this._hitbox.actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger : ActionManager.OnIntersectionEnterTrigger,
                    parameter : player.getCharacter().getHitbox()
                },
                () => {
                    player.getCharacter().setHitObstacle(true);
                    setTimeout(function(){
                        player.getCharacter().setHitObstacle(false);
                    }, 2000)
                }
            ))
        })
        
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
