import { AnimationGroup, Mesh, PhysicsImpostor, Scene, SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import Group from "./Group";

import player1 from "../assets/models/player1.glb";

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

  constructor(scene: Scene, name: string) {
    this._scene = scene;
    
    this._name = name || "No name";
    this._health = 100;
    this._stamina = 100;
    this._staminaRegen = 1;

    this._transform =  null;
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

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  public async createCharacter(group: Group): Promise<Character> {

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
    
    // Add character to the scene
    this._scene.addMesh(characterMesh);

    return this;
  }
}

export default Character;