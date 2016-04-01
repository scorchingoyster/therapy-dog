.PHONY: help run-server run-client test-server examples deps

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

run-server: ## Run the API server in development mode
	cd server && node_modules/.bin/nodemon --ignore "data/uploads" npm start

run-client: ## Run the client in development mode
	cd client && ember server

test-server: ## Run the API server tests
	cd server && npm test

EXAMPLE_TEMPLATES = $(wildcard server/data/forms/*.json.example server/data/vocabularies/*.json.example)

examples: $(EXAMPLE_TEMPLATES:.json.example=.json) ## Copy example forms and vocabularies

%.json: %.json.example
	cp $< $@

deps: ## Install dependencies for the client and API server
	cd server && npm install
	cd client && npm install && bower install
