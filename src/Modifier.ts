import { Vector3 } from '@babylonjs/core';

class Modifier {

  private _name: string;
  private _description: string;
  private _icon: string;
  private _duration: number;

  private _speedDelta: Vector3;
  private _staminaDelta: number;
  private _staminaRegenDelta: number;
  private _vision: boolean;
  private _timeDelta: number;

  constructor(name: string, description: string, icon: string, duration: number, speedDelta: Vector3, staminaDelta: number, staminaRegenDelta: number, vision: boolean, timeDelta: number) {
    this._name = name || "No name";
    this._description = description || "No description";
    this._icon = icon || null;
    this._duration = duration || null;
    this._speedDelta = speedDelta || null;
    this._staminaDelta = staminaDelta || null;
    this._staminaRegenDelta = staminaRegenDelta || null;
    this._vision = vision || true;
    this._timeDelta = timeDelta || null;
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // Name
  public getName(): string {
    return this._name;
  }
  public setName(name: string): void {
    this._name = name;
  }

  // Description
  public getDescription(): string {
    return this._description;
  }
  public setDescription(description: string): void {
    this._description = description;
  }

  // Icon
  public getIcon(): string {
    return this._icon;
  }
  public setIcon(icon: string): void {
    this._icon = icon;
  }

  // Duration
  public getDuration(): number {
    return this._duration;
  }
  public setDuration(duration: number): void {
    this._duration = duration;
  }

  // SpeedDelta
  public getSpeedDelta(): Vector3 {
    return this._speedDelta;
  }
  public setSpeedDelta(speedDelta: Vector3): void {
    this._speedDelta = speedDelta;
  }

  // StaminaDelta
  public getStaminaDelta(): number {
    return this._staminaDelta;
  }
  public setStaminaDelta(staminaDelta: number): void {
    this._staminaDelta = staminaDelta;
  }

  // StaminaRegenDelta
  public getStaminaRegenDelta(): number {
    return this._staminaRegenDelta;
  }
  public setStaminaRegenDelta(staminaRegenDelta: number): void {
    this._staminaRegenDelta = staminaRegenDelta;
  }

  // Vision
  public getVision(): boolean {
    return this._vision;
  }
  public setVision(vision: boolean): void {
    this._vision = vision;
  }

  // TimeDelta
  public getTimeDelta(): number {
    return this._timeDelta;
  }
  public setTimeDelta(timeDelta: number): void {
    this._timeDelta = timeDelta;
  }
}

export default Modifier;