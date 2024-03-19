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
    // set up the default keys of the keyboard for AZERTY
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
}

export default Controller;