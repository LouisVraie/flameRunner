import { AbstractMesh, ActionManager, Color3, Color4, CubeTexture, Curve3, DirectionalLight, ExecuteCodeAction, FreeCamera, HavokPlugin, HemisphericLight, Matrix, Mesh, MeshBuilder, NodeMaterial, ParticleSystem,  Path3D,  PhysicsAggregate,  PhysicsMotionType,  PhysicsShapeType,  Quaternion,  Scene,  SceneLoader,  ShadowGenerator,  Texture,  TransformNode, Vector3 } from "@babylonjs/core";
import Player from "./Player";
import Group from "./Group";

// import map from "../assets/models/MapDefinitive2.glb";
import HavokPhysics from "@babylonjs/havok";
import CubeModifier from "./CubeModifier";

import Vehicle from "./obstacles/Vehicle";
import Spawner from "./Spawner";

import flare from '../assets/textures/Flare.png';
// import map from '../assets/models/Map.glb';

export const WORLD_GRAVITY: Vector3 = new Vector3(0, -9.81, 0);
export const WORLD_SCALE: number = 0.3;

//filtering happens here
export const FILTER_GROUP_GROUND = 1;
export const FILTER_GROUP_LIMIT = 2;
export const FILTER_GROUP_OBSTACLE = 3;

interface RespawnNode {
    node: TransformNode;
    angle: number;
}

const MAP_URL = "https://dl.dropbox.com/scl/fi/w37zjc5tlmd3f7g7ug6pz/MapDefinitive.glb?rlkey=s6y40ktt03aji6tytg4m4vfg4&st=9r9nfha8"


