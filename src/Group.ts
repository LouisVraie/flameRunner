import { Vector3 } from "@babylonjs/core";
import Modifier from "./Modifier";

import sprinterIcon from '../assets/icons/groups/sprinter.png';
import ghostIcon from '../assets/icons/groups/ghost.png';
import enduranceIcon from '../assets/icons/groups/endurance.png';
import enduranceHotIcon from '../assets/icons/groups/enduranceHot.png';
import enduranceColdIcon from '../assets/icons/groups/enduranceCold.png';
import gymnastIcon from '../assets/icons/groups/gymnast.png';
import { Climate } from "./enum/Climate";

class Group {

  private _name: string;
  private _description: string;
  private _icon: string;

  private _capacityName: string;
  private _capacity: Modifier;
  private _capacityDuration: number;
  private _capacityCooldown: number;
  private _isPassive: boolean;
  private _climate: Climate;

  private _subGroups: Group[];

  constructor(name: string, description: string, icon: string, capacityName: string, capacity: Modifier, capacityDuration: number, capacityCooldown: number) {
    this._name = name || "No name";
    this._description = description || "No description";
    this._icon = icon || null;
    this._capacityName = capacityName || "No capacity";
    this._capacity = capacity || null;
    this._capacityDuration = capacityDuration || null;
    this._capacityCooldown = capacityCooldown || null;
    this._isPassive = false;
    this._climate = null;
    this._subGroups = [];
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

  // CapacityName
  public getCapacityName(): string {
    return this._capacityName;
  }
  public setCapacityName(capacityName: string): void {
    this._capacityName = capacityName;
  }

  // Capacity
  public getCapacity(): Modifier {
    return this._capacity;
  }
  public setCapacity(capacity: Modifier): void {
    this._capacity = capacity;
  }

  // CapacityDuration
  public getCapacityDuration(): number {
    return this._capacityDuration;
  }
  public setCapacityDuration(capacityDuration: number): void {
    this._capacityDuration = capacityDuration;
  }

  // CapacityCooldown
  public getCapacityCooldown(): number {
    return this._capacityCooldown;
  }
  public setCapacityCooldown(capacityCooldown: number): void {
    this._capacityCooldown = capacityCooldown;
  }

  // IsPassive
  public isPassive(): boolean {
    return this._isPassive;
  }
  public setIsPassive(isPassive: boolean): void {
    this._isPassive = isPassive;
  }

  // Climate
  public getClimate(): Climate {
    return this._climate;
  }
  public setClimate(climate: Climate): void {
    this._climate = climate;
  }

  // SubGroups
  public getSubGroups(): Group[] {
    return this._subGroups;
  }
  public setSubGroups(subGroups: Group[]): void {
    this._subGroups = subGroups;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////

  // getSprinter
  public static getSprinter(): Group {
    const name = "Sprinter";
    const description = "Run faster";
    const icon = sprinterIcon;
    const capacityName = "Fast runner";
    const capacityDuration = 5;
    const capacityCooldown = 30;
  
    // Create a new modifier
    const capacity = new Modifier();
    capacity.setDefault(false);
    capacity.setName(name);
    capacity.setDescription(description);
    capacity.setIcon(icon);
    capacity.setDuration(capacityDuration);
    capacity.setSpeedDelta(2);

    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityCooldown);
  
    return group;
  }
  

  // getGhost
  public static getGhost(): Group {
    const name = "Ghost";
    const description = "Run through obstacles";
    const icon = ghostIcon;
    const capacityName = name;
    const capacityDuration = null;
    const capacityCooldown = 60;

    // Create a new modifier
    const capacity = new Modifier();
    capacity.setDefault(false);
    capacity.setName(name);
    capacity.setDescription(description);
    capacity.setIcon(icon);
    capacity.setDuration(capacityDuration);
    // TODO : Add the ghost capacity

    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityCooldown);

    return group;
  }

  // getEndurance
  public static getEndurance(): Group {
    const name = "Endurance";
    const description = "Reduce stamina consumption";
    const icon = enduranceIcon;
    const capacityName = "Endurance boost";
    const capacityDuration = null;
    const capacityCooldown = null;
  
    // Create a new modifier
    const capacity = new Modifier();
    capacity.setDefault(false);
    capacity.setName(name);
    capacity.setDescription(description);
    capacity.setIcon(icon);
    capacity.setDuration(capacityDuration);
    capacity.setStaminaConsumDelta(0.75);

    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityCooldown);
  
    const hotEndurance = new Group("Hot Endurance", `${description} in hot biomes`, enduranceHotIcon, "Hot endurance boost", capacity, capacityDuration, capacityCooldown);
    const coldEndurance = new Group("Cold Endurance", `${description} in cold biomes`, enduranceColdIcon, "Cold endurance boost", capacity, capacityDuration, capacityCooldown);
    hotEndurance.setClimate(Climate.HOT_CLIMATE);
    hotEndurance.setIsPassive(true);
    coldEndurance.setClimate(Climate.COLD_CLIMATE);
    coldEndurance.setIsPassive(true);

    group.setIsPassive(true);
    group.setSubGroups([hotEndurance, coldEndurance]);
    
    return group;
  }
  
  // getGymnast
  public static getGymnast(): Group {
    const name = "Gymnast";
    const description = "Jump higher and longer";
    const icon = gymnastIcon;
    const capacityName = "Extension";
    const capacityDuration = 5;
    const capacityCooldown = 30;
  
    // Create a new modifier
    const capacity = new Modifier();
    capacity.setDefault(false);
    capacity.setName(name);
    capacity.setDescription(description);
    capacity.setIcon(icon);
    capacity.setDuration(capacityDuration);
    capacity.setJumpDelta(2);

    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityCooldown);
  
    return group;
  }
  
}

export default Group;