# Flame Runner

## Bande annonce

Accédez à la bande annonce du jeu en **[cliquant ici](https://youtu.be/3I5FaNAnaLY)**.

## Tutoriel

Pour avoir un aperçu du gameplay, **[cliquez ici](https://youtu.be/uiI-DI9plR0)**.

## Histoire

"En vue de l'ouverture imminente des **Jeux Olympiques 2024**, tout le monde est à pied d'œuvre. Mais avec toute cette frénésie, les organisateurs ont oublié la **flamme olympique** ! Soyez le plus rapide à rapporter la flamme à Paris pour l'ouverture des jeux ! Mais prenez garde, la route est semée d'embuches…"

## Description du jeu

Jeu de course à pied avec un style low poly dans lequel vous traversez différents environnements (Ville, Campagne, Désert, ...) où l'objectif est d'arriver au bout du chemin en terminant par l'ascension de la montagne sacrée avec à son sommet la flamme olympique.

Durant votre parcours vous rencontrerez différents obstacles associés aux différents biomes mais aussi des cubes de bonus/malus qui influenceront votre stratégie de course.

De plus, chaque joueur choisit une classe avant la course qui lui permet de débloquer une capacité bonus ou passive qui lui est propre.

## But du jeu

Atteindre le sommet de la montagne le plus rapidement possible tout en ayant le 
meilleur temps de course.

Celui qui possède le temps de course le plus court l'emporte.

## Modes de jeu

- **Solo** : Contre la montre pour battre ces records.
- **Duo** : Affronter ces amis en local (écran scindé en 2).

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
