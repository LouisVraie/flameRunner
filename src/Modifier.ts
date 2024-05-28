import { Vector3 } from '@babylonjs/core';

import defaultIcon from '../assets/icons/modifiers/defaultIcon.png';
import speedBonusIcon from '../assets/icons/modifiers/speedBonus.png';
import speedMalusIcon from '../assets/icons/modifiers/speedMalus.png';
import staminaBonusIcon from '../assets/icons/modifiers/staminaBonus.png';
import staminaMalusIcon from '../assets/icons/modifiers/staminaMalus.png';
import staminaRegenBonusIcon from '../assets/icons/modifiers/staminaRegenBonus.png';
import staminaRegenMalusIcon from '../assets/icons/modifiers/staminaRegenMalus.png';
// import visionBonusIcon from '../assets/icons/modifiers/visionBonus.png';
// import visionMalusIcon from '../assets/icons/modifiers/visionMalus.png';
// import timeBonusIcon from '../assets/icons/modifiers/timeBonus.png';
// import timeMalusIcon from '../assets/icons/modifiers/timeMalus.png';

class Modifier {

  private _default: boolean;
  private _name: string;
  private _description: string;
  private _icon: string;
  private _duration: number;
  private _isInstant: boolean;

  private _speedDelta: number;
  private _staminaDelta: number;
  private _staminaConsumDelta: number;
  private _staminaRegenDelta: number;
  private _vision: boolean;
  private _timeDelta: number;
  private _jumpDelta: number;

  constructor() {
    this._default = true;
    this._name = "Default name";
    this._description = "No description";
    this._icon = defaultIcon;
    this._duration = 0;
    this._isInstant = false;
    this._speedDelta = 1;
    this._staminaDelta = 0;
    this._staminaConsumDelta = 1;
    this._staminaRegenDelta = 1;
    this._vision = true;
    this._timeDelta = 0;
    this._jumpDelta = 1;
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // Default
  public isDefault(): boolean {
    return this._default;
  }
  public setDefault(defaultValue: boolean): void {
    this._default = defaultValue;
  }

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

  // IsInstant
  public isInstant(): boolean {
    return this._isInstant;
  }
  public setInstant(isInstant: boolean): void {
    this._isInstant = isInstant;
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

  // StaminaConsumDelta
  public getStaminaConsumDelta(): number {
    return this._staminaConsumDelta;
  }
  public setStaminaConsumDelta(staminaConsumDelta: number): void {
    this._staminaConsumDelta = staminaConsumDelta;
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
    this.setDefault(false);
    this.setName("Speed bonus");
    this.setDescription("Increase speed");
    this.setIcon(speedBonusIcon);
    this.setDuration(10);
    this.setSpeedDelta(1.25);
    return this;
  }

  // Malus Speed Modifier
  public getMalusSpeed(): Modifier {
    this.setDefault(false);
    this.setName("Speed malus");
    this.setDescription("Decrease speed");
    this.setIcon(speedMalusIcon);
    this.setDuration(10);
    this.setSpeedDelta(0.85);
    return this;
  }

  // Bonus Stamina Regen Modifier
  public getBonusStaminaRegen(): Modifier {
    this.setDefault(false);
    this.setName("Stamina Regen bonus");
    this.setDescription("Increase stamina");
    this.setIcon(staminaRegenBonusIcon);
    this.setDuration(10);
    this.setStaminaRegenDelta(2);
    return this;
  }

  // Malus Stamina Regen Modifier
  public getMalusStaminaRegen(): Modifier {
    this.setDefault(false);
    this.setName("Stamina Regen malus");
    this.setDescription("Decrease stamina");
    this.setIcon(staminaRegenMalusIcon);
    this.setDuration(10);
    this.setStaminaRegenDelta(0.5);
    return this;
  }

  // Bonus Stamina Modifier
  public getBonusStamina(): Modifier {
    this.setDefault(false);
    this.setName("Stamina bonus");
    this.setDescription("Increase stamina");
    this.setIcon(staminaBonusIcon);
    this.setInstant(true);
    this.setStaminaDelta(50);
    return this;
  }

  // Malus Stamina Modifier
  public getMalusStamina(): Modifier {
    this.setDefault(false);
    this.setName("Stamina malus");
    this.setDescription("Decrease stamina");
    this.setIcon(staminaMalusIcon);
    this.setInstant(true);
    this.setStaminaDelta(-50);
    return this;
  }

  // Bonus Vision Modifier
  public getBonusVision(): Modifier {
    this.setDefault(false);
    this.setName("Vision bonus");
    this.setDescription("Increase vision");
    this.setIcon("visionBonus.png");
    this.setDuration(10);
    this.setVision(true);
    return this;
  }

  // Malus Vision Modifier
  public getMalusVision(): Modifier {
    this.setDefault(false);
    this.setName("Vision malus");
    this.setDescription("Decrease vision");
    this.setIcon("visionMalus.png");
    this.setDuration(10);
    this.setVision(false);
    return this;
  }

  // Bonus Time Modifier
  public getBonusTime(): Modifier {
    this.setDefault(false);
    this.setName("Time bonus");
    this.setDescription("Increase time");
    this.setIcon("timeBonus.png");
    this.setDuration(10);
    this.setTimeDelta(-10);
    return this;
  }

  // Malus Time Modifier
  public getMalusTime(): Modifier {
    this.setDefault(false);
    this.setName("Time malus");
    this.setDescription("Decrease time");
    this.setIcon("timeMalus.png");
    this.setDuration(10);
    this.setTimeDelta(10);
    return this;
  }

  // Get random bonus Modifier
  public getRandomBonusModifier(): Modifier {
    const randomValue = Math.floor(Math.random() * 3);

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
    const randomValue = Math.floor(Math.random() * 3);

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

  // Combine two modifiers
  public static combineModifiers(modifier1: Modifier, modifier2: Modifier): Modifier {
    const combinedModifier = new Modifier();

    // If both modifiers are null or default, we return a default modifier
    if (modifier1 === null && modifier2 === null || modifier1?.isDefault() && modifier2?.isDefault()){
      return combinedModifier;
    }
    
    // If one of the modifier is null, we return the other one
    if (modifier1 === null) {
      return modifier2;
    }
    if (modifier2 === null) {
      return modifier1;
    }

    // Combine the two modifiers
    combinedModifier.setSpeedDelta(modifier1.getSpeedDelta() * modifier2.getSpeedDelta());
    combinedModifier.setStaminaDelta(modifier1.getStaminaDelta() + modifier2.getStaminaDelta());
    combinedModifier.setStaminaConsumDelta(modifier1.getStaminaConsumDelta() * modifier2.getStaminaConsumDelta());
    combinedModifier.setStaminaRegenDelta(modifier1.getStaminaRegenDelta() * modifier2.getStaminaRegenDelta());
    combinedModifier.setVision(modifier1.getVision() && modifier2.getVision());
    combinedModifier.setTimeDelta(modifier1.getTimeDelta() + modifier2.getTimeDelta());

    return combinedModifier;
  }
}

export default Modifier;