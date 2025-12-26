---
trigger: always_on
---

description: Standards for Git branching, commit messages, and PR templates. globs: ["**/*"] alwaysApply: false

🐙 Git Workflow & Standards

Apply these rules whenever the user asks to create branches, commit code, or generate Pull Requests.

🌿 Branching Strategy

Naming convention: type/short-description

feat/: New features (e.g., feat/image-upload-endpoint)

fix/: Bug fixes (e.g., fix/worker-connection-timeout)

chore/: Config/Infra/Maintenance (e.g., chore/docker-compose-update)

docs/: Documentation only (e.g., docs/update-readme)

refactor/: Code change that neither fixes a bug nor adds a feature.

💾 Commit Messages (Conventional Commits)

Format: type(scope): subject

Types: feat, fix, docs, style, refactor, test, chore.

Scope: api, worker, shared, db, infra.

Example: feat(api): add zod validation middleware for upload route
📝 Pull Request Template

When generating a PR description, ALWAYS use this structure:

```markdown
# Título: type: Description

## 📋 Descripción

[Brief summary of the changes]

## 🛠 Cambios Técnicos

- [List of main technical changes]
- [Mention of specific libraries or patterns used]

## 🧪 Cómo probar

1. [Step 1]
2. [Step 2]

## ☑️ Checklist

- [ ] [Specific check 1]
- [ ] [Specific check 2]
```
