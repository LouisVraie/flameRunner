import { AbstractMesh, BoundingInfo, Color3, Color4, DefaultRenderingPipeline, Engine, FreeCamera, HemisphericLight, KeyboardEventTypes, Mesh, MeshBuilder, MotionBlurPostProcess, Scalar, Scene, SceneLoader, Sound, StandardMaterial, Texture, Vector3 } from "@babylonjs/core";
import { Inspector } from "@babylonjs/inspector";

const TRACK_WIDTH = 8;
const TRACK_HEIGHT = 0.1;
const TRACK_DEPTH = 3;
const BORDER_HEIGHT = 0.5;
const NB_TRACKS = 50;
const NB_OBSTACLES = 10;
const SPAWN_POS_Z = (TRACK_DEPTH * NB_TRACKS);
const SPEED_Z = 40;
const SPEED_X = 10;

import meshUrl from "../assets/models/player.glb";
import mountainUrl from "../assets/models/mount_timpanogos_early_2017.glb";
import roadTextureUrl from "../assets/textures/dd719e47a144a8ed5f56999b21ffafeb.jpg";

import musicUrl from "../assets/musics/Cyberpunk Moonlight Sonata v2.mp3";
import hitSoundUrl from "../assets/sounds/344033__reitanna__cute-impact.wav";

import obstacle1Url from "../assets/models/ice_cube.glb";

class Game {

    engine: Engine;
    canvas: HTMLCanvasElement;
    scene: Scene;

    startTimer: number;

    player: AbstractMesh;
    playerBox: Mesh;
    obstacles: AbstractMesh[] = [];
    tracks: Mesh[] = [];
    camera: FreeCamera;

    music: Sound;
    aie: Sound;

    inputMap: object = {};
    actions: object = {};

    constructor(engine: Engine, canvas: HTMLCanvasElement) {
        this.engine = engine;
        this.canvas = canvas;
    }


    init() {
        this.engine.displayLoadingUI();
        this.createScene().then(() => {

            this.scene.onKeyboardObservable.add((kbInfo) => {
                switch (kbInfo.type) {
                    case KeyboardEventTypes.KEYDOWN:
                        this.inputMap[kbInfo.event.code] = true;
                        //console.log(`KEY DOWN: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                        break;
                    case KeyboardEventTypes.KEYUP:
                        this.inputMap[kbInfo.event.code] = false;
                        this.actions[kbInfo.event.code] = true;
                        //console.log(`KEY UP: ${kbInfo.event.code} / ${kbInfo.event.key}`);
                        break;
                }
            });
            this.engine.hideLoadingUI();

            //qdqdInspector.Show(this.scene, {});
        });

    }


    start() {
        this.startTimer = 0;
        this.engine.runRenderLoop(() => {
            const delta = this.engine.getDeltaTime() / 1000.0;
            this.updateMoves(delta);
            this.update(delta);
            this.scene.render();
        });
    }

