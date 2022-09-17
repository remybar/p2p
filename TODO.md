# TODOS:

[MAJOR]
  - Github actions
    - Récupérer proprement les résultats (log, etc ...)
      - résultat du lint
      - résultat coverage

    - avoir un tag dans le README.md du repository
      - splitter les jobs pour avoir un état de tests / static analysis / linting ?

  - compléter les tests unitaires des librairies

[DEPLOIEMENT]
  - process propre de déploiement sur testnet

# FUTURES VERSIONS

Version 0.2:
  - when a token is unwhitelisted, what do we do with existing offers using this token ?
    * idée: gérer un état de l'offre. Une offre désactivée peut être annulé par le vendeur (pour récupérer ses tokens) mais pas achetée. 
  - gestion des commissions pour le vendeur et l'acheteur
  - ajout de fonctions de management du smart contract (mise en pause, mode urgence, ...)
  - review du contrat, version des points sécurité
  - cleaner les tests
  - mettre en place la CI/CD et procédure d'upgrade.
  - test en local
  - test sur testnet
  - 🚀 déploiement mainnet 🚀

🔥 SECURITE 🔥
  * prévoir que les fonctions publiques peuvent être appelées et dans n'importe quel ordre, avec n'importe quel paramètre.
  
