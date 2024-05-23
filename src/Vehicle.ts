import { Scene, Vector3, AbstractMesh, Animation, TransformNode, SceneLoader, Mesh, PhysicsShapeType, PhysicsMotionType, MeshBuilder, ActionManager, ExecuteCodeAction } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Modifier from "./Modifier";
import { PhysicsAggregate } from "@babylonjs/core";
import { FILTER_GROUP_GROUND, FILTER_GROUP_OBSTACLE } from "./World";

import mesh1 from '../assets/models/vehicles/voiture4.glb';
import mesh2 from '../assets/models/vehicles/ambulance.glb';
import mesh3 from '../assets/models/vehicles/bus.glb';
import mesh4 from '../assets/models/vehicles/camion_pompier.glb';
import mesh5 from '../assets/models/vehicles/camion2.glb';
import mesh6 from '../assets/models/vehicles/policeCar.glb';
import mesh7 from '../assets/models/vehicles/taxi.glb';
import mesh8 from '../assets/models/vehicles/Tractor.glb';

interface VehicleParameters {
    id: string;
    meshPath: string;
    size: number;
    width: number;
    height: number;
}

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

    private vehicle1: VehicleParameters = {
        id: "vehicle1",
        meshPath: mesh1,
        size: 4.2,
        width: 2,
        height: 1.7
    }

    private vehicle2: VehicleParameters = {
        id: "vehicle2",
        meshPath: mesh2,
        size: 4.2,
        width: 1.8,
        height: 2.3
    }

    private vehicle3: VehicleParameters = {
        id: "vehicle3",
        meshPath: mesh3,
        size: 10.6,
        width: 2.8,
        height: 3.4
    }

    private vehicle4: VehicleParameters = {
        id: "vehicle4",
        meshPath: mesh4,
        size: 7.8,
        width: 2.3,
        height: 2.4
    }

    private vehicle5: VehicleParameters = {
        id: "vehicle5",
        meshPath: mesh5,
        size: 11,
        width: 2.5,
        height: 3.2
    }

    private vehicle6: VehicleParameters = {
        id: "vehicle6",
        meshPath: mesh6,
        size: 4.8,
        width: 1.8,
        height: 1.5
    }

    private vehicle7: VehicleParameters = {
        id: "vehicle7",
        meshPath: mesh7,
        size: 4,
        width: 1.6,
        height: 1.6
    }

    private vehicle8: VehicleParameters = {
        id: "vehicle8",
        meshPath: mesh8,
        size: 2.6,
        width: 1.4,
        height: 1.1
    }

    private vehicles: VehicleParameters[] = [this.vehicle1, this.vehicle2, this.vehicle3, this.vehicle4, this.vehicle5, this.vehicle6, this.vehicle7, this.vehicle8]

    private static readonly VEHICLE_SCALING: number = 0.8;

    constructor(scene: Scene, dispawnerList: AbstractMesh[], position: Vector3, direction: string) {
        super(scene);
        
        this._location = position;
        this._direction = direction;
        this._dispawnerList = dispawnerList;
        this._lastPosition = position;
        this._speed = Math.floor(Math.random() * (160 - 150) + 150);
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

        let random = Math.floor(Math.random() * this.vehicles.length);
        let vehicle = this.vehicles.at(random);
    
        const assets = await SceneLoader.ImportMeshAsync("", "", vehicle.meshPath, this._scene);
    
        this._hitbox = MeshBuilder.CreateBox("vehiculeHitbox", { size: vehicle.size, width: vehicle.width, height: vehicle.height}, this._scene);
        this._hitbox.visibility = 0.4/*.4*/;
        this._hitbox.position = new Vector3(this._lastPosition.x, this._lastPosition.y, this._lastPosition.z);

        this._mesh = assets.meshes[0] as Mesh;
        
        
        this._mesh.scaling = new Vector3(Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING);
        
        
        

        this._mesh.parent = this._hitbox;
        this._mesh.position = new Vector3(0, -(vehicle.height)/2, 0);

        this._mesh.isPickable = false; 
        this._mesh.doNotSyncBoundingInfo = true;


        this._hitbox.isPickable = false;
        this._hitbox.scaling = new Vector3(Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING, Vehicle.VEHICLE_SCALING);
        this._hitbox.actionManager = new ActionManager(this._scene);
        this._hitboxAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.BOX, { mass: 1000, friction:0, restitution: 0 }, this._scene);
        this._hitboxAggregate.body.disablePreStep = false;
        this._hitboxAggregate.body.setMassProperties({
            inertia: new Vector3(0, 0, 0)
        });
        this._hitboxAggregate.shape.filterMembershipMask = FILTER_GROUP_OBSTACLE;
        this._hitboxAggregate.shape.filterCollideMask = FILTER_GROUP_GROUND;

        this._lastPosition = this._hitbox.absolutePosition.clone();

        //Animate the Wheels
        const animWheel = new Animation("wheelAnimation", "rotation.x", 30, Animation.ANIMATIONTYPE_FLOAT, Animation.ANIMATIONLOOPMODE_CYCLE);
        const wheelKeys = []; 
        //At the animation key 0, the value of rotation.y is 0
        wheelKeys.push({
            frame: 0,
            value: 0
        });
        //At the animation key 30, (after 1 sec since animation fps = 30) the value of rotation.y is 2PI for a complete rotation
        wheelKeys.push({
            frame: 30,
            value: 2 * Math.PI
        });
        //set the keys
        animWheel.setKeys(wheelKeys);

        

        for(const childMesh of assets.meshes){
            childMesh.refreshBoundingInfo(true);
            //console.log(childMesh.id);
            //console.log(childMesh.id);
            if (childMesh.getTotalVertices() > 0) {
                if(childMesh.id.includes("wheel")) {
                    
                    //Link this animation to a wheel
                    childMesh.animations = [];
                    childMesh.animations.push(animWheel);

                    this._scene.beginAnimation(childMesh, 0, 30, true);
                }
                
            }
        }
        
       
       
        //this._mesh = vehicule;
        //this._mesh.parent = this._hitbox;

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
            case "Left": moveDirection = new Vector3(0, linearVelocity_y, deltaDistance);
            break;
            case "Right": moveDirection = new Vector3(0, linearVelocity_y, -deltaDistance);
            break;
            case "Forth": moveDirection = new Vector3(deltaDistance, linearVelocity_y, 0);
            break;
            case "Back": moveDirection = new Vector3(-deltaDistance, linearVelocity_y, 0);
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

export default Vehicle;