    update(delta: number) {

        for (let i = 0; i < this.obstacles.length; i++) {
            const obstacle = this.obstacles[i];

            obstacle.position.z -= (SPEED_Z * delta);
            if (obstacle.position.z < 0) {
                const x = Scalar.RandomRange(-TRACK_WIDTH / 2, TRACK_WIDTH / 2);
                const z = Scalar.RandomRange(SPAWN_POS_Z - 15, SPAWN_POS_Z + 15);
                obstacle.position.set(x, 0.5, z);
            } else {
                if (this.playerBox.intersectsMesh(obstacle, false)) {
                    // Handle collision
                }
            }
        }
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i];
            track.position.z -= SPEED_Z / 3 * delta;
        }
        for (let i = 0; i < this.tracks.length; i++) {
            const track = this.tracks[i];
            if (track.position.z <= 0) {
                const nextTrackIdx = (i + this.tracks.length - 1) % this.tracks.length;
                track.position.z = this.tracks[nextTrackIdx].position.z + TRACK_DEPTH;
            }
        }
        this.startTimer += delta;
    }


    updateMoves(delta: number) {
        if (this.inputMap["KeyA"]) {
            this.player.position.x -= SPEED_X * delta;
            if (this.player.position.x < -3.75)
                this.player.position.x = -3.75;
        }
        else if (this.inputMap["KeyD"]) {
            this.player.position.x += SPEED_X * delta;
            if (this.player.position.x > 3.75)
                this.player.position.x = 3.75;
        }
        if (this.actions["Space"]) {
            //TODO jump
        }
    }

    async createScene() {
        this.scene = new Scene(this.engine);

        this.scene.clearColor = new Color4(0.7, 0.7, 0.95, 1);
        this.scene.ambientColor = new Color3(0.8, 0.8, 1);
        this.scene.fogMode = Scene.FOGMODE_LINEAR;
        this.scene.fogStart = SPAWN_POS_Z - 30;
        this.scene.fogEnd = SPAWN_POS_Z;
        this.scene.fogColor = new Color3(0.6, 0.6, 0.85);
        this.scene.collisionsEnabled = true;
        this.scene.gravity = new Vector3(0, -0.15, 0);

        this.camera = new FreeCamera("camera1", new Vector3(0, 3.8, 0), this.scene);
        this.camera.setTarget(new Vector3(0, 3, 3));


        this.camera.attachControl(this.canvas, true);


        const pipeline = new DefaultRenderingPipeline("default", true, this.scene, [this.camera]);

        pipeline.glowLayerEnabled = true;
        pipeline.glowLayer.intensity = 0.35;

        pipeline.glowLayer.blurKernelSize = 16;
        // pipeline.glowLayer.ldrMerge = true;


        const light = new HemisphericLight("light", new Vector3(0, 1, 0), this.scene);
        light.intensity = 0.7;



        const mb = new MotionBlurPostProcess('mb', this.scene, 1.0, this.camera);
        mb.motionStrength = 1;

        let res = await SceneLoader.ImportMeshAsync("", "", meshUrl, this.scene);
        this.player = res.meshes[0];
        res.meshes[0].name = "Player";

        res.meshes[0].scaling = new Vector3(1, 1, 1);
        res.meshes[0].position.set(0, TRACK_HEIGHT / 2, 6);
        res.meshes[0].rotation = new Vector3(0, 0, 0);
        res.animationGroups[0].stop();
        res.animationGroups[1].play(true);

        this.playerBox = MeshBuilder.CreateCapsule("playerCap", { radius: 0.4, height: 1.7 });
        this.playerBox.position.y = 1.7 / 2;
        this.playerBox.parent = this.player;
        this.playerBox.checkCollisions = true;
        this.playerBox.collisionGroup = 1;
        this.playerBox.visibility = 0;

        const mainTrack = MeshBuilder.CreateBox("trackmiddle", { width: TRACK_WIDTH, height: TRACK_HEIGHT, depth: TRACK_DEPTH });
        mainTrack.position = new Vector3(0, 0, 0);
        const matRoad = new StandardMaterial("road");
        const tex = new Texture(roadTextureUrl);


        matRoad.diffuseTexture = tex;
        mainTrack.material = matRoad;

        for (let i = 0; i < NB_TRACKS; i++) {
            const newTrack = mainTrack.clone();
            newTrack.position.z = TRACK_DEPTH * i;
            this.tracks.push(newTrack);
        }
        mainTrack.dispose();

        res = await SceneLoader.ImportMeshAsync("", "", mountainUrl, this.scene);
        res.meshes[0].name = "mountain";
        res.meshes[0].position = new Vector3(-18, -31.3, 123.2);

        res.meshes[0].rotation = new Vector3(0, Math.PI / 2, 0);
        res.meshes[0].scaling = new Vector3(2, 2, 2);

        res = await SceneLoader.ImportMeshAsync("", "", obstacle1Url, this.scene);
        const obstacleModele = res.meshes[0];

        for (let i = 0; i < NB_OBSTACLES; i++) {   
            const obstacle = obstacleModele.clone("", null);
            obstacle.normalizeToUnitCube();

            const w = Scalar.RandomRange(.5, 1.5);
            const d = Scalar.RandomRange(.5, 1.5);
            const h = Scalar.RandomRange(.5, 1.5);

            obstacle.scaling.set(w, h, d);

            const x = Scalar.RandomRange(-TRACK_WIDTH / 2, TRACK_WIDTH / 2);
            const z = Scalar.RandomRange(SPAWN_POS_Z - 15, SPAWN_POS_Z + 15);
            obstacle.position.set(x, 0, z);

            const childMeshes = obstacle.getChildMeshes();
            let min = childMeshes[0].getBoundingInfo().boundingBox.minimumWorld;
            let max = childMeshes[0].getBoundingInfo().boundingBox.maximumWorld;

            for (let i = 0; i < childMeshes.length; i++) {
                const mat = new StandardMaterial("mat", this.scene);
                mat.emissiveColor = new Color3(.3, .3, Scalar.RandomRange(.5, .8));
                mat.alpha = 0.5;
                childMeshes[i].material = mat;

                const meshMin = childMeshes[i].getBoundingInfo().boundingBox.minimumWorld;
                const meshMax = childMeshes[i].getBoundingInfo().boundingBox.maximumWorld;
                min = Vector3.Minimize(min, meshMin);
                max = Vector3.Maximize(max, meshMax);
            }
            this.obstacles.push(obstacle);

        }
        obstacleModele.dispose();

        this.music = new Sound("music", musicUrl, this.scene, undefined, { loop: true, autoplay: true, volume: 0.4 });
        this.aie = new Sound("aie", hitSoundUrl, this.scene);
    }
}

export default Game;