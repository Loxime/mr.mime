# Mr Mime

Chrono + mots à mimer : un mot, un chrono, deux boutons (Passe = 0, Valide = +1).

- Durée réglable avant chaque session (45 s par défaut, mémorisée).
- Le chrono ne se remet pas à zéro entre deux mots ; la session s'arrête à 0 et affiche le score.
- Aucun mot ne se répète tant que tout le paquet (~420 mots) n'a pas été vu. Le paquet est mémorisé dans le navigateur (localStorage) : utiliser le même appareil pour toutes les sessions.
- Ajouter des mots : éditer `public/words.js`.

## Local

    make run    # http://localhost:3045
    make stop

## Production (mrmime.falchero.fr)

    make deploy-prod

Le code est copié dans `~/sites/mrmime.falchero.fr` et le conteneur écoute sur `127.0.0.1:3045`. Le reverse proxy HTTPS publie ce port.
