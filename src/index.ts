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

    const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100,subdivisions: 256 }, scene);
    ground.position = new Vector3(0, -5, 0);
    ground.receiveShadows = true;
    

    // Our built-in 'ground' shape.
    var test = MeshBuilder.CreateGround("test", { width: 2, height: 2, subdivisions: 128 }, scene);
    test.scaling = new Vector3(32, 3, 11);
    test.position = new Vector3(20, -2.2, 103);
    test.rotation.y = Math.PI/2;

    NodeMaterial.ParseFromSnippetAsync("#3FU5FG#1", scene).then((mat) => {
        test.material = mat;
    });

    //world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
    world.addFreeCamera("cam1", new Vector3(0, 5, 8), true);

    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);    
    world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world
    world.loadWorld();

    const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);
    return scene;
}



window.onload = async () => {
    
    const sc = await createScene();

}
