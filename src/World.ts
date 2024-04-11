import { AbstractMesh, ActionManager, Color3, CubeTexture, DirectionalLight, ExecuteCodeAction, FreeCamera, HavokPlugin, HemisphericLight, MeshBuilder, MirrorTexture, NodeMaterial,  PhysicsAggregate,  PhysicsMotionType,  PhysicsShapeType,  Plane,  Scene,  SceneLoader,  ScenePerformancePriority,  ShadowGenerator,  StandardMaterial,  Texture,  TransformNode, Vector3 } from "@babylonjs/core";
import Player from "./Player";
import Group from "./Group";

import map from "../assets/models/new_world.glb";
import HavokPhysics from "@babylonjs/havok";
import CubeModifier from "./CubeModifier";


export const WORLD_GRAVITY: Vector3 = new Vector3(0, -9.81, 0);
export const WORLD_SCALE: number = 0.5;

const worldMap = {
    name: "map",
    model: map
}

class World{
    private _scene: Scene;
    private _worldMesh: AbstractMesh;
    private _physicsPlugin: HavokPlugin;
    private _players: Player[] = [];
    private _cubeModifiers: CubeModifier[] = [];
    private _gameObject: TransformNode;
    private _light: DirectionalLight;
    private _shadowGenerator: ShadowGenerator;

    constructor(scene: Scene) {
        this._scene = scene;

        this._gameObject = new TransformNode("world", this._scene);
        this._gameObject.position = Vector3.Zero();

        this.addDiffuseLight("diffuseLightOrigin", new Vector3(0, 20, 0), new Color3(1, 1, 1));
        this._shadowGenerator = new ShadowGenerator(1024, this._light);
        this._shadowGenerator.usePercentageCloserFiltering = true;

        // add in IBL with linked environment        
        let env = CubeTexture.CreateFromPrefilteredData("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/env/kloofendal_pureSky.env", scene);
        env.name = "sky";
        env.gammaSpace = false;
        env.rotationY = 4.0823;
        this._scene.environmentTexture = env;
    }

    async getInitializedHavok() {
        return await HavokPhysics();
    }

    async createScene(){
        const havokInstance = await this.getInitializedHavok();
        this._scene.collisionsEnabled = true;
        this._scene.performancePriority = ScenePerformancePriority.BackwardCompatible;

        const hk = new HavokPlugin(true, havokInstance);
        this._scene.enablePhysics(WORLD_GRAVITY, hk)
    }

    async loadWorld(){
        const result = await SceneLoader.ImportMeshAsync("", "", worldMap.model, this._scene);
        
        this._worldMesh = result.meshes[0];
        this._worldMesh.receiveShadows = true;
        this._gameObject = this._worldMesh;
        this._gameObject.name = "world";
        this._gameObject.setParent(null);
        this._gameObject.scaling.scaleInPlace(WORLD_SCALE);
        this._gameObject.position.set(0,-3,0);

        for (const childMesh of result.meshes) {

            childMesh.refreshBoundingInfo(true);
            console.log(childMesh.id);
            if (childMesh.getTotalVertices() > 0) {
                const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                if(!childMesh.id.startsWith("Ground_")){
                    // environment elements cast shadows
                    this._shadowGenerator.addShadowCaster(childMesh);
                }
                else{
                    // ground receives shadows
                    childMesh.receiveShadows = true;
                }

                //#JN2BSF#171   #6MCVHR#5
                if(childMesh.id.startsWith("River")){
                    //this.applySnippetTexture(childMesh, "#6MCVHR#5");

                    let sphereMaterials = new StandardMaterial("sphereMaterial", this._scene);
                    sphereMaterials.emissiveColor = new Color3(51,153,255)
                    sphereMaterials.backFaceCulling = false;
                    childMesh.material = sphereMaterials;
            
                }
                // SXYK15
                if(childMesh.id.startsWith("Eiffel_")){
                    this.applySnippetTexture(childMesh, "#SXYK15");
                }
                //#JNQ200#11
                if(childMesh.id.startsWith("Object001")){
                    this.applySnippetTexture(childMesh, "#J4XAC0");
                }
                //#V11ZH9
                if(childMesh.id.startsWith("Bandeau")){
                    this.applySnippetTexture(childMesh, "#V11ZH9");
                }
           }
        }

        // world.addSphere("sphere", 32, 3, 0, 15, 0, true);
        this.addCubeModifier();
        const player = await this.addPlayer("player1");
        this.setShadows(player.getCharacter().getMesh());
        //const player2 = await world.addPlayer("player2");
        
        // Set the character's collision on the cube modifier
        this._setCubeModifierCollision();
    }

