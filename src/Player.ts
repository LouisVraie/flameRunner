import { UniversalCamera } from "@babylonjs/core";
import Character from "./Character";
import Controller from "./Controller";
import Modifier from "./Modifier";

class Player {
  private _identifier: string;
  private _score: number;

  private _controller: Controller;
  private _character: Character;
  private _camera: UniversalCamera;

  private _modifier: Modifier;
  private _life: number;

  constructor(
    identifier: string,
    score: number,
    controller: Controller,
    character: Character,
    camera: UniversalCamera,
    modifier: Modifier,
    life: number
  ) {
    this._identifier = identifier;
    this._score = score;
    this._controller = controller;
    this._character = character;
    this._camera = camera;
    this._modifier = modifier;
    this._life = life;
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
}

export default Player;