# Mr Mime

Chrono + mots à mimer. Une page blanche : un mot, un chrono, deux boutons (**Passe** = 0, **Valide** = +1).

- La durée se règle avant chaque session (45 s par défaut, mémorisée).
- Le chrono ne se remet pas à zéro entre deux mots ; la session s'arrête à 0 et affiche le score.
- Les mots ne se répètent pas tant que tout le paquet n'a pas été vu (~420 mots). Le paquet est mémorisé dans le navigateur (`localStorage`) : il survit au rechargement de la page, mais il est propre à chaque appareil. **Utilisez le même téléphone/ordinateur pour toutes les sessions.** « Réinitialiser les mots » remet tout dans le paquet.

Ajouter des mots : éditer `public/words.js`.

## Local

    make run        # http://localhost:8085
    make stop

## Production (mrmime.falchero.fr)

Prérequis : un enregistrement DNS `mrmime.falchero.fr` vers le serveur, Docker + rsync sur le serveur, et un reverse proxy HTTPS.

    make deploy-prod DEPLOY_HOST=utilisateur@serveur

Le conteneur écoute sur `127.0.0.1:8085` ; le reverse proxy le publie.

Caddy :

    mrmime.falchero.fr {
        reverse_proxy 127.0.0.1:8085
    }

nginx (+ certbot) :

    server {
        server_name mrmime.falchero.fr;
        location / { proxy_pass http://127.0.0.1:8085; proxy_set_header Host $host; }
    }
