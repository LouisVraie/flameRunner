import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, SceneLoader, Vector3, HavokPlugin, Color3} from "@babylonjs/core";

import { Inspector } from '@babylonjs/inspector';
import "@babylonjs/loaders/";
import Game from "./game";

import World from "./World";

import map from "../assets/models/world.glb";
import player1 from "../assets/models/player1.glb";


async function createScene(engine){
    
    const scene = new Scene(engine);
    // Create a World instance
    const world = new World(scene);
    
    world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
    world.addFreeCamera("freeCamera1", new Vector3(0, 5, -40), true);

    // const havokInstance = await HavokPhysics();
    // const havokPlugin = new HavokPlugin(true, havokInstance);    
    // world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world
    
    // Load the world mesh
    SceneLoader.ImportMesh("", "", map, scene, function(meshes) {
        const worldMesh = meshes[0];
        world.createWorld(worldMesh);
    });

    world.addPlayer("player1");
    
    //Load the character mesh
    // SceneLoader.ImportMesh("", "", player, scene, function(meshes) {
    //     const characterMesh = meshes[0];
    //     world.addCharacter(characterMesh);

    //     // Move the character forward
    //     window.addEventListener("keydown", (event) => {
    //         if (event.key === 'w') {
    //             world.moveCharacter(characterMesh, new Vector3(0, 0, 1));
    //         }
    //     });
    // });

    //Inspector.Show(scene, {});

    return scene;
}

window.onload = () => {
   
    const canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    const engine = new Engine(canvas, true);

    window.addEventListener("resize", () => {
        engine.resize();
    });

    createScene(engine).then((scene) => {
        engine.runRenderLoop(function () {
            if (scene) {
            scene.render();
            }
        });
    });
}
