import { Scene, AbstractMesh, TransformNode } from "@babylonjs/core";
import Obstacle from "./Obstacle";

class Spawn {
    
    private _transformNodes: TransformNode[] = [];
    private _triggerObject: AbstractMesh;
    private _obstacle: Obstacle;

    constructor(scene: Scene, name: string, triggerObject: AbstractMesh, obstacle: Obstacle) {
        scene.transformNodes.forEach((nodes) => {
            if(nodes.id == name){
                this._transformNodes.push(nodes);
            }
        });

        this._triggerObject = triggerObject;
        this._obstacle = obstacle;
    }

    public enumSpawnNodes(): void{
        this._transformNodes.forEach( (t) =>  {
            
            console.log("Spawn nodes : ", t)
        });
    }

    public getSpawnNodes() : TransformNode[] {
        return this._transformNodes;
    }
}

export default Spawn;
