import HavokPhysics from "@babylonjs/havok";
import { Vector3, HavokPlugin, Color3, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Viewport, NodeMaterial} from "@babylonjs/core";

// import { Inspector } from '@babylonjs/inspector';
import "@babylonjs/loaders/";

import World from "./World";
import App from "./App";

const app = new App();

async function createScene(){
    
    const scene = app.getScene();
    const world = new World(scene);


    //world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
    world.addFreeCamera("cam1", new Vector3(0, 5, 8), true);

    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);    
    world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world
    await world.loadWorld();


    return scene;
}



window.onload = async () => {
    
    const sc = await createScene();

}
