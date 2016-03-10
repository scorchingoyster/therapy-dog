.PHONY: help deploy build-client build-server run-server run-client deps

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

deploy: build-client build-server ## Create a new deploy commit and push to OpenShift
	echo "Update client and server build to $$(git rev-parse --verify HEAD)" | (cd deploy && git add . && git commit --file=- && git push)

build-client: ## Build client, with output in the deploy/public directory
	cd client && ember build --environment=production --output-path=../deploy/public

build-server: ## Build API server, with output in the deploy directory
	cd server && node_modules/.bin/rollup -c -o ../deploy/api.js

run-server: ## Run the API server in development mode
	cd server && node_modules/.bin/nodemon --watch api/lib --watch arrow/lib --watch forms --exec "node_modules/.bin/rollup -c && node server"

run-client: ## Run the client in development mode
	cd client && ember server

deps: ## Install dependencies for the client and API server
	cd server && npm install
	cd client && npm install && bower install
