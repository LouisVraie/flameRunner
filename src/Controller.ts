import { KeyboardEventTypes, Scene } from "@babylonjs/core";

class Controller {

  private _scene: Scene;
  private _inputMap: Map<string, boolean>;

  private _forward: string;
  private _backward: string;
  private _left: string;
  private _right: string;

  private _jump: string;
  private _slide: string;

  private _modifier: string;
  private _capacity: string;

  constructor(isPlayer1: boolean) {
    // set up the default keys of the keyboard for AZERTY
    this._setDefaultKeys(isPlayer1);

    // set up the input map event listener
    this._inputMap = new Map<string, boolean>();

    // add the event listener and update the input map with the key pressed or released with BabylonJS methods
    this._scene.onKeyboardObservable.add((kbInfo) => {
      switch (kbInfo.type) {
        case KeyboardEventTypes.KEYDOWN:
          this._inputMap.set(kbInfo.event.code, true);
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

  
  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

  // setDefaultKeys
  private _setDefaultKeys(isPlayer1: boolean): void {
    if (isPlayer1) {
      this._forward = "z";
      this._backward = "s";
      this._left = "q";
      this._right = "d";
      
      this._jump = " ";
      this._slide = "c";

      this._modifier = "a";
      this._capacity = "e";
      
    } else {
      this._forward = "ArrowUp";
      this._backward = "ArrowDown";
      this._left = "ArrowLeft";
      this._right = "ArrowRight";
      
      this._jump = "Shift";
      this._slide = "Control";

      this._modifier = "0";
      this._capacity = "Enter";
    }
  }

  // Keyboard controls & Mobile controls
  //handles what is done when keys are pressed or if on mobile, when buttons are pressed
  private _updateFromKeyboard(): void {
  //   //forward - backward movement
  //   if ((this.inputMap["ArrowUp"] || this.mobileUp) && !this._ui.gamePaused) {
  //     this.verticalAxis = 1;
  //     this.vertical = Scalar.Lerp(this.vertical, 1, 0.2);

  //   } else if ((this.inputMap["ArrowDown"] || this.mobileDown) && !this._ui.gamePaused) {
  //     this.vertical = Scalar.Lerp(this.vertical, -1, 0.2);
  //     this.verticalAxis = -1;
  //   } else {
  //     this.vertical = 0;
  //     this.verticalAxis = 0;
  //   }

  //   //left - right movement
  //   if ((this.inputMap["ArrowLeft"] || this.mobileLeft) && !this._ui.gamePaused) {
  //       //lerp will create a scalar linearly interpolated amt between start and end scalar
  //       //taking current horizontal and how long you hold, will go up to -1(all the way left)
  //       this.horizontal = Scalar.Lerp(this.horizontal, -1, 0.2);
  //       this.horizontalAxis = -1;

  //   } else if ((this.inputMap["ArrowRight"] || this.mobileRight) && !this._ui.gamePaused) {
  //       this.horizontal = Scalar.Lerp(this.horizontal, 1, 0.2);
  //       this.horizontalAxis = 1;
  //   }
  //   else {
  //       this.horizontal = 0;
  //       this.horizontalAxis = 0;
  //   }

  //   //dash
  //   if ((this.inputMap["Shift"] || this._mobileDash) && !this._ui.gamePaused) {
  //       this.dashing = true;
  //   } else {
  //       this.dashing = false;
  //   }

  //   //Jump Checks (SPACE)
  //   if ((this.inputMap[" "] || this._mobileJump) && !this._ui.gamePaused) {
  //       this.jumpKeyDown = true;
  //   } else {
  //       this.jumpKeyDown = false;
  //   }
  }

}

export default Controller;