    async initGame(){
        await this.createScene();
    }

    
    applySnippetTexture(mesh: AbstractMesh, snippetId: string) : void{
        NodeMaterial.ParseFromSnippetAsync(snippetId, this._scene).then(nodeMaterial => {
            nodeMaterial.backFaceCulling = false;
            mesh.material = nodeMaterial;
        });
    }
  

    addFreeCamera(name: string,  position: Vector3, zoom : boolean) : void {
        const camera = new FreeCamera(name, position, this._scene);
        if(zoom){
            camera.inputs.addMouseWheel();
        }
        camera.setTarget(Vector3.Zero());
        camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);

        this._scene.activeCameras.push(camera);
        //camera.viewport = new Viewport(0, 0, 0.5, 1.0);
    }

    addSphere(name: string, segment: number, diameter: number, posX : number, posY : number, posZ : number, physics : boolean): void{
        const  sphere = MeshBuilder.CreateSphere(name, {segments: segment, diameter: diameter}, this._scene);
        sphere.name = name;
        sphere.position.x = posX;
        sphere.position.y = posY;
        sphere.position.z = posZ;

        if(physics){
            const sphereAggregate = new PhysicsAggregate(sphere, PhysicsShapeType.SPHERE, { mass: 1, restitution: 0.1 }, this._scene);
        }
    }

    addHemisphericLight(name: string, position: Vector3, intensity: number): void{
        const light = new HemisphericLight(name, position, this._scene);
        light.intensity = intensity;
    }

    addDiffuseLight(name: string, position: Vector3, color: Color3): void {
        this._light = new DirectionalLight(name, new Vector3(0, -1, 0), this._scene);
        this._light.position = position;
        this._light.diffuse = color;
        this._light.shadowEnabled = true;
        this._light.shadowOrthoScale = 2;
    }

    async addPlayer(identifier: string): Promise<Player> {
        const player = new Player(this._scene, identifier);
        await player.addCharacterAsync("Wall-E", Group.getSprinter());

        player.updatePlayer();
        this._shadowGenerator.addShadowCaster(player.getCharacter().getMesh())
        this._players.push(player);

        return player;
    }

    addCubeModifier() : void {
        const cubeModifier = new CubeModifier(this._scene);
        cubeModifier.createObstacle();
        this._cubeModifiers.push(cubeModifier);
    }

    moveCharacter(characterMesh: AbstractMesh, direction: Vector3): void {
        const speed = 0.1;
        characterMesh.moveWithCollisions(direction.multiplyByFloats(speed, speed, speed));
    }

    setPhysicsPlugin(gravity : Vector3, plugin: HavokPlugin): void {
        this._physicsPlugin = plugin;
        this._scene.enablePhysics(gravity, this._physicsPlugin);
    }

    public setShadows(mesh: AbstractMesh){
        this._shadowGenerator.addShadowCaster(mesh);
    }

    public getLight(): DirectionalLight {
        return this._light;
    }
    public setLight(light: DirectionalLight): void {
        this._light = light;
    }
    public getShadowGenerator(): ShadowGenerator {
        return this._shadowGenerator;
    }
    public setShadowGenerator(shadowGenerator: ShadowGenerator): void {
        this._shadowGenerator = shadowGenerator;
    }

    // Set the character's collision on the cube modifier
    private _setCubeModifierCollision(): void {

        // for each player
        for (const player of this._players) {
            // for each cube modifier
            for (const cube of this._cubeModifiers) {
                console.log("Setting collision for player: " + player.getCharacter().getMesh().name + " and cube: " + cube.getMesh().name);
                // Create a trigger for the cube modifier
                player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                    {
                        trigger : ActionManager.OnIntersectionEnterTrigger,
                        parameter : cube.getMesh()
                    },
                    () => {
                        console.log("HIT Cube!");
                        cube.disposeObstacle();
                    }
                ));
            }
        }
    }
}

export default World;