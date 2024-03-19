import { Vector3 } from "@babylonjs/core";
import Modifier from "./Modifier";

class Group {

  private name: string;
  private description: string;
  private icon: string;

  private capacityName: string;
  private capacity: Modifier;
  private capacityDuration: number;
  private capacityDelay: number;

  constructor(name: string, description: string, icon: string, capacityName: string, capacity: Modifier, capacityDuration: number, capacityDelay: number) {
    this.name = name || "No name";
    this.description = description || "No description";
    this.icon = icon || null;
    this.capacityName = capacityName || "No capacity";
    this.capacity = capacity || null;
    this.capacityDuration = capacityDuration || null;
    this.capacityDelay = capacityDelay || null;
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // Name
  public getName(): string {
    return this.name;
  }
  public setName(name: string): void {
    this.name = name;
  }

  // Description
  public getDescription(): string {
    return this.description;
  }
  public setDescription(description: string): void {
    this.description = description;
  }

  // Icon
  public getIcon(): string {
    return this.icon;
  }
  public setIcon(icon: string): void {
    this.icon = icon;
  }

  // CapacityName
  public getCapacityName(): string {
    return this.capacityName;
  }
  public setCapacityName(capacityName: string): void {
    this.capacityName = capacityName;
  }

  // Capacity
  public getCapacity(): Modifier {
    return this.capacity;
  }
  public setCapacity(capacity: Modifier): void {
    this.capacity = capacity;
  }

  // CapacityDuration
  public getCapacityDuration(): number {
    return this.capacityDuration;
  }
  public setCapacityDuration(capacityDuration: number): void {
    this.capacityDuration = capacityDuration;
  }

  // CapacityDelay
  public getCapacityDelay(): number {
    return this.capacityDelay;
  }
  public setCapacityDelay(capacityDelay: number): void {
    this.capacityDelay = capacityDelay;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////

  // getSprinter
  public static getSprinter(): Group {
    const name = "Sprinter";
    const description = "Run faster";
    const icon = "sprinter.png";
    const capacityName = "Fast runner";
    const capacityDuration = 10;
    const capacityDelay = 10;
  
    const capacity = new Modifier(name, description, icon, 10, new Vector3(2, 1, 2), null, null, true, null);
    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityDelay);
  
    return group;
  }
  

  // getGhost
  public static getGhost(): Group {
    const name = "Ghost";
    const description = "Run through obstacles";
    const icon = "ghost.png";
    const capacityName = name;
    const capacityDuration = 10;
    const capacityDelay = 10;

    const modifier = new Modifier(name, description, icon, 10, null, null, null, true, null);
    const group = new Group(name, description, icon, capacityName, modifier, capacityDuration, capacityDelay);

    return group;
  }

  // getEndurance
  public static getEndurance(): Group {
    const name = "Endurance";
    const description = "Improved stamina";
    const icon = "endurance.png";
    const capacityName = "Endurance boost";
    const capacityDuration = 15;
    const capacityDelay = 15;
  
    const capacity = new Modifier(name, description, icon, 15, null, 1.5, 1.5, true, null);
    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityDelay);
  
    return group;
  }
  
  // getGymnast
  public static getGymnast(): Group {
    const name = "Gymnast";
    const description = "Jump higher and longer";
    const icon = "gymnast.png";
    const capacityName = "Extension";
    const capacityDuration = 12;
    const capacityDelay = 12;
  
    const capacity = new Modifier(name, description, icon, 12, new Vector3(2, 1, 2), null, null, true, null);
    const group = new Group(name, description, icon, capacityName, capacity, capacityDuration, capacityDelay);
  
    return group;
  }
  
}

export default Group;