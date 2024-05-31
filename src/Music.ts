import { Scene, Sound } from "@babylonjs/core";

import menuMusic from '../assets/sounds/olympics-electric-111050.mp3';

class Music {

  private static readonly PLAYBACK_RATE: number = 1;
  private static readonly VOLUME: number = 0.025;

  constructor() {}

  public static playMenuMusic(scene: Scene) : void {
    // Play the music
    new Sound("MenuMusic", menuMusic, scene, null, {
      playbackRate: Music.PLAYBACK_RATE,
      volume: Music.VOLUME,
      loop: true,
      autoplay: true
    });
  }
}

export default Music;