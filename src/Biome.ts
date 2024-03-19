import { ParticleSystem, PointLight, Sound } from "@babylonjs/core";
import Obstacle from "./Obstacle";

class Biome {
  private name: string;
  private musics: Sound[];
  private obstacles: Obstacle[];
  private lights: PointLight[];
  private particles: ParticleSystem[];

  constructor(name: string, musics: Sound[], obstacles: Obstacle[], lights: PointLight[], particles: ParticleSystem[]) {
    this.name = name;
    this.musics = musics;
    this.obstacles = obstacles;
    this.lights = lights;
    this.particles = particles;
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

  // Musics
  public getMusics(): Sound[] {
    return this.musics;
  }
  public setMusics(musics: Sound[]): void {
    this.musics = musics;
  }

  // Obstacles
  public getObstacles(): Obstacle[] {
    return this.obstacles;
  }
  public setObstacles(obstacles: Obstacle[]): void {
    this.obstacles = obstacles;
  }

  // Lights
  public getLights(): PointLight[] {
    return this.lights;
  }
  public setLights(lights: PointLight[]): void {
    this.lights = lights;
  }

  // Particles
  public getParticles(): ParticleSystem[] {
    return this.particles;
  }
  public setParticles(particles: ParticleSystem[]): void {
    this.particles = particles;
  }
}

export default Biome;