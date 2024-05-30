import Modifier from "./Modifier";
import "../public/css/playerInterface.css";
import Group from "./Group";

class PlayerInterface {
    
    private _gui: HTMLDivElement;
    private _playerName: string;
    private _playerTime: string;
    private _playerScore: number;
    private _playerEffect: string; 
    private _playerTimeEffect: number;

    private _currentModifier: Modifier;
    private _currentIcon: string;

    constructor(playerName: string){
        this._gui = document.createElement("div");
        this._gui.style.width = "100%";
        this._gui.style.height = "100%";    
        this._gui.className = "viewport";
        this._gui.id = playerName+"_screen";
        this._gui.blur();
        //document.body.appendChild(this._gui);
        
        this._playerName = playerName;
        this._playerTime = "00:00.000";
        this._playerScore = 0;
        this._playerEffect = "";
        this._playerTimeEffect = 0;

        this._currentModifier = new Modifier();
        this._currentIcon = null;
    }

    addViewport(){

        const gui = document.querySelector("#gui");
        gui.appendChild(this._gui);

        const topContainer = document.createElement('div')
        topContainer.className = 'top_container';
        topContainer.id = 'top_container_'+this._playerName;
        this._gui.appendChild(topContainer)

        const middleContainer = document.createElement('div')
        middleContainer.className = 'middle_container';
        middleContainer.id = 'middle_container_'+this._playerName;
        middleContainer.innerHTML = this._playerEffect;
        this._gui.appendChild(middleContainer)

        const bottomContainer = document.createElement('div');
        bottomContainer.className = "bottom_container";
        bottomContainer.id = 'bottom_container_'+this._playerName;
        this._gui.appendChild(bottomContainer);

        const topLeftContainer = document.createElement('div');
        topLeftContainer.className = "top_left_container";
        topContainer.appendChild(topLeftContainer);

        const topRightContainer = document.createElement('div');
        topRightContainer.className = "top_right_container";
        topContainer.appendChild(topRightContainer);

        // Player name
        const nameContainer = document.createElement('div');
        nameContainer.id = "name_container_"+this._playerName;
        nameContainer.className = "name_container";
        nameContainer.innerHTML = this._playerName;
        topLeftContainer.appendChild(nameContainer);

        // Stamina
        const staminaContainer = document.createElement('div');
        staminaContainer.className = "stamina_container";
        const staminaBar = document.createElement('div');
        staminaBar.id = "stamina_bar_"+this._playerName;
        staminaBar.className = "stamina_bar";
        staminaContainer.appendChild(staminaBar);
        topLeftContainer.appendChild(staminaContainer);

        // Timer
        const timerContainer = document.createElement('div');
        timerContainer.id = "timer_container_"+this._playerName;
        timerContainer.className = "timer_container";
        timerContainer.innerHTML = "Time : "+ this._playerTime;
        topLeftContainer.appendChild(timerContainer);

        /////////////////////////////////////////////
        // Modifier
        /////////////////////////////////////////////
        // Modifier Container
        const modifierContainer = document.createElement('div');
        modifierContainer.className = "modifier_container";

        // Modifier Icon
        const modifierIcon = document.createElement('img');
        modifierIcon.id = "modifier_icon_"+this._playerName;
        modifierIcon.className = "modifier_icon";
        modifierIcon.alt = "Modifier icon";
        modifierContainer.appendChild(modifierIcon);
        topRightContainer.appendChild(modifierContainer);

        // Modifier Effect Container
        const modifierEffectContainer = document.createElement('div');
        modifierEffectContainer.id = "modifier_effect_container_"+this._playerName;
        modifierEffectContainer.className = "modifier_effect_container";
        // Modifier Effect Name
        const modifierEffectName = document.createElement('div');
        modifierEffectName.id = "modifier_effect_name_"+this._playerName;
        modifierEffectName.className = "modifier_effect_name";
        modifierEffectName.innerHTML = this._playerEffect;
        // Modifier Effect Timer
        const modifierEffectTimer = document.createElement('div');
        modifierEffectTimer.id = "modifier_effect_timer_"+this._playerName;
        modifierEffectTimer.className = "modifier_effect_timer";
        modifierEffectTimer.innerHTML = this._playerTimeEffect + " s";

        modifierEffectContainer.appendChild(modifierEffectName);
        modifierEffectContainer.appendChild(modifierEffectTimer);
        topRightContainer.appendChild(modifierEffectContainer);

        /////////////////////////////////////////////
        // Class ability
        /////////////////////////////////////////////
        const classAbilityContainer = document.createElement('div');
        classAbilityContainer.id = "class_ability_container_"+this._playerName;
        classAbilityContainer.className = "class_ability_container";

        // Icon
        const classAbilityIconContainer = document.createElement('div');
        classAbilityIconContainer.id = "class_ability_icon_container_"+this._playerName;
        classAbilityIconContainer.className = "class_ability_icon_container";
        classAbilityContainer.appendChild(classAbilityIconContainer);

        const classAbilityIcon = document.createElement('img');
        classAbilityIcon.id = "class_ability_icon_"+this._playerName;
        classAbilityIcon.className = "class_ability_icon";
        classAbilityIcon.src = "";
        classAbilityIcon.alt = "Class ability icon";
        classAbilityIconContainer.appendChild(classAbilityIcon);

        // Cooldown
        const classAbilityCooldownContainer = document.createElement('div');
        classAbilityCooldownContainer.id = "class_ability_cooldown_container_"+this._playerName;
        classAbilityCooldownContainer.className = "class_ability_cooldown_container";
        classAbilityIconContainer.appendChild(classAbilityCooldownContainer);

        const classAbilityCooldownProgressBarContainer = document.createElement('div');
        classAbilityCooldownProgressBarContainer.id = "class_ability_cooldown_progress_bar_container_"+this._playerName;
        classAbilityCooldownProgressBarContainer.className = "class_ability_cooldown_progress_bar_container";
        classAbilityCooldownContainer.appendChild(classAbilityCooldownProgressBarContainer);

        const classAbilityCooldownProgressBar = document.createElement('div');
        classAbilityCooldownProgressBar.id = "class_ability_cooldown_progress_bar_"+this._playerName;
        classAbilityCooldownProgressBar.className = "class_ability_cooldown_progress_bar";
        classAbilityCooldownProgressBarContainer.appendChild(classAbilityCooldownProgressBar);

        // Cooldown timer
        const classAbilityCooldownTimer = document.createElement('div');
        classAbilityCooldownTimer.id = "class_ability_cooldown_timer_"+this._playerName;
        classAbilityCooldownTimer.className = "class_ability_cooldown_timer";
        classAbilityCooldownContainer.appendChild(classAbilityCooldownTimer);

        // Name
        const classAbilityName = document.createElement('div');
        classAbilityName.id = "class_ability_name_"+this._playerName;
        classAbilityName.className = "class_ability_name";
        classAbilityName.innerHTML = "Class ability";
        classAbilityContainer.appendChild(classAbilityName);

        bottomContainer.appendChild(classAbilityContainer);
    }

