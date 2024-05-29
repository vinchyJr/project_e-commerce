Lancer le projet
Pour démarrer le projet, vous aurez besoin d'ouvrir deux terminaux.

===========================================================================

Premier terminal:

Assurez-vous d'être dans le dossier game_master.
Connecter le projet à la base de données en entrant la commande suivante : 

nodemon server.js

===========================================================================

Deuxième terminal :

Assurez-vous d'être dans le dossier game_master.
Lancez le projet React en entrant la commande suivante :

npm start

Rester sur le terminal pour validé la mise en route de deux serveurs simultanément,en écrivant 'y' lorsque cela est demandé.

===========================================================================

1. Écrire l'URL, http://localhost:3001/signup , inscrivez-vous en tant qu'Amin avec le code ( wxcvbn ). Puis connectez-vous.

2. Une fois cette étape de réalisé, écrivez l'URL, http://localhost:3001/addgame , 
Ajouter un jeu avec les images et vidéos situés dans le dossier assets qui se situe dans le dossier apps il vous faudra ajouter un jeu pour avoir 

3. Une fois, le jeu ajouté, allez dans la base de données et insérer le jeu mis en avant en fonction de l'id du produit ajouté: 

INSERT INTO `settings` (`id`, `featured_game_id`) VALUES
(1, id du jeu);
COMMIT;

===========================================================================

Exemple: j'ai créé un jeu avec comme id 45, voici ce que vous devriez avoir : 

INSERT INTO `settings` (`id`, `featured_game_id`) VALUES
(1, 45);
COMMIT;

===========================================================================
