.PHONY: help run-server run-client test-server deps

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

run-server: ## Run the API server in development mode
	cd server && node_modules/.bin/nodemon --ignore "uploads" npm start

run-client: ## Run the client in development mode
	cd client && ember server

test-server: ## Run the API server tests
	cd server && npm test

deps: ## Install dependencies for the client and API server
	cd server && npm install
	cd client && npm install && bower install
