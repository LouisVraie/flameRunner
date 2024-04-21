import { AbstractMesh, ActionManager, Color3, Color4, CubeTexture, DirectionalLight, ExecuteCodeAction, FreeCamera, HavokPlugin, HemisphericLight, Layer, MeshBuilder, MirrorTexture, NodeMaterial,  ParticleSystem,  PhysicsAggregate,  PhysicsMotionType,  PhysicsShapeType,  Plane,  Scene,  SceneLoader,  ScenePerformancePriority,  ShadowGenerator,  StandardMaterial,  Texture,  TransformNode, Vector3 } from "@babylonjs/core";
import Player from "./Player";
import Group from "./Group";

import map from "../assets/models/new_world.glb";
import HavokPhysics from "@babylonjs/havok";
import CubeModifier from "./CubeModifier";

import Spawn from "./Spawner";
import Vehicle from "./Vehicle";
import Spawner from "./Spawner";
import { Vector } from "babylonjs";


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
    private _vehicleObstacles: Vehicle[] = [];
    private _gameObject: TransformNode;
    private _light: DirectionalLight;
    private _shadowGenerator: ShadowGenerator;
    private _worldSpawn: Vector3;

    private _dispawnerTab: AbstractMesh[] = [];
    private _spawnerTab: TransformNode[] = [];
    private _groundTab: AbstractMesh[] = [];
    private _limitTab: AbstractMesh[] =[];
    private _gazTab: AbstractMesh[] =[];


    public getDispawnerList() : AbstractMesh[]{
        return this._dispawnerTab;
    }
    public getSpawnerList() : TransformNode[]{
        return this._spawnerTab;
    }
    public getGroundList() : AbstractMesh[]{
        return this._groundTab;
    }
    public getLimitList() : AbstractMesh[]{
        return this._limitTab;
    }

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

        this._worldSpawn = Vector3.Zero();

        // Pour afficher un background
        //var layer = new Layer('','https://i.imgur.com/mBBxGJH.jpg', this._scene, true);
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

        for(const transformNode of result.transformNodes){
            //console.log(transformNode.id);

            if(transformNode.id.startsWith("Spawn")){
                this._spawnerTab.push(transformNode);
            }

            if(transformNode.id == "Respawn"){
                this._worldSpawn = transformNode.absolutePosition;
                console.log("World spawn : ", this._worldSpawn);
            }
        }


        for (const childMesh of result.meshes) {

            childMesh.refreshBoundingInfo(true);

            //console.log(childMesh.id)
            
            if (childMesh.getTotalVertices() > 0) {

                
                if(childMesh.id.startsWith("Dispawn")){
                    childMesh.isPickable = true;
                    this._dispawnerTab.push(childMesh);
                }
                else{
                    const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                    meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                }
                
                if(childMesh.id.startsWith("Ground")){
                    this._groundTab.push(childMesh);
                }                
                if(childMesh.id.startsWith("Limit")) {
                    this._limitTab.push(childMesh);
                    childMesh.isVisible = false;
                    childMesh.isPickable = true;
                }
                if(childMesh.id.startsWith("Gaz")) {
                    this.addSmoke(childMesh.absolutePosition);
                    this._gazTab.push(childMesh);
                }

                childMesh.receiveShadows = true;
                this._shadowGenerator.addShadowCaster(childMesh);
                
                

                if(childMesh.id.startsWith("Bandeau")){
                    this.applySnippetTexture(childMesh, "#V11ZH9");
                }
                
            }
        }

        

        this._spawnerTab.forEach((spawner) => {
            console.log(spawner.id);
            const parts = spawner.id.split('_');
            const direction = parts[1];
            const type = parts[2];
            if (type.startsWith("Vehicle")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Vehicle", this._dispawnerTab);
                this._scene.registerBeforeRender(() => {
                    newSpawner.updateVehicle();
                })
        
            }
        });
        

        // world.addSphere("sphere", 32, 3, 0, 15, 0, true);
        this.addCubeModifier();

        //await this.addVehicleObstacle();

        const player = await this.addPlayer("player1", this._worldSpawn);
        this.setShadows(player.getCharacter().getMesh());
        //const player2 = await world.addPlayer("player2");

        
        
        // Set the character's collision on the cube modifier
        this._setCubeModifierCollision();
        //this._setVehicleCollision();
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

    addSmoke(vector : Vector3){
        // Create a particle system
        var particleSystem = new ParticleSystem("particles", 8000, this._scene);

        //Texture of each particle
        particleSystem.particleTexture = new Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/FFV/smokeParticleTexture.png", this._scene);

        // lifetime
        particleSystem.minLifeTime = 2;
        particleSystem.maxLifeTime = 4;// permet de modifier la hauteur par la durée de vie

        // emit rate
        particleSystem.emitRate = 100;

        // gravity
        particleSystem.gravity = new Vector3(0.25, 1.5, 0);

        // size gradient
        particleSystem.addSizeGradient(0, 0.6, 1);
        particleSystem.addSizeGradient(0.3, 1, 2);
        particleSystem.addSizeGradient(0.5, 2, 3);
        particleSystem.addSizeGradient(1.0, 6, 8);

        // color gradient
        particleSystem.addColorGradient(0, new Color4(0.5, 0.5, 0.5, 0),  new Color4(0.8, 0.8, 0.8, 0));
        particleSystem.addColorGradient(0.4, new Color4(1, 1, 1, 0.1), new Color4(1, 1, 1, 0.4));
        particleSystem.addColorGradient(0.7, new Color4(1, 1, 1, 0.2), new Color4(1, 1, 1, 0.4));
        particleSystem.addColorGradient(1.0, new Color4(0.0, 0.0, 0.0, 0), new Color4(0.03, 0.03, 0.03, 0));

        // speed gradient
        particleSystem.addVelocityGradient(0, 1, 1.5);
        particleSystem.addVelocityGradient(0.1, 0.8, 0.9);
        particleSystem.addVelocityGradient(0.7, 0.4, 0.5);
        particleSystem.addVelocityGradient(1, 0.1, 0.2);

        // rotation
        particleSystem.minInitialRotation = 0;
        particleSystem.maxInitialRotation = Math.PI;
        particleSystem.minAngularSpeed = -1;
        particleSystem.maxAngularSpeed = 1;

        // blendmode
        particleSystem.blendMode = ParticleSystem.BLENDMODE_STANDARD;
        
        // emitter shape
        var sphereEmitter = particleSystem.createConeEmitter(0.01, 0.5);
        // Where the particles come from
        particleSystem.emitter = vector; // the starting object, the emitter
        // particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -0.5); // Starting all from
        // particleSystem.maxEmitBox = new Vector3(0.5, 0, 0.5); // To...

        // Start the particle system
        particleSystem.start();
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

    async addPlayer(identifier: string, position : Vector3): Promise<Player> {
        const player = new Player(this._scene, identifier);
        await player.addCharacterAsync("Wall-E", position, Group.getSprinter());
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

    // async addVehicleObstacle() : Promise<void>{
    //     const vehicle = new Vehicule(this._scene, policeCar);
    //     await vehicle.createObstacle();
    //     this._vehicleObstacles.push(vehicle);
    // }

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
                //console.log("Setting collision for player: " + player.getCharacter().getMesh().name + " and cube: " + cube.getMesh().name);
                // Create a trigger for the cube modifier
                player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                    {
                        trigger : ActionManager.OnIntersectionEnterTrigger,
                        parameter : cube.getMesh()
                    },
                    () => {
                        //console.log("HIT Cube!");
                        cube.disposeObstacle();
                    }
                ));
            }
        }
    }


    
}

export default World;