import { Engine } from "@babylonjs/core";
import { Inspector } from '@babylonjs/inspector';
import Game from "./game";

let engine: Engine;
let canvas: HTMLCanvasElement;
let game: Game;

window.onload = () => {
    canvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    engine = new Engine(canvas, true);
    window.addEventListener("resize", () => {
        engine.resize();
    });

    game = new Game(engine, canvas);
    game.init();
    game.start();
}
