import { Scene, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import Character from "./Character";
import Controller from "./Controller";
import Modifier from "./Modifier";
import PlayerInterface from "./PlayerInterface";

import Group from "./Group";

class Player {
  private _scene: Scene;

  private _identifier: string;
  private _score: number;

  private _health: number;

  private _controller: Controller;
  private _character: Character;
  
  private _interface: PlayerInterface;

  // camera variables
  private _camRoot: TransformNode;
  private _yTilt: TransformNode;
  private _camera: UniversalCamera;

  private _modifier: Modifier;
  private _deathCounter: number;

  // Timer
  private _timer: number;
  private _startTime: number;

  //const values
  private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.45, 0, 0);
  private static readonly MAX_HEALTH: number = 3;

  constructor(
    scene: Scene,
    identifier: string,
  ) {
    this._scene = scene;
    
    this._identifier = identifier || "No identifier";
    this._score = 0;

    this._health = Player.MAX_HEALTH;
    
    this._attachCamera();
    this._attachController();

    this._interface = new PlayerInterface(identifier);
    this._interface.addViewport();

    this._modifier = new Modifier();
    this._deathCounter = 0;

    // Get the current time
    this._startTime = Date.now();
    this._timer = 0;
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

  // Health
  public getHealth(): number {
    return this._health;
  }
  public setHealth(health: number): void {
    this._health = health;
  }

  // Stamina
  public getStamina(): number {
    return this._character.getStamina();
  }

  // StaminaRegen
  public getStaminaRegen(): number {
    return this._character.getStaminaRegen();
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

  // Set Modifier from random value
  public setModifierFromRandomValue(randomValue: number): void {
    this._modifier = Modifier.getRandomModifier(randomValue);
    console.log("CubeModifier : ", randomValue, "%, ", this._modifier.getName());
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

    // update timer adding the delta time
    this._timer += this._scene.getEngine().getDeltaTime();

    // update stamina according to the modifier
    this._modifier = this._character.updateStamina(this._modifier);

    this._character.updateCharacter(this._camRoot, this._controller, this._modifier);
  }

  // Update interface
  public _updatePlayerInterface(): void {

    // Check if the current modifier duration is over and it is not default
    if (!this._modifier.isDefault() && this._modifier.getDuration() == 0) {
      this._modifier = new Modifier();
    }

    // If a modifier is not default, and the icon is not set, set the icon
    if (this._modifier.getIcon() != this._interface.getModifierIcon()) {
      this._interface.setModifierIcon(this._modifier);
    }

    // Update health


    // Update stamina
    this._interface.updateStamina(this._character.getStamina());

    // Update timer
    this._interface.updateTimer(this._timer);
  }

  // Update player
  public updatePlayer(): void {
    this._scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
      this._updateCamera();

      this._updatePlayerInterface();
    })
  }

}

export default Player;