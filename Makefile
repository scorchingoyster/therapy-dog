.PHONY: help run-server run-client test-server examples deps

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

run-server: ## Run the API server in development mode
	cd server && node_modules/.bin/nodemon --ignore "data/uploads" npm start

run-client: ## Run the client in development mode
	cd client && ember server

test-server: ## Run the API server tests
	cd server && npm test

examples: ## Copy example forms and vocabularies
	cp server/data/forms/test-form.json.example server/data/forms/test-form.json
	cp server/data/vocabularies/genre.json.example server/data/vocabularies/genre.json
	cp server/data/vocabularies/issuance.json.example server/data/vocabularies/issuance.json

deps: ## Install dependencies for the client and API server
	cd server && npm install
	cd client && npm install && bower install
