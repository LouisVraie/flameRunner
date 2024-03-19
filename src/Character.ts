import { AnimationGroup, Mesh, Scene, TransformNode, Vector3 } from "@babylonjs/core";
import Group from "./Group";

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

  private _transform: TransformNode;
  private _position: Vector3;
  private _speed: Vector3;

  private _mesh: Mesh;

  constructor(assets: any, scene: Scene, name: string, group: Group, health: number, stamina: number, staminaRegen: number, transform: TransformNode, position: Vector3, speed: Vector3, mesh: Mesh) {
    this._scene = scene;
    
    this._name = name || "No name";
    this._group = group || null;
    this._health = health || 100;
    this._stamina = stamina || 100;
    this._staminaRegen = staminaRegen || 1;

    // Animations
    this._setAnimations(assets);

    this._transform = transform || null;
    this._position = position || Vector3.Zero();
    this._speed = speed || Vector3.Zero();

    this._mesh = assets.mesh;
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
    this._idle = assets.animationGroups[0];
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
  }

  // Transform
  public getTransform(): TransformNode {
    return this._transform;
  }
  public setTransform(transform: TransformNode): void {
    this._transform = transform;
  }

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


}

export default Character;