    public getPlayerName() : string {
        return this._playerName;
    }
    public setPlayerName(newPlayerName : string) : void {
        this._playerName = newPlayerName;
    }
    
    public getPlayerTime() : string {
        return this._playerTime;
    }
    public setPlayerTime(newPlayerTime : string) : void {
        this._playerTime = newPlayerTime;
    }

    public getPlayerScore() : number{
        return this._playerScore;
    }
    public setPlayerScore(newPlayerScore : number) : void {
        this._playerScore = newPlayerScore;
    }
    
    public getPlayerEffect(): string{
        return this._playerEffect;
    }
    public setPlayerEffect(newPlayereffect : string) : void{
        this._playerEffect = newPlayereffect;
    }

    public getPlayerTimeEffect() : number{
        return this._playerTimeEffect;
    }
    public setPlayerTimeEffect(newPlayerTimeEffect : number) : void {
        this._playerTimeEffect = newPlayerTimeEffect;
    }

    public getModifierIcon() : string {
        return this._currentIcon;
    }
    public setModifierIcon(modifier: Modifier) : void {
        this._currentModifier = modifier;
        this._playerEffect = modifier.getName();
        this._currentIcon = modifier.getIcon();
        this._playerTimeEffect = modifier.getDuration();

        // Change the img
        const modifierIcon = document.querySelector('#modifier_icon_'+this._playerName) as HTMLImageElement;
        modifierIcon.src = this._currentIcon;
        modifierIcon.alt = this._playerEffect;

        // Change the effect text
        const modifierEffectName = document.querySelector('#modifier_effect_name_'+this._playerName) as HTMLDivElement;
        const modifierEffectTimer = document.querySelector('#modifier_effect_timer_'+this._playerName) as HTMLDivElement;

        // if not default, display the effect
        if(!modifier.isDefault() && !modifier.isInstant()) {
            modifierEffectName.innerHTML = this._playerEffect;
            modifierEffectTimer.innerHTML = this._playerTimeEffect + " s";
        } else if (!modifier.isDefault() && modifier.isInstant()){
            modifierEffectName.innerHTML = this._playerEffect;
            modifierEffectTimer.innerHTML = "";
        } else {
            modifierEffectName.innerHTML = "";
            modifierEffectTimer.innerHTML = "";
        }
    }

    public setClassAbility(group: Group) : void {
        // Set icon
        const classAbilityIcon = document.querySelector('#class_ability_icon_'+this._playerName) as HTMLImageElement;
        classAbilityIcon.src = group.getIcon();
        classAbilityIcon.alt = group.getName();

        // Set name
        const classAbilityName = document.querySelector('#class_ability_name_'+this._playerName) as HTMLDivElement;
        classAbilityName.innerHTML = group.getName();
    }

