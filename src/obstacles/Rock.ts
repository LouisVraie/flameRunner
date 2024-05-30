import { Scene, Vector3, AbstractMesh, Animation, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager, ExecuteCodeAction , PhysicsAggregate } from "@babylonjs/core";
import Obstacle from "../Obstacle";
import Modifier from "../Modifier";
import World, { FILTER_GROUP_GROUND, FILTER_GROUP_OBSTACLE } from "../World";

import mesh2 from '../../assets/models/rocks/Pierre3.glb';
import mesh3 from '../../assets/models/rocks/Pierre4.glb';
import mesh4 from '../../assets/models/rocks/Pierre5.glb';


interface RocksParameters {
    id: string;
    meshPath: string;
    diameterX: number;
    diameterY: number;
    diameterZ: number;
}

class Rock extends Obstacle {
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


    private rock2: RocksParameters = {
        id: "rock2",
        meshPath: mesh2,
        diameterX: 1.5,
        diameterY: 1,
        diameterZ: 1.5
    }

    private rock3: RocksParameters = {
        id: "rock3",
        meshPath: mesh3,
        diameterX: 1,
        diameterY: 1,
        diameterZ: 1
    }

    private rock4: RocksParameters = {
        id: "rock4",
        meshPath: mesh4,
        diameterX: 1.2,
        diameterY: 0.8,
        diameterZ: 1.2
    }


    private rocks: RocksParameters[] = [this.rock2, this.rock3, this.rock4]

    private static readonly ROCK_SCALING: number = 0.8;

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
        const parent = new TransformNode("rock", this._scene);

        const random = Math.floor(Math.random() * this.rocks.length);
        const rock = this.rocks.at(random);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", rock.meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateSphere("rockHitbox", { diameterX: rock.diameterX, diameterY: rock.diameterY, diameterZ: rock.diameterZ}, this._scene);
       
        this._hitbox.isVisible = false;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        
        this._mesh.scaling = new Vector3(Rock.ROCK_SCALING, Rock.ROCK_SCALING, Rock.ROCK_SCALING);
        
        this.world._setShadows(this._mesh);
        

        this._mesh.parent = this._hitbox;
        this._mesh.position = new Vector3(0, 0, 0);

        this._mesh.isPickable = false; 
        this._mesh.doNotSyncBoundingInfo = true;


        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(Rock.ROCK_SCALING, Rock.ROCK_SCALING, Rock.ROCK_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        this._hitboxAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.SPHERE, { mass: 1000, friction:0.1, restitution: 0.4 }, this._scene);
        this._hitboxAggregate.body.disablePreStep = false;
        this._lastPosition = this._hitbox.absolutePosition.clone();

        this.setRockActionManager();
    
        this.setTangible(true);
        this.setParentNode(parent);
    }

    setRockActionManager(){
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

export default Rock;