import Biome from "./Biome";
import { Climate } from "./enum/Climate";
import Cactus from "./obstacles/Cactus";
import Slower from "./obstacles/Slower";

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
    private _podium: TransformNode[] = [];
    private _respawnTab: RespawnNode[] = [];
    private _cubeSpawn: TransformNode[] =[];
    private _groundTab: AbstractMesh[] = [];
    private _limitTab: AbstractMesh[] =[];
    private _deathTab: AbstractMesh[] =[];
    private _checkpointTab: AbstractMesh[] =[];

    private _cameraDown : AbstractMesh = null;
    private _cameraUp : AbstractMesh = null;
    private _cowPathPoints: Vector3[] = [];

    private _biomes: Biome[] = [];
    private _cityDoors: AbstractMesh[] = [];
    private _citySolidMeshes: AbstractMesh[] = [];
    private _cityMeshes: AbstractMesh[] = [];

    private _countrysideDoors: AbstractMesh[] = [];
    private _countrysideSolidMeshes: AbstractMesh[] = [];
    private _countrysideMeshes: AbstractMesh[] = [];

    private _desertDoors: AbstractMesh[] = [];
    private _desertSolidMeshes: AbstractMesh[] = [];
    private _desertMeshes: AbstractMesh[] = [];

    private _riverDoors: AbstractMesh[] = [];
    private _riverSolidMeshes: AbstractMesh[] = [];
    private _riverMeshes: AbstractMesh[] = [];

    private _forestDoors: AbstractMesh[] = [];
    private _forestSolidMeshes: AbstractMesh[] = [];
    private _forestMeshes: AbstractMesh[] = [];

    private _vulcanDoors: AbstractMesh[] = [];
    private _vulcanSolidMeshes: AbstractMesh[] = [];
    private _vulcanMeshes: AbstractMesh[] = [];

    private _mountainDoors: AbstractMesh[] = [];
    private _mountainSolidMeshes: AbstractMesh[] = [];
    private _mountainMeshes: AbstractMesh[] = [];

    private _snowDoors: AbstractMesh[] = [];
    private _snowSolidMeshes: AbstractMesh[] = [];
    private _snowMeshes: AbstractMesh[] = [];

    private _slowingMeshes: AbstractMesh[]=[];
    private _cactusMeshes: AbstractMesh[]=[];

    private _biomeNames: string[] = ["Ville", "Campagne", "Desert", "Riviere", "Foret", "Volcan", "Montagne", "Neige"];


    private _fishCurve: Vector3[] = [];
    private _fishTangents: Vector3[] = [];
    private _fishBinormals: Vector3[] = [];
    private _fishNormals: Vector3[] = [];

    private _end: AbstractMesh;
    private _arrival: number = 0;
    private _start: AbstractMesh;

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
    public getRespawnList() : RespawnNode[]{
        return this._respawnTab;
    }
    public getGroundList() : AbstractMesh[]{
        return this._groundTab;
    }
    public getLimitList() : AbstractMesh[]{
        return this._limitTab;
    }
    public getStartWall() : AbstractMesh{
        return this._start;
    }
    public getPlayers() : Player[]{
        return this._players;
    }
    public getFishCurve(): Vector3[]{
        return this._fishCurve;
    }
    public getFishTangents(): Vector3[]{
        return this._fishTangents;
    }
    public getFishBinormals(): Vector3[]{
        return this._fishBinormals;
    }
    public getFishNormals(): Vector3[]{
        return this._fishNormals;
    }
    public getBiomes(): Biome[]{
        return this._biomes;
    }
    public getBiomeNames(): string[]{
        return this._biomeNames;
    }
    public getCowPathPoints(): Vector3[]{
        return this._cowPathPoints;
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


    sortBiomeDoors(name: string, childmesh: AbstractMesh){
        
        if(name.includes("Ville")){
            this._cityDoors.push(childmesh);
        }                
        else if(name.includes("Campagne")){
            this._countrysideDoors.push(childmesh)
        }                
        else if(name.includes("Desert")){
            this._desertDoors.push(childmesh);
        }
        else if(name.includes("Riviere")){
            this._riverDoors.push(childmesh);
        }
        else if(name.includes("Foret")){
            this._forestDoors.push(childmesh);
        }
        else if(name.includes("Volcan")){
            this._vulcanDoors.push(childmesh);
        }
        else if(name.includes("Montagne")){
            this._mountainDoors.push(childmesh);
        }
        else if(name.includes("Neige")){
            this._snowDoors.push(childmesh);
        }
    }

    sortBiomeSolidMeshes(childmesh: AbstractMesh){
        
        if(childmesh.id.includes("Ville")){
            this._citySolidMeshes.push(childmesh);
        }                
        else if(childmesh.id.includes("Campagne")){
            this._countrysideSolidMeshes.push(childmesh)
        }                
        else if(childmesh.id.includes("Desert")){
            if(childmesh.id.includes("Cactus")){
                this._cactusMeshes.push(childmesh);
            }
            else{
                this._desertSolidMeshes.push(childmesh);
            }
        }
        else if(childmesh.id.includes("Riviere")){
            this._riverSolidMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Foret")){
            this._forestSolidMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Volcan")){
            this._vulcanSolidMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Montagne")){
            this._mountainSolidMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Neige")){
            this._snowSolidMeshes.push(childmesh);
        }
        else{
            //console.log("Exception : " + childmesh.id )
        }
    }

    sortBiomeMeshes(childmesh: AbstractMesh){
        if(childmesh.id.startsWith("Load")){
            console.log("Loader trouvé pour ", childmesh.id)
        }
        
        if(childmesh.id.includes("Ville")){
            this._cityMeshes.push(childmesh);
        }                
        else if(childmesh.id.includes("Campagne")){
            this._countrysideMeshes.push(childmesh)
        }                
        else if(childmesh.id.includes("Desert")){
            if(childmesh.id.includes("Slow")){
                this._slowingMeshes.push(childmesh);
            }
            else{
                this._desertMeshes.push(childmesh);
            }            
        }
        else if(childmesh.id.includes("Riviere")){
            this._riverMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Foret")){
            this._forestMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Volcan")){
            this._vulcanMeshes.push(childmesh);
        }
        else if(childmesh.id.includes("Montagne")){
            if(childmesh.id.includes("Slow")){
                this._slowingMeshes.push(childmesh);
            }
            else{
                this._mountainMeshes.push(childmesh);
            }
        }
        else if(childmesh.id.includes("Neige")){
            this._snowMeshes.push(childmesh);
        }
        else{
            //console.log("Exception : " + childmesh.id )
        }
    }



    

    async loadWorld(){
        const result = await SceneLoader.ImportMeshAsync("", "", MAP_URL, this._scene);

        this._worldMesh = result.meshes[0];
        // this._worldMesh.receiveShadows = true;
        //this._shadowGenerator.addShadowCaster(this._worldMesh);
        this._gameObject = this._worldMesh;
        this._gameObject.name = "world";
        this._gameObject.setParent(null);
        this._gameObject.scaling.scaleInPlace(WORLD_SCALE);
        this._gameObject.position.set(0,-3,0);


        this.addFreeCamera("Camera", new Vector3(-13.5, 3, 11), new Vector3(-13.963, 2.849, -6.664), true)

        for(const transformNode of result.transformNodes){

            //console.log(transformNode.id);
            if(transformNode.id.startsWith("Particles")){                
                this.addShiningParticles(transformNode.absolutePosition.clone().scaleInPlace(WORLD_SCALE));
            }           
            if(transformNode.id.startsWith("Spawn")){
                this._spawnerTab.push(transformNode);
            }
            if(transformNode.id.startsWith("Bonus")){
                this._cubeSpawn.push(transformNode);
            }
            if(transformNode.id.startsWith("Final")){
                this._podium.push(transformNode);
            }

            if(transformNode.id.startsWith("Respawn")){
                if(transformNode.id == "Respawn0"){
                    this._worldSpawn = transformNode.absolutePosition.clone().scaleInPlace(WORLD_SCALE);
                    //this._worldSpawn = new Vector3(66, -10, -380)
                    console.log("World spawn : ", this._worldSpawn);
                }
                else{
                    //this._respawnTab.push(transformNode);
                    const angle = this.getAngleForNode(transformNode);
                    this._respawnTab.push({ node: transformNode, angle: angle });
                }
            }
            
            if(transformNode.id.startsWith("Smoke")) {
                this.addSmoke(transformNode.absolutePosition.clone().scaleInPlace(WORLD_SCALE));
            }
        }


       



        for (const childMesh of result.meshes) {

            childMesh.refreshBoundingInfo(true);

            
            if (childMesh.getTotalVertices() > 0) {


                if(childMesh.id == "End"){
                    this._end = childMesh;
                    childMesh.isVisible = false;
                }
                else if(childMesh.id == "Camera_Up"){
                    this._cameraUp = childMesh;
                }
                else if(childMesh.id == "Camera_Down"){
                    this._cameraDown = childMesh;
                }               

                else if(childMesh.id.startsWith("Biome")){
                    childMesh.isVisible = false;
                    this.sortBiomeDoors(childMesh.id, childMesh)         
                }


                else if(childMesh.id.startsWith("Dispawn")){
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
                    

                    if(childMesh.id === "SolideStart"){
                        this._start = childMesh;
                        childMesh.visibility = 0.4;  
                        
                        childMesh.freezeWorldMatrix();
                        const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                        meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
                    }

                    else if(childMesh.id.includes("SolideSolMap")){
                        childMesh.freezeWorldMatrix();
                        const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                        meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);

                        meshAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
                        // childMesh.receiveShadows = true;
                        
                    }
                    else if(childMesh.id.includes("SolideDepart")){
                        childMesh.freezeWorldMatrix();
                        const meshAggregate = new PhysicsAggregate(childMesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                        meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);

                        meshAggregate.shape.filterMembershipMask = FILTER_GROUP_GROUND;
                        // childMesh.receiveShadows = true;
                        
                    }
                    else{
                        this.sortBiomeSolidMeshes(childMesh);
                    }
                    // if(childMesh.id.includes("SolideForetNoire") || childMesh.id.includes("SolideBatiment")){
                    //     meshAggregate.shape.filterMembershipMask = FILTER_GROUP_LIMIT;
                    //     // childMesh.receiveShadows = true;
                    // }

                    //childMesh.receiveShadows = true;
                   //this._setShadows(childMesh);
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

                    // childMesh.freezeWorldMatrix();
                    // childMesh.isPickable = false; 
                    // childMesh.doNotSyncBoundingInfo = true;

                    this.sortBiomeMeshes(childMesh);
                    
                    // childMesh.receiveShadows = true;
                    // this._shadowGenerator.addShadowCaster(childMesh);
                }

                if(childMesh.id == "VolcanLave"){
                    
                    NodeMaterial.ParseFromSnippetAsync("#JN2BSF#29", this._scene).then((mat) => {
                        childMesh.material = mat;    
                    });
                }
                // childMesh.receiveShadows = true;
                // this._shadowGenerator.addShadowCaster(childMesh);
                
            }
        }

        this._biomes.push(
            new Biome("Ville", this._cityDoors, true, Climate.MILD_CLIMATE, this._citySolidMeshes, this._cityMeshes, this),
            new Biome("Campagne", this._countrysideDoors, false, Climate.MILD_CLIMATE, this._countrysideSolidMeshes, this._countrysideMeshes, this),
            new Biome("Desert", this._desertDoors, false, Climate.HOT_CLIMATE, this._desertSolidMeshes, this._desertMeshes, this),
            new Biome("Riviere", this._riverDoors, false, Climate.COLD_CLIMATE, this._riverSolidMeshes, this._riverMeshes, this),
            new Biome("Foret", this._forestDoors, false, Climate.MILD_CLIMATE, this._forestSolidMeshes, this._forestMeshes, this),
            new Biome("Volcan", this._vulcanDoors, false, Climate.HOT_CLIMATE, this._vulcanSolidMeshes, this._vulcanMeshes, this),
            new Biome("Montagne", this._mountainDoors, false, Climate.MILD_CLIMATE, this._mountainSolidMeshes, this._mountainMeshes, this),
            new Biome("Neige", this._snowDoors, false, Climate.COLD_CLIMATE, this._snowSolidMeshes, this._snowMeshes, this),
        )

        this._scene.freeActiveMeshes();
        this._scene.blockMaterialDirtyMechanism = true;

        // Add Cube Modifiers
        this._cubeSpawn.forEach(cube =>{
            this.addCubeModifier(cube.absolutePosition.clone())
        })

        // Set up spawners
        this._spawnerTab.forEach((spawner) => {
            const parts = spawner.id.split('_');
            const direction = parts[1];
            const type = parts[2];
            if (type.startsWith("Vehicle")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Vehicle", this._dispawnerTab, this._players, this);
                this._scene.registerAfterRender(() => {
                    newSpawner.updateVehicle();
                })
        
            }
            if (type.startsWith("Bee")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Bee", this._dispawnerTab, this._players, this);
                this._scene.registerBeforeRender(() => {
                    newSpawner.updateBee();
                })
        
            }
            if (type.startsWith("Bat")) {
                
                const newSpawner = new Spawner(this._scene, spawner, direction, "Bat", this._dispawnerTab, this._players, this);
                this._scene.registerBeforeRender(() => {
                    newSpawner.updateBat();
                })
        
            }
            if (type.startsWith("Rock")) {
                new Spawner(this._scene, spawner, direction, "Rock", this._dispawnerTab, this._players, this);
            }
        });

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
        this._fishTangents = path3d.getTangents();
        //var normals = path3d.getNormals();
        this._fishBinormals = path3d.getBinormals();
        this._fishCurve = path3d.getCurve();

        //var path3d = new Path3D(curve.getPoints());
        this._fishNormals = path3d.getNormals();
        // var theta = Math.acos(Vector3.Dot(Axis.Z,normals[0]));
        // carBody.rotate(Axis.Y, theta); 
        //var startRotation = carBody.rotationQuaternion;
        
        // visualisation
        for(let p = 0; p < this._fishCurve.length; p++) {
            const tg = MeshBuilder.CreateLines('tg', {points: [ this._fishCurve[p], this._fishCurve[p].add(this._fishTangents[p]) ]}, this._scene);
            //tg.color = ;
            tg.isVisible = false;
            tg.parent = pathGroup;
            const no = MeshBuilder.CreateLines('no', {points: [ this._fishCurve[p], this._fishCurve[p].add(this._fishNormals[p]) ]}, this._scene);
            //no.color = null;
            no.isVisible = false;
            no.parent = pathGroup;
            const bi = MeshBuilder.CreateLines('bi', {points: [ this._fishCurve[p], this._fishCurve[p].add(this._fishBinormals[p]) ]}, this._scene);
            //bi.color = Color3.Green();
            bi.parent = pathGroup;
            bi.isVisible = false;
        }

        const totalPoints = this._fishCurve.length;

        // Assurez-vous que vous avez au moins nbLoops points
        if (totalPoints < nbLoops) {
            console.error("Pas assez de points pour créer autant de sections.");
        } else {
            // Nombre de points par section
            const pointsPerSection = totalPoints / nbLoops;

            for (let i = 0; i < nbLoops; i++) {



                const indice = pointsPerSection * i
                const valeur = this._fishCurve.at(indice)

                const node = new TransformNode("spawnerNode", this._scene);

                // Définissez la position du TransformNode
                node.position = valeur;

                // Utilisez le TransformNode dans le constructeur de Spawner
                new Spawner(this._scene, node, "Forth", "Fish", this._dispawnerTab, this._players, this);

            }
        }

        // Create a cow path
        this.createCowPath();
    }

    async initGame(){
        await this.createScene();
    }

    public addDeathSurface(mesh: AbstractMesh){
        this._deathTab.push(mesh);
    }

    // Fonction pour obtenir l'angle associé à un TransformNode (à adapter selon votre logique)
    getAngleForNode(node: TransformNode): number {
        // Par exemple, mappez les IDs de nodes à des angles spécifiques
        const angleMap: { [id: string]: number } = {
            "Respawn1": Math.PI/2,
            "Respawn2": Math.PI,
            "Respawn3": Math.PI/2,
            "Respawn4": 0,
            "Respawn5": Math.PI/2,
            "Respawn6": -Math.PI/2,
            // Ajoutez d'autres mappings ici
        };
        return angleMap[node.id] || 0; // Retourne l'angle associé ou 0 par défaut
    }

    public createCowPath() {
        /*-----------------------Path------------------------------------------*/ 
        
        const pathGroup = new Mesh("cowPathGroup", this._scene);
        // Create array of points to describe the curve
        const points = [];
        const n = 450; // number of points
        const r = 3.5; //radius
        for (let i = 0; i < n + 1; i++) {
            points.push( new Vector3((r + (r/5)*Math.sin(8*i*Math.PI/n))* Math.sin(2*i*Math.PI/n) + 37, 0.5, (r + (r/10)*Math.sin(6*i*Math.PI/n)) * Math.cos(2*i*Math.PI/n) - 160));
        }	
        
        /*-----------------------End Path------------------------------------------*/ 
    
        const path3d = new Path3D(points);
        const tangents = path3d.getTangents();
        const normals = path3d.getNormals();
        const binormals = path3d.getBinormals();
        const curve = path3d.getCurve();
    
        // Visualisation (optional, can be removed if not needed)
        for(let p = 0; p < curve.length; p++) {
            const tg = MeshBuilder.CreateLines('tg', {points: [ curve[p], curve[p].add(tangents[p]) ]}, this._scene);
            tg.color = Color3.Red();
            tg.isVisible = false;
            tg.parent = pathGroup;
            const no = MeshBuilder.CreateLines('no', {points: [ curve[p], curve[p].add(normals[p]) ]}, this._scene);
            no.isVisible = false;
            no.parent = pathGroup;
            const bi = MeshBuilder.CreateLines('bi', {points: [ curve[p], curve[p].add(binormals[p]) ]}, this._scene);
            bi.color = Color3.Green();
            bi.parent = pathGroup;
            bi.isVisible = false;
        }
    
        this._cowPathPoints = points;
        const valeur = curve[0];
        
        for(let a = 0; a < 10; a++){

            const node = new TransformNode("spawnerNode", this._scene);

            // Définissez la position du TransformNode
            node.position = new Vector3(valeur.x, valeur.y, valeur.z -5*a);

            // Utilisez le TransformNode dans le constructeur de Spawner
            const newSpawner = new Spawner(this._scene, node, "Forth", "Cow", this._dispawnerTab, this._players, this);
        }
    }
    
    
    applySnippetTexture(mesh: AbstractMesh, snippetId: string) : void{
        NodeMaterial.ParseFromSnippetAsync(snippetId, this._scene).then(nodeMaterial => {
            nodeMaterial.backFaceCulling = false;
            mesh.material = nodeMaterial;
        });
    }

    addFreeCamera(name: string,  position: Vector3, target: Vector3, zoom : boolean) : void {
        const camera = new FreeCamera(name, position, this._scene);
        if(zoom){
            camera.inputs.addMouseWheel();
        }
        camera.setTarget(target);
        camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);

        //this._scene.activeCameras.push(camera);
        //camera.viewport = new Viewport(0, 0, 0.5, 1.0);
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
        particleSystem.createConeEmitter(0.01, 0.5);
        // Where the particles come from
        particleSystem.emitter = new Vector3(vector.x, vector.y - 3, vector.z)//.scaleInPlace(WORLD_SCALE); // the starting object, the emitter

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

    addShiningParticles(location: Vector3){
        // Create a particle system
        const particleSystem = new ParticleSystem("particles", 2000, this._scene);

        //Texture of each particle
        particleSystem.particleTexture = new Texture(flare, this._scene);

        // Where the particles come from
        particleSystem.emitter = new Vector3(location.x, location.y - 3, location.z); // the starting location

        // Colors of all particles
        particleSystem.color1 = new Color4(1, 0.82, 0.7);
        particleSystem.color2 = new Color4(1, 0.95, 0.2);
        particleSystem.colorDead = new Color4(0.2, 0, 0, 0);

        // Size of each particle (random between...
        particleSystem.minSize = 0.01;
        particleSystem.maxSize = 0.05;

        // Life time of each particle (random between...
        particleSystem.minLifeTime = 0.3;
        particleSystem.maxLifeTime = 1.5;

        // Emission rate
        particleSystem.emitRate = 1000;


        /******* Emission Space ********/
        particleSystem.createSphereEmitter(2);


        // Speed
        particleSystem.minEmitPower = 1;
        particleSystem.maxEmitPower = 3;
        particleSystem.updateSpeed = 0.005;

        particleSystem.updateFunction = function(particles) {
            for (let index = 0; index < particles.length; index++) {
                const particle = particles[index];
                particle.age += this._scaledUpdateSpeed;
                
                if (particle.age >= particle.lifeTime) { // Recycle
                        particles.splice(index, 1);
                        this._stockParticles.push(particle);
                        index--;
                        continue;
                }
                else {
                        particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
                        particle.color.addInPlace(this._scaledColorStep);
        
                        if (particle.color.a < 0)
                                    particle.color.a = 0;
        
                        particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;
        
                        particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
                        particle.position.addInPlace(this._scaledDirection);
        
                        this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
                        particle.direction.addInPlace(this._scaledGravity);
                }
            } 
        }

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

    public async addPlayer(identifier: string, position: Vector3, group: Group, isPlayer1: boolean): Promise<Player> {
        const player = new Player(this._scene, identifier, isPlayer1);
        await player.addCharacterAsync(identifier, position, group);

        player.updatePlayer();
        this._shadowGenerator.addShadowCaster(player.getCharacter().getMesh())
        this._players.push(player);

        return player;
    }

    public addCubeModifier(position: Vector3) : void {
        const cubeModifier = new CubeModifier(this._scene, this);
        cubeModifier.createObstacle();
        cubeModifier.setPosition(position);
        this._cubeModifiers.push(cubeModifier);
    }

    setPhysicsPlugin(gravity : Vector3, plugin: HavokPlugin): void {
        this._physicsPlugin = plugin;
        this._scene.enablePhysics(gravity, this._physicsPlugin);
    }

    public _setShadows(mesh: AbstractMesh){
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

    private _checkPointManager(player: Player){
        this._checkpointTab.forEach((checkPoint, index) => {
            player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger : ActionManager.OnIntersectionEnterTrigger,
                    parameter : checkPoint
                },
                () => {

                    // Récupérer le respawn et l'angle
                    const respawnData = this._respawnTab[index];
                    const respawn = respawnData.node.absolutePosition.clone();
                    const angle = respawnData.angle;

                    // Vérifier et mettre à jour la position de spawn du joueur
                    if (!player.getCharacter().getSpawnLocation().equals(respawn)) {
                        player.getCharacter().setSpawnLocation(respawn);
                        player.getCharacter().setSpawnRotation(angle);
                    }
                }
            ))

        })
    }

    private _setCameraManager(player: Player){
        player.getCharacter().getHitbox().actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this._cameraDown
                },
                () => {
                    player.getCharacter().getCamera().heightOffset = -1;
                }
        ));

        player.getCharacter().getHitbox().actionManager.registerAction(
            new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: this._cameraUp
                },
                () => {
                    player.getCharacter().getCamera().heightOffset = 1.5;
                }
        ));
    }

    private _deathManager(player: Player){
        const hitbox = player.getCharacter().getHitbox();
        if (!hitbox.actionManager) {
            hitbox.actionManager = new ActionManager(this._scene);
        }

        

        this._deathTab.forEach((death) => {

            death.refreshBoundingInfo(true);

            hitbox.actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger: ActionManager.OnIntersectionEnterTrigger,
                    parameter: death
                },
                () => {
                    // Check if the position is set correctly
                    const respawnPosition = player.getCharacter().getSpawnLocation().clone();

                    hitbox.position.copyFrom(respawnPosition);
                    player.getCharacter().getMesh().rotation.y = player.getCharacter().getSpawnRotation(); // Supposons qu'il y ait une méthode pour définir l'angle de rotation
                }
            ));
        });
    }

    private manageScore(time) : boolean{
        const parseTime = (time) => {
            const [min, sec, msAndMicro] = time.split(/[:.]/).map(Number);
            const ms = Math.floor(msAndMicro); // Prendre la partie entière des millisecondes
            const micro = msAndMicro % 1; // Prendre la partie décimale des microsecondes
            return (min * 60 * 1000) + (sec * 1000) + ms + micro;
        };
    
        const newTime = parseTime(time);
        const bestTimeKey = "bestTime";
    
        const bestTime = localStorage.getItem(bestTimeKey);
    
        if (bestTime === null) {
            localStorage.setItem(bestTimeKey, time);
            console.log(`New best score set: ${time}`);
            return true
        } else {
            const previousBestTime = parseTime(bestTime);
            if (newTime < previousBestTime) {
                localStorage.setItem(bestTimeKey, time);
                console.log(`New best score updated: ${time}`);
                return true;
            } else {
                console.log(`Current time (${time}) is not better than the best time (${bestTime}).`);
                return false;
            }
        }
    }
    

    private _endManager(player: Player){
        
        player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
            {
                trigger : ActionManager.OnIntersectionEnterTrigger,
                parameter : this._end
            },
            () => {
                
                if(this._arrival < this._podium.length){
                    const podium = this._podium.at(this._arrival).absolutePosition.clone()   /*absolutePosition.clone().scaleInPlace(WORLD_SCALE);*/
                
                    player.getCharacter().setSpawnLocation(podium);
                    player.getCharacter().getCapsuleAggregate().body.setMotionType(PhysicsMotionType.STATIC)
                    player.getCharacter().getMesh().rotation.y = 0;
                    player.getCharacter().getCamera().cameraAcceleration = 0.1; // how fast to move
                    player.getCharacter().getCamera().maxCameraSpeed = 45; // speed limit
                    player.getCharacter().getCamera().rotationOffset = 0;
                    player.getCharacter().getCamera().radius = 8;
                    player.getCharacter().getCamera().heightOffset = 0;
                    player.getCharacter().getHitbox().position.copyFrom(podium);
                    player.setArrived(true);
                    console.log(player.getInterface().getPlayerTime());
                    const isBestTime = this.manageScore(player.getInterface().getPlayerTime());
                    this._arrival += 1;
                    console.log("Joueur arrivé en position : " + this._arrival + " position.")
                    player.getCharacter().setFinalPosition(this._arrival);
                    if(this._arrival == 1){
                        player.getInterface().showFinalScreen(true, isBestTime);
                    }
                    else{
                        player.getInterface().showFinalScreen(false, isBestTime);
                    }
                }
                else{
                    console.log("Problème avec le nombre de joueur. Il n'y a pas assez de place sur le podium.");
                }
            }
        ))
    }

    private _cactusBumperManager(player: Player){

        this._cactusMeshes.forEach(cactus => {
            const cactusObject = new Cactus(this._scene, cactus, this)
            cactusObject.createObstacle();
            player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger : ActionManager.OnIntersectionEnterTrigger,
                    parameter : cactusObject.getMesh()
                },
                () => {
                    player.getCharacter().setHitObstacle(true);
                    setTimeout(function(){
                        player.getCharacter().setHitObstacle(false);
                    }, 2000)
                    
                }
            ))
        })       
    }

    private _slowManager(player: Player){
        this._slowingMeshes.forEach(cactus => {
            
            const slowerObject = new Slower(this._scene, cactus, this)
            slowerObject.createObstacle();

            player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger : ActionManager.OnIntersectionEnterTrigger,
                    parameter : slowerObject.getMesh()
                },
                () => {
                    player.getCharacter().setIsSlowed(true)                 
                }
            ))

            player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
                {
                    trigger : ActionManager.OnIntersectionExitTrigger,
                    parameter : slowerObject.getMesh()
                },
                () => {
                    player.getCharacter().setIsSlowed(false)                  
                }
            ))
        })  

    

    }

    // private _biomeManager(player: Player, biome: Biome){
        
    //     if(biome.getEntryDoor() != null){
    //         player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
    //             {
    //                 trigger : ActionManager.OnIntersectionEnterTrigger,
    //                 parameter : biome.getEntryDoor()
    //             },
    //             () => {
    //                 console.log("Vous entrez dans un biome");
    //                 player.setClimate(biome.getClimate());
    //                 biome.increasePlayerCount();
    //                 if(!biome.getIsBiomeActive()){
    //                     biome.setIsBiomeActive(true);
    //                 }      
    //                 if(biome.getPlayerCount() <= 1){
    //                     biome.manageActiveBiome(biome.getIsBiomeActive());
    //                 } 
                        
    //             }
    //         ))
    //     }
        

    //     if(biome.getExitDoor() != null){
    //         player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
    //             {
    //                 trigger : ActionManager.OnIntersectionEnterTrigger,
    //                 parameter : biome.getExitDoor()
    //             },
    //             () => {
                    
    //                 console.log("Vous sortez d'un biome");
    //                 biome.decreasePlayerCount();
    //                 if(biome.getPlayerCount() <= 0){
    //                     biome.setIsBiomeActive(false);
    //                     biome.setPlayerCount(0);
    //                     biome.manageActiveBiome(biome.getIsBiomeActive());
    //                 }
    //             }
    //         ))
    //     }
        
    // }

    // Set all the collisions with the players
    public setCollisionWithPlayers() {
        for (const player of this._players) {
            this._setShadows(player.getCharacter().getMesh());
            this._setCubeModifierCollision(player);
            this._checkPointManager(player);
            this._deathManager(player);
            this._endManager(player);
            this._biomes.forEach(biome =>{
                biome.setEntryDoorManager(player);
                biome.setExitDoorManager(player);
                biome.setActiveBiomeManager(player);
            })
            this._setCameraManager(player);
            this._cactusBumperManager(player);
            this._slowManager(player);
        }
    }
}

export default World;