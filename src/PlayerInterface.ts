
class PlayerInterface {
    
    private _gui: HTMLDivElement;
    private _playerName: string;
    private _playerTime: string;
    private _playerScore: number;
    private _playerEffect: string; 
    private _playerTimeEffect: number;

    constructor(playerName){
        this._gui = document.createElement("div");
        this._gui.style.width = "100%";
        this._gui.style.height = "100%";    
        this._gui.className = "viewport";
        this._gui.id = playerName+"_screen";
        this._gui.blur();
        //document.body.appendChild(this._gui);
        
        this._playerName = playerName;
        this._playerTime = "00:00:00";
        this._playerScore = 0;
        this._playerEffect = "";
        this._playerTimeEffect = 0;
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

        const topLeftSubTimeContainer = document.createElement('div');
        topLeftSubTimeContainer.className = "top_left_sub_time_container";
        topLeftSubTimeContainer.innerHTML = "Time : "+ this._playerTime;
        topLeftContainer.appendChild(topLeftSubTimeContainer);

        const topLeftSubScoreContainer = document.createElement('div');
        topLeftSubScoreContainer.className = "top_left_sub_score_container";
        topLeftSubScoreContainer.innerHTML = "Score : "+this._playerScore;
        topLeftContainer.appendChild(topLeftSubScoreContainer);

        const topRightSubItemContainer = document.createElement('div');
        topRightSubItemContainer.className = "top_right_sub_item_container";
        topRightSubItemContainer.innerHTML = "?";
        topRightContainer.appendChild(topRightSubItemContainer);

        const topRightSubEffectContainer = document.createElement('div');
        topRightSubEffectContainer.className = "top_right_sub_effect_container";
        topRightSubEffectContainer.innerHTML = this._playerEffect + " : " + this._playerTimeEffect + " s.";
        topRightContainer.appendChild(topRightSubEffectContainer);
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


    public updateStamina(stamina : number) : void {
        const staminaBar = document.querySelector('#stamina_bar_'+this._playerName) as HTMLDivElement;
        staminaBar.style.width = stamina + "%";
    }
}

export default PlayerInterface;