PROJECT_NAME ?= apps.vite-react-spa
PROJECT_ARTIFACT_PATH = dist/

PLATFORM ?= linux/arm64,linux/amd64

export AWS_REGION ?= us-east-1
# The Terraform Module Name to Deploy
export TF_MODULE_NAME ?= base_infra
export TF_ENV_NAME ?= sandbox
# The Terraform Configuration Directory
export TF_CONFIG_DIR ?= terraform/configs/${TF_ENV_NAME}/${TF_MODULE_NAME}/${AWS_REGION}
# The path to the Terraform Module Actively Deployed
export TF_MODULE_PATH = terraform/modules/${TF_MODULE_NAME}
# The Terraform State Bucket
export TF_STATE_BUCKET ?= c3lifesandbox01use1-tf-state-bucket
# The Terraform State Key (used for the state file)
export TF_STATE_PROJECT_KEY ?= applications/${PROJECT_NAME}/${TF_ENV_NAME}
export TF_STATE_MODULE_KEY ?= ${TF_STATE_PROJECT_KEY}/${TF_MODULE_NAME}
# The Working Directory inside the Terraform Container
export TF_WORKING_DIR = /workspace
export TF_LOG=DEBUG

##
## - Terraform Input Variables injected into the container
##
export TF_VAR_tf_state_bucket ?= ${TF_STATE_BUCKET}
export TF_VAR_tf_state_project_key = ${TF_STATE_PROJECT_KEY}

##
# Functions
# ============================================
##

.PHONY: shell build start develop deploy

# Params
# 1 - The container to run the command inside of
# 2 - The command to run inside the container
# 3 - The (optional) parameters to the command
define run_command_in_container
	@docker compose \
		--file docker-compose.yml \
		run \
		-i \
		--rm \
		--remove-orphans \
		$(1) \
		$(2)
endef


# Params
#	1 - The container to run the shell inside of
#	2 - The shell to run inside the container
#	3 - Optional commands to run within the container
define run_shell
	docker compose \
		--file docker-compose.yml \
		run \
		-it \
		--rm \
		--remove-orphans \
		--no-deps \
		--entrypoint $(2) \
		$(1)
endef

default: help

help:		## Show help menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

## -------------------------------------- Build Targets --------------------------------------

shell:
	@docker compose run --entrypoint /bin/bash --rm node

prepare: ## Prepare the environment
	@docker compose run --rm --entrypoint npm node install

build: prepare ## Build the application
	@docker compose run --rm --entrypoint npm node run build

develop: build ## Start the application
	@docker compose run --rm --entrypoint npm --service-ports node run dev

test: build ## Run the test suite
	@docker compose run --rm --entrypoint npm node run test:coverage

test-watch: build ## Run the test suite
	@docker compose run --rm --entrypoint npm node run test:watch

lint: build ## Lint the application
	@docker compose run --rm --entrypoint npm node run lint

deploy: build ## Deploy the application
	@aws s3 sync ${PROJECT_ARTIFACT_PATH} s3://$(shell make which-bucket) --delete

invalidate-cache: ## Invalidate the CloudFront cache
	@aws cloudfront create-invalidation --distribution-id ${shell make which-distribution} --paths "/index.html"

which-project: ## Show the project name
	@echo ${PROJECT_NAME}

## -------------------------------------- Terraform Targets --------------------------------------
tf-clean: ## Clean the Terraform configuration
	@docker-compose run --rm --entrypoint /bin/sh terraform -c "rm -rf .terraform || true"

tf-shell: ## Start bash session inside the Terraform image
	$(call run_shell,terraform,"/bin/sh")

tf-validate: ## Validate the Terraform configuration
	$(call run_command_in_container,terraform,validate)

tf-init: ## Initializes Terraform (run terraform init)
	$(call run_command_in_container,terraform, -chdir=${TF_MODULE_PATH} init --upgrade -reconfigure $(shell make get_opts_backend))

tf-plan: ## Run terraform plan
	$(call run_command_in_container,terraform, -chdir=${TF_MODULE_PATH} plan $(shell make get_opts_tfvars))

tf-apply: ## Apply the Terraform configuration
	$(call run_command_in_container,terraform, -chdir=${TF_MODULE_PATH} apply -auto-approve $(shell make get_opts_tfvars))

tf-destroy: ## Destroy the Terraform configuration
	$(call run_command_in_container,terraform, -chdir=${TF_MODULE_PATH} destroy -auto-approve $(shell make get_opts_tfvars))

tf-output: ## Show the Terraform output
	$(call run_command_in_container,terraform, -chdir=${TF_MODULE_PATH} output)

tf-test: ## Run the test suite
	$(call run_command_in_container,terraform,test)

tf-lint: ## Lint the terraform code
	$(call run_command_in_container,tflint)

get_opts_tfvars: ## Get the tfvars options
	@if [ -z "$(TF_CONFIG_DIR)" ]; then \
		echo ""; \
	else \
		echo "-var-file=${TF_WORKING_DIR}/$(TF_CONFIG_DIR)/terraform.tfvars"; \
	fi

get_opts_backend: ## Get the backend-config options
	@if [ -f "${TF_MODULE_PATH}/override.tf" ]; then \
		echo ""; \
	elif [ -z "$(TF_STATE_BUCKET)" ]; then \
		echo "-backend=false"; \
	else \
		echo "-backend-config=\"bucket=${TF_STATE_BUCKET}\" -backend-config=\"key=${TF_STATE_MODULE_KEY}/terraform.tfstate\" -backend-config=\"region=${AWS_REGION}\""; \
	fi

which-distribution: pull-infra-state
	@cat infra.tfstate | jq -r '.outputs.distribution_id.value'

which-bucket: pull-infra-state
	@cat infra.tfstate | jq -r '.outputs.content_bucket.value'

pull-infra-state:
	@aws s3 cp s3://${TF_STATE_BUCKET}/${TF_STATE_PROJECT_KEY}/base_infra/terraform.tfstate infra.tfstate > /dev/null
