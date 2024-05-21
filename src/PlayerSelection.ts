import Group from "./Group";

class PlayerSelection {

  private _identifier: string;
  private _group: Group;

  constructor(identifier: string, group: Group) {
    this._identifier = identifier;
    this._group = group;
  }

  //////////////////////////////////////////////////////////
  // Getters and Setters
  //////////////////////////////////////////////////////////

  // Identifier
  public getIdentifier(): string {
    return this._identifier;
  }
  public setIdentifier(identifier: string): void {
    this._identifier = identifier;
  }

  // Group
  public getGroup(): Group {
    return this._group;
  }

  public setGroup(group: Group): void {
    this._group = group;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////
}

export default PlayerSelection;