// import { Scene, AbstractMesh, TransformNode, Vector3, ExecuteCodeAction, ActionManager } from "@babylonjs/core";
// import Obstacle from "./Obstacle";
// import Vehicle from "./Vehicle";
// import FlyingAnimal from "./FlyingAnimal";
// import Player from "./Player";

// class Spawner {
    
//     private _spawnerNode: TransformNode;
//     private _direction: string;
//     private _obstacleType: string;
//     private _obstacle: any;
//     private _scene: Scene;
//     private _dispawnerTab: AbstractMesh[] = [];
//     private _vehiclesTab: Vehicle[] = [];
//     private _beesTab: FlyingAnimal[] = [];
//     private _batsTab: FlyingAnimal[] = [];
//     private _playerList: Player[] = [];

//     private distance: number;
    

//     constructor(scene: Scene, spawner: TransformNode, direction: string, obstacleType: string, dispawners: AbstractMesh[], playerList: Player[]) {
//         this._spawnerNode = spawner;
//         this._direction = direction;
//         this._obstacleType = obstacleType;
//         this._scene = scene;
//         this._dispawnerTab = dispawners;  
        
//         this._playerList = playerList;

//         this.distance = 0;
        
//         this.initSpawn();
            
//     }

//     getHorizontalDistance(transformNode: TransformNode, targetPosition: Vector3): number {
//         // Obtenez la position actuelle du TransformNode
//         const nodePosition = transformNode.getAbsolutePosition();
    
//         // Calculez la différence sur les axes X et Z
//         const deltaX = nodePosition.x - targetPosition.x;
//         const deltaZ = nodePosition.z - targetPosition.z;
    
//         // Calculez la distance horizontale
//         const distance = Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
    
//         return distance;
//     }

//     public initSpawn() : void{


        

//         setInterval(() => {

//             let distances = [];
//             let minDistance = 0;

//             switch(this._obstacleType){
//                 case "Vehicle":

//                     this._playerList.forEach(player => {
//                         let playerPosition = player.getCharacter().getHitbox().position;
//                         let distance = this.getHorizontalDistance(this._spawnerNode, playerPosition);
//                         console.log("Distance calculée entre joueur et spawner "+ this._spawnerNode.id+" : " + distance)
                        
//                         distances.push(distance);
//                     })

//                     minDistance = Math.min(...distances);

//                     if(this._vehiclesTab.length < 5 && minDistance < 100){
//                         this.spawn();
//                     }
//                     else{

//                         if(this._vehiclesTab.length > 0){
//                             this._vehiclesTab.forEach(vehicle => {
//                                 vehicle.disposeObstacle()
//                             })
//                             this._vehiclesTab = [];
//                         }
                        
//                     }
//                 break;

//                 case "Bee":  
                
//                     this._playerList.forEach(player => {
//                         let playerPosition = player.getCharacter().getHitbox().position;
//                         let distance = this.getHorizontalDistance(this._spawnerNode, playerPosition);
//                         console.log("Distance calculée entre joueur et spawner "+ this._spawnerNode.id+" : " + distance)
                        
//                         distances.push(distance);
//                     })

//                     minDistance = Math.min(...distances);

//                     if(this._beesTab.length < 2 && minDistance < 100){
//                         this.spawn();
//                     }
//                     else{
//                         if(this._beesTab.length > 0){
//                             this._beesTab.forEach(bee => {
//                                 bee.disposeObstacle()
//                             })
//                             this._beesTab = [];
//                         }
//                     }
//                 break;
                
//                 case "Bat":


//                     this._playerList.forEach(player => {
//                         let playerPosition = player.getCharacter().getHitbox().position;
//                         let distance = this.getHorizontalDistance(this._spawnerNode, playerPosition);
//                         console.log("Distance calculée entre joueur et spawner "+ this._spawnerNode.id+" : " + distance)
                        
//                         distances.push(distance);
//                     })

//                     minDistance = Math.min(...distances);

//                     if(this._batsTab.length < 2 && minDistance < 100){
//                         this.spawn();
//                     }
//                     else{

//                         if(this._batsTab.length > 0){
//                             this._batsTab.forEach(bat => {
//                                 bat.disposeObstacle()
//                             })
//                             this._batsTab = [];
//                         }
//                     }
//                 break;

