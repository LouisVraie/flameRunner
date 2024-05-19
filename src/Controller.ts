import { KeyboardEventTypes, Scalar, Scene } from "@babylonjs/core";

import "@babylonjs/inspector";
import "@babylonjs/core/Debug/debugLayer";

class Controller {

  private _scene: Scene;
  private _isPlayer1: boolean;
  private _inputMap: Map<string, boolean>;

  private _forward: string;
  private _backward: string;
  private _left: string;
  private _right: string;

  private _sprint: string;
  private _jump: string;
  private _slide: string;

  private _modifier: string;
  private _capacity: string;

  private _jumping: boolean;
  private _sliding: boolean;

  constructor(scene: Scene, isPlayer1: boolean) {
    this._scene = scene;
    this._isPlayer1 = isPlayer1;

    // set up the default keys of the keyboard for AZERTY
    this._setDefaultKeys();

    // set up the input map event listener
    this._inputMap = new Map<string, boolean>();

    document.addEventListener("keybindings", (e) => {
      console.log("keybindings updated !");
      this._setDefaultKeys();
    });

    if (this._scene !== null) {
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
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // InputMap
  public getInputMap(): Map<string, boolean> {
    return this._inputMap;
  }

  // IsPlayer1
  public isPlayer1(): boolean {
    return this._isPlayer1;
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

  // Sprint
  public getSprint(): string {
    return this._sprint;
  }
  public setSprint(sprint: string): void {
    this._sprint = sprint;
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
  private _setDefaultKeys(): void {
    // Get the local storage to check if the player has already set his keys
    const keyBindings = JSON.parse(localStorage.getItem("keyBindings"));

    if (this._isPlayer1) {
      this._forward = keyBindings.player1["forward"] || "KeyW";
      this._backward = keyBindings.player1["backward"] || "KeyS";
      this._left = keyBindings.player1["left"] || "KeyA";
      this._right = keyBindings.player1["right"] || "KeyD";
      
      this._sprint = keyBindings.player1["sprint"] || "ShiftLeft";
      this._jump = keyBindings.player1["jump"] || "Space";
      this._slide = keyBindings.player1["slide"] || "KeyC";

      this._modifier = keyBindings.player1["modifier"] || "KeyQ";
      this._capacity = keyBindings.player1["capacity"] || "KeyE";
      
    } else {
      this._forward = keyBindings.player2["forward"] || "ArrowUp";
      this._backward = keyBindings.player2["backward"] || "ArrowDown";
      this._left = keyBindings.player2["left"] || "ArrowLeft";
      this._right = keyBindings.player2["right"] || "ArrowRight";

      this._sprint = keyBindings.player2["sprint"] || "ShiftRight";
      this._jump = keyBindings.player2["jump"] || "ControlRight";
      this._slide = keyBindings.player2["slide"] || "Numpad0";

      this._modifier = keyBindings.player2["modifier"] || "Numpad1";
      this._capacity = keyBindings.player2["capacity"] || "Enter";
    }
  }

  // Keyboard controls & Mobile controls
  //handles what is done when keys are pressed or if on mobile, when buttons are pressed
  private _updateFromKeyboard(): void {

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