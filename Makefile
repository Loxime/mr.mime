# Serveur de production (SSH). Surchargeable : make deploy-prod DEPLOY_HOST=moi@mon-serveur
DEPLOY_HOST ?= user@falchero.fr
DEPLOY_PATH ?= /opt/mrmime

.PHONY: run stop logs deploy-prod

run: ## Lance l'app en local sur http://localhost:8085
	docker compose up -d --build

stop: ## Arrête l'app locale
	docker compose down

logs:
	docker compose logs -f

deploy-prod: ## Envoie le code sur le serveur et relance le conteneur
	ssh $(DEPLOY_HOST) "mkdir -p $(DEPLOY_PATH)"
	rsync -az --delete --exclude .git ./ $(DEPLOY_HOST):$(DEPLOY_PATH)/
	ssh $(DEPLOY_HOST) "cd $(DEPLOY_PATH) && docker compose up -d --build"
