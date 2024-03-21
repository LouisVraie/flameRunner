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

  // movement variables
  private _h: number;
  private _v: number;
  private _inputAmt: number;
  private _moveDirection: Vector3;

  // camera variables
  private _camRoot: TransformNode;
  private _yTilt: TransformNode;
  private _camera: UniversalCamera;

  private _modifier: Modifier;
  private _life: number;

  //const values
  private static readonly PLAYER_SPEED: number = 0.45;
  private static readonly JUMP_FORCE: number = 0.80;
  private static readonly GRAVITY: number = -2.8;
  private static readonly SLIDE_FACTOR: number = 2.5;
  private static readonly SLIDE_TIME: number = 10; //how many frames the slide lasts
  private static readonly DOWN_TILT: Vector3 = new Vector3(0.8290313946973066, 0, 0);
  private static readonly ORIGINAL_TILT: Vector3 = new Vector3(0.45, 0, 0);

  constructor(
    scene: Scene,
    identifier: string,
  ) {
    this._scene = scene;
    
    this._identifier = identifier || "No identifier";
    this._score = 0;
    
    this._attachCamera();
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
    this._character = await character.createCharacterAsync(group);
  }

  // Attach controller to the player
  private _attachController(): void {
    this._controller = new Controller(this._scene, true);
  }

  // Attach camera to the player
  private _attachCamera(): void {
    //root camera parent that handles positioning of the camera to follow the player
    this._camRoot = new TransformNode("root");
    this._camRoot.position = Vector3.Zero(); //initialized at (0,0,0)

    //rotations along the x-axis (up/down tilting)
    const yTilt = new TransformNode("ytilt");
    //adjustments to camera view to point down at our player
    yTilt.rotation = Player.ORIGINAL_TILT;
    this._yTilt = yTilt;
    yTilt.parent = this._camRoot;

    //our actual camera that's pointing at our root's position
    this._camera = new UniversalCamera("cam", new Vector3(0, 0, -200), this._scene);
    this._camera.lockedTarget = this._camRoot.position;
    this._camera.fov = 0.47350045992678597;
    this._camera.parent = yTilt;

    this._scene.activeCamera = this._camera;
  }

  private _updateCamera(): void {
    const centerPlayer = this._character.getMesh().position.y + 2;
    this._camRoot.position = Vector3.Lerp(this._camRoot.position, new Vector3(this._character.getMesh().position.x, centerPlayer, this._character.getMesh().position.z), 0.4);
  }

  // Move character using the controller horizontal and vertical inputs
  private _updateFromControls(): void {
    this._deltaTime = this._scene.getEngine().getDeltaTime() / 1000.0;
    this._h = this._controller.getHorizontal();
    this._v = this._controller.getVertical();

    //--MOVEMENTS BASED ON CAMERA (as it rotates)--
    const fwd = this._camRoot.forward;
    const right = this._camRoot.right;
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
    this._moveDirection = this._moveDirection.scaleInPlace(this._inputAmt * Player.PLAYER_SPEED);
    

    // Apply rotation only if there's actual movement
    if (this._controller.getHorizontalAxis() !== 0 || this._controller.getVerticalAxis() !== 0) {
      // Apply the rotation to the character
      //rotation based on input & the camera angle
      let angle = Math.atan2(this._controller.getHorizontalAxis(), this._controller.getVerticalAxis());
      angle += this._camRoot.rotation.y;

      // The mesh must face the direction it moves
      const targetQuaternion = Quaternion.FromEulerAngles(0, angle, 0);
      const currentQuaternion = this._character.getMesh().rotationQuaternion || Quaternion.Identity();
      this._character.getMesh().rotationQuaternion = Quaternion.Slerp(currentQuaternion, targetQuaternion, 10 * this._deltaTime);
    }

    // Move the character
    this._character.moveCharacterMeshDirection(this._moveDirection);
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
      this._updateCamera();
    })
  }
}

export default Player;