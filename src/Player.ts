import { Scene, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import Character from "./Character";
import Controller from "./Controller";
import Modifier from "./Modifier";
import PlayerInterface from "./PlayerInterface";

import Group from "./Group";
import { Climate } from "./enum/Climate";

class Player {
  private _scene: Scene;

  private _identifier: string;
  private _group: Group;
  private _isEnduranceGroup: boolean;

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
  private _isModifierActive: boolean;
  private _isGroupModifierActive: boolean;
  private _deathCounter: number;

  private _climate: Climate = Climate.MILD_CLIMATE;

  // Timer
  private _timer: number;
  private _modifierTimer: number;
  private _groupModifierDurationTimer: number;
  private _groupModifierCooldownTimer: number;
  private _startTime: number;

  private _isArrived: boolean = true;

  //const values
  private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.45, 0, 0);
  private static readonly MAX_HEALTH: number = 3;

  constructor(
    scene: Scene,
    identifier: string,
    isPlayer1: boolean
  ) {
    this._scene = scene;
    
    this._identifier = identifier || "No identifier";
    this._score = 0;

    this._health = Player.MAX_HEALTH;
    
    this._attachCamera();
    this._attachController(isPlayer1);

    this._interface = new PlayerInterface(identifier);
    this._interface.addViewport();

    this._modifier = new Modifier();
    this._isModifierActive = false;
    this._isGroupModifierActive = false;
    this._deathCounter = 0;

    // Get the current time
    this._startTime = Date.now();
    this._modifierTimer = 0;
    this._groupModifierDurationTimer = 0;
    this._groupModifierCooldownTimer = 0;
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

  // Group
  public getGroup(): Group {
    return this._group;
  }
  public setGroup(group: Group): void {
    this._group = group;
  }

  
  // Interface
  public getInterface(): PlayerInterface {
    return this._interface;
  }

  // Timer
  public getTimer() : number{
    return this._timer;
  }
  public setTimer(timer: number): void {
    this._timer = timer;
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

  // Climate
  public getClimate(): Climate{
    return this._climate;
  }
  public setClimate(climate: Climate): void{
    this._climate = climate;
  }

  // Set Modifier from random value
  public setModifierFromRandomValue(randomValue: number): void {
    this._modifier = Modifier.getRandomModifier(randomValue);
    console.log("CubeModifier : ", randomValue, "%, ", this._modifier.getName());
  }

  public getArrived(): boolean{
    return this._isArrived;
  }
  public setArrived(isArrived : boolean) : void {
    this._isArrived = isArrived;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  // Add character to the scene
  public async addCharacterAsync(name: string, spawnLocation : Vector3, group: Group): Promise<void> {
    // Set the group to the player
    this._group = group;
    // regex to check if the group name contains "Endurance" 
    this._isEnduranceGroup = /Endurance/.test(this._group.getName());

    // Add the character to the scene
    const character = new Character(this._scene, name, spawnLocation);
    this._character = await character.createCharacterAsync();

    // Set the class ability to the interface
    this._interface.setClassAbility(group);
  }

  // Attach controller to the player
  private _attachController(isPlayer1: boolean): void {
    this._controller = new Controller(this._scene, isPlayer1);
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

  private _setGroupInfo(): void {
    if (this._group.getCapacityCooldown() != null) {
      this._groupModifierCooldownTimer = this._group.getCapacityCooldown() * 1000;
    }
  
    // set the group modifier timer
    if (this._group.getCapacity().isInstant()) {
      this._groupModifierDurationTimer = -1;
    } else if (!this._group.isPassive()) {
      this._groupModifierDurationTimer = this._group.getCapacityDuration() * 1000;
    }
  }

  //--GAME UPDATES--
  private _beforeRenderUpdate(): void {

    // TIMER
    // update timer adding the delta time
    this._timer += this._scene.getEngine().getDeltaTime();

    // GROUP MODIFIER
    let currentGroupModifier = null;
    
    // In case the group modifier is passive, check if the group is Endurance and the player his in a corresponding climate
    if (this._group.isPassive() && this._isEnduranceGroup && this._climate == this._group.getClimate()) {
      this._isGroupModifierActive = true;
      this._setGroupInfo();
    }

    // check if the capacity key is pressed and the group modifier is not active or the group modifier is passive
    if ((this._controller.getInputMap().get(this._controller.getCapacity()) && !this._isGroupModifierActive && this._groupModifierDurationTimer <= 0 && this._groupModifierCooldownTimer <= 0) || this._group.isPassive() && !this._isEnduranceGroup) {
      this._isGroupModifierActive = true;
      this._setGroupInfo();
    }

    if (this._isGroupModifierActive) {
      // set the current group modifier
      currentGroupModifier = this._group.getCapacity();

      // update group modifier timer removing the delta time
      if (this._groupModifierDurationTimer > 0 && this._group.getCapacity().getDuration() > 0 && !this._group.getCapacity().isInstant()) {
        this._groupModifierDurationTimer -= this._scene.getEngine().getDeltaTime();
      }
    } else {
      // update group modifier cooldown timer removing the delta time
      if (this._groupModifierCooldownTimer > 0 && !this._group.isPassive()) {
        this._groupModifierCooldownTimer -= this._scene.getEngine().getDeltaTime();
      }
    }

    // MODIFIER
    let currentModifier = new Modifier();
    // if the modifier is not active and the modifier key is pressed, set the modifier as active
    if (!this._isModifierActive && !this._modifier.isDefault() && this._controller.getInputMap().get(this._controller.getModifier())) {
      this._isModifierActive = true;
    }

    if(this._isModifierActive){
      // set the current modifier
      currentModifier = this._modifier;

      // update modifier timer removing the delta time
      if (this._modifierTimer > 0 && this._modifier.getDuration() > 0 && !this._modifier.isInstant()){
        this._modifierTimer -= this._scene.getEngine().getDeltaTime();
      }

      // update the character
      this._character.updateCharacter(this._controller, Modifier.combineModifiers(currentModifier, currentGroupModifier));
    } else {
      this._character.updateCharacter(this._controller, Modifier.combineModifiers(currentModifier, currentGroupModifier));
    }
  }

  // Update before render interface
  private _updateBeforeRenderInterface(): void {
    // GROUP MODIFIER
    // Check if the group modifier is over
    if (!this._group.isPassive() && ((this._groupModifierDurationTimer <= 0 && this._groupModifierDurationTimer != -1) 
      || (this._group.getCapacity().isInstant() && this._isGroupModifierActive))
      || this._group.isPassive() && this._climate != this._group.getClimate() && this._isEnduranceGroup) {
      this._isGroupModifierActive = false;
      this._groupModifierDurationTimer = 0;
    }

    // MODIFIER
    // If the modifier icon is different from the interface icon, update the interface icon
    if (this._modifier.getIcon() != this._interface.getModifierIcon()) {
      if (this._modifier.isInstant()) {
        this._modifierTimer = 10;
      } else {
        this._modifierTimer = this._modifier.getDuration() * 1000;
      }
      this._interface.setModifierIcon(this._modifier);
    }

    // Check if the current modifier duration is over and it is not default
    if ((!this._modifier.isDefault() && this._modifierTimer <= 0) || (this._modifier.isInstant() && this._isModifierActive)) {
      this._modifier = new Modifier();
      this._modifierTimer = 0;
      this._isModifierActive = false;
    }
  }

  // Update interface
  public _updatePlayerInterface(): void {

    // Update modifier time
    this._interface.updateModifierTime(this._modifierTimer);

    // Update health


    // Update stamina
    this._interface.updateStamina(this._character.getStamina());

    // Update timer
    if(!this._isArrived){
      this._interface.updateTimer(this._timer);
    }

    // Update class ability cooldown
    this._interface.updateClassAbilityCooldown(this._groupModifierCooldownTimer, this._group.getCapacityCooldown() * 1000);
  }

  // Update player
  public updatePlayer(): void {
    this._scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
      this._updateCamera();

      this._updateBeforeRenderInterface();
      this._updatePlayerInterface();
    })
  }

}

export default Player;