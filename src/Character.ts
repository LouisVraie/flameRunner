import { AnimationGroup, Mesh, MeshBuilder, FollowCamera, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Scene, SceneLoader, TransformNode, Vector3, AbstractMesh, Viewport, Ray, RayHelper, Color3, Skeleton, Nullable, ActionManager } from "@babylonjs/core";
import Group from "./Group";

import player1 from "../assets/models/player1.glb";
import Controller from "./Controller";
import Modifier from "./Modifier";

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

  // Character stats
  private _stamina: number;
  private _staminaRegen: number;

  // camera variables
  private _cameraRoot: AbstractMesh;
  private _camera: FollowCamera;

  // movement variables
  private _moveDirection: Vector3;
  private _lastPosition: Vector3;
  private _isMoving: boolean;
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

  private _hitbox: Mesh;
  private _mesh: Mesh;
  private _skeleton: Skeleton;
  private _capsuleAggregate: PhysicsAggregate;

  // Constants
  private static readonly PLAYER_HEIGHT: number = 1.5;
  private static readonly PLAYER_RADIUS: number = 0.25;
  private static readonly PLAYER_END_ANIMATION_THRESHOLD: number = 0.01;
  private static readonly PLAYER_SPEED: number = 4.5;
  private static readonly PLAYER_SPRINT_MULTIPLIER: number = 1.5;
  private static readonly MAX_STAMINA: number = 100;
  private static readonly STAMINA_REGEN: number = 8;
  private static readonly ROTATION_SPEED: number = 2;
  private static readonly JUMP_NUMBER: number = 1;
  private static readonly JUMP_FORCE: number = 0.5;
  private static readonly GROUND_THRESHOLD: number = 0.05;
  private static readonly SLIDE_FACTOR: number = 2.5;
  private static readonly SLIDE_TIME: number = 10; //how many frames the slide lasts

  constructor(scene: Scene, name: string) {
    super("character", scene);
    this._scene = scene;
    
    this._name = name || "No name";
        
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

  // Stamina
  public getStamina(): number {
    return this._stamina;
  }
  public setStamina(stamina: number): void {
    this._stamina = stamina;
  }

  // Stamina Regen
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

  // Hitbox
  public getHitbox(): Mesh {
    return this._hitbox;
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
    this._stamina = Character.MAX_STAMINA;
    this._staminaRegen = Character.STAMINA_REGEN;

    const assets = await SceneLoader.ImportMeshAsync("", "", player1, this._scene);

    const characterMesh = assets.meshes[0] as Mesh;
    characterMesh.position = new Vector3(0, -Character.PLAYER_HEIGHT / 2, 0);
    characterMesh.scaling = new Vector3(1, 1, 1);
    characterMesh.rotate(Vector3.UpReadOnly, Math.PI);
    characterMesh.name = this._name;
    characterMesh.bakeCurrentTransformIntoVertices();
    characterMesh.checkCollisions = true;
    characterMesh.rotationQuaternion = null;
    characterMesh.isPickable = false;
    // put all children meshes not pickable
    characterMesh.getChildMeshes().forEach((m) => {
      m.isPickable = false;
    });

    this._lastPosition = characterMesh.position.clone();

    // Get the skeleton
    const skeleton = assets.skeletons[0];
    skeleton.enableBlending(0.1);
    this._skeleton = skeleton;

    // Combine character and capsule
    //characterMesh.parent = this._hitbox;

    // Create capsule
    this._hitbox = MeshBuilder.CreateCapsule("capsule", { height: Character.PLAYER_HEIGHT, radius: Character.PLAYER_RADIUS }, this._scene);
    this._hitbox.visibility = 0.4;
    this._hitbox.position = new Vector3(0, 8, 0);
    this._hitbox.isPickable = false;
    this._hitbox.actionManager = new ActionManager(this._scene);
    this._capsuleAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.CAPSULE, { mass: 1000, friction:0.5, restitution: 0.01 }, this._scene);
    this._capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

    this._capsuleAggregate.body.setMassProperties({
      inertia: new Vector3(0, 0, 0),
      // centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0),
    });
    this._capsuleAggregate.body.setLinearDamping(1);
    this._capsuleAggregate.body.setAngularDamping(1.0);

    // Animations
    this._setAnimations(assets);
    this._mesh = characterMesh;
    this._mesh.parent = this._hitbox;

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
    // Create cameraRoot as a child of this._mesh
    this._cameraRoot = new AbstractMesh("cameraRoot");
    this._cameraRoot.parent = this._mesh;

    // Position cameraRoot above this._mesh
    this._cameraRoot.position = new Vector3(0, 1, 0);

    const camera = new FollowCamera("characterFollowCamera", this._mesh.position, this._scene);

    camera.radius = 4; // how far from the object to follow
    camera.heightOffset = 1.5; // how high above the object to place the camera
    camera.rotationOffset = 180; // the viewing angle
    camera.cameraAcceleration = .05; // how fast to move
    camera.maxCameraSpeed = 5; // speed limit
    camera.lockedTarget = this._cameraRoot; // target to follow
    this._camera = camera;

    this._scene.activeCameras.push(this._camera);
  }

  // Update the character's grounded state
  public updateGrounded(): void {

    const radius = Character.PLAYER_RADIUS / 2;
    const height = Character.PLAYER_HEIGHT / 2;

    // Define a ray from the character's position downward to check for ground collision
    // create 4 rays at bottom of capsule place in a square
    const ray1 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(radius, -height, radius)), new Vector3(0, -1, 0), height + Character.GROUND_THRESHOLD);
    const ray2 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(-radius, -height, radius)), new Vector3(0, -1, 0), height + Character.GROUND_THRESHOLD);
    const ray3 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(radius, -height, -radius)), new Vector3(0, -1, 0), height + Character.GROUND_THRESHOLD);
    const ray4 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(-radius, -height, -radius)), new Vector3(0, -1, 0), height + Character.GROUND_THRESHOLD);

    // list of rays
    const rays = [ray1, ray2, ray3, ray4];

    // create ray helpers with a foreach loop
    // rays.forEach((ray) => {
    //   const rayHelper = new RayHelper(ray);
    //   rayHelper.show(this._scene, Color3.Green());
    // });

    // Perform a raycast to check for collisions with the ground with ray list
    // If one of the rays hits the ground, the character is considered grounded
    rays.forEach((ray) => {
      const hit = this._scene.pickWithRay(ray);
      // Check if the ray hit an object and if the distance to the object is less than a threshold (considered as touching ground)
      if (!this._isGrounded && hit.hit) {
        this._jumpCount = 0;
        this._movingState = MovingState.DEFAULT;
        this._isGrounded = true; // Character is grounded
        return;
      }
    });
  }

  // Update the character's position
  public updatePosition(position: Vector3): void {
    // Check if the current position is different from the last recorded position withing a certain threshold
    // Without taking the y-axis into account
    if (Math.abs(position.x - this._lastPosition.x) > Character.PLAYER_END_ANIMATION_THRESHOLD || Math.abs(position.z - this._lastPosition.z) > Character.PLAYER_END_ANIMATION_THRESHOLD) {
      this._isMoving = true;
    } else {
      this._isMoving = false;
    }

    // Update the character's grounded state
    this.updateGrounded();

    this._lastPosition = position.clone();
  }

  // Move the character
  public moveCharacterMeshDirection(controller: Controller, modifier: Modifier): void {
    // Get the input map from the controller
    const inputMap = controller.getInputMap();

    // Determine movement direction based on input
    // Forward
    if (inputMap.get(controller.getForward())) {
      this._moveDirection = new Vector3(Math.sin(this._mesh.rotation.y), 0, Math.cos(this._mesh.rotation.y)).scaleInPlace(Character.PLAYER_SPEED * modifier.getSpeedDelta());
      // this._moveDirection.addInPlace(WORLD_GRAVITY);

      // Set running animation playing forward
      this._run.speedRatio = 1;
      
      // Sprint
      if (inputMap.get(controller.getSprint()) && this._stamina > 0) {
        this._moveDirection.scaleInPlace(Character.PLAYER_SPRINT_MULTIPLIER);
        // Set running animation playing forward
        this._run.speedRatio = 1.25;
        this._stamina -= Character.STAMINA_REGEN * this._deltaTime;

        // Clamp stamina to 0
        if (this._stamina < 0) {
          this._stamina = 0;
        }
      }

      // Set the character's velocity
      this._capsuleAggregate.body.setLinearVelocity(this._moveDirection);
    }
    // Backward
    if (inputMap.get(controller.getBackward())) {
      this._moveDirection = new Vector3(Math.sin(this._mesh.rotation.y), 0, Math.cos(this._mesh.rotation.y)).negate().scaleInPlace(Character.PLAYER_SPEED/2 * modifier.getSpeedDelta());
      // this._moveDirection.addInPlace(WORLD_GRAVITY);

      // Set running animation playing backwards
      this._run.speedRatio = -0.85;

      // Set the character's velocity
      this._capsuleAggregate.body.setLinearVelocity(this._moveDirection);
    }
    // Left
    if (inputMap.get(controller.getLeft())) {
      // Backward
      if (inputMap.get(controller.getBackward())) {
        this._mesh.rotation.y += Character.ROTATION_SPEED * this._deltaTime;
      } else {
        this._mesh.rotation.y -= Character.ROTATION_SPEED * this._deltaTime;
      }
    }
    // Right
    if (inputMap.get(controller.getRight())) {
      // Backward
      if (inputMap.get(controller.getBackward())) {
        this._mesh.rotation.y -= Character.ROTATION_SPEED * this._deltaTime;
      } else {
        this._mesh.rotation.y += Character.ROTATION_SPEED * this._deltaTime;
      }
    }

    // jump
    if (inputMap.get(controller.getJump()) && Character.JUMP_NUMBER > this._jumpCount && this._isGrounded) {
      console.log("jump");
      this._jumpCount++;
      this._movingState = MovingState.JUMPING;
      this._capsuleAggregate.body.applyImpulse(Vector3.Up().scale(Character.JUMP_FORCE * this._capsuleAggregate.body.getMassProperties().mass), this._capsuleAggregate.transformNode.getAbsolutePosition());
      this._isGrounded = false;
    }

    // Update the character's position
    this.updatePosition(this._capsuleAggregate.transformNode.getAbsolutePosition());

    // Regenerate stamina
    if (!inputMap.get(controller.getSprint()) && this._stamina < Character.MAX_STAMINA) {
      this._stamina += Character.STAMINA_REGEN * modifier.getStaminaRegenDelta() * this._deltaTime;

      // Clamp stamina to Character.MAX_STAMINA
      if (this._stamina > Character.MAX_STAMINA) {
        this._stamina = Character.MAX_STAMINA;
      }
    }
  }

  // Animate the character
  public animateCharacter(): void {
    
    // Determine the appropriate animation based on the character's moving state
    switch (this._movingState) {
      // If the character is jumping, play the run jump animation
      case MovingState.JUMPING:
        this._currentAnim = this._isMoving ? this._runJump : this._idleJump;
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
        this._currentAnim = this._isMoving ? this._run : this._idle;
        this._run.speedRatio
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

  // Update stamina
  public updateStamina(controller: Controller, modifier: Modifier): Modifier {
    const inputMap = controller.getInputMap();
    // Apply stamina bonus or malus
    if (modifier.getStaminaDelta() != 0 && inputMap.get(controller.getModifier())){
      console.log("stamina delta : ", modifier.getName());
      this._stamina += modifier.getStaminaDelta();
      modifier.setStaminaDelta(0);

      // Clamp stamina to 0
      if (this._stamina < 0) {
        this._stamina = 0;
      }
      // Clamp stamina to Character.MAX_STAMINA
      if (this._stamina > Character.MAX_STAMINA) {
        this._stamina = Character.MAX_STAMINA;
      }
    }

    return modifier;
  }

  // Update the character
  public updateCharacter(camRoot: TransformNode, controller: Controller, modifier: Modifier): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;

    // update stamina according to the modifier
    modifier = this.updateStamina(controller, modifier);

    // Move the character
    this.moveCharacterMeshDirection(controller, modifier);
    // Animate the character
    this.animateCharacter();
  }
}

export default Character;