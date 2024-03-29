import { AnimationGroup, Mesh, MeshBuilder, PhysicsAggregate, PhysicsImpostor, PhysicsMotionType, PhysicsShapeType, Quaternion, Scene, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import Group from "./Group";

import player1 from "../assets/models/player1.glb";

const PLAYER_HEIGHT = 1.7;
const PLAYER_RADIUS = 0.4;
const USE_FORCES = true;

class Character {

  private _scene: Scene;

  private _name: string;
  private _group: Group;

  private _health: number;
  private _stamina: number;
  private _staminaRegen: number;

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
  private _jumped: boolean = false;

  private _hitbox: Mesh;
  private _position: Vector3;
  private _speed: Vector3;

  private _capsuleAggregate: PhysicsAggregate;

  private _mesh: Mesh;

  constructor(scene: Scene, name: string) {
    this._scene = scene;
    
    this._name = name || "No name";
    this._health = 100;
    this._stamina = 100;
    this._staminaRegen = 1;

    // Create capsule
    this._hitbox = MeshBuilder.CreateCapsule("capsule", { height: PLAYER_HEIGHT, radius: PLAYER_RADIUS }, this._scene);
    this._hitbox.visibility = 0.4;
    this._hitbox.position = new Vector3(0, 8, 0);
    


    this._position = Vector3.Zero();

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
    this._idle = assets.animationGroups[5];
    this._idleJump = assets.animationGroups[2];
    this._run = assets.animationGroups[3];
    this._runJump = assets.animationGroups[4];
    this._runSlide = assets.animationGroups[5];
    this._climbUpWall = assets.animationGroups[6];
    this._climbEnd = assets.animationGroups[7];
    this._stunBack = assets.animationGroups[8];
    this._fallIdle = assets.animationGroups[9];
    this._fallRoll = assets.animationGroups[10];
    this._death = assets.animationGroups[11];
    this._idle.start(true);
    this._currentAnim = this._idle;
  }

  // Transform
  // public getTransform(): TransformNode {
  //   return this._transform;
  // }
  // public setTransform(transform: TransformNode): void {
  //   this._transform = transform;
  // }

  // Position
  public getPosition(): Vector3 {
    return this._position;
  }
  public setPosition(position: Vector3): void {
    this._position = position;
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

  public async createCharacter(group: Group): Promise<Character> {

    this._group = group;

    const assets = await SceneLoader.ImportMeshAsync("", "", player1, this._scene);

    const characterMesh = assets.meshes[0] as Mesh;
    characterMesh.position = new Vector3(0, -PLAYER_HEIGHT / 2, 0);
    characterMesh.scaling = new Vector3(1, 1, 1);
    characterMesh.rotate(Vector3.UpReadOnly, Math.PI);
    characterMesh.name = "toto";
    characterMesh.bakeCurrentTransformIntoVertices();
    characterMesh.checkCollisions = true;

    

    // Combine character and capsule
    //characterMesh.parent = this._hitbox;

    
    

    this._capsuleAggregate = new PhysicsAggregate(this._hitbox, PhysicsShapeType.CAPSULE, { mass: 1, friction: 1, restitution: 0.1 }, this._scene);
    this._capsuleAggregate.body.setMotionType(PhysicsMotionType.DYNAMIC);


    this._capsuleAggregate.body.setMassProperties({
      inertia: new Vector3(0, 0, 0),
      centerOfMass: new Vector3(0, PLAYER_HEIGHT / 2, 0),
      mass: 1,
      inertiaOrientation: new Quaternion(0, 0, 0, 1)
    });
    // if (USE_FORCES) {
    //   this._capsuleAggregate.body.setLinearDamping(0.8);
    //   this._capsuleAggregate.body.setAngularDamping(10.0);
    // }
    // else {
    //   this._capsuleAggregate.body.setLinearDamping(0.5);
    //   this._capsuleAggregate.body.setAngularDamping(0.5);
    // }
    
    characterMesh.parent =  this._hitbox;
    
    // Animations
    this._setAnimations(assets);

    this._mesh = characterMesh;

    

    // Position the capsule below the character
    //this._hitbox.position = this._mesh.position.subtract(new Vector3(0, characterHeight / 2, 0));

    // Set the character position at the top of the capsule
    //this._mesh.position = this._hitbox.getAbsolutePosition().add(new Vector3(0, characterHeight / 2, 0));

    return this;
  }

  // Move the character
  public moveCharacterMeshDirection(direction: Vector3): void {
    let currentVelocity = this._capsuleAggregate.body.getLinearVelocity();
    this._capsuleAggregate.body.setLinearVelocity(direction);
    //this._mesh.moveWithCollisions(direction);
  }
}

export default Character;