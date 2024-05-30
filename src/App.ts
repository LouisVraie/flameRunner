import { ArcRotateCamera, Animation, Engine, HavokPlugin, HemisphericLight, MeshBuilder, PhysicsAggregate, PhysicsShapeType, Scene, Vector3, Viewport, Mesh, StandardMaterial, DynamicTexture, Color3, AbstractMesh } from "@babylonjs/core";
import HavokPhysics from "@babylonjs/havok";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/";

import GUI from "./GUI";
import World, { WORLD_SCALE } from "./World";
import { Menu } from "./enum/Menu";
class App {

    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    public _light: HemisphericLight;
    private _gui: GUI;
    private _world: World;

    private _viewportsData: Viewport[] = [
        new Viewport(0, 0, 0.5, 1.0),
        new Viewport(0.5, 0, 0.5, 1.0)
    ];

    private static distpatchPlayersLoadedEvent() {
        // Create a new CustomEvent with the specific parameter included in the detail
        const event = new CustomEvent('playersloaded', {
          detail: {
            message: 'playersloaded custom event!'
          },
          bubbles: true,
          cancelable: true
        });
        // Dispatch the event on a target element, e.g., document or a specific element
        document.dispatchEvent(event);
    }

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

        // this._camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 5, -40), this._scene);
        // this._camera.setTarget(Vector3.Zero());
        // this._camera.attachControl(this._canvas, true);

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

        this._world = new World(this._scene);
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

    public getGUI(): GUI{
        return this._gui;
    }

    //////////////////////////////////////////////////////////
    // methods
    //////////////////////////////////////////////////////////
    
    private _isGamePaused(): boolean {
        return this._gui.isPaused();
    }

    // Start the game 
    public async start(){

        document.addEventListener("playersloaded", async (event) => {
            console.log("Le jeu peut commencer")

            await new Promise(resolve => setTimeout(resolve, 2000));

            const countdownContainers = [];
            const countdownDivs = [];

        // Création des éléments html pour le compte à rebours
        this._world.getPlayers().forEach(player =>{
            const container = document.querySelector('#middle_container_'+player.getIdentifier()) as HTMLElement;
            const countDownContainer = document.createElement('div')
            countDownContainer.setAttribute('class', 'countdown');
            container.appendChild(countDownContainer);
            countdownContainers.push(container);
            countdownDivs.push(countDownContainer)
        })
                     
        this._world.getBiomes().at(0).setPlayerCount(this._world.getPlayers().length);
            
        // Lancer le décompte de 3 à 0
        for (let i = 3; i >= 0; i--) {
            countdownDivs.forEach(div => div.innerHTML = i.toString())
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
           
        countdownDivs.forEach(div => div.innerHTML = "GO")
            
        // Supprimer la barrière du spawn
        this._world.getStartWall().dispose();

            // Déclencher les timers des joueurs
            this._world.getPlayers().forEach(player =>{
                player.setTimer(0);
                player.setArrived(false);
            })

            // Attendre 2 secondes puis supprimer les éléments html du compte à rebours
            await new Promise(resolve => setTimeout(resolve, 2000));
            countdownContainers.forEach(container => container.innerHTML = "")
        });
    }

    // Create the scene
    public async createScene(): Promise<Scene>{
        
    
        const ground = MeshBuilder.CreateGround("ground", {width: 300, height: 500}, this._scene);
        ground.position = new Vector3(85, -30, -180);
        ground.receiveShadows = true;
        this._world.addDeathSurface(ground);
    
        //world.addDiffuseLight("diffuseLight1", new Vector3(0, 10, 0), new Color3(1, 1, 1));
        // world.addFreeCamera("cam1", new Vector3(0, 5, 8), true);
    
        const havokInstance = await HavokPhysics();
        const havokPlugin = new HavokPlugin(true, havokInstance);    
        this._world.setPhysicsPlugin(new Vector3(0, -9.81, 0), havokPlugin); // Set the physics plugin to use for this world

        // Load the world
        await this._world.loadWorld();

        // Display the main menu
        this._gui.setActiveMenu(Menu.MAIN_MENU);

        document.addEventListener("playerselected", async (event) => {
            // Display the main menu
            this._gui.setActiveMenu(Menu.LOADING_MENU);

            const playerList = this._gui.getPlayersSelection();

            const promiseList = [];

            let i = -2;
            // Create Players
            for (const player of playerList) {
                // Odd players are player 1
                const isPlayer1 = playerList.indexOf(player) % 2 == 0;

                promiseList.push(this._world.addPlayer(player.getIdentifier(), new Vector3(this._world.getWorldSpawn().x, this._world.getWorldSpawn().y, this._world.getWorldSpawn().z  + i ), player.getGroup(), isPlayer1));

                i += 4
            }

            await Promise.all(promiseList);

            // Set the collision between players
            this._world.setCollisionWithPlayers(); 

            // Hide the loading menu
            this._gui.setActiveMenu(Menu.NONE_MENU);

            // Dispatch the event to notify that the players are loaded
            App.distpatchPlayersLoadedEvent();
        });
    
        return this._scene;
    }

}
export default App;