//             }
//         }, 2500);
//     }


//     private async spawn(): Promise<void> {
        

//         switch(this._obstacleType){
//             case "Vehicle":
                 
//                 const vehicle = new Vehicle(this._scene, this._dispawnerTab, this._spawnerNode.absolutePosition, this._direction);
//                 await vehicle.createObstacle();
//                 this._vehiclesTab.push(vehicle);

//                 this._dispawnerTab.forEach((dispawner) => {


//                     vehicle.getHitbox().actionManager.registerAction(new ExecuteCodeAction({
//                         trigger: ActionManager.OnIntersectionEnterTrigger,
//                         parameter: dispawner
//                     }, () => {
//                         vehicle.disposeObstacle();
//                         let index = this._vehiclesTab.indexOf(vehicle);
//                         this._vehiclesTab.splice(index ,1);
//                     }));
//                 });

//             break;       
//             case "Bee":
                 
//                 const flyingAnimalBee = new FlyingAnimal(this._scene, this._dispawnerTab, 0, this._spawnerNode.absolutePosition, this._direction);
//                 await flyingAnimalBee.createObstacle();
//                 this._beesTab.push(flyingAnimalBee);

//                 this._dispawnerTab.forEach((dispawner) => {


//                     flyingAnimalBee.getHitbox().actionManager.registerAction(new ExecuteCodeAction({
//                         trigger: ActionManager.OnIntersectionEnterTrigger,
//                         parameter: dispawner
//                     }, () => {

//                         flyingAnimalBee.getHitbox().position = this._spawnerNode.absolutePosition

//                         // flyingAnimalBee.disposeObstacle();
//                         // let index = this._beesTab.indexOf(flyingAnimalBee);
//                         // this._beesTab.splice(index ,1);
//                     }));
//                 });

//             break;     
//             case "Bat":
                 
//                 const flyingAnimalBat = new FlyingAnimal(this._scene, this._dispawnerTab, 1, this._spawnerNode.absolutePosition, this._direction);
//                 await flyingAnimalBat.createObstacle();
//                 this._batsTab.push(flyingAnimalBat);

//                 this._dispawnerTab.forEach((dispawner) => {


//                     flyingAnimalBat.getHitbox().actionManager.registerAction(new ExecuteCodeAction({
//                         trigger: ActionManager.OnIntersectionEnterTrigger,
//                         parameter: dispawner
//                     }, () => {

//                         flyingAnimalBat.getHitbox().position = this._spawnerNode.absolutePosition

//                         // flyingAnimalBat.disposeObstacle();
//                         // let index = this._batsTab.indexOf(flyingAnimalBat);
//                         // this._batsTab.splice(index ,1);
//                     }));
//                 });

//             break;
//         }
//     }

//     public updateVehicle() : void{

//         if(this._vehiclesTab.length > 0){
//             this._vehiclesTab.forEach(vehicle => {
//                 vehicle.move();
//             });
//         }        
//     }

//     public updateBee() : void{

//         if(this._beesTab.length > 0){
//             this._beesTab.forEach(bee => {
//                 bee.move();
//             });
//         }        
//     }

//     public updateBat() : void{

//         if(this._batsTab.length > 0){
//             this._batsTab.forEach(bat => {
//                 bat.move();
//             });
//         }        
//     }
// }

// export default Spawner;



import { Scene, AbstractMesh, TransformNode, Vector3, ExecuteCodeAction, ActionManager } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import Vehicle from "./Vehicle";
import FlyingAnimal from "./FlyingAnimal";
import Player from "./Player";

class Spawner {
    private _spawnerNode: TransformNode;
    private _direction: string;
    private _obstacleType: string;
    private _scene: Scene;
    private _dispawnerTab: AbstractMesh[] = [];
    private _vehiclesTab: Vehicle[] = [];
    private _beesTab: FlyingAnimal[] = [];
    private _batsTab: FlyingAnimal[] = [];
    private _playerList: Player[] = [];

    private distance: number;

