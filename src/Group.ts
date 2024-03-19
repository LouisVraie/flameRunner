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
}

export default Group;