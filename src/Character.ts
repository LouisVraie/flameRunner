import { AnimationGroup, Mesh, MeshBuilder, FollowCamera, PhysicsAggregate, PhysicsMotionType, PhysicsShapeType, Scene, SceneLoader, TransformNode, Vector3, AbstractMesh, Viewport, Ray, RayHelper, Color3, Skeleton, Nullable, ActionManager } from "@babylonjs/core";

import player1 from "../assets/models/player.glb";
import Controller from "./Controller";
import Modifier from "./Modifier";
import { MovingState } from "./enum/MovingState";

class Character extends TransformNode{

  public scene: Scene;
  private _deltaTime: number;

  private _name: string;

  // Character stats
  private _stamina: number;
  private _staminaRegen: number;

  private _spawnLocation : Vector3;
  private _spawnRotation : number = 0;

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
  private _stunBack: AnimationGroup;
  private _death: AnimationGroup;
  private _victory: AnimationGroup;
  private _defeat: AnimationGroup;

  // animation trackers
  private _currentAnim: AnimationGroup = null;
  private _prevAnim: AnimationGroup;
  private _isGrounded: boolean = true;
  private _movingState: MovingState = MovingState.DEFAULT;

  private _hitbox: Mesh;
  private _mesh: Mesh;
  private _skeleton: Skeleton;
  private _capsuleAggregate: PhysicsAggregate;

  private _hitObstacle: boolean = false;
  private _isSlowed: boolean = false;

  private _finalPosition: number = 0;

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
  private static readonly JUMP_FORCE: number = 5;
  private static readonly GROUND_THRESHOLD: number = 0.05;
  private static readonly SLIDE_FACTOR: number = 2.5;
  private static readonly SLIDE_TIME: number = 10; //how many frames the slide lasts

