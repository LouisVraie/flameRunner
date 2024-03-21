import { AnimationGroup, Mesh, PhysicsImpostor, Quaternion, Scene, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import Group from "./Group";

import player1 from "../assets/models/player1.glb";
import Controller from "./Controller";

class Character extends TransformNode{

  public scene: Scene;
  private _deltaTime: number;

  private _name: string;
  private _group: Group;

  private _health: number;
  private _stamina: number;
  private _staminaRegen: number;

  // movement variables
  private _h: number;
  private _v: number;
  private _inputAmt: number;
  private _moveDirection: Vector3;

  // Animations
  private _idle: AnimationGroup;
  private _idleJump: AnimationGroup;
  private _run: AnimationGroup;
  private _runJump: AnimationGroup;
  private _runSlide: AnimationGroup;
  private _climbUpWall: AnimationGroup;
  private _climbEnd: AnimationGroup;
  private _stunBack: AnimationGroup;
  private _fallIdle: AnimationGroup;
  private _fallRoll: AnimationGroup;
  private _death: AnimationGroup;

  // animation trackers
  private _currentAnim: AnimationGroup = null;
  private _prevAnim: AnimationGroup;
  private _isFalling: boolean = false;
  private _isJumping: boolean = false;
  private _isSliding: boolean = false;
  private _isClimbing: boolean = false;
  private _isStunned: boolean = false;
  private _isDead: boolean = false;

  private _speed: Vector3;
  private _mesh: Mesh;

  // Constants
  private static readonly PLAYER_SPEED: number = 0.45;
  private static readonly JUMP_FORCE: number = 0.80;
  private static readonly GRAVITY: number = -2.8;
  private static readonly SLIDE_FACTOR: number = 2.5;
  private static readonly SLIDE_TIME: number = 10; //how many frames the slide lasts

  constructor(scene: Scene, name: string) {
    super("character", scene);
    this._scene = scene;
    
    this._name = name || "No name";
    this._health = 100;
    this._stamina = 100;
    this._staminaRegen = 1;

    this._speed = new Vector3(1, 1, 1);
  }

  //////////////////////////////////////////////////////////
  // Getters and setters
  //////////////////////////////////////////////////////////

  // Scene
  public getScene(): Scene {
    return this._scene;
  }
  public setScene(scene: Scene): void {
    this._scene = scene;
  }

  // Name
  public getName(): string {
    return this._name;
  }
  public setName(name: string): void {
    this._name = name;
  }

  // Group
  public getGroup(): Group {
    return this._group;
  }
  public setGroup(group: Group): void {
    this._group = group;
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
    return this._stamina;
  }
  public setStamina(stamina: number): void {
    this._stamina = stamina;
  }

  // StaminaRegen
  public getStaminaRegen(): number {
    return this._staminaRegen;
  }
  public setStaminaRegen(staminaRegen: number): void {
    this._staminaRegen = staminaRegen;
  }

  // Animations
  private _setAnimations(assets: any): void {
    // Idle animations is a blend of assets.animationGroups[5] and assets.animationGroups[7]
    this._idle = assets.animationGroups[5]; 
    this._idleJump = assets.animationGroups[6];
    this._run = assets.animationGroups[8];
    this._runJump = assets.animationGroups[9];
    this._runSlide = assets.animationGroups[10];
    this._climbUpWall = assets.animationGroups[1];
    this._climbEnd = assets.animationGroups[0];
    this._stunBack = assets.animationGroups[11];
    this._fallIdle = assets.animationGroups[3];
    this._fallRoll = assets.animationGroups[4];
    this._death = assets.animationGroups[2];
  }

  // Position
  public getPosition(): Vector3 {
    return this._mesh.position;
  }
  public setPosition(position: Vector3): void {
    this._mesh.position = position;
  }

  // Speed
  public getSpeed(): Vector3 {
    return this._speed;
  }
  public setSpeed(speed: Vector3): void {
    this._speed = speed;
  }

  // Mesh
  public getMesh(): Mesh {
    return this._mesh;
  }
  public setMesh(mesh: Mesh): void {
    this._mesh = mesh;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  public async createCharacterAsync(group: Group): Promise<Character> {

    this._group = group;

    const assets = await SceneLoader.ImportMeshAsync("", "", player1, this._scene);

    const characterMesh = assets.meshes[0] as Mesh;

    // Animations
    this._setAnimations(assets);

    // Apply physics to the character
    characterMesh.physicsImpostor = new PhysicsImpostor(characterMesh, PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0.1 }, this._scene);
    characterMesh.position = new Vector3(0, 5, 0);
    characterMesh.scaling = new Vector3(20, 20, 20);

    this._mesh = characterMesh;
    this._mesh.parent = this;

    // Set up animations
    this._setUpAnimations();

    return this;
  }

  private _setUpAnimations(): void {
    this._scene.stopAllAnimations();
    this._run.loopAnimation = true;
    this._idle.loopAnimation = true;

    //initialize current and previous
    this._currentAnim = this._idle;
    this._prevAnim = this._fallIdle;
  }

  // Update character's rotation
  public updateCharacterRotation(camRoot: TransformNode, controller: Controller): void {
    // Apply rotation only if there's actual movement
    if (controller.getHorizontalAxis() !== 0 || controller.getVerticalAxis() !== 0) {
      // Apply the rotation to the character
      //rotation based on input & the camera angle
      let angle = Math.atan2(controller.getHorizontalAxis(), controller.getVerticalAxis());
      angle += camRoot.rotation.y;

      // The mesh must face the direction it moves
      const targetQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
      const currentQuaternion = this._mesh.rotationQuaternion || Quaternion.Identity();
      this._mesh.rotationQuaternion = Quaternion.Slerp(currentQuaternion, targetQuaternion, 10 * this._deltaTime);
    }
  }

  // Move the character
  public moveCharacterMeshDirection(camRoot: TransformNode, controller: Controller): void {
    
    this._h = controller.getHorizontal();
    this._v = controller.getVertical();

    //--MOVEMENTS BASED ON CAMERA (as it rotates)--
    const fwd = camRoot.forward;
    const right = camRoot.right;
    const correctedVertical = fwd.scaleInPlace(this._v);
    const correctedHorizontal = right.scaleInPlace(this._h);

    //movement based off of camera's view
    const move = correctedHorizontal.addInPlace(correctedVertical);

    //clear y so that the character doesnt fly up, normalize for next step
    this._moveDirection = new Vector3((move).normalize().x, 0, (move).normalize().z);
    
    //clamp the input value so that diagonal movement isn't twice as fast
    const inputMag = Math.abs(this._h) + Math.abs(this._v);
    if (inputMag < 0) {
        this._inputAmt = 0;
    } else if (inputMag > 1) {
        this._inputAmt = 1;
    } else {
        this._inputAmt = inputMag;
    }
    //final movement that takes into consideration the inputs
    this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Character.PLAYER_SPEED);
    this._mesh.moveWithCollisions(this._moveDirection);
  }

  // Animate the character
  public animateCharacter(): void {
    // if the character is moving, play the run animation otherwise play the idle animation
    if(this._moveDirection.length() > 0){
      this._currentAnim = this._run;
    } else {
      this._currentAnim = this._idle;
    }

    // animation update
    if(this._currentAnim != null && this._prevAnim !== this._currentAnim){
      this._prevAnim.stop();
      this._currentAnim.play(this._currentAnim.loopAnimation);
      this._prevAnim = this._currentAnim;
    }
  }

  // Update the character
  public updateCharacter(camRoot: TransformNode, controller: Controller): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
    // Update character rotation
    this.updateCharacterRotation(camRoot, controller);
    // Move the character
    this.moveCharacterMeshDirection(camRoot, controller);
    // Animate the character
    this.animateCharacter();
  }
}

export default Character;