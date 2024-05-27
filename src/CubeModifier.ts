import { Color3, TransformNode, DynamicTexture, Mesh, MeshBuilder, Scene, StandardMaterial, Vector3 } from "@babylonjs/core";
import Obstacle from "./Obstacle";
import World from "./World";

class CubeModifier extends Obstacle{

  private static readonly SIZE: number = 1;
  private static readonly ROTATION_SPEED: number = 1;

  private _randomValue: number;
  private _gradientColor: Color3;

  private _mesh : Mesh;
  private world: World;

  constructor(scene: Scene, world: World) {
    super(scene);
    this.world = world;
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////
  // Mesh
  public getMesh(): Mesh {
    return this._mesh;
  }

  // Random Value
  public getRandomValue(): number {
    return this._randomValue;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////
  public createObstacle(): void {
    const parent = new TransformNode("cubeModifierParent", this._scene);
    parent.position = new Vector3(0, 3, 3);

    // Generate random value between 20 and 80
    this._randomValue = Math.floor(Math.random() * 60) + 20;

    // Get the gradient color according to the random value
    this._gradientColor = this._computeGradientColor(this._randomValue);

    // Creating material for the cube
    const cubeMaterial = new StandardMaterial("cubeModifierMaterial", this._scene);
    cubeMaterial.diffuseColor = this._gradientColor;
    cubeMaterial.alpha = 0.5; // 50% Transparency

    // Creating the cube with the material
    const box = MeshBuilder.CreateBox("cubeModifierBox", {size: CubeModifier.SIZE}, this._scene);
    // box.scaling.scaleInPlace(WORLD_SCALE);
    box.material = cubeMaterial;
    box.enableEdgesRendering();
    box.edgesWidth = 2.0;
    box.edgesColor = this._gradientColor.toColor4(0.6);
    box.parent = parent;
    
    this._mesh = box;
    this.world._setShadows(this._mesh)

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
    textPlane.scaling.scaleInPlace(CubeModifier.SIZE);
    // textPlane.scaling.y = 0.5; // Adjust scale as needed

    // Create material for the text plane
    const material = new StandardMaterial("textPlaneMaterial", this._scene);
    textPlane.material = material;

    // Create dynamic texture
    const texture = new DynamicTexture("textTexture", { width: 256, height: 256 }, this._scene);
    // add shadow to the text
    texture.drawText(`${this._randomValue}%`, null, null, "bold 100px Arial", "black", "transparent", true, true);
    texture.drawText(`${this._randomValue}%`, null, null, "bold 105px Arial", this._gradientColor.toHexString(), "transparent", true, true);

    material.diffuseTexture = texture;
    material.diffuseTexture.hasAlpha = true;
    material.specularColor = new Color3(0, 0, 0);
    material.emissiveColor = new Color3(0.5, 0.5, 0.5);

    return textPlane;
  }

  // Compute the gradient color between red and green
  private _computeGradientColor(value: number): Color3 {
    // Red color
    const red = new Color3(1, 0, 0);
    // Green color
    const green = new Color3(0, 1, 0);

    // Calculate the color between red and green according to the value in the range [20-80]
    const color = red.add(green.subtract(red).scale((value - 20) / 60));

    return color;
  }

  public disposeObstacle(): void {
    this._mesh.dispose();
    // TODO : Remove ActionTrigger linked to the cube modifier
    this.getParentNode().dispose();
  }
}

export default CubeModifier;