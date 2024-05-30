import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  PhysicsAggregate,
  PhysicsMotionType,
  PhysicsShapeType,
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

  private _visitingPlayers: string[] = [];
  private _leavingPlayers: string[] = [];

  private _entryDoor: AbstractMesh = null;
  private _exitDoor: AbstractMesh = null;

  private _climate: Climate = Climate.MILD_CLIMATE;

  private loadNextBiome : AbstractMesh = null;

  constructor(
    name: string,
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
      }
      else if(type === "Exit"){
        this._exitDoor = door;
      }
      else{
        console.error("La porte "+door+" n'a pas été enregistré. Vérifier que l'id correspond");
      }
    })

    if(this._isBiomeActive){
      
      for(let i = 0; i < this._world.getPlayers().length; i++){
        this._currentPlayerCount++;
        this._visitingPlayers.push(this._world.getPlayers().at(i).getIdentifier());
      }

      this._solidMeshes.forEach(mesh =>{
        //mesh.freezeWorldMatrix();
        const meshAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
        meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
        this._physicBodies.push(meshAggregate);
      })
      this._landscapeMeshes.forEach(mesh =>{

        if(mesh.id.includes("Load")){
          mesh.isVisible = false;
          this.loadNextBiome = mesh;
        }else{
          mesh.setEnabled(true);
          mesh.freezeWorldMatrix();
          mesh.isPickable = false; 
          mesh.doNotSyncBoundingInfo = true;
        }

        
      })

    }
    else{
      this._landscapeMeshes.forEach(mesh =>{
        if(mesh.id.startsWith("Load")){
          mesh.isVisible = false;
          this.loadNextBiome = mesh;
        }
        else{
          mesh.setEnabled(false);
          mesh.doNotSyncBoundingInfo = false;
        }
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

    public setActiveBiomeManager(player: Player){
      if(this.loadNextBiome != null){

        player.getCharacter().getHitbox().actionManager.registerAction(new ExecuteCodeAction(
          {
              trigger : ActionManager.OnIntersectionEnterTrigger,
              parameter : this.loadNextBiome
          },
          () => {
            
  
            const parts = this.loadNextBiome.id.split('_');
            const biomeName = parts[1];

            console.log("Le biome suivant est le biome ", biomeName)
  
            this._world.getBiomes().forEach(biome =>{
              if(biome.getName() == biomeName){
                biome.setIsBiomeActive(true);
                biome.manageActiveBiome(biome.getIsBiomeActive());
              }
            })     
          }
        ));

      }
      else{
        console.log("Le biome suivant n'a pas été chargé.");
      }
      
    }

    public manageActiveBiome(value: boolean){
      if(value){
        this._solidMeshes.forEach(mesh =>{
          mesh.freezeWorldMatrix();
          const meshAggregate = new PhysicsAggregate(mesh, PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
          meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
          this._physicBodies.push(meshAggregate);
        })
        this._landscapeMeshes.forEach(mesh =>{
          mesh.setEnabled(true);
          mesh.freezeWorldMatrix();
          mesh.isPickable = false; 
          mesh.doNotSyncBoundingInfo = true;
        })
      }
      else{
        this._physicBodies.forEach(physicBody =>{
          physicBody.body.dispose();
          physicBody.dispose();
        })
        this._solidMeshes.forEach(mesh=>{
          mesh.freezeWorldMatrix();
          mesh.isPickable = false; 
          mesh.doNotSyncBoundingInfo = true;
        })
        this._landscapeMeshes.forEach(mesh =>{
          //mesh.setEnabled(false);
          mesh.freezeWorldMatrix();
          mesh.isPickable = false; 
          mesh.doNotSyncBoundingInfo = true;
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

            if(this._visitingPlayers.includes(player.getIdentifier())){
              console.log("Le joueur est déjà entré dans ce biome")
            }
            else{

              this._visitingPlayers.push(player.getIdentifier());
              console.log("Vous entrez dans un biome");
              player.setClimate(this._climate);
              this._currentPlayerCount++;


              let index = this._world.getBiomeNames().indexOf(this._name);
              index--;
              const previousBiome = this._world.getBiomes().at(index);

              if(previousBiome.getPlayerCount() <= 0 && previousBiome.getExitDoor() != null){
                const meshAggregate = new PhysicsAggregate(previousBiome.getExitDoor(), PhysicsShapeType.MESH, {mass:0, friction: 0.5, restitution: 0});
                meshAggregate.body.setMotionType(PhysicsMotionType.STATIC);
              }
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
              if(this._leavingPlayers.includes(player.getIdentifier())){
                console.log("Le joueur est déjà sorti de ce biome")
              }
              else{
                this._leavingPlayers.push(player.getIdentifier());
                this._currentPlayerCount--;
                if(this._currentPlayerCount <= 0){
                  this._isBiomeActive = false;
                  this._currentPlayerCount = 0;
                  this.manageActiveBiome(this._isBiomeActive);
                }
              }
            }
          ));
      }
    }
}

export default Biome;
