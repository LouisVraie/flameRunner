import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  ParticleSystem,
  PhysicsAggregate,
  PhysicsMotionType,
  PhysicsShapeType,
  PointLight,
  Sound,
} from "@babylonjs/core";
import World from "./World";
import Player from "./Player";
import { Climate } from "./enum/Climate";

class Biome {
  private _name: string;
  private _landscapeMeshes: AbstractMesh[] = [];
  private _solidMeshes: AbstractMesh[] = [];
  private _biomeDoors: AbstractMesh[] = [];

  private _physicBodies: PhysicsAggregate[] = [];
  private _isBiomeActive: boolean = false;
  private _currentPlayerCount: number = 0;
  private _world: World;

  private _entryDoor: AbstractMesh = null;
  private _exitDoor: AbstractMesh = null;

  private _climate: Climate = Climate.MILD_CLIMATE;

  constructor(
    name: string,
    //landscapeMeshes: AbstractMesh[],
    //solidMeshes: AbstractMesh[],
    biomeDoors: AbstractMesh[],
    activeBiome: boolean,
    climate: Climate,
    solidMeshes,
    meshes,
    world: World
  ) {
    this._name = name;
    this._landscapeMeshes = meshes;
    this._solidMeshes = solidMeshes;
    this._isBiomeActive = activeBiome;
    this._world = world;
    this._climate = climate;

    this._biomeDoors = biomeDoors;
    this._biomeDoors.forEach(door =>{
      const parts = door.id.split('_');
      const type = parts[2];
      if(type === "Entry"){
        this._entryDoor = door;
        console.log("Entrée du biome "+this._name+" bien enregistrée.")
      }
      else if(type === "Exit"){
        this._exitDoor = door;
        console.log("Sortie du biome "+this._name+" bien enregistrée.")
      }
      else{
        console.error("La porte "+door+" n'a pas été enregistré. Vérifier que l'id correspond");
      }
    })

    if(this._isBiomeActive){
      this._currentPlayerCount = this._world.getPlayers().length;
      this._solidMeshes.forEach(mesh =>{
        //mesh.freezeWorldMatrix();
        const meshAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
        meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
        this._physicBodies.push(meshAggregate);
      })

    }

    
    
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
  // Landscape
  public getLandscapeMeshes(): AbstractMesh[] {
    return this._landscapeMeshes;
  }
  public setLandscapeMeshes(landscapeMeshes: AbstractMesh[]): void {
    this._landscapeMeshes = landscapeMeshes;
  }
  // Solide Meshes
  public getSolidMeshes(): AbstractMesh[] {
    return this._solidMeshes;
  }
  public setSolidMeshes(solidMeshes: AbstractMesh[]): void {
    this._solidMeshes = solidMeshes;
  }
  // Biome Doors
  public getBiomeDoors(): AbstractMesh[] {
    return this._biomeDoors;
  }
  public setBiomeDoors(biomeDoors: AbstractMesh[]): void {
    this._biomeDoors = biomeDoors;
  }
  // Biome Active
  public getIsBiomeActive(): boolean {
    return this._isBiomeActive;
  }
  public setIsBiomeActive(isBiomeActie: boolean): void {
    this._isBiomeActive = isBiomeActie;
  }
  // Entry Door
  public getEntryDoor(): AbstractMesh {
    return this._entryDoor;
  }
  public setEntryDoor(entryDoor: AbstractMesh): void {
    this._entryDoor = entryDoor;
  }
  // Exit Door
  public getExitDoor(): AbstractMesh {
    return this._exitDoor;
  }
  public setExitDoor(exitDoor: AbstractMesh): void {
    this._exitDoor = exitDoor;
  }

  // Player count
  public getPlayerCount(): number{
    return this._currentPlayerCount;
  }
  public setPlayerCount(playerCount : number): void{
    this._currentPlayerCount = playerCount;
  } 

  // Climate
  public getClimate(): Climate{
    return this._climate;
  }
  public setClimate(climate: Climate): void{
    this._climate = climate;
  }

  //////////////////////////////////////////////////////////
  // Methods
  //////////////////////////////////////////////////////////

    public decreasePlayerCount() : void{
      this._currentPlayerCount--;
    }
    public increasePlayerCount(): void{
      this._currentPlayerCount++;
    }

    public manageActiveBiome(value: boolean){
      if(value){
        console.log("Biome "+this._name+" activé !")
        this._solidMeshes.forEach(mesh =>{
          //mesh.freezeWorldMatrix();
          const meshAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
          meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
          this._physicBodies.push(meshAggregate);
        })
      }
      else{
        console.log("Biome "+this._name+" désactivé !")
        this._physicBodies.forEach(physicBody =>{
          physicBody.body.dispose();
          physicBody.dispose();
        })
        this._physicBodies = [];
      }
    }

    public setEntryDoorManager(player: Player){
    
      if(this._entryDoor != null){

        // Create a trigger for the cube modifier
        player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
          {
              trigger : ActionManager.OnIntersectionEnterTrigger,
              parameter : this._entryDoor
          },
          () => {
            console.log("Vous entrez dans un biome");
            player.setClimate(this._climate);
            console.log("Le joueur "+player.getIdentifier()+" a maintenant le climat "+player.getClimate());
            this._currentPlayerCount++;
            if(!this._isBiomeActive){
              this._isBiomeActive = true;
            }      
            if(this._currentPlayerCount <= 1){
              this.manageActiveBiome(this._isBiomeActive);
            }        
          }
        ));
      }
        
     }

    public setExitDoorManager(player: Player){
         
      if(this._exitDoor != null){

        // Create a trigger for the cube modifier
        player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
          {
            trigger : ActionManager.OnIntersectionEnterTrigger,
            parameter : this._exitDoor
          },
          () => {
            console.log("Vous sortez d'un biome");
            this._currentPlayerCount--;
            if(this._currentPlayerCount <= 0){
              this._isBiomeActive = false;
              this._currentPlayerCount = 0;
              this.manageActiveBiome(this._isBiomeActive);
            }
          }
        ));
      }
      

    }
}

export default Biome;
