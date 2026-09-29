# Serveur de production (SSH). Surchargeable : make deploy-prod DEPLOY_HOST=moi@mon-serveur
DEPLOY_HOST ?= ubuntu@falchero.fr
DEPLOY_PATH ?= /home/ubuntu/sites/mrmime.falchero.fr

.PHONY: run stop logs deploy-prod

run:
	docker compose up -d --build

stop:
	docker compose down

logs:
	docker compose logs -f

deploy-prod:
	ssh $(DEPLOY_HOST) "mkdir -p $(DEPLOY_PATH)"
	rsync -az --delete --exclude .git ./ $(DEPLOY_HOST):$(DEPLOY_PATH)/
	ssh $(DEPLOY_HOST) "cd $(DEPLOY_PATH) && docker compose up -d --build"