    private _setClassAbilityColor(isAbilityActive: boolean, isPassive: boolean, cooldown: number) : boolean {
        const classAbilityIconContainer = document.querySelector('#class_ability_icon_container_'+this._playerName) as HTMLDivElement;
        
        if (isPassive) {
            if(isAbilityActive){
                classAbilityIconContainer.style.borderColor = "green";
                return true;
            } else {
                classAbilityIconContainer.style.borderColor = "red";
            }
        } else {
            // If the ability is active, the cooldown is not displayed
            if(isAbilityActive && cooldown > 0){
                classAbilityIconContainer.style.borderColor = "green";
                return true;
            } else if (!isAbilityActive && cooldown > 0) {
                classAbilityIconContainer.style.borderColor = "red";
            } else {
                classAbilityIconContainer.style.borderColor = "white";
            }
        }
        return false;
    }

    // Update the player class ability cooldown
    public updateClassAbilityCooldown(isAbilityActive: boolean, currentCooldown: number, group: Group) : void {
        const cooldown = group.getCapacityCooldown() * 1000;
        
        if (!group.isPassive()) {
            const classAbilityCooldownProgressBar = document.querySelector('#class_ability_cooldown_progress_bar_'+this._playerName) as HTMLDivElement;
            const classAbilityCooldownTimer = document.querySelector('#class_ability_cooldown_timer_'+this._playerName) as HTMLDivElement;
            
            // If the ability is active, the cooldown is not displayed
            if(this._setClassAbilityColor(isAbilityActive, group.isPassive(), currentCooldown)){
                return;
            }

            // Set the cooldown timer
            if (currentCooldown < 0) {
                currentCooldown = 0;
            }

            if (currentCooldown != 0) {
                const seconds = Math.floor((currentCooldown % 60000) / 1000);
                classAbilityCooldownTimer.innerHTML = this.padLeft(seconds, 1);
            } else {
                classAbilityCooldownTimer.innerHTML = "";
            }

            // Set the cooldown time in secondes in percentage
            const cooldownPercentage = (currentCooldown / cooldown) * 100;
            
            classAbilityCooldownProgressBar.style.height = cooldownPercentage + "%";
        } else {
            this._setClassAbilityColor(isAbilityActive, group.isPassive(), cooldown);
        }
    }

    public updateModifierTime(timer: number) : void {
        this._playerTimeEffect = timer;

        if(this._playerTimeEffect > 0 && !this._currentModifier.isInstant()) {
            // Convert timer to milliseconds
            const seconds = Math.floor((this._playerTimeEffect % 60000) / 1000);
            // Round the milliseconds to 1 decimal
            const millisecondsPart = Math.round(this._playerTimeEffect % 1000 / 100);

            const modifierEffectTimer = document.querySelector('#modifier_effect_timer_'+this._playerName) as HTMLDivElement;
            modifierEffectTimer.innerHTML = `${seconds}.${this.padLeft(millisecondsPart, 1)} s`;
        }
    }

    private padLeft(value: number, length: number): string {
        return value.toString().padStart(length, '0');
    }

    public updateTimer(timer : number) : void {
        // Set the timer in the format (minutes:seconds:milliseconds)
        // Convert timer to milliseconds
        const milliseconds = timer;

        // Calculate minutes, seconds, and milliseconds
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        const millisecondsPart = milliseconds % 1000;

        // Format the time string
        this._playerTime = `${this.padLeft(minutes, 2)}:${this.padLeft(seconds, 2)}:${this.padLeft(millisecondsPart, 3)}`;
        const timeContainer = document.querySelector('#timer_container_'+this._playerName) as HTMLDivElement;
        timeContainer.innerHTML = "Time : "+ this._playerTime;
    }

    public showFinalScreen(isWinner : boolean, isBestTime : boolean){
        const container = document.querySelector('#middle_container_'+this._playerName) as HTMLDivElement;

        const topContainer = document.querySelector('#top_container_'+this._playerName) as HTMLDivElement;
        topContainer.classList.add('display_none');

        const bottomContainer = document.querySelector('#bottom_container_'+this._playerName) as HTMLDivElement;
        bottomContainer.classList.add('display_none');

        const endInfoContainer = document.createElement('div');
        endInfoContainer.className = "end_info_container";
        endInfoContainer.id = "end_info_container_"+this._playerName;
        container.appendChild(endInfoContainer);

        const endInfoContent = document.createElement('div');
        endInfoContent.className = "end_info_content";
        endInfoContent.id = "end_info_content_"+this._playerName;
        endInfoContainer.appendChild(endInfoContent);

        if(isWinner){
            endInfoContent.innerHTML = `<div class="winner">1st place !</div>`;
        }
        else{
            endInfoContent.innerHTML = `<div class="loser">2nd place !</div>`;           
        }

        // Diplay the time
        endInfoContent.innerHTML += `<div class="time">Time : ${this._playerTime}</div>`;

        // Display the best time message
        if(isBestTime){
            endInfoContent.innerHTML += `<div class="best_time">New best time !</div>`;
        }
    }

    public updateStamina(stamina : number) : void {
        const staminaBar = document.querySelector('#stamina_bar_'+this._playerName) as HTMLDivElement;
        staminaBar.style.width = stamina + "%";
    }
}

export default PlayerInterface;