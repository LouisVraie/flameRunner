import { Scene, Vector3, TransformNode } from "@babylonjs/core";

abstract class Obstacle{

  protected _scene: Scene;
  private _parentNode: TransformNode;
  private _position: Vector3;
  private _size: Vector3;
  private _tangible: boolean;
  private _visible: boolean;

  constructor(scene: Scene) {
    this._scene = scene;
    this.createDefaultObstacle();
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // Parent Node
  public getParentNode(): TransformNode {
    return this._parentNode;
  }
  public setParentNode(parentNode: TransformNode): void {
    this._parentNode = parentNode;
  }

  // Position
  public getPosition(): Vector3 {
    return this._position;
  }
  public setPosition(position: Vector3): void {
    this._position = position;
  }

  // Size
  public getSize(): Vector3 {
    return this._size;
  }
  public setSize(size: Vector3): void {
    this._size = size;
  }

  // Tangible
  public getTangible(): boolean {
    return this._tangible;
  }
  public setTangible(tangible: boolean): void {
    this._tangible = tangible;
  }

  // Visible
  public getVisible(): boolean {
    return this._visible;
  }
  public setVisible(visible: boolean): void {
    this._visible = visible;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////
  private createDefaultObstacle(): void {
    this._parentNode = null;
    this._position =  Vector3.Zero();
    this._size = new Vector3(1, 1, 1);
    this._tangible = false;
    this._visible = true;
  }

  public abstract createObstacle(): void;
  public abstract disposeObstacle(): void;
}

export default Obstacle;