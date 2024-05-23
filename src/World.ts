import { AbstractMesh, ActionManager, Animation, Color3, Color4, CubeTexture, Curve3, DirectionalLight, ExecuteCodeAction, FreeCamera, HavokPlugin, HemisphericLight, Layer, Mesh, MeshBuilder, NodeMaterial,  ParticleSystem,  Path3D,  PhysicsAggregate,  PhysicsMotionType,  PhysicsShapeType,  Quaternion,  Scene,  SceneLoader,  SceneOptimizer,  SceneOptimizerOptions,  ScenePerformancePriority,  ShadowGenerator,  Space,  StandardMaterial,  Texture,  TransformNode, Vector3 } from "@babylonjs/core";
import Player from "./Player";
import Group from "./Group";

import map from "../assets/models/MapDefinitive2.glb";
import HavokPhysics from "@babylonjs/havok";
import CubeModifier from "./CubeModifier";

import Vehicle from "./Vehicle";
import Spawner from "./Spawner";

import mesh8 from '../assets/models/animals/carp.glb';


export const WORLD_GRAVITY: Vector3 = new Vector3(0, -9.81, 0);
export const WORLD_SCALE: number = 0.3;

const worldMap = {
    name: "map",
    model: map
}

//filtering happens here
export const FILTER_GROUP_GROUND = 1;
export const FILTER_GROUP_LIMIT = 2;
export const FILTER_GROUP_OBSTACLE = 3;

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
    private _respawnTab: TransformNode[] = [];
    private _groundTab: AbstractMesh[] = [];
    private _limitTab: AbstractMesh[] =[];
    private _deathTab: AbstractMesh[] =[];
    private _checkpointTab: AbstractMesh[] =[];

    public getWorldSpawn() : Vector3{
        return this._worldSpawn;
    }
    public getDispawnerList() : AbstractMesh[]{
        return this._dispawnerTab;
    }
    public getCheckPointList() : AbstractMesh[]{
        return this._dispawnerTab;
    }
    public getSpawnerList() : TransformNode[]{
        return this._spawnerTab;
    }
    public getRespawnList() : TransformNode[]{
        return this._respawnTab;
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
        const env = CubeTexture.CreateFromPrefilteredData("https://patrickryanms.github.io/BabylonJStextures/Demos/waterRefraction/assets/env/kloofendal_pureSky.env", scene);
        env.name = "sky";
        env.gammaSpace = false;
        env.rotationY = 4.0823;
        this._scene.environmentTexture = env;

        this._worldSpawn = Vector3.Zero();

        // Pour afficher un background
        // const layer = new Layer('','https://i.imgur.com/mBBxGJH.jpg', this._scene, true);
    }

    async getInitializedHavok() {
        return await HavokPhysics();
    }

    async createScene(){
        const havokInstance = await this.getInitializedHavok();
        this._scene.collisionsEnabled = true;

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

            if(transformNode.id.startsWith("Respawn")){
                if(transformNode.id == "Respawn0"){
                    this._worldSpawn = transformNode.absolutePosition.clone().scaleInPlace(WORLD_SCALE);
                    //this._worldSpawn = new Vector3(66, -10, -380)
                    console.log("World spawn : ", this._worldSpawn);
                }
                else{
                    this._respawnTab.push(transformNode);
                }
            }
            

            if(transformNode.id.startsWith("Smoke")) {
                this.addSmoke(transformNode.absolutePosition);
            }
        }




        for (const childMesh of result.meshes) {

            childMesh.refreshBoundingInfo(true);

            //console.log(childMesh.id)
            
            if (childMesh.getTotalVertices() > 0) {

                
                if(childMesh.id.startsWith("Dispawn")){
                    childMesh.isVisible = false;
                    this._dispawnerTab.push(childMesh);
                    
                }
                else if(childMesh.id.startsWith("Death")){
                    childMesh.isVisible = false;

                    childMesh.isPickable = true;
                    this._deathTab.push(childMesh)                    
                }
                else if(childMesh.id.startsWith("Solide")){

                    //childMesh.alwaysSelectAsActiveMesh = true;
                    childMesh.freezeWorldMatrix();
                    const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                    meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);

                    if(childMesh.id === "SolideSolMap"){
                        meshAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
                    }
                    if(childMesh.id.includes("SolideForetNoire") || childMesh.id.includes("SolideBatiment")){
                        meshAggregate.shape.filterMembershipMask = FILTER_GROUP_LIMIT;
                    }
                }       
                else if(childMesh.id.startsWith("Limit")) {
                    this._limitTab.push(childMesh);
                    childMesh.isVisible = false;
                    childMesh.isPickable = true;
                    const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0, restitution: 0});
                    meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    meshAggregate.shape.filterMembershipMask = FILTER_GROUP_LIMIT;
                }
                else if(childMesh.id.startsWith("Checkpoint")){
                    childMesh.isVisible = false;
                    this._checkpointTab.push(childMesh);
                }
                else{

                    childMesh.freezeWorldMatrix();
                    childMesh.isPickable = false; 
                    childMesh.doNotSyncBoundingInfo = true;
                    
                }

                if(childMesh.id == "Lave"){
                    
                    NodeMaterial.ParseFromSnippetAsync("#JN2BSF#29", this._scene).then((mat) => {
                        childMesh.material = mat;    
                    });
                }
                // childMesh.receiveShadows = true;
                // this._shadowGenerator.addShadowCaster(childMesh);
                
            }
        }

        this._scene.freeActiveMeshes();
        this._scene.blockMaterialDirtyMechanism = true;

        // world.addSphere("sphere", 32, 3, 0, 15, 0, true);
        // 
        for (let i = 0; i < 5; i++) {
            this.addCubeModifier(new Vector3(0 + i * 3, 3, 2));
        }
        // const player = await this.addPlayer("player1");
        //const player2 = await world.addPlayer("player2");


        // Set up spawners
        this._spawnerTab.forEach((spawner) => {
            const parts = spawner.id.split('_');
            const direction = parts[1];
            const type = parts[2];
            if (type.startsWith("Vehicle")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Vehicle", this._dispawnerTab, this._players);
                this._scene.registerBeforeRender(() => {
                    newSpawner.updateVehicle();
                })
        
            }
            if (type.startsWith("Bee")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Bee", this._dispawnerTab, this._players);
                this._scene.registerBeforeRender(() => {
                    newSpawner.updateBee();
                })
        
            }
            if (type.startsWith("Bat")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Bat", this._dispawnerTab, this._players);
                this._scene.registerBeforeRender(() => {
                    newSpawner.updateBat();
                })
        
            }
        });

        const assets = await SceneLoader.ImportMeshAsync("", "", mesh8, this._scene);

        const carBody = assets.meshes[0] as Mesh;
        carBody.position = new Vector3(0, 18, 0)
        carBody.scaling = new Vector3(5, 5, 5)
        carBody.id = "Carpe"


        const nbPoints = 25;
        const nbLoops = 4

        const points = [];
        const offset = 30;
        const startpoint = -120;

        for(let a = 0; a < nbLoops; a++){
            for(let i = 0; i < nbPoints; i++){
                points.push( new Vector3(i - (a*offset + startpoint), 5 * Math.sin(i/4) - 17, 5 * Math.cos(i/5) - 301) );
            }

        }
        


        // PATH DEFINITION
        // Here we define the path along where the camera will move. 
        // This path is comprised of chained cubic Bèzier curves.
        //
        const pathGroup = new Mesh("pathGroup");

        const v3 = (x, y, z) => new Vector3(x,y,z);
        let curve = Curve3.CreateCubicBezier(v3(-10,10,0), v3(-5, 10, 10), v3(5, 10, 10), v3(10, 10, 0),40);
        const curveCont = Curve3.CreateCubicBezier(v3(10, 10, 0), v3(5, 10, -10), v3(-5, 10, -10), v3(-10, 10, 0), 40);
        curve = curve.continue(curveCont);
        const curveMesh = MeshBuilder.CreateLines(
            "bezier", {points: curve.getPoints()}, this._scene);
        //curveMesh.color = new Color3(1, 1, 0.5);
        curveMesh.parent = pathGroup;
        curveMesh.isVisible = false;

        // Transform the curves into a proper Path3D object and get its orientation information
        //var path3d = new Path3D(curve.getPoints());
        const path3d = new Path3D(points);
        const tangents = path3d.getTangents();
        //var normals = path3d.getNormals();
        const binormals = path3d.getBinormals();
        const curvePath = path3d.getCurve();

        //var path3d = new Path3D(curve.getPoints());
        const normals = path3d.getNormals();
        // var theta = Math.acos(Vector3.Dot(Axis.Z,normals[0]));
        // carBody.rotate(Axis.Y, theta); 
        //var startRotation = carBody.rotationQuaternion;
        
        // visualisation
        for(let p = 0; p < curvePath.length; p++) {
            const tg = MeshBuilder.CreateLines('tg', {points: [ curvePath[p], curvePath[p].add(tangents[p]) ]}, this._scene);
            //tg.color = ;
            tg.isVisible = false;
            tg.parent = pathGroup;
            const no = MeshBuilder.CreateLines('no', {points: [ curvePath[p], curvePath[p].add(normals[p]) ]}, this._scene);
            //no.color = null;
            no.isVisible = false;
            no.parent = pathGroup;
            const bi = MeshBuilder.CreateLines('bi', {points: [ curvePath[p], curvePath[p].add(binormals[p]) ]}, this._scene);
            //bi.color = Color3.Green();
            bi.parent = null;
            bi.isVisible = false;
        }




        // Define the position and orientation animations that will be populated
        // according to the Path3D properties 
        const frameRate = 60;
        const posAnim = new Animation("cameraPos", "position", frameRate, Animation.ANIMATIONTYPE_VECTOR3);
        const posKeys = [];
        const rotAnim = new Animation("cameraRot", "rotationQuaternion", frameRate, Animation.ANIMATIONTYPE_QUATERNION);
        const rotKeys = [];

        for (let i = 0; i < curvePath.length; i++) {
            const position = curvePath[i];
            const tangent = tangents[i];
            const binormal = binormals[i];

            const rotation = Quaternion.FromLookDirectionRH(tangent, binormal);

            posKeys.push({frame: i * frameRate, value: position});
            rotKeys.push({frame: i * frameRate, value: rotation});
            
        }

        posAnim.setKeys(posKeys);
        rotAnim.setKeys(rotKeys);


        carBody.animations.push(posAnim);
        carBody.animations.push(rotAnim);
        this._scene.beginAnimation(carBody, 0, 15000, true, 8);


            /*-----------------------Path------------------------------------------*/ 
        
        // // Create array of points to describe the curve
        // var points = [];
        // var n = 900; // number of points
        // var r = 3; //radius
        // for (var i = 0; i < n + 1; i++) {
        //     points.push( new Vector3((r + (r/5)*Math.sin(8*i*Math.PI/n))* Math.sin(2*i*Math.PI/n)*0.5, 0, (r + (r/10)*Math.sin(6*i*Math.PI/n)) * Math.cos(2*i*Math.PI/n) * 6));
        // }	
        
        // //Draw the curve
        // var track = MeshBuilder.CreateLines('track', {points: points}, this._scene);
        // track.color = new Color3(0, 0, 0);
        // track.position = new Vector3(38, 0, -190)
        // /*-----------------------End Path------------------------------------------*/ 
        
        // /*-----------------------Ground------------------------------------------*/ 	
        // var ground = MeshBuilder.CreateGround("ground", {width: 3*r, height: 3*r}, this._scene);
        // /*-----------------------End Ground------------------------------------------*/ 	

        // /*----------------Position and Rotate Car at Start---------------------------*/
        // // carBody.position.y = 4;
        // // carBody.position.z = r;
        // carBody.position = new Vector3(38, 0, -190)

        // var path3d = new Path3D(points);
        // var normals = path3d.getNormals();
        // var theta = Math.acos(Vector3.Dot(Axis.Z,normals[0]));
        // carBody.rotate(Axis.Y, theta); 
        // var startRotation = carBody.rotationQuaternion;
        // /*----------------End Position and Rotate Car at Start---------------------*/

        // /*----------------Animation Loop---------------------------*/
        // var i=0;
        // this._scene.registerAfterRender(function() {
        //     carBody.position.x = curve.getPoints().at(i).x;
        //     carBody.position.z = curve.getPoints().at(i).z;
            
        //     theta = Math.acos(Vector3.Dot(normals[i],normals[i+1]));
        //     var dir = Vector3.Cross(normals[i],normals[i+1]).y;
        //     var dir = dir/Math.abs(dir);
        //     carBody.rotate(Axis.Y, dir * theta);
            
        //     i = (i + 1) % (curve.getPoints().length -1);	//continuous looping  
            
        //     if(i == 0) {
        //         carBody.rotationQuaternion = startRotation;
        //     }
        // });

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

        // this._scene.activeCameras.push(camera);
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
        const particleSystem = new ParticleSystem("particles", 8000, this._scene);

        //Texture of each particle
        particleSystem.particleTexture = new Texture("https://raw.githubusercontent.com/PatrickRyanMS/BabylonJStextures/master/FFV/smokeParticleTexture.png", this._scene);

        // lifetime
        particleSystem.minLifeTime = 2;
        particleSystem.maxLifeTime = 2;// permet de modifier la hauteur par la durée de vie

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
        const sphereEmitter = particleSystem.createConeEmitter(0.01, 0.5);
        // Where the particles come from
        particleSystem.emitter = vector.scaleInPlace(WORLD_SCALE); // the starting object, the emitter
        // particleSystem.minEmitBox = new Vector3(-0.5, -0.5, -0.5); // Starting all from
        // particleSystem.maxEmitBox = new Vector3(0.5, 0, 0.5); // To...

        // Start the particle system
        // particleSystem.start();
        // Variables to control the intervals
        let isRunning = false;
        const intervalTime = Math.floor(Math.random() * 10) + 1; // Interval time in milliseconds
        const geyserDuration = Math.floor(Math.random() * 10) + 1; // Geyser active duration in milliseconds

        setInterval(() => {
            if (!isRunning) {
                particleSystem.start();
                isRunning = true;

                // Stop the particle system after the geyser duration
                setTimeout(() => {
                    particleSystem.stop();
                    isRunning = false;
                }, geyserDuration*1000);
            }
        }, intervalTime*1000);
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

    public async addPlayer(identifier: string, position: Vector3, group: Group, isPlayer1: boolean): Promise<Player> {
        const player = new Player(this._scene, identifier, isPlayer1);
        await player.addCharacterAsync(identifier, position, group);

        player.updatePlayer();
        this._shadowGenerator.addShadowCaster(player.getCharacter().getMesh())
        this._players.push(player);

        return player;
    }

    public addCubeModifier(position: Vector3) : void {
        const cubeModifier = new CubeModifier(this._scene);
        cubeModifier.createObstacle();
        cubeModifier.setPosition(position);
        this._cubeModifiers.push(cubeModifier);
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
    private _setCubeModifierCollision(player: Player): void {

        // for each player
        for (const player of this._players) {
            // for each cube modifier
            for (const cube of this._cubeModifiers) {
                // Create a trigger for the cube modifier
                const action = new ExecuteCodeAction(
                    {
                        trigger : ActionManager.OnIntersectionEnterTrigger,
                        parameter : cube.getMesh()
                    },
                    () => {
                        // Check if the player has a modifier
                        if (player.getModifier().isDefault()) {
                            // Apply the modifier to the player
                            player.setModifierFromRandomValue(cube.getRandomValue());
                            
                            // Dispose the action manager related to this cube modifier for this player
                            player.getCharacter().getHitbox().actionManager.unregisterAction(action);

                            // Remove the cube modifier
                            cube.disposeObstacle();
                        }
                    }
                );

                // Add the action manager to the player's hitbox
                player.getCharacter().getHitbox().actionManager.registerAction(action);
            }
        }
    }

    private _checkPointManager(player: Player){
        this._checkpointTab.forEach((checkPoint, index) => {
            player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger : ActionManager.OnIntersectionEnterTrigger,
                    parameter : checkPoint
                },
                () => {
                    
                    console.log("Changement de respawn : ", checkPoint.id)
                    console.log("Index : ", index);
                    const respawn = this._respawnTab.at(index).absolutePosition;
                    if(player.getCharacter().getSpawnLocation() != respawn){
                        player.getCharacter().setSpawnLocation(respawn);
                        console.log("Respawn set at : ", respawn)
                    }
                    else{
                        console.log("Pas de changement de respawn");
                    }
                    
                    
                }
            ))

        })
    }

    private _deathManager(player: Player){
        const hitbox = player.getCharacter().getHitbox();
        if (!hitbox.actionManager) {
            hitbox.actionManager = new ActionManager(this._scene);
        }

        

        this._deathTab.forEach((death, index) => {

            death.refreshBoundingInfo(true);

            hitbox.actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: death
                },
                () => {
                    console.log("Intersection detected with death surface: ", death.id);
                    console.log("Index: ", index);
                    
                    // Check if the position is set correctly
                    const respawnPosition = player.getCharacter().getSpawnLocation().clone();
                    console.log("Respawn position is: ", respawnPosition);
                    // player.getCharacter().getCapsuleAggregate().body.setMotionType(PhysicsMotionType.STATIC)
                    hitbox.position.copyFrom(respawnPosition);
                    // hitbox.computeWorldMatrix(true);
                    // player.getCharacter().setLastPosition(respawnPosition);
                    // player.getCharacter().updatePosition(respawnPosition);

                    console.log("Respawn set at: ", respawnPosition);
                    // player.getCharacter().getCapsuleAggregate().body.setMotionType(PhysicsMotionType.DYNAMIC)
                }
            ));
        });
    }

    // Set all the collisions with the players
    public setCollisionWithPlayers() {
        for (const player of this._players) {
            this._setCubeModifierCollision(player);
            this._checkPointManager(player);
            this._deathManager(player);
        }
    }
}

export default World;