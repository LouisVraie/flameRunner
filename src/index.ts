import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, SceneLoader, Vector3, HavokPlugin, Color3, MeshBuilder, PhysicsAggregate, PhysicsShapeType} from "@babylonjs/core";

// import { Inspector } from '@babylonjs/inspector';
import "@babylonjs/loaders/";
import Game from "./game";

import World from "./World";


import player1 from "../assets/models/player1.glb";
import world1 from '../assets/models/world.glb';

import App from "./App";

let app = new App();



async function createScene(){
    
    const scene = app.getScene();
    const world = new World(scene);

    var ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, scene);
    ground.position = new Vector3(0, -5, 0);


    world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));

    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);    
    world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world
    
    
    let map = world.loadWorld();

    var groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    

    world.addSphere("sphere", 32, 3, 0, 15, 0, true);
    
    let player = await world.addPlayer("player1");
    
    return scene;
}

window.onload = () => {
   
    //const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    //const engine = new Engine(canvas, true);

    

    createScene()
    
    // .then((scene) => {
    //     engine.runRenderLoop(function () {
    //         if (scene) {
    //         scene.render();
    //         }
    //     });
    // });
}
