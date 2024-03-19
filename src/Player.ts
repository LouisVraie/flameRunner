import { Scene, SceneLoader, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
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
  private _camera: UniversalCamera;

  private _modifier: Modifier;
  private _life: number;

  constructor(
    scene: Scene,
    identifier: string,
  ) {
    this._scene = scene;
    this._identifier = identifier || "No identifier";
    this._score = 0;

    this._attachController();

    this._modifier = null;
    this._life = 3;
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

  // Life
  public getLife(): number {
    return this._life;
  }
  public setLife(life: number): void {
    this._life = life;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  // Add character to the scene
  public addCharacter(name: string, group: Group): void {
    const character = new Character(this._scene, name);

    character.createCharacter(group).then((character: Character) => {
      this._character = character;
    });
  }

  // Attach controller to the player
  private _attachController(): void {
    this._controller = new Controller(this._scene, true);
  }

}

export default Player;