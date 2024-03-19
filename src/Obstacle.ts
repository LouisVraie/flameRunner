import { Mesh, Vector3 } from "@babylonjs/core";

abstract class Obstacle{

  private _mesh: Mesh;
  private _position: Vector3;
  private _size: Vector3;
  private _tangible: boolean;
  private _visible: boolean;

  constructor(mesh: Mesh, position: Vector3, size: Vector3, tangible: boolean, visible: boolean){
    this._mesh = mesh || null;
    this._position = position || Vector3.Zero();
    this._size = size || new Vector3(1, 1, 1);
    this._tangible = tangible || false;
    this._visible = visible || true;
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // Mesh
  public getMesh(): Mesh {
    return this._mesh;
  }
  public setMesh(mesh: Mesh): void {
    this._mesh = mesh;
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
}

export default Obstacle;