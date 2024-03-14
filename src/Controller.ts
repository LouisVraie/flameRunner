class Controller {

  private _forward: string;
  private _backward: string;
  private _left: string;
  private _right: string;

  private _jump: string;
  private _slide: string;

  private _modifier: string;
  private _capacity: string;

  constructor(isPlayer1: boolean) {
    // Set up the default keys of the keyboard for AZERTY
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

  //////////////////////////////////////////////////////////
  // Getters and setters
  //////////////////////////////////////////////////////////

  // Forward
  getForward(): string {
    return this._forward;
  }
  setForward(forward: string): void {
    this._forward = forward;
  }

  // Backward
  getBackward(): string {
    return this._backward;
  }
  setBackward(backward: string): void {
    this._backward = backward;
  }

  // Left
  getLeft(): string {
    return this._left;
  }
  setLeft(left: string): void {
    this._left = left;
  }

  // Right
  getRight(): string {
    return this._right;
  }
  setRight(right: string): void {
    this._right = right;
  }

  // Jump
  getJump(): string {
    return this._jump;
  }
  setJump(jump: string): void {
    this._jump = jump;
  }

  // Slide
  getSlide(): string {
    return this._slide;
  }
  setSlide(slide: string): void {
    this._slide = slide;
  }

  // Modifier
  getModifier(): string {
    return this._modifier;
  }
  setModifier(modifier: string): void {
    this._modifier = modifier;
  }

  // Capacity
  getCapacity(): string {
    return this._capacity;
  }
  setCapacity(capacity: string): void {
    this._capacity = capacity;
  }
}

export default Controller;