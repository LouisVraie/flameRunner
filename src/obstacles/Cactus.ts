import { Scene, Vector3, AbstractMesh, TransformNode, Mesh, PhysicsShapeType, PhysicsMotionType, PhysicsAggregate } from "@babylonjs/core";
import Obstacle from "../Obstacle";
import Modifier from "../Modifier";
import World from "../World";


class Cactus extends Obstacle {
    private _modifier: Modifier;
    private _hitbox: Mesh;
    private _mesh: AbstractMesh;
    private _hitboxAggregate: PhysicsAggregate;
    private _lastPosition: Vector3;
    private world: World;
    

    constructor(scene: Scene, mesh: AbstractMesh, world: World) {
        super(scene);
        
        this._mesh = mesh;
        this.world = world;

    }

    //////////////////////////////////////////////////////////
    // getters and setters
    //////////////////////////////////////////////////////////
    // Mesh
    public getMesh(): AbstractMesh {
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
        this._lastPosition = pos;
    }


    //////////////////////////////////////////////////////////
    // methods
    //////////////////////////////////////////////////////////
    
    
    public async createObstacle(): Promise<void> {
        const parent = new TransformNode("cactus", this._scene);   

        this._hitboxAggregate = new PhysicsAggregate(this._mesh, PhysicsShapeType.MESH, { mass: 40, friction:0, restitution: 2 }, this._scene);
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

export default Cactus;
