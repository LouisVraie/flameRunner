import { Quaternion, Scene, SceneLoader, TransformNode, UniversalCamera, Vector3 } from "@babylonjs/core";
import Character from "./Character";
import Controller from "./Controller";
import Modifier from "./Modifier";

import Group from "./Group";

class Player {
  private _scene: Scene;
  private _deltaTime: number;

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
  public async addCharacterAsync(name: string, group: Group): Promise<void> {
    const character = new Character(this._scene, name);
    this._character = await character.createCharacter(group);
  }

  // Attach controller to the player
  private _attachController(): void {
    this._controller = new Controller(this._scene, true);
  }

  // Attach camera to the player
  public attachCamera(): void {
    this._camera = new UniversalCamera("camera", new Vector3(0, 1, -10), this._scene);
    this._camera.attachControl(this._scene.getEngine().getRenderingCanvas(), true);
  }

  // Move character using the controller horizontal and vertical inputs
  private _updateFromControls(): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
    const direction = new Vector3(
      this._controller.getHorizontal(),
      0,
      this._controller.getVertical()
    );

    // Apply the rotation to the character
    //rotation based on input & the camera angle
    const angle = Math.atan2(this._controller.getHorizontalAxis(), this._controller.getVerticalAxis());
    // angle += this._camRoot.rotation.y;
    const targ = Quaternion.FromEulerAngles(0, angle, 0);
    this._character.getMesh().rotationQuaternion = Quaternion.Slerp(this._character.getMesh().rotationQuaternion, targ, 10 * this._deltaTime);

    this._character.moveCharacterMeshDirection(direction);
  }

  //--GAME UPDATES--
  private _beforeRenderUpdate(): void {
    this._updateFromControls();
    // this._updateGroundDetection();
    // this._animatePlayer();
  }

  // Update player
  public updatePlayer(): void {
    this._scene.registerBeforeRender(() => {
      this._beforeRenderUpdate();
    })
  }
}

export default Player;