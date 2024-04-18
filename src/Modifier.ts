import { Vector3 } from '@babylonjs/core';

class Modifier {

  private _name: string;
  private _description: string;
  private _icon: string;
  private _duration: number;

  private _speedDelta: number;
  private _staminaDelta: number;
  private _staminaRegenDelta: number;
  private _vision: boolean;
  private _timeDelta: number;
  private _jumpDelta: number;

  constructor() {
    this._name = "No name";
    this._description = "No description";
    this._icon = null;
    this._duration = 0;
    this._speedDelta = 1;
    this._staminaDelta = 1;
    this._staminaRegenDelta = 1;
    this._vision = true;
    this._timeDelta = 0;
    this._jumpDelta = 1;
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
  public getSpeedDelta(): number {
    return this._speedDelta;
  }
  public setSpeedDelta(speedDelta: number): void {
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

  // JumpDelta
  public getJumpDelta(): number {
    return this._jumpDelta;
  }
  public setJumpDelta(jumpDelta: number): void {
    this._jumpDelta = jumpDelta;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////

  // Bonus Speed Modifier
  public getBonusSpeed(): Modifier {
    this.setName("Speed bonus");
    this.setDescription("Increase speed");
    this.setIcon("speed.png");
    this.setDuration(10);
    this.setSpeedDelta(1.25);
    return this;
  }

  // Malus Speed Modifier
  public getMalusSpeed(): Modifier {
    this.setName("Speed malus");
    this.setDescription("Decrease speed");
    this.setIcon("speed.png");
    this.setDuration(10);
    this.setSpeedDelta(0.85);
    return this;
  }

  // Bonus Stamina Regen Modifier
  public getBonusStaminaRegen(): Modifier {
    this.setName("Stamina Regen bonus");
    this.setDescription("Increase stamina");
    this.setIcon("stamina.png");
    this.setDuration(10);
    this.setStaminaRegenDelta(2);
    return this;
  }

  // Malus Stamina Regen Modifier
  public getMalusStaminaRegen(): Modifier {
    this.setName("Stamina Regen malus");
    this.setDescription("Decrease stamina");
    this.setIcon("stamina.png");
    this.setDuration(10);
    this.setStaminaRegenDelta(0.5);
    return this;
  }

  // Bonus Stamina Modifier
  public getBonusStamina(): Modifier {
    this.setName("Stamina bonus");
    this.setDescription("Increase stamina");
    this.setIcon("stamina.png");
    this.setDuration(10);
    this.setStaminaDelta(2);
    return this;
  }

  // Malus Stamina Modifier
  public getMalusStamina(): Modifier {
    this.setName("Stamina malus");
    this.setDescription("Decrease stamina");
    this.setIcon("stamina.png");
    this.setDuration(10);
    this.setStaminaDelta(0.5);
    return this;
  }

  // Bonus Vision Modifier
  public getBonusVision(): Modifier {
    this.setName("Vision bonus");
    this.setDescription("Increase vision");
    this.setIcon("vision.png");
    this.setDuration(10);
    this.setVision(true);
    return this;
  }

  // Malus Vision Modifier
  public getMalusVision(): Modifier {
    this.setName("Vision malus");
    this.setDescription("Decrease vision");
    this.setIcon("vision.png");
    this.setDuration(10);
    this.setVision(false);
    return this;
  }

  // Bonus Time Modifier
  public getBonusTime(): Modifier {
    this.setName("Time bonus");
    this.setDescription("Increase time");
    this.setIcon("time.png");
    this.setDuration(10);
    this.setTimeDelta(-10);
    return this;
  }

  // Malus Time Modifier
  public getMalusTime(): Modifier {
    this.setName("Time malus");
    this.setDescription("Decrease time");
    this.setIcon("time.png");
    this.setDuration(10);
    this.setTimeDelta(10);
    return this;
  }

  // Get random bonus Modifier
  public getRandomBonusModifier(): Modifier {
    const randomValue = Math.floor(Math.random() * 5);

    switch (randomValue) {
      case 0:
        return this.getBonusSpeed();
      case 1:
        return this.getBonusStamina();
      case 2:
        return this.getBonusStaminaRegen();
      case 3:
        return this.getBonusVision();
      case 4:
        return this.getBonusTime();
    }
  }

  // Get random malus modifier
  public getRandomMalusModifier(): Modifier {
    const randomValue = Math.floor(Math.random() * 5);

    switch (randomValue) {
      case 0:
        return this.getMalusSpeed();
      case 1:
        return this.getMalusStamina();
      case 2:
        return this.getMalusStaminaRegen();
      case 3:
        return this.getMalusVision();
      case 4:
        return this.getMalusTime();
    }
  }

  // Get random modifier
  public static getRandomModifier(value: number): Modifier {
    // Get a random number 0 or 1 using the value in parameter telling if we want a malus or a bonus
    const randomValue = Math.floor(Math.random() * 100);
    console.log("Random value : ", randomValue);
    const modifier = new Modifier();

    // If the random value is 0, we return a malus modifier
    if (randomValue > value) {
      return modifier.getRandomMalusModifier();
    }
    // Else we return a bonus modifier
    return modifier.getRandomBonusModifier();
  }
}

export default Modifier;