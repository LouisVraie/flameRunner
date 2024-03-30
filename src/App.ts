import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3, Viewport } from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
class App {

    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    public _light: HemisphericLight;

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

        // fps
        const fps = document.createElement("div");
        fps.id = "fps";
        document.body.appendChild(fps);

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        this._camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 5, -40), this._scene);
        this._camera.setTarget(Vector3.Zero());
        this._camera.attachControl(this._canvas, true);

        window.addEventListener("resize", () => {
            this._engine.resize();
        });

        const divFPS = document.getElementById("fps");

        // run the main render loop
        this._engine.runRenderLoop(() => {
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
}
export default App;