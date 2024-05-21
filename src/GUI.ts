import "../public/css/main.css";
import "../public/css/menus.css";
import Controller from "./Controller";
import Group from "./Group";
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

  private static _classSelectedEvent = new CustomEvent('classselected', {
    detail: {
      message: 'classselected custom event!'
    },
    bubbles: true, // Optional: Specify whether the event bubbles up through the DOM or not
    cancelable: true // Optional: Specify whether the event is cancelable or not
  });

  private static _keyBindingsEvent = new CustomEvent('keybindings', {
    detail: {
      message: 'keybindings custom event!'
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
    this._globalGUI.appendChild(this._classMenuContainer);

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

    // Create the class menu
    this._createClassMenu();

    // Create the pause menu
    this._createPauseMenu();

    // Create the help menu
    this._createHelpMenu();

    // Create local storage for key bindings
    this._createSettingsKeyBindings();

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
      if (event.key == "Escape" && this._activeMenu != Menu.MAIN_MENU) {

        // If the game is in progress
        if (this._isInGame) {         
          this._isPaused = !this._isPaused;
          console.log("isPaused", this._isPaused);

          // If the game is paused, set the active menu to pause menu
          if (this._isPaused) {
            this.setActiveMenu(Menu.PAUSE_MENU);
          } else {
            this.setActiveMenu(Menu.NONE_MENU);
          }
        } else {
          this.setActiveMenu(Menu.MAIN_MENU);
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

    const gameCanvas = document.getElementById("gameCanvas");

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
        if (gameCanvas) {
          gameCanvas.focus();
        }
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
    title.className = 'menu_title';
    parent.appendChild(title);
  }

  private _addSubtitle(parent: HTMLDivElement, content: string): void {
    const subtitle = document.createElement('h2');
    subtitle.innerHTML = content;
    subtitle.className = 'menu_subtitle';
    parent.appendChild(subtitle);
  }

  private _addButtonMenu(parent: HTMLDivElement, content: string, onClickAction: () => void, additionalClass?: string): void {
    const button = document.createElement('div');
    button.className = "menu_btn";
    button.onclick = onClickAction;

    if (additionalClass) {
      button.classList.add(additionalClass);
    }

    const buttonContent = document.createElement('div');
    buttonContent.className = "menu_btn_content";
    buttonContent.innerHTML = content;

    button.appendChild(buttonContent);
    parent.appendChild(button);
  }

  private _addClassButton(parent: HTMLDivElement, group: Group, onClickAction: () => void, additionalClass?: string): void {
    const button = document.createElement('div');
    button.className = "menu_btn";
    button.onclick = onClickAction;

    if (additionalClass) {
      button.classList.add(additionalClass);
    }

    const buttonContent = document.createElement('div');
    buttonContent.className = "menu_btn_content";

    const insideContent = document.createElement('div');
    insideContent.className = "class_btn_content";

    // Image
    const imageContainers = document.createElement('div');
    imageContainers.className = "class_img_containers";

    const imagePrimaryContainer = document.createElement('div');
    imagePrimaryContainer.className = "class_img_container";

    const imageContent = document.createElement('img');
    imageContent.className = "class_img";
    imageContent.src = group.getIcon();
    imageContent.alt = group.getName();
    imagePrimaryContainer.appendChild(imageContent);

    imageContainers.appendChild(imagePrimaryContainer);

    if (group.getName() === Group.getEndurance().getName()) {
      const imageSecondaryContainer = document.createElement('div');
      imageSecondaryContainer.className = "class_img_secondary_container";

      for (const subGroup of group.getSubGroups()) {
        const imageSecondaryContent = document.createElement('div');
        imageSecondaryContent.className = "class_img_secondary";

        const imageContent = document.createElement('img');
        imageContent.className = "class_img";
        imageContent.src = subGroup.getIcon();
        imageContent.alt = subGroup.getName();
        imageSecondaryContent.appendChild(imageContent);
        imageSecondaryContainer.appendChild(imageSecondaryContent);
      }
      imageContainers.appendChild(imageSecondaryContainer);
    } else {
      imageContainers.style.paddingRight = "50px";
    }

    insideContent.appendChild(imageContainers);

    // Text
    const buttonTextContainer = document.createElement('div');
    buttonTextContainer.className = "class_btn_text_container";

    const buttonText = document.createElement('span');
    buttonText.innerHTML = group.getName();
    buttonTextContainer.appendChild(buttonText);
    insideContent.appendChild(buttonTextContainer);

    buttonContent.appendChild(insideContent);
    button.appendChild(buttonContent);
    parent.appendChild(button);
  }

  private _createMainMenu(): void {
    this._addTitle(this._mainMenuContainer);
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    // Generate buttons with onclick event
    this._addButtonMenu(buttonContainer, "Solo runner", () => {
      console.log("Solo runner");

      // Set the active menu
      this.setActiveMenu(Menu.CLASS_MENU);
      
      // Add 1 player
      // this._players.push("player1");

      // // Dispatch the mode selected event
      // document.dispatchEvent(GUI._modeSelectedEvent);

      // this._isPaused = false;
      // this._isInGame = true;
    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Dual runners", () => {
      console.log("Dual runners");

      // Set the active menu
      this.setActiveMenu(Menu.CLASS_MENU);

      // Add 2 players
      this._players.push("player1");
      this._players.push("player2");

      // Dispatch the mode selected event
      document.dispatchEvent(GUI._modeSelectedEvent);

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

  private _createClassMenu(): void {
    this._addSubtitle(this._classMenuContainer, "Choose your class");
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    this._addClassButton(buttonContainer, Group.getSprinter(), () => {
      console.log("Sprinter");
      this.setActiveMenu(Menu.NONE_MENU);
    }, "class_btn");
    this._addClassButton(buttonContainer, Group.getGhost(), () => {
      console.log("Ghost");
      this.setActiveMenu(Menu.NONE_MENU);
    }, "class_btn");
    this._addClassButton(buttonContainer, Group.getEndurance(), () => {
      console.log("Endurance");
      this.setActiveMenu(Menu.NONE_MENU);
    }, "class_btn");
    this._addClassButton(buttonContainer, Group.getGymnast(), () => {
      console.log("Gymnast");
      this.setActiveMenu(Menu.NONE_MENU);
    }, "class_btn");
    this._addButtonMenu(buttonContainer, "Back", () => {
      console.log("Back");
      this.setActiveMenu(Menu.MAIN_MENU);
    }, "tertiary_btn");

    this._classMenuContainer.appendChild(buttonContainer);
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

  private _createSettingsKeyBindings(): void {
    // Create local storage for key bindings
    // Check if the key bindings exist
    if (localStorage.getItem("keyBindings")) {
      return;
    }

    const player1Controller = new Controller(null, true);
    const player2Controller = new Controller(null, false);

    // Create the key bindings for the players
    localStorage.setItem("keyBindings", JSON.stringify({
      player1: {
        forward: player1Controller.getForward(),
        backward: player1Controller.getBackward(),
        left: player1Controller.getLeft(),
        right: player1Controller.getRight(),
        sprint: player1Controller.getSprint(),
        jump: player1Controller.getJump(),
        slide: player1Controller.getSlide(),
        modifier: player1Controller.getModifier(),
        capacity: player1Controller.getCapacity(),
      },
      player2: {
        forward: player2Controller.getForward(),
        backward: player2Controller.getBackward(),
        left: player2Controller.getLeft(),
        right: player2Controller.getRight(),
        sprint: player2Controller.getSprint(),
        jump: player2Controller.getJump(),
        slide: player2Controller.getSlide(),
        modifier: player2Controller.getModifier(),
        capacity: player2Controller.getCapacity(),
      }
    }));

  }

  private _createSettingsKeyContainer(parent: HTMLDivElement, action: string, key: string, onClickAction: () => Promise<string>): void {
    const keyContainer = document.createElement('div');
    keyContainer.className = "key_container";

    const keyAction = document.createElement('span');
    keyAction.className = "key_action";
    keyAction.innerHTML = action;

    const keyBind = document.createElement('button');
    keyBind.className = "key_bind";
    keyBind.innerHTML = key;
    keyBind.onclick = async () => {
      // Wait for the key to be pressed and update the key binding
      const newKey = await onClickAction();
      // Update the key binding
      keyBind.innerHTML = newKey;
    };

    keyContainer.appendChild(keyAction);
    keyContainer.appendChild(keyBind);

    parent.appendChild(keyContainer);
  }
  

  private _createSettingsMenu(): void {
    this._addSubtitle(this._settingsMenuContainer, "Settings");

    const keyBindingsContainer = document.createElement('div');
    keyBindingsContainer.className = "key_bindings_container";

    const changeKeyContainer = document.createElement('div');
    changeKeyContainer.className = "change_key_container";
    changeKeyContainer.innerHTML = "Press a key...";

    this._settingsMenuContainer.appendChild(changeKeyContainer);

    const createKeyBinding = (parent: HTMLDivElement, action: string, controller: Controller, getKey: () => string, setKey: (key: string) => void) => {
      this._createSettingsKeyContainer(parent, action, getKey(), () => {
        return new Promise((resolve, reject) => {
          // show the change key container
          changeKeyContainer.style.display = "flex";
          const keyListener = (event: KeyboardEvent) => {
            if (event.code === "Escape") {
              document.removeEventListener("keydown", keyListener);
              changeKeyContainer.style.display = "none";
              resolve(getKey());
              return;
            }
            setKey(event.code);
            // update the key binding in the local storage
            const keyBindings = JSON.parse(localStorage.getItem("keyBindings"));
            if(controller.isPlayer1()) {
              keyBindings.player1[action.toLowerCase()] = event.code;
            } else {
              keyBindings.player2[action.toLowerCase()] = event.code;
            }
            localStorage.setItem("keyBindings", JSON.stringify(keyBindings));
            
            // Dispatch the mode selected event
            document.dispatchEvent(GUI._keyBindingsEvent);

            // remove the event listener
            document.removeEventListener("keydown", keyListener);
            // hide the change key container
            changeKeyContainer.style.display = "none";
            resolve(event.code);
          };
          document.addEventListener("keydown", keyListener);
        });
      });
    };

    const setKeyBindFields = (parent: HTMLDivElement, playerController: Controller) => {
      createKeyBinding(parent, "Forward", playerController, playerController.getForward.bind(playerController), playerController.setForward.bind(playerController));
      createKeyBinding(parent, "Backward", playerController, playerController.getBackward.bind(playerController), playerController.setBackward.bind(playerController));
      createKeyBinding(parent, "Left", playerController, playerController.getLeft.bind(playerController), playerController.setLeft.bind(playerController));
      createKeyBinding(parent, "Right", playerController, playerController.getRight.bind(playerController), playerController.setRight.bind(playerController));
      createKeyBinding(parent, "Sprint", playerController, playerController.getSprint.bind(playerController), playerController.setSprint.bind(playerController));
      createKeyBinding(parent, "Jump", playerController, playerController.getJump.bind(playerController), playerController.setJump.bind(playerController));
      // createKeyBinding(parent, "Slide", playerController, playerController.getSlide.bind(playerController), playerController.setSlide.bind(playerController));
      createKeyBinding(parent, "Modifier", playerController, playerController.getModifier.bind(playerController), playerController.setModifier.bind(playerController));
      createKeyBinding(parent, "Capacity", playerController, playerController.getCapacity.bind(playerController), playerController.setCapacity.bind(playerController));
    }

    // player 1
    const player1Controller = new Controller(null, true);
    const player1Container = document.createElement('div');
    player1Container.className = "player_container";
    const player1Title = document.createElement('h3');
    player1Title.innerHTML = "Player 1";
    player1Container.appendChild(player1Title);
    setKeyBindFields(player1Container, player1Controller);

    // player 2
    const player2Controller = new Controller(null, false);
    const player2Container = document.createElement('div');
    player2Container.className = "player_container";
    const player2Title = document.createElement('h3');
    player2Title.innerHTML = "Player 2";
    player2Container.appendChild(player2Title);
    setKeyBindFields(player2Container, player2Controller);

    keyBindingsContainer.appendChild(player1Container);
    keyBindingsContainer.appendChild(player2Container);

    this._settingsMenuContainer.appendChild(keyBindingsContainer);

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