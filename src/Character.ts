import { AnimationGroup, FollowCamera, Matrix, Mesh, PhysicsAggregate, PhysicsImpostor, PhysicsShapeType, Quaternion, Scene, SceneLoader, TransformNode, Vector3, VertexBuffer } from "@babylonjs/core";
import Group from "./Group";

import player1 from "../assets/models/player1.glb";
import Controller from "./Controller";

enum MovingState {
  DEFAULT = 0,
  JUMPING = 1,
  FALLING = 2,
  SLIDING = 3,
  CLIMBING = 4,
  STUNNED = 5,
  DEAD = 6
}

class Character extends TransformNode{

  public scene: Scene;
  private _deltaTime: number;

  private _name: string;
  private _group: Group;

  private _health: number;
  private _stamina: number;
  private _staminaRegen: number;

  // camera variables
  private _camera: FollowCamera;

  // movement variables
  private _h: number;
  private _v: number;
  private _inputAmt: number;
  private _moveDirection: Vector3;
  private _lastPosition: Vector3;
  private _jumpCount: number;

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
  private _isGrounded: boolean = true;
  private _movingState: MovingState = MovingState.DEFAULT;

  private _mesh: Mesh;

  // Constants
  private static readonly PLAYER_SPEED: number = 0.45;
  private static readonly ROTATION_SPEED: number = 0.02;
  private static readonly JUMP_NUMBER: number = 1;
  private static readonly JUMP_FORCE: number = 0.80;
  private static readonly GRAVITY: number = -2.8;
  private static readonly SLIDE_FACTOR: number = 2.5;
  private static readonly SLIDE_TIME: number = 10; //how many frames the slide lasts

  constructor(scene: Scene, name: string) {
    super("character", scene);
    this._scene = scene;
    
    this._name = name || "No name";
    this._health = 3;
    this._stamina = 100;
    this._staminaRegen = 1;

    this._moveDirection = new Vector3(0, 0, 1);

    this._jumpCount = 0;
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
    characterMesh.rotationQuaternion = null;

    this._mesh = characterMesh;
    this._mesh.parent = this;

    // Create the follow camera
    this.createFollowCamera();



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

  // Create the follow camera
  private createFollowCamera() {
    const camera = new FollowCamera("characterFollowCamera", this._mesh.position, this._scene, this._mesh);

    camera.radius = 80; // how far from the object to follow
    camera.heightOffset = 40; // how high above the object to place the camera
    camera.rotationOffset = 180; // the viewing angle
    camera.cameraAcceleration = .05; // how fast to move
    camera.maxCameraSpeed = 5; // speed limit
    this._camera = camera;

    this._scene.activeCamera = this._camera;
  }

  // Update character's rotation
  public updateCharacterRotation(camRoot: TransformNode, controller: Controller): void {
    // // Apply rotation only if there's actual movement
    // if (controller.getHorizontalAxis() !== 0 || controller.getVerticalAxis() !== 0) {
    //   // Apply the rotation to the character
    //   //rotation based on input & the camera angle
    //   let angle = Math.atan2(controller.getHorizontalAxis(), controller.getVerticalAxis());
    //   angle += camRoot.rotation.y;

    //   // The mesh must face the direction it moves
    //   const targetQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
    //   const currentQuaternion = this._mesh.rotationQuaternion || Quaternion.Identity();
    //   this._mesh.rotationQuaternion = Quaternion.Slerp(currentQuaternion, targetQuaternion, 10 * this._deltaTime);
    // }
  }

  // Move the character
  public moveCharacterMeshDirection(controller: Controller): void {
    
    const inputMap = controller.getInputMap();
    this._lastPosition = this._mesh.position;
    
    //this._mesh.rotationQuaternion = null 
    //clamp the input value so that diagonal movement isn't twice as fast
    // const inputMag = Math.abs(this._h) + Math.abs(this._v);
    // if (inputMag < 0) {
    //     this._inputAmt = 0;
    // } else if (inputMag > 1) {
    //     this._inputAmt = 1;
    // } else {
    //     this._inputAmt = inputMag;
    // }

    // Determine movement direction based on input
    if (inputMap.get(controller.getForward())) {
      this._mesh.moveWithCollisions(this._moveDirection.scaleInPlace(Character.PLAYER_SPEED));
    }
    if (inputMap.get(controller.getBackward())) {
      this._mesh.moveWithCollisions(this._moveDirection.scaleInPlace(-Character.PLAYER_SPEED));
    }
    if (inputMap.get(controller.getLeft())) {
      this._mesh.rotation.y -= Character.ROTATION_SPEED;
      this._moveDirection = new Vector3(Math.sin(this._mesh.rotation.y), 0, Math.cos(this._mesh.rotation.y));
    }
    if (inputMap.get(controller.getRight())) {
      this._mesh.rotation.y += Character.ROTATION_SPEED;
      this._moveDirection = new Vector3(Math.sin(this._mesh.rotation.y), 0, Math.cos(this._mesh.rotation.y));
    }

    // jump
    // if (controller.getJumping() && Character.JUMP_NUMBER > this._jumpCount && this._isGrounded) {
    //   this._jumpCount++;
    //   this._isJumping = true;
    //   this._isGrounded = false;
    // }
  }

  // Animate the character
  public animateCharacter(): void {
    if(!this._lastPosition.equals(this._mesh.position)) {
      console.log("======================================")
      console.log("Last pos",this._lastPosition)
      console.log("Mesh pos", this._mesh.position)
    }
    const isMoving = !this._lastPosition.equals(this._mesh.position);

    // Determine the appropriate animation based on the character's moving state
    switch (this._movingState) {
      // If the character is jumping, play the run jump animation
      case MovingState.JUMPING:
        this._currentAnim = isMoving ? this._runJump : this._idleJump;
        break;
      // If the character is sliding, play the slide animation
      case MovingState.SLIDING:
        this._currentAnim = this._runSlide;
        break;
      // If the character is climbing, play the climbing animation
      case MovingState.CLIMBING:
        this._currentAnim = this._climbUpWall;
        // this._currentAnim = this._climbEnd;
        break;
      // If the character is stunned, play the stunned animation
      case MovingState.STUNNED:
        this._currentAnim = this._stunBack;
        break;
      // If the character is falling, play the fall animation
      case MovingState.FALLING:
        this._currentAnim = this._isGrounded ? this._fallRoll : this._fallIdle;
        break;
      // If the character is dead, play the death animation
      case MovingState.DEAD:
        this._currentAnim = this._death;
        break;
        
      // Default case: play the run animation if moving, otherwise play the idle animation
      case MovingState.DEFAULT:
      default:
        this._currentAnim = isMoving ? this._run : this._idle;
        break;
      }

    // animation update
    if(this._currentAnim != null && this._prevAnim !== this._currentAnim){
      // put a smooth transition between animations
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
    this.moveCharacterMeshDirection(controller);
    // Animate the character
    this.animateCharacter();
  }
}

export default Character;