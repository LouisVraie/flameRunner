import { ParticleSystem, PointLight, Sound } from "@babylonjs/core";
import Obstacle from "./Obstacle";

class Biome {
  private _name: string;
  private _musics: Sound[];
  private _obstacles: Obstacle[];
  private _lights: PointLight[];
  private _particles: ParticleSystem[];

  constructor(name: string, musics: Sound[], obstacles: Obstacle[], lights: PointLight[], particles: ParticleSystem[]) {
    this._name = name;
    this._musics = musics;
    this._obstacles = obstacles;
    this._lights = lights;
    this._particles = particles;
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

  // Musics
  public getMusics(): Sound[] {
    return this._musics;
  }
  public setMusics(musics: Sound[]): void {
    this._musics = musics;
  }

  // Obstacles
  public getObstacles(): Obstacle[] {
    return this._obstacles;
  }
  public setObstacles(obstacles: Obstacle[]): void {
    this._obstacles = obstacles;
  }

  // Lights
  public getLights(): PointLight[] {
    return this._lights;
  }
  public setLights(lights: PointLight[]): void {
    this._lights = lights;
  }

  // Particles
  public getParticles(): ParticleSystem[] {
    return this._particles;
  }
  public setParticles(particles: ParticleSystem[]): void {
    this._particles = particles;
  }
}

export default Biome;