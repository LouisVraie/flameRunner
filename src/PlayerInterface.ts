import Modifier from "./Modifier";

class PlayerInterface {
    
    private _gui: HTMLDivElement;
    private _playerName: string;
    private _playerTime: string;
    private _playerScore: number;
    private _playerEffect: string; 
    private _playerTimeEffect: number;

    private _currentModifier: Modifier;
    private _currentIcon: string;

    constructor(playerName){
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

        console.log("hello")

        const gui = document.querySelector("#gui");
        //gui.classList.add('in_game');

        // const view = document.createElement('div');
        // view.className = 'viewport';
        gui.appendChild(this._gui);

        const topContainer = document.createElement('div')
        topContainer.className = 'top_container';
        this._gui.appendChild(topContainer)

        const middleContainer = document.createElement('div')
        middleContainer.className = 'middle_container';
        middleContainer.innerHTML = this._playerEffect;
        this._gui.appendChild(middleContainer)

        const bottomContainer = document.createElement('div');
        bottomContainer.className = "bottom_container";
        this._gui.appendChild(bottomContainer);

        const classAbilityContainer = document.createElement('div');
        classAbilityContainer.className = "class_ability_container";
        bottomContainer.appendChild(classAbilityContainer);

        const topLeftContainer = document.createElement('div');
        topLeftContainer.className = "top_left_container";
        topContainer.appendChild(topLeftContainer);

        const topRightContainer = document.createElement('div');
        topRightContainer.className = "top_right_container";
        topContainer.appendChild(topRightContainer);

        const topLeftSubContainer = document.createElement('div');
        topLeftSubContainer.className = "top_left_sub_container";
        topLeftContainer.appendChild(topLeftSubContainer);

        const topLeftSubLifeContainer = document.createElement('div');
        topLeftSubLifeContainer.className = "top_left_sub_life_container";
        topLeftSubContainer.appendChild(topLeftSubLifeContainer);

        for(let i = 0; i < 3; i++){
            const life = document.createElement('img');
            life.className = "life";
            life.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAeCAYAAAA7MK6iAAAACXBIWXMAAAsTAAALEwEAmpwYAAABKUlEQVR4nO3WO0oEQRDG8b+aKMIKPhDP4QY+LqKJ4A3EE5ho6qqJLBj5yow8gBgoYiCIJ9AN19wV9JNmRhiXndp5VeR8UMlMMb9puqAb6vzbCFYEF4KOoCd4E5wKFgf0NgVnfb3nguU84JjgUKCU+hLsCkbi2hN8p/SG563wzSywhSYr9B1l7N0fhi4Zf1+2Vi340glVmAEL7jjCrxb86Qj3LPjdEe5a8K0jfGPB247wlgXPCD489lcwlwrHeNsBPjbRxKq7FaJhYGeHwjG+WSG8kQlN4CcVoO1caIhgQnBfAr0TjFMkginBUwH0WTBdCP2NYEHwkhOdp4oomvTHDOhD6ZX2RzApuDLQa0EDjyi66uwMuCwcCEZd0GQE6/HZHWrtz8s6dYjyAzhREZF5NroFAAAAAElFTkSuQmCC';
            topLeftSubLifeContainer.appendChild(life);
        }

        // for(let i = 0; i < 3; i++) {
        //     // const iframe = document.createElement('iframe');
        //     // iframe.className = "life";
        //     // iframe.src = '../assets/svg/heart.svg';
        //     // iframe.style.border = "none"; // Pour enlever la bordure par défaut de l'iframe
        //     // topLeftSubLifeContainer.appendChild(iframe);
        //     topLeftSubLifeContainer.innerHTML = '<img src="../assets/heart2.svg" alt="" srcset="">'
        // }

        const topLeftSubNameContainer = document.createElement('div');
        topLeftSubNameContainer.className = "top_left_sub_name_container";
        topLeftSubNameContainer.innerHTML = this._playerName;
        topLeftSubContainer.appendChild(topLeftSubNameContainer);

        // Stamina
        const topLeftSubStaminaContainer = document.createElement('div');
        topLeftSubStaminaContainer.className = "top_left_sub_stamina_container";
        const staminaBar = document.createElement('div');
        staminaBar.id = "stamina_bar_"+this._playerName;
        staminaBar.className = "stamina_bar";
        topLeftSubStaminaContainer.appendChild(staminaBar);
        topLeftContainer.appendChild(topLeftSubStaminaContainer);

        // Timer
        const timerContainer = document.createElement('div');
        timerContainer.id = "timer_container_"+this._playerName;
        timerContainer.className = "timer_container";
        timerContainer.innerHTML = "Time : "+ this._playerTime;
        topLeftContainer.appendChild(timerContainer);

        const topLeftSubScoreContainer = document.createElement('div');
        topLeftSubScoreContainer.className = "top_left_sub_score_container";
        topLeftSubScoreContainer.innerHTML = "Score : "+this._playerScore;
        topLeftContainer.appendChild(topLeftSubScoreContainer);

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
        modifierIcon.alt = modifier.getName();

        // Change the effect text
        const modifierEffectName = document.querySelector('#modifier_effect_name_'+this._playerName) as HTMLDivElement;
        const modifierEffectTimer = document.querySelector('#modifier_effect_timer_'+this._playerName) as HTMLDivElement;

        // if not default, display the effect
        if(!modifier.isDefault()) {
            modifierEffectName.innerHTML = modifier.getName();
            modifierEffectTimer.innerHTML = this._playerTimeEffect + " s";
        } else {
            modifierEffectName.innerHTML = "";
            modifierEffectTimer.innerHTML = "";
        }
    }

    public updateModifierTime(timer: number) : void {
        this._playerTimeEffect = timer;

        if(this._playerTimeEffect > 0) {
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
        this._playerTime = `${this.padLeft(minutes, 2)}:${this.padLeft(seconds, 2)}.${this.padLeft(millisecondsPart, 3)}`;
        const timeContainer = document.querySelector('#timer_container_'+this._playerName) as HTMLDivElement;
        timeContainer.innerHTML = "Time : "+ this._playerTime;
    }

    public updateStamina(stamina : number) : void {
        const staminaBar = document.querySelector('#stamina_bar_'+this._playerName) as HTMLDivElement;
        staminaBar.style.width = stamina + "%";
    }
}

export default PlayerInterface;