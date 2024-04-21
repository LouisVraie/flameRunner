import { Scene, AbstractMesh, TransformNode, Vector3, ExecuteCodeAction, ActionManager } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Vehicle from "./Vehicle";

import policeCar from '../assets/models/policeCar.glb';

class Spawner {
    
    private _spawnerNode: TransformNode;
    private _direction: string;
    private _obstacleType: string;
    private _obstacle: any;
    private _scene: Scene;
    private _dispawnerTab: AbstractMesh[] = [];
    private _vehiclesTab: Vehicle[] = [];
    

    constructor(scene: Scene, spawner: TransformNode, direction: string, obstacleType: string, dispawners: AbstractMesh[]) {
        this._spawnerNode = spawner;
        this._direction = direction;
        this._obstacleType = obstacleType;
        this._scene = scene;
        this._dispawnerTab = dispawners;    
        
        this.initSpawn();
            
    }

    public initSpawn() : void{

        setInterval(() => {
            if(this._vehiclesTab.length < 3){
                this.spawn();
            }
        }, 3000);
    }


    private async spawn(): Promise<void> {
        

        switch(this._obstacleType){
            case "Vehicle":
                 
                const vehicle = new Vehicle(this._scene, this._dispawnerTab, policeCar, this._spawnerNode.absolutePosition, this._direction);
                await vehicle.createObstacle();
                this._vehiclesTab.push(vehicle);

                this._dispawnerTab.forEach((dispawner) => {


                    vehicle.getHitbox().actionManager.registerAction(new ExecuteCodeAction({
                        trigger: ActionManager.OnIntersectionEnterTrigger,
                        parameter: dispawner
                    }, () => {
                        vehicle.disposeObstacle();
                        let index = this._vehiclesTab.indexOf(vehicle);
                        this._vehiclesTab.splice(index ,1);
                    }));
                });

            break;            
        }
    }

    public updateVehicle() : void{

        if(this._vehiclesTab.length > 0){
            this._vehiclesTab.forEach(vehicle => {
                vehicle.move();
            });
        }        
    }
}

export default Spawner;