  constructor(scene: Scene, name: string, spawnLocation : Vector3) {
    super("character", scene);
    this._scene = scene;
    
    this._name = name || "No name";
        
    this._moveDirection = new Vector3(0, 0, 1);

    this._jumpCount = 0;

    this._spawnLocation = spawnLocation;
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

  // Hit Obstacle
  public getHitObstacle(): boolean{
    return this._hitObstacle;
  }
  public setHitObstacle(hitObstacle: boolean): void{
    if(hitObstacle){
      this._movingState = MovingState.STUNNED;
    } else {
      this._movingState = MovingState.DEFAULT;
    }
    this._hitObstacle = hitObstacle;
  }

  // is slowed
  public getIsSlowed(): boolean{
    return this._isSlowed;
  }
  public setIsSlowed(isSlowed: boolean): void{
    this._isSlowed = isSlowed;
  }

  // Animations
  private _setAnimations(assets: any): void {
    this._idle = assets.animationGroups[2]; 
    this._idleJump = assets.animationGroups[3];
    this._run = assets.animationGroups[4];
    this._runJump = assets.animationGroups[5];
    this._stunBack = assets.animationGroups[6];
    this._death = assets.animationGroups[0];
    this._victory = assets.animationGroups[7];
    this._defeat = assets.animationGroups[1];
  }

  // Position
  public getPosition(): Vector3 {
    return this._mesh.position;
  }
  public setPosition(position: Vector3): void {
    this._mesh.position = position;
  }

  // Spawn Location
  public getSpawnLocation(): Vector3 {
    return this._spawnLocation;
  }
  public setSpawnLocation(spawnLocation: Vector3): void {
    this._spawnLocation = spawnLocation;
  }

  // Spawn Rotation
  public getSpawnRotation(): number {
    return this._spawnRotation;
  }
  public setSpawnRotation(spawnRotation: number): void {
    this._spawnRotation = spawnRotation;
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


  public getCamera(): FollowCamera{
    return this._camera;
  }
  public getLastPosition(){
    return this._lastPosition;
  }
  public setLastPosition(lastPosition: Vector3): void{
    this._lastPosition = lastPosition;
  }

  public getCapsuleAggregate(){
    return this._capsuleAggregate;
  }
  public setCapsuleAggregate(capsuleAggregate: PhysicsAggregate): void{
    this._capsuleAggregate = capsuleAggregate;
  }

  // Moving State
  public getMovingState(): MovingState{
    return this._movingState;
  }
  public setMovingState(movingState: MovingState): void{
    this._movingState = movingState;
  }

  // Final Position
  public getFinalPosition(): number{
    return this._finalPosition;
  }
  public setFinalPosition(finalPosition: number): void{
    this._movingState = MovingState.FINISHED;
    this._finalPosition = finalPosition;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  public async createCharacterAsync(): Promise<Character> {

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
    this._hitbox.visibility = 0;
    this._hitbox.position = this._spawnLocation;
    this._hitbox.isPickable = false;
    this._hitbox.actionManager = new ActionManager(this._scene);
    this._capsuleAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.CAPSULE, { mass: 1000, friction:0.5, restitution: 0.01 }, this._scene);
    this._capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);

    // Important for relocation of aggregated mesh
    this._capsuleAggregate.body.disablePreStep = false;

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
    this._mesh.rotation.y = Math.PI/2;

    // Create the follow camera
    this.createFollowCamera();

    // Set up animations
    this._setUpAnimations();

    return this;
  }

  private _setUpAnimations(): void {
    this._scene.stopAllAnimations();
    // Set up loop animations
    this._run.loopAnimation = true;
    this._idle.loopAnimation = true;
    this._runJump.loopAnimation = true;
    this._victory.loopAnimation = true;
    this._defeat.loopAnimation = true;

    // Set up animations speed
    this._idleJump.speedRatio = 2;
    this._stunBack.speedRatio = 2;

    //initialize current and previous
    this._currentAnim = this._idle;
    this._prevAnim = this._idle;
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
    const originY = -Character.PLAYER_HEIGHT / 2;

    // Define a ray from the character's position downward to check for ground collision
    // create 4 rays at bottom of capsule place in a square
    const ray1 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(radius, originY, radius)), new Vector3(0, -1, 0), Character.GROUND_THRESHOLD);
    const ray2 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(-radius, originY, radius)), new Vector3(0, -1, 0), Character.GROUND_THRESHOLD);
    const ray3 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(radius, originY, -radius)), new Vector3(0, -1, 0), Character.GROUND_THRESHOLD);
    const ray4 = new Ray(this._capsuleAggregate.transformNode.getAbsolutePosition().add(new Vector3(-radius, originY, -radius)), new Vector3(0, -1, 0), Character.GROUND_THRESHOLD);

    // list of rays
    const rays = [ray1, ray2, ray3, ray4];

    // create ray helpers with a foreach loop
    // rays.forEach((ray) => {
    //   const rayHelper = new RayHelper(ray);
    //   rayHelper.show(this._scene, Color3.Red());
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

    if(!this._hitObstacle){
      // Gérer l'état de la touche de saut
      if (controller.getJumpKeyPressed() && this._jumpCount < Character.JUMP_NUMBER && this._isGrounded) {
          this._jumpCount++;
          this._movingState = MovingState.JUMPING;
          const jumpImpulse = Vector3.Up().scale(Character.JUMP_FORCE * this._capsuleAggregate.body.getMassProperties().mass * modifier.getJumpForceDelta());
          this._capsuleAggregate.body.applyImpulse(jumpImpulse, this._capsuleAggregate.transformNode.getAbsolutePosition());
          this._isGrounded = false;
      }

      if (inputMap.get(controller.getForward())) {
          this._moveDirection = new Vector3(Math.sin(this._mesh.rotation.y), 0, Math.cos(this._mesh.rotation.y)).scale(Character.PLAYER_SPEED * modifier.getSpeedDelta());
          this._run.speedRatio = 1;
          if (inputMap.get(controller.getSprint()) && this._stamina > 0) {
              this._moveDirection.scaleInPlace(Character.PLAYER_SPRINT_MULTIPLIER);
              this._run.speedRatio = 1.25;
              this._stamina -= Character.STAMINA_REGEN * this._deltaTime;
              if (this._stamina < 0) {
                  this._stamina = 0;
              }
          }
          const currentVelocity = this._capsuleAggregate.body.getLinearVelocity();
          this._capsuleAggregate.body.setLinearVelocity(new Vector3(this._moveDirection.x, currentVelocity.y, this._moveDirection.z));
      }

      if (inputMap.get(controller.getBackward())) {
          this._moveDirection = new Vector3(Math.sin(this._mesh.rotation.y), 0, Math.cos(this._mesh.rotation.y)).negate().scale(Character.PLAYER_SPEED / 2 * modifier.getSpeedDelta());
          const currentVelocity = this._capsuleAggregate.body.getLinearVelocity();
          this._capsuleAggregate.body.setLinearVelocity(new Vector3(this._moveDirection.x, currentVelocity.y, this._moveDirection.z));
      }

      if (inputMap.get(controller.getLeft())) {
          if (inputMap.get(controller.getBackward())) {
              this._mesh.rotation.y += Character.ROTATION_SPEED * this._deltaTime;
          } else {
              this._mesh.rotation.y -= Character.ROTATION_SPEED * this._deltaTime;
          }
      }
      if (inputMap.get(controller.getRight())) {
          if (inputMap.get(controller.getBackward())) {
              this._mesh.rotation.y -= Character.ROTATION_SPEED * this._deltaTime;
          } else {
              this._mesh.rotation.y += Character.ROTATION_SPEED * this._deltaTime;
          }
      }
    }

    // Update the character's position
    this.updatePosition(this._capsuleAggregate.transformNode.getAbsolutePosition());

    // Regenerate stamina
    if (!inputMap.get(controller.getSprint()) && this._stamina < Character.MAX_STAMINA) {
        this._stamina += Character.STAMINA_REGEN * modifier.getStaminaRegenDelta() * this._deltaTime;
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
      // If the character is stunned, play the stunned animation
      case MovingState.STUNNED:
        this._currentAnim = this._stunBack;
        break;
      // If the character is falling, play the fall animation
      case MovingState.FALLING:
        this._currentAnim = this._isGrounded ? this._runJump : this._idle;
        break;
      // If the character is dead, play the death animation
      case MovingState.DEAD:
        this._currentAnim = this._death;
        break;
      // If the character has finished
      case MovingState.FINISHED:
        this._currentAnim = this._finalPosition == 1 ? this._victory : this._defeat;
        break;
      // Default case: play the run animation if moving, otherwise play the idle animation
      case MovingState.DEFAULT:
      default:
        this._currentAnim = this._isMoving ? this._run : this._idle;
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

  // Update stamina with modifier
  private _updateStaminaWithModifier(modifier: Modifier): Modifier {
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

    return modifier;
  }

  // Update stamina
  public updateStamina(modifier: Modifier): Modifier {

    // Apply stamina bonus or malus
    if (modifier.getStaminaDelta() != 0){
      modifier = this._updateStaminaWithModifier(modifier);
    }

    return modifier;
  }

  // Update the character
  public updateCharacter(controller: Controller, modifier: Modifier): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;

    // update stamina according to the modifier
    modifier = this.updateStamina(modifier);

    // Move the character
    this.moveCharacterMeshDirection(controller, modifier);
    // Animate the character
    this.animateCharacter();
  }
}

export default Character;