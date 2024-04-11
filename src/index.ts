import HavokPhysics from "@babylonjs/havok";
import { Vector3, HavokPlugin, Color3, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Viewport} from "@babylonjs/core";

// import { Inspector } from '@babylonjs/inspector';
import "@babylonjs/loaders/";

import World from "./World";
import App from "./App";

const app = new App();

async function createScene(){
    
    const scene = app.getScene();
    const world = new World(scene);

    const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    ground.position = new Vector3(0, -5, 0);

    world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
    world.addFreeCamera("cam1", new Vector3(0, 5, 8), true);

    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);    
    world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world
    world.loadWorld();

    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    // world.addSphere("sphere", 32, 3, 0, 15, 0, true);
    world.addCubeModifier();
    const player = await world.addPlayer("player1");
    
    return scene;
}

window.onload = async () => {
    
    const sc = await createScene();

}
