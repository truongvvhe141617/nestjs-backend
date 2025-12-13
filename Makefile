# Choose default branch
BRANCH ?= main
REMOTE ?= origin

# Show help
help:
	@echo "Usage:"
	@echo " make checkout BRANCH=<branch>      # checkout branch"
	@echo " make pull BRANCH=<branch>          # git pull"
	@echo " make push BRANCH=<branch>          # git push"
	@echo " make status                        # git status"
	@echo " make commit MSG=\"Your message\"     # add+commit+push"

# Checkout a branch
checkout:
	@git fetch $(REMOTE)
	@git checkout $(BRANCH)
	@echo "Checked out branch $(BRANCH)"

# Pull the latest from remote
pull:
	@git pull $(REMOTE) $(BRANCH)
	@echo "Pulled latest from $(REMOTE)/$(BRANCH)"

# Push current branch
push:
	@git push $(REMOTE) $(BRANCH)
	@echo "Pushed to $(REMOTE)/$(BRANCH)"

# Show git status
status:
	@git status

# Add all changes and commit
commit:
	@if [ -z "$(MSG)" ]; then \
	  echo "Error: commit message needed!"; \
	  exit 1; \
	fi
	@git add .
	@git commit -m "$(MSG)"
	@git push $(REMOTE) $(BRANCH)
	@echo "Committed & pushed: $(MSG)"
