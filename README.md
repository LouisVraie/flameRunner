# Flame Runner

## Bande annonce

Accédez à la bande annonce du jeu en **[cliquant ici](https://youtu.be/3I5FaNAnaLY)**.

## Tutoriel

Pour avoir un aperçu du gameplay, **[cliquez ici](https://youtu.be/uiI-DI9plR0)**.

## Histoire

"En vue de l'ouverture imminente des **Jeux Olympiques 2024**, tout le monde est à pied d'œuvre. Mais avec toute cette frénésie, les organisateurs ont oublié la **flamme olympique** ! Soyez le ou la plus rapide à rapporter la flamme à Paris pour l'ouverture des jeux ! Mais prenez garde, la route est semée d'embuches…"

## Description du jeu

Jeu de course à pied avec un style low poly dans lequel vous traversez différents environnements (Ville, Campagne, Désert, ...) où l'objectif est d'arriver au bout du chemin en terminant par l'ascension de la montagne sacrée avec à son sommet la flamme olympique.

Durant votre parcours vous rencontrerez différents obstacles associés aux différents biomes mais aussi des cubes de bonus/malus qui influenceront votre stratégie de course.

De plus, chaque joueur choisit une classe avant la course qui lui permet de débloquer une capacité bonus ou passive qui lui est propre.

## But du jeu

Atteindre le sommet de la montagne le plus rapidement possible tout en ayant le 
meilleur temps de course.

Celui qui possède le temps de course le plus court l'emporte.

## Modes de jeu

- **Solo** : Contre la montre pour battre vos records.
- **Duo** : Affronter vos amis en local (écran scindé en 2).

> #### Détails 
>Pour plus de détails sur le projet vous trouverez l'ensemble de nos idées de : 
> - Game design 
> - Interface utilisateur
> 
> En **[cliquant ici](https://drive.google.com/drive/folders/1p7vsO7vuWu8rYQDJA0QNg3Xx2BEph3aF?usp=sharing)**.


## Installation et lancement du projet

1. Cloner le dépôt Git : 
    ```bash
    git clone https://github.com/LouisVraie/flameRunner.git
    ```
2. Dans le dossier cloné, installer les dépendances :
    ```bash
    npm install
    ```
3. Lancer le projet :
    ```bash
    npm start
    ```

## Guide

**Bonus** 

1. Octroie un boost de vitesse pendan 10 secondes.  
![speedBonus](https://github.com/LouisVraie/flameRunner/assets/91614537/e4afcef5-0c01-4d98-8c87-5854e8902fc9) 

2. Remplie instantanément une partie de votre jauge d'endurance.  
![staminaBonus](https://github.com/LouisVraie/flameRunner/assets/91614537/71fd839a-29e3-4210-a05e-9c638d6567ad) 

3. Accélère la récupération d'endurance pandant 10 secondes.  
![staminaRegenBonus](https://github.com/LouisVraie/flameRunner/assets/91614537/72e45815-5fce-4137-b495-4946e428945d)

**Malus**

1. Réduit la vitesse de déplacement pendant 10 secondes.  
![speedMalus](https://github.com/LouisVraie/flameRunner/assets/91614537/0fbf7180-6fb7-4c06-b10c-7bc08d8b8653) 

2. Supprime une partie de l'endurance accumulée instantanément.  
![staminaMalus](https://github.com/LouisVraie/flameRunner/assets/91614537/a966eefd-0bfb-42b3-84c4-d4df424217ef)

3. Diminue la récupération d'endurance pendant 10 secondes.  
![staminaRegenMalus](https://github.com/LouisVraie/flameRunner/assets/91614537/c976e530-4adb-4839-9f59-21d78a59944b)

**Classes**

* Endurance : Résistance au froid  

Réduit de façon passive la consommation d'endurance dans les biomes froids (Rivière & Neige)

![endurance](https://github.com/LouisVraie/flameRunner/assets/91614537/19725635-a69a-48e9-a025-b71259a1ef61) ![enduranceCold](https://github.com/LouisVraie/flameRunner/assets/91614537/0ab1b290-3a76-4900-9765-655566af0d50)

* Endurance : Résistance à la chaleur  

Réduit de façon passive la consommation d'endurance dans les biomes chauds (Désert & Lave)  
![endurance](https://github.com/LouisVraie/flameRunner/assets/91614537/19725635-a69a-48e9-a025-b71259a1ef61) ![enduranceHot](https://github.com/LouisVraie/flameRunner/assets/91614537/bafba643-d390-444c-9c74-a76092d6d7aa)

* Sprinter

Permet de courir très vite pendant 5 secondes. Le délais de rechargement est de 30 secondes.  
![sprinter](https://github.com/LouisVraie/flameRunner/assets/91614537/19915a5f-d909-4cea-a95a-a06fa82d82e7)


* Gymnaste

Permet de sauter plus haut et plus loin pendant 5 secondes. Le délais de rechargement est de 30 secondes.  
![gymnast](https://github.com/LouisVraie/flameRunner/assets/91614537/8e84f2db-8083-42cf-add1-6beed77fde29)


**Jouabilité**

Le jeu est jouable sur clavier AZERTY et QWERTY.

Les touches sont modifiables dans le menu **Settings** et sont enregistrées dans le cache de votre ordinateurs.

![image](https://github.com/LouisVraie/flameRunner/assets/91614537/dee00f55-abfc-44a1-b2ef-b5e2ad9e4dec)

> [!NOTE]
> Appuyer sur la touche **Echap** permet de revenir au menu précédent. En jeu, cette touche permet de mettre le jeu en pause et d'afficher les menus.


## État d'avancement

**Au `30 mars 2024`**
- Structuration du projet :
  - Classes principales du jeu construites;
  - Design des interfaces principales;
  - Cadre / règles du jeu bien établies :
    - Système de Classes de personnages
    - Système de Bonus et Malus
- Création d'un monde 3D pour les tests :
  - Gestion des lumières;
  - Ensemble d'obstacles 3D;
- Implémentation d'un système de physique fonctionnel utilisant Havok.
- Création du personnage 3D :
  - Trouver un modèle 3D;
  - Lui ajouter toutes les animations souhaitées ([voir Détails => Animations](#détails));
  - Associer une caméra avec vue en troisième personne;
  - Appliquer de la physique au personnage;
  - Début des déplacements du personnage (ZQSD);

## Crédits

- Louis Vraie
- Adrien Escoubeyrou
