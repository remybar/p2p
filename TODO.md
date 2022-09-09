# TODOS:

[MAJOR]
  - tester le smart contract Offers et Tokens
  - quand on achète une offre, gérer correctement les offerId

  - when a token is unwhitelisted, what do we do with existing offers using this token ?
    * idée: gérer un état de l'offre. Une offre désactivée peut être annulé par le vendeur (pour récupérer ses tokens) mais pas achetée. 

  - détecter le mauvais réseau => render
  - détecter la déconnexion du compte => render

[MINOR]
  - 

[DEPLOIEMENT]
  - process propre de déploiement sur testnet

# QUESTIONS:


# FUTURES VERSIONS

Version 0.2:
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
  
