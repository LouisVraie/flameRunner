import { Scene, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import Character from "./Character";
import Controller from "./Controller";
import Modifier from "./Modifier";

import Group from "./Group";

class Player {
  private _scene: Scene;

  private _identifier: string;
  private _score: number;

  private _controller: Controller;
  private _character: Character;

  // camera variables
  private _camRoot: TransformNode;
  private _yTilt: TransformNode;
  private _camera: UniversalCamera;

  private _modifier: Modifier;
  private _deathCounter: number;

  //const values
  private static readonly DOWN_TILT: Vector3 = new Vector3(0.8290313946973066, 0, 0);
  private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.45, 0, 0);

  constructor(
    scene: Scene,
    identifier: string,
  ) {
    this._scene = scene;
    
    this._identifier = identifier || "No identifier";
    this._score = 0;
    
    this._attachCamera();
    this._attachController();

    this._modifier = null;
    this._deathCounter = 0;
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // Identifier
  public getIdentifier(): string {
    return this._identifier;
  }
  public setIdentifier(identifier: string): void {
    this._identifier = identifier;
  }

  // Score
  public getScore(): number {
    return this._score;
  }
  public setScore(score: number): void {
    this._score = score;
  }

  // Controller
  public getController(): Controller {
    return this._controller;
  }
  public setController(controller: Controller): void {
    this._controller = controller;
  }

  // Character
  public getCharacter(): Character {
    return this._character;
  }
  public setCharacter(character: Character): void {
    this._character = character;
  }

  // Camera
  public getCamera(): UniversalCamera {
    return this._camera;
  }
  public setCamera(camera: UniversalCamera): void {
    this._camera = camera;
  }

  // Modifier
  public getModifier(): Modifier {
    return this._modifier;
  }
  public setModifier(modifier: Modifier): void {
    this._modifier = modifier;
  }

  // DeathCounter
  public getDeathCounter(): number {
    return this._deathCounter;
  }
  public setDeathCounter(deathCounter: number): void {
    this._deathCounter = deathCounter;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  // Add character to the scene
  public async addCharacterAsync(name: string, group: Group): Promise<void> {
    const character = new Character(this._scene, name);
    this._character = await character.createCharacterAsync(group);
  }

  // Attach controller to the player
  private _attachController(): void {
    this._controller = new Controller(this._scene, true);
  }

  // Attach camera to the player
  private _attachCamera(): void {
    //root camera parent that handles positioning of the camera to follow the player
    this._camRoot = new TransformNode("root");
    this._camRoot.position = Vector3.Zero(); //initialized at (0,0,0)

    //rotations along the x-axis (up/down tilting)
    const yTilt = new TransformNode("ytilt");
    //adjustments to camera view to point down at our player
    yTilt.rotation = Player.ORIGINAL_TILT;
    this._yTilt = yTilt;
    yTilt.parent = this._camRoot;

    //our actual camera that's pointing at our root's position
    this._camera = new UniversalCamera("cam", new Vector3(0, 0, -200), this._scene);
    this._camera.lockedTarget = this._camRoot.position;
    this._camera.fov = 0.47350045992678597;
    this._camera.parent = yTilt;

    this._scene.activeCamera = this._camera;
  }

  private _updateCamera(): void {
    const centerPlayer = this._character.getMesh().position.y + 2;
    this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this._character.getMesh().position.x, centerPlayer, this._character.getMesh().position.z), 0.4);
  }

  //--GAME UPDATES--
  private _beforeRenderUpdate(): void {
    this._character.updateCharacter(this._camRoot, this._controller);
  }

  // Update player
  public updatePlayer(): void {
    this._scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
      this._updateCamera();
    })
  }
}

export default Player;