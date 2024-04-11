import { Color3, TransformNode, DynamicTexture, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3, GlowLayer } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import { WORLD_SCALE } from "./World";
import Modifier from "./Modifier";

class CubeModifier extends Obstacle{

  private static readonly SIZE: number = 0.5;
  private static readonly ROTATION_SPEED: number = 1;

  private _modifier: Modifier;
  private _randomValue: number;

  private _mesh : Mesh;

  constructor(scene: Scene) {
    super(scene);
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////
  // Mesh
  public getMesh(): Mesh {
    return this._mesh;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////
  public createObstacle(): void {
    const parent = new TransformNode("cubeModifierParent", this._scene);
    parent.position = new Vector3(0, 3, 0);

    // Creating material for the cube
    const cubeMaterial = new StandardMaterial("cubeModifierMaterial", this._scene);
    cubeMaterial.diffuseColor = new Color3(255, 0, 0);
    cubeMaterial.alpha = 0.5; // 50% Transparency

    // Creating the cube with the material
    const box = MeshBuilder.CreateBox("cubeModifierBox", {size: CubeModifier.SIZE}, this._scene);
    box.scaling.scaleInPlace(WORLD_SCALE);
    box.material = cubeMaterial;
    box.parent = parent;
    this._mesh = box;

    // Adding rotation animation to the cube
    this._scene.registerBeforeRender(() => {
        const rotation = CubeModifier.ROTATION_SPEED * this._scene.getEngine().getDeltaTime() / 1000;
        box.rotation.y += rotation;
        box.rotation.x += rotation;
    });

    // Create a text plane
    const textPlane = this._createTextPlane();
    textPlane.parent = parent;

    this.setTangible(true);
    this.setParentNode(parent);
  }

  // Create a text of the cube
  private _createTextPlane(): Mesh {
    // Create a plane for the text
    const textPlane = MeshBuilder.CreatePlane("textPlane", {size: CubeModifier.SIZE}, this._scene);
    textPlane.position = new Vector3(0, 1, 0); // Adjust position as needed
    textPlane.billboardMode = Mesh.BILLBOARDMODE_ALL;
    textPlane.scaling.scaleInPlace(WORLD_SCALE);
    // textPlane.scaling.y = 0.5; // Adjust scale as needed

    // Create material for the text plane
    const material = new StandardMaterial("textPlaneMaterial", this._scene);
    textPlane.material = material;

    // Generate random value between 20 and 80
    this._randomValue = Math.floor(Math.random() * 60) + 20;

    // Create dynamic texture
    const texture = new DynamicTexture("textTexture", { width: 256, height: 256 }, this._scene);
    // add shadow to the text
    texture.drawText(`${this._randomValue}%`, null, null, "bold 100px Arial", "black", "transparent", true, true);
    texture.drawText(`${this._randomValue}%`, null, null, "bold 105px Arial", "red", "transparent", true, true);

    material.diffuseTexture = texture;
    material.diffuseTexture.hasAlpha = true;
    material.specularColor = new Color3(0, 0, 0);
    material.emissiveColor = new Color3(0.5, 0.5, 0.5);

    return textPlane;
  }

  public disposeObstacle(): void {
    this._mesh.dispose();
    this.getParentNode().dispose();
  }
}

export default CubeModifier;