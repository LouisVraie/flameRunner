import "../public/css/main.css";
import "../public/css/menus.css";
import Controller from "./Controller";
import Group from "./Group";
import PlayerSelection from "./PlayerSelection";
import { Menu } from "./enum/Menu";

class GUI {
  private _globalGUI: HTMLDivElement;
  private _loadingMenuContainer: HTMLDivElement;
  private _mainMenuContainer: HTMLDivElement;
  private _classMenuContainer: HTMLDivElement;
  private _pauseMenuContainer: HTMLDivElement;
  private _helpMenuContainer: HTMLDivElement;
  private _settingsMenuContainer: HTMLDivElement;
  
  private _isPaused: boolean;
  private _isInGame: boolean;
  private _activeMenu: Menu;
  
  private _numberOfPlayers: number;
  private _playersSelection: PlayerSelection[];

  private static dispatchNumberOfPlayersEvent(numberOfPlayers: number) {
    // Create a new CustomEvent with the specific parameter included in the detail
    const event = new CustomEvent('numberofplayers', {
      detail: {
        message: 'numberofplayers custom event!',
        numberOfPlayers: numberOfPlayers
      },
      bubbles: true,
      cancelable: true
    });
    // Dispatch the event on a target element, e.g., document or a specific element
    document.dispatchEvent(event);
  }

  private static dispatchPlayerSelectedEvent() {
    // Create a new CustomEvent with the specific parameter included in the detail
    const event = new CustomEvent('playerselected', {
      detail: {
        message: 'playerselected custom event!'
      },
      bubbles: true,
      cancelable: true
    });
    // Dispatch the event on a target element, e.g., document or a specific element
    document.dispatchEvent(event);
  }

  private static dispatchClassSelectedEvent(playerIdentifier: string, group: Group, parent: HTMLDivElement, button: HTMLDivElement) {
    // Create a new CustomEvent with the specific parameter included in the detail
    const event = new CustomEvent('classselected', {
      detail: {
        message: 'classselected custom event!',
        playerIdentifier: playerIdentifier,
        group: group,
        parent: parent,
        button: button
      },
      bubbles: true,
      cancelable: true
    });
    // Dispatch the event on a target element, e.g., document or a specific element
    document.dispatchEvent(event);
  }

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

    // Create the loading menu container
    this._loadingMenuContainer = this._buildBaseMenuElement("loading_menu_container", "menu_container");
    this._loadingMenuContainer.style.display = 'flex';
    this._globalGUI.appendChild(this._loadingMenuContainer);

    // Create the main menu container
    this._mainMenuContainer = this._buildBaseMenuElement("main_menu_container", "menu_container");
    this._mainMenuContainer.style.display = 'none';
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

    // Create the loading menu
    this._createLoadingMenu();

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
    this._activeMenu = Menu.LOADING_MENU;

    // Default players
    this._numberOfPlayers = 0;
    this._playersSelection = [];

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

