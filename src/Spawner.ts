import { Scene, AbstractMesh, TransformNode, Vector3, ExecuteCodeAction, ActionManager } from "@babylonjs/core";
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
                const playerPosition = player.getCharacter().getHitbox().position;
                const distance = this.getHorizontalDistance(this._spawnerNode, playerPosition);
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