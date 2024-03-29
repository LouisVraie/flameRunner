import { ArcRotateCamera, Engine, HemisphericLight, Mesh, MeshBuilder, Scene, Vector3 } from "@babylonjs/core";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders/glTF";
class App {

    private _canvas: HTMLCanvasElement;
    private _engine: Engine;
    private _scene: Scene;
    private _camera: ArcRotateCamera;
    public _light: HemisphericLight;

    constructor() {
        // create the canvas html element and attach it to the webpage
        this._canvas = document.createElement("canvas");
        this._canvas.style.width = "100%";
        this._canvas.style.height = "100%";
        this._canvas.id = "gameCanvas";
        document.body.appendChild(this._canvas);

        // initialize babylon scene and engine
        this._engine = new Engine(this._canvas, true);
        this._scene = new Scene(this._engine);

        this._camera = new ArcRotateCamera("Camera", Math.PI / 2, Math.PI / 2, 2, new Vector3(0, 5, -40), this._scene);
        this._camera.setTarget(Vector3.Zero());
        this._camera.attachControl(this._canvas, true);

        window.addEventListener("resize", () => {
            this._engine.resize();
        });

        // run the main render loop
        this._engine.runRenderLoop(() => {
            this._scene.render();
        });
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