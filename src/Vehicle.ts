import { Scene, Vector3, AbstractMesh, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Modifier from "./Modifier";
import { PhysicsAggregate } from "@babylonjs/core";


class Vehicle extends Obstacle {
    private _modifier: Modifier;
    private _hitbox: Mesh;
    private _mesh: Mesh;
    private _meshPath: string;
    private _hitboxAggregate: PhysicsAggregate;
    private _location : Vector3;
    private _direction: string
    private _dispawnerList: AbstractMesh[];
    private _lastPosition: Vector3;

    private _speed : number;


    private static readonly VEHICLE_SIZE: number = 4.8;
    private static readonly VEHICLE_HEIGHT: number = 1.7;
    private static readonly VEHICLE_WIDTH: number = 2;
    private static readonly VEHICLE_SCALING: number = 0.8;

    constructor(scene: Scene, dispawnerList: AbstractMesh[], path: string, position: Vector3, direction: string) {
        super(scene);
        this._meshPath = path;
        this._location = position;
        //console.log("position", this._location)
        this._direction = direction;
        this._dispawnerList = dispawnerList;
        this._lastPosition = position;
        this._speed = Math.floor(Math.random() * (181 - 150) + 150);
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
        const parent = new TransformNode("vehicule", this._scene);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", this._meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateBox("vehiculeHitbox", { size: Vehicle.VEHICLE_SIZE, width: Vehicle.VEHICLE_WIDTH, height: Vehicle.VEHICLE_HEIGHT}, this._scene);
        this._hitbox.visibility = 0.4;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        this._mesh.scaling = new Vector3(Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING);
        
        

        this._mesh.parent = this._hitbox;
        this._mesh.position = new Vector3(0, -(Vehicle.VEHICLE_WIDTH-0.5)/2, 0);
        //this._mesh.position.y = -(this._lastPosition.y*3.3);


        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        this._hitboxAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.BOX, { mass: 1000, friction:0, restitution: 0 }, this._scene);
        //this._hitboxAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this._hitboxAggregate.body.disablePreStep = false;
        this._hitboxAggregate.body.setMassProperties({
            inertia: Vector3.ZeroReadOnly
            // centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0),
        });

        this._lastPosition = this._hitbox.absolutePosition.clone();

        for(const childMesh of assets.meshes){
            childMesh.refreshBoundingInfo(true);
            //console.log(childMesh.id);
            if (childMesh.getTotalVertices() > 0) {
                if(childMesh.id.startsWith("Police Muscle wheel")) {
                    // const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:1, friction: 0.5, restitution: 0});
                    // meshAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
                    this._scene.registerBeforeRender(() => {
                        const rotation = 5 * this._scene.getEngine().getDeltaTime() / 1000;
                        
                        childMesh.rotation.x += rotation;
                    });
                }
                
            }
        }
        
       
        //this._mesh = vehicule;
        //this._mesh.parent = this._hitbox;

        switch(this._direction){
            case "Left": this._hitbox.rotate(new Vector3(0, 1, 0), Math.PI/2);
            break;
            case "Right": this._hitbox.rotate(new Vector3(0, 1, 0), -Math.PI/2);
            break;
            case "Forth": this._hitbox.rotate(new Vector3(0, 1, 0), Math.PI);
            break;
            case "Back": ;
            break;
        }

        
        
       
    
        this.setTangible(true);
        this.setParentNode(parent);
    }

    
    
    

    
    public move(): void {

        // Récupérer la vitesse linéaire actuelle du personnage
        const currentLinearVelocity = this._hitboxAggregate.body.getLinearVelocity();

        // Ajouter la composante Y de la vitesse linéaire actuelle à la vitesse de déplacement horizontal
        let linearVelocity_y = currentLinearVelocity.y;
        // Déterminez la quantité de déplacement souhaitée pour chaque trame
        //const speed = 100 // Vitesse de déplacement en unités par trame

        // Calculer le déplacement en fonction du temps écoulé depuis la dernière trame
        const deltaDistance = this._speed * this._scene.getEngine().getDeltaTime() / 1000;

        let moveDirection = null;
        
        switch(this._direction){
            case "Left": moveDirection = new Vector3(-deltaDistance, linearVelocity_y, 0);;
            break;
            case "Right": moveDirection = new Vector3(deltaDistance, linearVelocity_y, 0);;
            break;
            case "Forth": moveDirection = new Vector3(0, linearVelocity_y, deltaDistance);
            break;
            case "Back": moveDirection = new Vector3(0, linearVelocity_y, -deltaDistance);
            break;
        }
        // Déplacer la hitbox sur l'axe Z
        this._hitboxAggregate.body.setLinearVelocity(moveDirection);

       
        // Mettre à jour la position du véhicule
        this.updatePosition(this._hitboxAggregate.transformNode.getAbsolutePosition());
                 
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

export default Vehicle;
