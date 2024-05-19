import { ArcRotateCamera, Engine, HavokPlugin, HemisphericLight, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, Vector3, Viewport } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/";

import GUI from "./GUI";
import World from "./World";
class App {

    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    public _light: HemisphericLight;
    private _gui: GUI;

    private _viewportsData: Viewport[] = [
        new Viewport(0.5, 0, 0.5, 1.0),
        new Viewport(0, 0, 0.5, 1.0)
    ];

    constructor() {

        // create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        this._gui = new GUI();

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        this._camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 5, -40), this._scene);
        this._camera.setTarget(Vector3.Zero());
        this._camera.attachControl(this._canvas, true);

        window.addEventListener("resize", () => {
            this._engine.resize();
            const globalGUI = this._gui.getGlobalGUI();
            globalGUI.style.width = `${window.innerWidth}px`;
            globalGUI.style.height = `${window.innerHeight}px`;
        });

        const divFPS = document.getElementById("fps");

        // run the main render loop
        this._engine.runRenderLoop(() => {

            // if the game is paused, don't render the scene
            if (this._isGamePaused()) return;

            this.addViewports();
            this._scene.render();

            // display fps
            divFPS.innerText = this._engine.getFps().toFixed() + " fps";
        });
    }


    async addViewports(){
        if(this._scene.activeCameras.length <= this._viewportsData.length){

            if(this._scene.activeCameras.length > 1){
                for(let i = 0; i < this._scene.activeCameras.length; i++){                    
                    this._scene.activeCameras[i].viewport = this._viewportsData[i];
                }
            }          
        }
        else{
            console.error("Erreur : Nombre d'activeCameras est supérieur au nombre de viewports autorisés.");
        }        
    }

    //////////////////////////////////////////////////////////
    // getters and setters
    //////////////////////////////////////////////////////////

    public getCamera(): ArcRotateCamera {
        return this._camera;
    }
    public setCamera(camera: ArcRotateCamera){
        this._camera = camera; 
    }
    
    public getCanvas(): HTMLCanvasElement {
        return this._canvas;
    }
    public setCanvas(canvas: HTMLCanvasElement): void {
        this._canvas = canvas;
    }

    public getEngine(): Engine {
        return this._engine;
    }
    public setEngine(engine: Engine): void {
        this._engine = engine;
    }

    public getScene(): Scene {
        return this._scene;
    }
    
    public setScene(scene: Scene): void {
        this._scene = scene;
    }

    //////////////////////////////////////////////////////////
    // methods
    //////////////////////////////////////////////////////////
    private _isGamePaused(): boolean {
        return this._gui.isPaused();
    }

    // Create the scene
    public async createScene(): Promise<Scene>{
        const world = new World(this._scene);
    
        const ground = MeshBuilder.CreateGround("ground", {width: 100, height: 100}, this._scene);
        ground.position = new Vector3(0, -5, 0);
        ground.receiveShadows = true;
    
        //world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
        world.addFreeCamera("cam1", new Vector3(0, 5, 8), true);
    
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);    
        world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world

        // Load the world
        world.loadWorld();

        document.addEventListener("modeselected", async (event) => {
            const playerList = this._gui.getPlayers();

            const promiseList = [];

            // Create Players
            for (const player of playerList) {
                // Odd players are player 1
                const isPlayer1 = playerList.indexOf(player) % 2 == 0;

                promiseList.push(world.addPlayer(player, isPlayer1));
            }

            await Promise.all(promiseList);
               
            // Set the character's collision on the cube modifier
            world.setCubeModifierCollision();
        });
    
        const groundAggregate = new PhysicsAggregate(ground, PhysicsShapeType.BOX, { mass: 0 }, this._scene);
        
        return this._scene;
    }

}
export default App;