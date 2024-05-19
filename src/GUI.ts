import "../public/css/main.css";
import "../public/css/menus.css";
import { Menu } from "./enum/Menu";

class GUI {
  private _globalGUI: HTMLDivElement;
  private _mainMenuContainer: HTMLDivElement;
  private _classMenuContainer: HTMLDivElement;
  private _pauseMenuContainer: HTMLDivElement;
  private _helpMenuContainer: HTMLDivElement;
  private _settingsMenuContainer: HTMLDivElement;
  
  private _isPaused: boolean;
  private _isInGame: boolean;
  private _activeMenu: Menu;
  
  private _players: string[];

  private static _modeSelectedEvent = new CustomEvent('modeselected', {
    detail: {
      message: 'modeselected custom event!'
    },
    bubbles: true, // Optional: Specify whether the event bubbles up through the DOM or not
    cancelable: true // Optional: Specify whether the event is cancelable or not
  });

  constructor() {
    this._globalGUI = document.createElement("div");
    this._globalGUI.id = "gui";
    document.body.appendChild(this._globalGUI);

    // Create the main menu container
    this._mainMenuContainer = this._buildBaseMenuElement("main_menu_container", "menu_container");
    this._mainMenuContainer.style.display = 'flex';
    this._globalGUI.appendChild(this._mainMenuContainer);

    // Create the class menu container
    this._classMenuContainer = this._buildBaseMenuElement("class_menu_container", "menu_container");
    this._classMenuContainer.style.display = 'none';

    // Create the pause menu container
    this._pauseMenuContainer = this._buildBaseMenuElement("pause_menu_container", "menu_container");
    this._pauseMenuContainer.style.display = 'none';
    this._globalGUI.appendChild(this._pauseMenuContainer);

    // Create the help menu container
    this._helpMenuContainer = this._buildBaseMenuElement("help_menu_container", "menu_container");
    this._helpMenuContainer.style.display = 'none';
    this._globalGUI.appendChild(this._helpMenuContainer);

    // Create the settings menu container
    this._settingsMenuContainer = this._buildBaseMenuElement("settings_menu_container", "menu_container");
    this._settingsMenuContainer.style.display = 'none';
    this._globalGUI.appendChild(this._settingsMenuContainer);

    // Create the main menu
    this._createMainMenu();

    // Create the pause menu
    this._createPauseMenu();

    // Create the help menu
    this._createHelpMenu();

    // Create the settings menu
    this._createSettingsMenu();

    this._isPaused = true;
    this._isInGame = false;
    this._activeMenu = Menu.MAIN_MENU;

    // Default players
    this._players = [];

    // fps
    const fps = document.createElement("div");
    fps.id = "fps";
    document.body.appendChild(fps);

    // Toggle the current menu
    document.addEventListener("keydown", (event) => {
      if (event.key == "Escape") {
        this._isPaused = !this._isPaused;
        console.log("isPaused", this._isPaused);

        // If the game is in progress
        if (this._isInGame) {         
          // If the game is paused, set the active menu to pause menu
          if (this._isPaused) {
            this.setActiveMenu(Menu.PAUSE_MENU);
          } else {
            this.setActiveMenu(Menu.NONE_MENU);
          }
        } else {
          if (this._isPaused) {
            this.setActiveMenu(Menu.MAIN_MENU);
            return;
          }
        }
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

  // Players
  public getPlayers(): string[] {
    return this._players;
  }

  // ActiveMenu
  public setActiveMenu(newMenu: Menu): void {
    console.log("new Menu", newMenu);
    console.log("active Menu", this._activeMenu);
    switch (this._activeMenu) {
      case Menu.MAIN_MENU:
        this._mainMenuContainer.style.display = 'none';
        break;
      case Menu.CLASS_MENU:
        this._classMenuContainer.style.display = 'none';
        break;
      case Menu.PAUSE_MENU:
        this._pauseMenuContainer.style.display = 'none';
        break;
      case Menu.HELP_MENU:
        this._helpMenuContainer.style.display = 'none';
        break;
      case Menu.SETTINGS_MENU:
        this._settingsMenuContainer.style.display = 'none';
        break;
      case Menu.NONE_MENU:
      default:
        break;
    }

    switch (newMenu) {
      case Menu.MAIN_MENU:
        this._mainMenuContainer.style.display = 'flex';
        this._isPaused = true;
        this._players = [];
        break;
      case Menu.CLASS_MENU:
        this._classMenuContainer.style.display = 'flex';
        break;
      case Menu.PAUSE_MENU:
        this._pauseMenuContainer.style.display = 'flex';
        break;
      case Menu.HELP_MENU:
        this._helpMenuContainer.style.display = 'flex';
        break;
      case Menu.SETTINGS_MENU:
        this._settingsMenuContainer.style.display = 'flex';
        break;
      case Menu.NONE_MENU:
      default:
        break;
    }

    this._activeMenu = newMenu;
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
    title.className = 'title';
    parent.appendChild(title);
  }

  private _addSubtitle(parent: HTMLDivElement, content: string): void {
    const subtitle = document.createElement('h2');
    subtitle.innerHTML = content;
    subtitle.className = 'subtitle';
    parent.appendChild(subtitle);
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

  private _createMainMenu(): void {
    this._addTitle(this._mainMenuContainer);
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    // Generate buttons with onclick event
    this._addButtonMenu(buttonContainer, "Solo runner", () => {
      console.log("Solo runner");

      // Add 1 player
      this._players.push("player1");

      // Dispatch the mode selected event
      document.dispatchEvent(GUI._modeSelectedEvent);

      // Set the active menu
      this.setActiveMenu(Menu.CLASS_MENU);

      this._isPaused = false;
      this._isInGame = true;
    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Dual runners", () => {
      console.log("Dual runners");

      // Add 2 players
      this._players.push("player1");
      this._players.push("player2");

      // Dispatch the mode selected event
      document.dispatchEvent(GUI._modeSelectedEvent);

      // Set the active menu
      this.setActiveMenu(Menu.CLASS_MENU);

      this._isPaused = false;
      this._isInGame = true;
    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Help", () => { 
      console.log("Help");

      // Set the active menu
      this.setActiveMenu(Menu.HELP_MENU);

    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Settings", () => {
      console.log("Settings");

      // Set the active menu
      this.setActiveMenu(Menu.SETTINGS_MENU);
    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Quit", () => {
      console.log("Quit");
      // Close the game
      window.close();
    }, "tertiary_btn");

    this._mainMenuContainer.appendChild(buttonContainer);
  }

  private _createPauseMenu(): void {
    this._addTitle(this._pauseMenuContainer);
    this._addSubtitle(this._pauseMenuContainer, "Game paused");
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    this._addButtonMenu(buttonContainer, "Resume", () => {
      console.log("Resume");
      this._isPaused = false;
      this.setActiveMenu(Menu.NONE_MENU);
    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Help", () => {
      console.log("Help");
      this.setActiveMenu(Menu.HELP_MENU);
    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Settings", () => {
      console.log("Settings");
      this.setActiveMenu(Menu.SETTINGS_MENU);
    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Back to Main menu", () => {
      console.log("Back to Main menu");
      window.location.reload();
    }, "tertiary_btn");
    this._pauseMenuContainer.appendChild(buttonContainer);
  }

  private _createHelpMenu(): void {
    this._addTitle(this._helpMenuContainer);
    this._addSubtitle(this._helpMenuContainer, "Help");
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    this._addButtonMenu(buttonContainer, "Back", () => {
      console.log("Back");
      if (this._isInGame) {
        this.setActiveMenu(Menu.PAUSE_MENU);
      } else {
        this.setActiveMenu(Menu.MAIN_MENU);
      }
    }, "primary_btn");
    this._helpMenuContainer.appendChild(buttonContainer);
  }

  private _createSettingsMenu(): void {
    this._addTitle(this._settingsMenuContainer);
    this._addSubtitle(this._settingsMenuContainer, "Settings");
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";
    
    this._addButtonMenu(buttonContainer, "Back", () => {
      console.log("Back");
      if (this._isInGame) {
        this.setActiveMenu(Menu.PAUSE_MENU);
      } else {
        this.setActiveMenu(Menu.MAIN_MENU);
      }
    }, "primary_btn");

    this._settingsMenuContainer.appendChild(buttonContainer);
  }
}

export default GUI;