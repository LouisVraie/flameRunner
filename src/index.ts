import HavokPhysics from "@babylonjs/havok";
import { Engine, Scene, SceneLoader, Vector3, HavokPlugin, Color3, MeshBuilder, PhysicsAggregate, PhysicsShapeType} from "@babylonjs/core";

import { Inspector } from '@babylonjs/inspector';
import "@babylonjs/loaders/";
import Game from "./game";

import World from "./World";

import map from "../assets/models/world.glb";
import player1 from "../assets/models/player1.glb";
import App from "./App";

let app = new App();


async function createScene(){
    
    //const scene = new Scene(engine);
    // Create a World instance
    //const world = new World(scene);
    const scene = app.getScene();
    const world = new World(scene);

    var ground = MeshBuilder.CreateGround("ground", {width: 10, height: 10}, scene);

    world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
    //world.addFreeCamera("freeCamera1", new Vector3(0, 5, -40), true);

    const havokInstance = await HavokPhysics();
    const havokPlugin = new HavokPlugin(true, havokInstance);    
    world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world
    
    // Load the world mesh
    // SceneLoader.ImportMesh("", "", map, scene, function(meshes) {
    //     const worldMesh = meshes[0];
    //     world.createWorld(worldMesh);
        
        
    // });

    var groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, scene);

    world.addGLBMeshToScene(scene, map,() => {
        console.log('Mesh added successfully!');
        // Vous pouvez ajouter ici d'autres opérations à effectuer après le chargement réussi du mesh
    },
    (errorMessage) => {
        console.error('Failed to add mesh:', errorMessage);
        // Vous pouvez gérer ici le cas d'erreur, par exemple afficher un message à l'utilisateur
    } );

    world.addSphere("sphere", 32, 10, 0, 100, 0, true);
    
    //world.addPlayer("player1");
    
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
