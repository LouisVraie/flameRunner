import "../public/css/main.css";
import "../public/css/mainMenu.css";
import "../public/css/classMenu.css";
import "../public/css/pauseMenu.css";
import { Menu } from "./enum/Menu";

class GUI {
  private _globalGUI: HTMLDivElement;
  private _mainMenuContainer: HTMLDivElement;
  private _classMenuContainer: HTMLDivElement;
  private _pauseMenuContainer: HTMLDivElement;
  private _helpMenuContainer: HTMLDivElement;
  private _settingsMenuContainer: HTMLDivElement;
  
  private _isPaused: boolean;
  private _activeMenu: Menu;

  constructor() {
    this._globalGUI = document.createElement("div");
    this._globalGUI.id = "gui";
    document.body.appendChild(this._globalGUI);

    // Create the main menu container
    this._mainMenuContainer = this._buildBaseMenuElement("main_menu_container", "menu_container");
    this._mainMenuContainer.style.display = 'flex';

    // Create the class menu container
    this._classMenuContainer = this._buildBaseMenuElement("class_menu_container", "menu_container");
    this._classMenuContainer.style.display = 'none';

    // Create the pause menu container
    this._pauseMenuContainer = this._buildBaseMenuElement("pause_menu_container", "menu_container");
    this._pauseMenuContainer.style.display = 'none';

    // Create the help menu container
    this._helpMenuContainer = this._buildBaseMenuElement("help_menu_container", "menu_container");
    this._helpMenuContainer.style.display = 'none';

    // Create the settings menu container
    this._settingsMenuContainer = this._buildBaseMenuElement("settings_menu_container", "menu_container");
    this._settingsMenuContainer.style.display = 'none';

    // Create the main menu
    this._createMainMenu(this._globalGUI);

    this._isPaused = false;

    // fps
    const fps = document.createElement("div");
    fps.id = "fps";
    document.body.appendChild(fps);

    // Toggle the current menu
    document.addEventListener("keydown", (event) => {
        if (event.key == "Escape") {
            console.log("isPaused", this._isPaused);                

            if(this._isPaused){
                this._mainMenuContainer.style.display = 'flex';  
            } 
            else{
                this._mainMenuContainer.style.display = 'none';
            }
            this._isPaused = !this._isPaused;
        }
    });
  }

  //////////////////////////////////////////////////////////
  // getters and setters
  //////////////////////////////////////////////////////////

  // GlobalGUI
  public getGlobalGUI(): HTMLDivElement {
    return this._globalGUI;
  }

  // IsPaused
  public isPaused(): boolean {
    return this._isPaused;
  }

  //////////////////////////////////////////////////////////
  // methods
  //////////////////////////////////////////////////////////
  private _buildBaseMenuElement(id: string, className: string): HTMLDivElement {
    const element = document.createElement('div');
    element.id = id;
    element.className = className;
    return element;
  }

  private _addTitle(parent: HTMLDivElement): void {
    const title = document.createElement('h1');
    title.innerHTML = "Flame Runner";
    title.id = 'title';
    parent.appendChild(title);
  }

  private _addButtonMenu(parent: HTMLDivElement, content: string, onClickAction: () => void, additionalClass?: string): void {
    const button = document.createElement('div');
    button.className = "menu_btn";
    button.onclick = onClickAction;

    if (additionalClass) {
      button.classList.add(additionalClass);
    }

    const spanContent = document.createElement('span');
    spanContent.className = "menu_btn_content";
    spanContent.innerHTML = content;

    button.appendChild(spanContent);
    parent.appendChild(button);
  }

  private _createMainMenu(globalGUI: HTMLDivElement): void {
    globalGUI.appendChild(this._mainMenuContainer);
    this._addTitle(this._mainMenuContainer);
    // Generate buttons with onclick event
    this._addButtonMenu(this._mainMenuContainer, "Solo runner", () => {
      console.log("Solo runner");
      // Hide the main menu
      this._mainMenuContainer.style.display = 'none';

      // Show the class menu
      this._classMenuContainer.style.display = 'flex';
    }, "primary_btn");
    this._addButtonMenu(this._mainMenuContainer, "Dual runners", () => {
      console.log("Dual runners");
      // Hide the main menu
      this._mainMenuContainer.style.display = 'none';

      // Show the class menu
      this._classMenuContainer.style.display = 'flex';
    }, "primary_btn");
    this._addButtonMenu(this._mainMenuContainer, "Help", () => { 
      console.log("Help");
      // Hide the main menu
      this._mainMenuContainer.style.display = 'none';

      // Show the help menu


    }, "secondary_btn");
    this._addButtonMenu(this._mainMenuContainer, "Settings", () => {
      console.log("Settings");
    }, "secondary_btn");
    this._addButtonMenu(this._mainMenuContainer, "Quit", () => {
      console.log("Quit");
      // Close the game
      window.close();
    }, "tertiary_btn");
  }
}

export default GUI;