    document.addEventListener("classselected", (event: CustomEvent) => {
      const eventPlayerIdentifier = event.detail.playerIdentifier as string;
      const group = event.detail.group as Group;
      const parent = event.detail.parent as HTMLDivElement;
      const button = event.detail.button as HTMLDivElement;      

      // Reset the class button style
      for (let i = 0; i < parent.children.length; i++) {
        const buttonContent = parent.children[i] as HTMLDivElement;
        buttonContent.classList.remove("class_btn_selected");
      }

      // Update the class button style
      button.classList.add("class_btn_selected");

      // Update the class description
      // Title
      const classTitle = document.getElementById(`${eventPlayerIdentifier}_class_title`) as HTMLDivElement;
      classTitle.innerHTML = group.getName();

      // Description
      const classDescription = document.getElementById(`${eventPlayerIdentifier}_class_description`) as HTMLDivElement;
      classDescription.innerHTML = `<b>Description :</b> ${group.getDescription()}`;
      
      // Duration
      const classDuration = document.getElementById(`${eventPlayerIdentifier}_class_duration`) as HTMLDivElement;
      classDuration.innerHTML = `<b>Duration :</b> ${group.getCapacityDuration() ? group.getCapacityDuration() + "s" : "Passive"}`;

      // Cooldown
      const classCooldown = document.getElementById(`${eventPlayerIdentifier}_class_cooldown`) as HTMLDivElement;
      classCooldown.innerHTML = `<b>Cooldown :</b> ${group.getCapacityCooldown() ? group.getCapacityCooldown() + "s" : "Passive"}`;

      // Check if the player selection already exists
      const playerSelection = this._playersSelection.find(player => player.getIdentifier() === eventPlayerIdentifier);

      // Remove the previous player selection
      if (playerSelection) {
        const index = this._playersSelection.indexOf(playerSelection);
        this._playersSelection.splice(index, 1);
      }

      // Add the class to the player selection
      this._playersSelection.push(new PlayerSelection(eventPlayerIdentifier, group));

      // Check if the confirm button should be enabled
      const confirmButton = document.getElementById("confirm_menu_btn_container").firstChild as HTMLDivElement;
      if (this._playersSelection.length > 0 && this._numberOfPlayers === this._playersSelection.length) {
        confirmButton.style.pointerEvents = "all";
      } else {
        confirmButton.style.pointerEvents = "none";
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

  // PlayersSelection
  public getPlayersSelection(): PlayerSelection[] {
    return this._playersSelection;
  }

  // IsInGame
  public isInGame(): boolean {
    return this._isInGame;
  }

  // ActiveMenu
  public setActiveMenu(newMenu: Menu): void {
    switch (this._activeMenu) {
      case Menu.LOADING_MENU:
        this._loadingMenuContainer.style.display = 'none';
        break;
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
      case Menu.LOADING_MENU:
        this._loadingMenuContainer.style.display = 'flex';
        break;
      case Menu.MAIN_MENU:
        this._mainMenuContainer.style.display = 'flex';
        this._isPaused = true;
        this._numberOfPlayers = 0;
        this._playersSelection = [];
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

  private _addClassButton(parent: HTMLDivElement, group: Group, playerIdentifier: string, onClickAction: () => void, additionalClass?: string): void {
    const button = document.createElement('div');
    button.id = `${playerIdentifier}_${group.getName().toLowerCase()}_btn`;
    button.className = "menu_btn";
    button.onclick = () => {
      onClickAction();
      GUI.dispatchClassSelectedEvent(playerIdentifier, group, parent, button);
    };

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

  private _createLoadingMenu(): void {
    this._addTitle(this._loadingMenuContainer);
    this._addSubtitle(this._loadingMenuContainer, "Loading...");

    const loadingContainer = document.createElement('div');
    loadingContainer.className = "loading_container";

    const loadingSpinnerContainer = document.createElement('div');
    loadingSpinnerContainer.className = "loading_spinner_container";

    // Generate loading spinners
    for (let i = 0; i < 5; i++) {
      const loadingSpinner = document.createElement('div');
      loadingSpinner.className = "loading_spinner";
      loadingSpinnerContainer.appendChild(loadingSpinner);
    }

    const loadingBar = document.createElement('div');
    loadingBar.className = "loading_bar";

    const loadingProgress = document.createElement('div');
    loadingProgress.className = "loading_progress";

    loadingBar.appendChild(loadingProgress);
    loadingContainer.appendChild(loadingSpinnerContainer);
    loadingContainer.appendChild(loadingBar);
    this._loadingMenuContainer.appendChild(loadingContainer);
  }

  private _createMainMenu(): void {
    this._addTitle(this._mainMenuContainer);
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    // Generate buttons with onclick event
    this._addButtonMenu(buttonContainer, "Solo runner", () => {
      // Dispatch the number of players event
      GUI.dispatchNumberOfPlayersEvent(1);

      // Set the active menu
      this.setActiveMenu(Menu.CLASS_MENU);
            
    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Dual runners", () => {
      // Dispatch the number of players event
      GUI.dispatchNumberOfPlayersEvent(2);

      // Set the active menu
      this.setActiveMenu(Menu.CLASS_MENU);

    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Help", () => { 
      // Set the active menu
      this.setActiveMenu(Menu.HELP_MENU);

    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Settings", () => {
      // Set the active menu
      this.setActiveMenu(Menu.SETTINGS_MENU);
    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Quit", () => {
      // Close the game
      window.close();
    }, "tertiary_btn");

    this._mainMenuContainer.appendChild(buttonContainer);
  }

  private _createClassMenu(): void {
    this._addSubtitle(this._classMenuContainer, "Choose your class");

    const menuContentContainer = document.createElement('div');
    menuContentContainer.className = "menu_content_container";
    
    document.addEventListener("numberofplayers", (event: CustomEvent) => {
      
      // Clear the previous content
      menuContentContainer.replaceChildren();

      // Get the number of players
      const numberOfPlayers = event.detail.numberOfPlayers as number;
      this._numberOfPlayers = numberOfPlayers;

      for (let i = 0; i < numberOfPlayers; i++) {
        const playerIdentifier = `Player${i + 1}`;

        const buttonContainer = document.createElement('div');
        buttonContainer.id = `${playerIdentifier}_menu_btn_container`;
        buttonContainer.className = "menu_btn_container";

        // Title
        const playerTitle = document.createElement('h3');
        playerTitle.id = `${playerIdentifier}_title`;
        playerTitle.className = "player_title";
        playerTitle.innerHTML = playerIdentifier;
        buttonContainer.appendChild(playerTitle);

        this._addClassButton(buttonContainer, Group.getSprinter(), playerIdentifier, () => {}, "class_btn");
        // this._addClassButton(buttonContainer, Group.getGhost(), playerIdentifier, () => {}, "class_btn");
        this._addClassButton(buttonContainer, Group.getEndurance(), playerIdentifier, () => {}, "class_btn");
        this._addClassButton(buttonContainer, Group.getGymnast(), playerIdentifier, () => {}, "class_btn");

        const classDescriptionContainer = document.createElement('div');
        classDescriptionContainer.id = `${playerIdentifier}_class_description_container`;
        classDescriptionContainer.className = "class_description_container";

        // Title
        const classTitle = document.createElement('div');
        classTitle.id = `${playerIdentifier}_class_title`;
        classTitle.className = "class_title";
        classTitle.innerHTML = "Title";

        // Description
        const classDescription = document.createElement('div');
        classDescription.id = `${playerIdentifier}_class_description`;
        classDescription.className = "class_description";
        classDescription.innerHTML = "<b>Description</b>";

        // Duration
        const classDuration = document.createElement('div');
        classDuration.id = `${playerIdentifier}_class_duration`;
        classDuration.className = "class_duration";
        classDuration.innerHTML = "<b>Duration</b>";

        // Cooldown
        const classCooldown = document.createElement('div');
        classCooldown.id = `${playerIdentifier}_class_cooldown`;
        classCooldown.className = "class_cooldown";
        classCooldown.innerHTML = "<b>Cooldown</b>";

        classDescriptionContainer.appendChild(classTitle);
        classDescriptionContainer.appendChild(classDescription);
        classDescriptionContainer.appendChild(classDuration);
        classDescriptionContainer.appendChild(classCooldown);

        buttonContainer.appendChild(classDescriptionContainer);
        menuContentContainer.appendChild(buttonContainer);
      }
    });
    const confirmContainer = document.createElement('div');
    confirmContainer.id = "confirm_menu_btn_container";
    confirmContainer.className = "menu_btn_confirm_container";

    this._addButtonMenu(confirmContainer, "Start", () => {
      // Set the active menu
      this.setActiveMenu(Menu.NONE_MENU);

      // Dispatch the mode selected event
      GUI.dispatchPlayerSelectedEvent();

      this._isPaused = false;
      this._isInGame = true;
    }, "confirm_btn");

    this._addButtonMenu(confirmContainer, "Back", () => {
      // Set the active menu
      this.setActiveMenu(Menu.MAIN_MENU);
    }, "tertiary_btn");

    this._classMenuContainer.appendChild(menuContentContainer);
    this._classMenuContainer.appendChild(confirmContainer);
  }

  private _createPauseMenu(): void {
    this._addTitle(this._pauseMenuContainer);
    this._addSubtitle(this._pauseMenuContainer, "Game paused");
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    this._addButtonMenu(buttonContainer, "Resume", () => {
      this._isPaused = false;
      // Set the active menu
      this.setActiveMenu(Menu.NONE_MENU);
    }, "primary_btn");
    this._addButtonMenu(buttonContainer, "Help", () => {
      // Set the active menu
      this.setActiveMenu(Menu.HELP_MENU);
    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Settings", () => {
      // Set the active menu
      this.setActiveMenu(Menu.SETTINGS_MENU);
    }, "secondary_btn");
    this._addButtonMenu(buttonContainer, "Back to Main menu", () => {
      window.location.reload();
    }, "tertiary_btn");
    this._pauseMenuContainer.appendChild(buttonContainer);
  }

  private _createHelpMenu(): void {
    this._addSubtitle(this._helpMenuContainer, "Help");
    const buttonContainer = document.createElement('div');
    buttonContainer.className = "menu_btn_container";

    this._addButtonMenu(buttonContainer, "Back", () => {
      // Set the active menu
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
      // Set the active menu
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