    constructor(scene: Scene, spawner: TransformNode, direction: string, obstacleType: string, dispawners: AbstractMesh[], playerList: Player[]) {
        this._spawnerNode = spawner;
        this._direction = direction;
        this._obstacleType = obstacleType;
        this._scene = scene;
        this._dispawnerTab = dispawners;
        this._playerList = playerList;

        this.distance = 0;

        this.initSpawn();
    }

    getHorizontalDistance(transformNode: TransformNode, targetPosition: Vector3): number {
        const nodePosition = transformNode.getAbsolutePosition();
        const deltaX = nodePosition.x - targetPosition.x;
        const deltaZ = nodePosition.z - targetPosition.z;
        return Math.sqrt(deltaX * deltaX + deltaZ * deltaZ);
    }

    public initSpawn(): void {
        setInterval(() => {
            let minDistance = Infinity;

            this._playerList.forEach(player => {
                let playerPosition = player.getCharacter().getHitbox().position;
                let distance = this.getHorizontalDistance(this._spawnerNode, playerPosition);
                console.log(`Distance calculée entre joueur et spawner ${this._spawnerNode.id} : ${distance}`);
                if (distance < minDistance) {
                    minDistance = distance;
                }
            });

            if (minDistance < 70) {
                this.spawnObstacle();
            } else {
                this.clearObstacles();
            }
        }, 3500);
    }

    private async spawnObstacle(): Promise<void> {
        switch (this._obstacleType) {
            case "Vehicle":
                if (this._vehiclesTab.length < 5) {
                    const vehicle = new Vehicle(this._scene, this._dispawnerTab, this._spawnerNode.absolutePosition, this._direction);
                    await vehicle.createObstacle();
                    this._vehiclesTab.push(vehicle);
                    this.addDispawnerActions(vehicle);
                }
                break;
            case "Bee":
                if (this._beesTab.length < 2) {
                    const bee = new FlyingAnimal(this._scene, this._dispawnerTab, 0, this._spawnerNode.absolutePosition, this._direction);
                    await bee.createObstacle();
                    this._beesTab.push(bee);
                    this.addDispawnerActions(bee);
                }
                break;
            case "Bat":
                if (this._batsTab.length < 2) {
                    const bat = new FlyingAnimal(this._scene, this._dispawnerTab, 1, this._spawnerNode.absolutePosition, this._direction);
                    await bat.createObstacle();
                    this._batsTab.push(bat);
                    this.addDispawnerActions(bat);
                }
                break;
        }
    }

    private clearObstacles(): void {
        switch (this._obstacleType) {
            case "Vehicle":
                this._vehiclesTab.forEach(vehicle => vehicle.disposeObstacle());
                this._vehiclesTab = [];
                break;
            case "Bee":
                this._beesTab.forEach(bee => bee.disposeObstacle());
                this._beesTab = [];
                break;
            case "Bat":
                this._batsTab.forEach(bat => bat.disposeObstacle());
                this._batsTab = [];
                break;
        }
    }

    private addDispawnerActions(obstacle: any): void {
        this._dispawnerTab.forEach(dispawner => {
            obstacle.getHitbox().actionManager.registerAction(new ExecuteCodeAction({
                trigger: ActionManager.OnIntersectionEnterTrigger,
                parameter: dispawner
            }, () => {
                obstacle.disposeObstacle();
                this.removeObstacleFromArray(obstacle);
            }));
        });
    }

    private removeObstacleFromArray(obstacle: any): void {
        switch (this._obstacleType) {
            case "Vehicle":
                const vehicleIndex = this._vehiclesTab.indexOf(obstacle);
                if (vehicleIndex > -1) this._vehiclesTab.splice(vehicleIndex, 1);
                break;
            case "Bee":
                const beeIndex = this._beesTab.indexOf(obstacle);
                if (beeIndex > -1) this._beesTab.splice(beeIndex, 1);
                break;
            case "Bat":
                const batIndex = this._batsTab.indexOf(obstacle);
                if (batIndex > -1) this._batsTab.splice(batIndex, 1);
                break;
        }
    }

    public updateVehicle(): void {
        this._vehiclesTab.forEach(vehicle => vehicle.move());
    }

    public updateBee(): void {
        this._beesTab.forEach(bee => bee.move());
    }

    public updateBat(): void {
        this._batsTab.forEach(bat => bat.move());
    }
}

export default Spawner;
