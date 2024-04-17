import { Scene, Vector3, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Modifier from "./Modifier";
import { PhysicsAggregate } from "@babylonjs/core";
import { AbstractMesh } from "babylonjs";

class Vehicle extends Obstacle {
    private _modifier: Modifier;
    private _hitbox: Mesh;
    private _mesh: Mesh;
    private _meshPath: string;
    private _hitboxAggregate: PhysicsAggregate;


    private static readonly VEHICLE_SIZE: number = 4.8;
    private static readonly VEHICLE_HEIGHT: number = 1.7;
    private static readonly VEHICLE_WIDTH: number = 2;
    private static readonly VEHICLE_SCALING: number = 0.8;

    constructor(scene: Scene, path: string) {
        super(scene);
        this._meshPath = path;
    }

    //////////////////////////////////////////////////////////
    // getters and setters
    //////////////////////////////////////////////////////////
    // Mesh
    public getMesh(): Mesh {
        return this._mesh;
    }

    //////////////////////////////////////////////////////////
    // methods
    //////////////////////////////////////////////////////////
    public async createObstacle(): Promise<void> {
        const parent = new TransformNode("vehicule", this._scene);
        parent.position = new Vector3(0, 0, 10);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", this._meshPath, this._scene);
    
        this._mesh = assets.meshes[0] as Mesh;
        this._mesh.position = new Vector3(0, - Vehicle.VEHICLE_HEIGHT / 2, 0);
        this._mesh.scaling = new Vector3(Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING);

        

        this._hitbox = MeshBuilder.CreateBox("vehiculeHitbox", { size: Vehicle.VEHICLE_SIZE, width: Vehicle.VEHICLE_WIDTH, height: Vehicle.VEHICLE_HEIGHT}, this._scene);
        this._hitbox.visibility = 0.4;
        this._hitbox.position = new Vector3(0, 10, 5);
        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        this._hitboxAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.BOX, { mass: 1000, friction:0.5, restitution: 0.01 }, this._scene);
        //this._hitboxAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);
        this._hitboxAggregate.body.disablePreStep = false;
        this._hitboxAggregate.body.setMassProperties({
            inertia: Vector3.ZeroReadOnly
        // centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0),
        });

        for(const childMesh of assets.meshes){
            childMesh.refreshBoundingInfo(true);
            console.log(childMesh.id);
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
        
        this._mesh.parent = this._hitbox;
        //this._mesh = vehicule;
        //this._mesh.parent = this._hitbox;

        this._scene.registerBeforeRender(() => {

            // Récupérer la vitesse linéaire actuelle du personnage
            const currentLinearVelocity = this._hitboxAggregate.body.getLinearVelocity();

            // Ajouter la composante Y de la vitesse linéaire actuelle à la vitesse de déplacement horizontal
            let linearVelocity_y = currentLinearVelocity.y;
            // Déterminez la quantité de déplacement souhaitée pour chaque trame
            const speed = 100; // Vitesse de déplacement en unités par trame

            // Calculer le déplacement en fonction du temps écoulé depuis la dernière trame
            const deltaDistance = speed * this._scene.getEngine().getDeltaTime() / 1000;
            let moveDirection = new Vector3(0, linearVelocity_y, deltaDistance);
            // Déplacer la hitbox sur l'axe Z
            this._hitboxAggregate.body.setLinearVelocity(moveDirection);
            
        });
    
        this.setTangible(true);
        this.setParentNode(parent);
    }
    
    
    

    // Create a text of the cube
    public disposeObstacle(): void {
        if (this._mesh) {
            this._mesh.dispose();
        }
        if (this.getParentNode()) {
            this.getParentNode().dispose();
        }
    }
}

export default Vehicle;
