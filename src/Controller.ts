import { KeyboardEventTypes, Scalar, Scene } from "@babylonjs/core";

import "@babylonjs/inspector";
import "@babylonjs/core/Debug/debugLayer";

class Controller {

  private _scene: Scene;
  private _inputMap: Map<string, boolean>;

  private _vertical: number;
  private _horizontal: number;
  private _verticalAxis: number;
  private _horizontalAxis: number;

  private _forward: string;
  private _backward: string;
  private _left: string;
  private _right: string;

  private _jump: string;
  private _slide: string;

  private _modifier: string;
  private _capacity: string;

  private _jumping: boolean;
  private _sliding: boolean;

  constructor(scene: Scene, isPlayer1: boolean) {
    this._scene = scene;

    // set up the default keys of the keyboard for AZERTY
    this._setDefaultKeys(isPlayer1);

    // set up the input map event listener
    this._inputMap = new Map<string, boolean>();

    // add the event listener and update the input map with the key pressed or released with BabylonJS methods
    this._scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          this._inputMap.set(kbInfo.event.code, true);
          // if key i is pressed, toggle the inspector
          if (kbInfo.event.code == "KeyI") {
            if (this._scene.debugLayer.isVisible()) {
              this._scene.debugLayer.hide();
            } else {
              this._scene.debugLayer.show();
            }
          }
          break;
        case KeyboardEventTypes.KEYUP:
          this._inputMap.set(kbInfo.event.code, false);
          break;
      }
    });

    //add to the scene an observable that calls updateFromKeyboard before rendering
    this._scene.onBeforeRenderObservable.add(() => {
      this._updateFromKeyboard();
    });
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // InputMap
  public getInputMap(): Map<string, boolean> {
    return this._inputMap;
  }

  // Vertical
  public getVertical(): number {
    return this._vertical;
  }

  // Horizontal
  public getHorizontal(): number {
    return this._horizontal;
  }

  // VerticalAxis
  public getVerticalAxis(): number {
    return this._verticalAxis;
  }

  // HorizontalAxis
  public getHorizontalAxis(): number {
    return this._horizontalAxis;
  }

  // Forward
  public getForward(): string {
    return this._forward;
  }
  public setForward(forward: string): void {
    this._forward = forward;
  }

  // Backward
  public getBackward(): string {
    return this._backward;
  }
  public setBackward(backward: string): void {
    this._backward = backward;
  }

  // Left
  public getLeft(): string {
    return this._left;
  }
  public setLeft(left: string): void {
    this._left = left;
  }

  // Right
  public getRight(): string {
    return this._right;
  }
  public setRight(right: string): void {
    this._right = right;
  }

  // Jump
  public getJump(): string {
    return this._jump;
  }
  public setJump(jump: string): void {
    this._jump = jump;
  }

  // Slide
  public getSlide(): string {
    return this._slide;
  }
  public setSlide(slide: string): void {
    this._slide = slide;
  }

  // Modifier
  public getModifier(): string {
    return this._modifier;
  }
  public setModifier(modifier: string): void {
    this._modifier = modifier;
  }

  // Capacity
  public getCapacity(): string {
    return this._capacity;
  }
  public setCapacity(capacity: string): void {
    this._capacity = capacity;
  }

  // Jumping
  public getJumping(): boolean {
    return this._jumping;
  }
  public setJumping(jumping: boolean): void {
    this._jumping = jumping;
  }

  // Sliding
  public getSliding(): boolean {
    return this._sliding;
  }
  public setSliding(sliding: boolean): void {
    this._sliding = sliding;
  }
  
  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  // setDefaultKeys
  private _setDefaultKeys(isPlayer1: boolean): void {
    if (isPlayer1) {
      this._forward = "KeyW";
      this._backward = "KeyS";
      this._left = "KeyA";
      this._right = "KeyD";
      
      this._jump = "Space";
      this._slide = "KeyC";

      this._modifier = "KeyQ";
      this._capacity = "KeyE";
      
    } else {
      this._forward = "ArrowUp";
      this._backward = "ArrowDown";
      this._left = "ArrowLeft";
      this._right = "ArrowRight";
      
      this._jump = "ShiftRight";
      this._slide = "ControlRight";

      this._modifier = "Numpad0";
      this._capacity = "Enter";
    }
  }

  // Keyboard controls & Mobile controls
  //handles what is done when keys are pressed or if on mobile, when buttons are pressed
  private _updateFromKeyboard(): void {
    // add "&& !this._ui.gamePaused" in ifs for pauses
    //forward - backward movement
    if (this._inputMap.get(this._forward)) {
      this._verticalAxis = 1;
      this._vertical = Scalar.Lerp(this._vertical, this._verticalAxis, 0.2);
    } else if (this._inputMap.get(this._backward)) {
      this._verticalAxis = -1;
      this._vertical = Scalar.Lerp(this._vertical, this._verticalAxis, 0.2);
    } else {
      this._vertical = 0;
      this._verticalAxis = 0;
    }

    //left - right movement
    if (this._inputMap.get(this._left)) {
      //lerp will create a scalar linearly interpolated amt between start and end scalar
      //taking current horizontal and how long you hold, will go up to -1(all the way left)
      this._horizontalAxis = -1;
      this._horizontal = Scalar.Lerp(this._horizontal, this._horizontalAxis, 0.2);
    } else if (this._inputMap.get(this._right)) {
      this._horizontalAxis = 1;
      this._horizontal = Scalar.Lerp(this._horizontal, this._horizontalAxis, 0.2);
    }
    else {
      this._horizontal = 0;
      this._horizontalAxis = 0;
    }

    // Jump
    if(!this._jumping){
      if (this._inputMap.get(this._jump)) {
        this._jumping = true;
      } else {
        this._jumping = false;
      }
    }

    // slide
    if(!this._sliding){
      if (this._inputMap.get(this._slide)) {
        this._sliding = true;
      } else {
        this._sliding = false;
      }
    }
  }

}

export default Controller;