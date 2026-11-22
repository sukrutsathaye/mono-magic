# Milestone M1 Scope (Features F1–F8)

## Exclusive File Ownership
1. `.gemini/settings.json` [MODIFY] — Keep `nx-mcp` and `contextFileName`; add `playwright` and `context7` zero-secret local stdio MCPs.
2. `.gemini/MCP.md` [NEW] — Document local stdio MCPs + opt-in credentialed Supabase, Firebase, Storybook, GitHub MCPs without committing secrets.
3. `.gemini/skills/engineering-standards/SKILL.md` [NEW] — Matching `SKILL.md` YAML frontmatter; SOLID concrete rules, clean code & performance hygiene, JSDoc/docstring/Dartdoc/README gates, >=80% (>=90% utils) unit test & E2E gates, `libs/<domain>/<lang>-<name>` naming & tagging.
4. `.gemini/skills/python-uv-service/SKILL.md` [NEW] — Matching `SKILL.md` YAML frontmatter; `libs/*/py-*` & `apps/api-*` in `uv` workspace, `pyproject.toml`, Nx `lint`=`ruff` / `typecheck`=`pyright` / `test`=`pytest --cov`, FastAPI `lifespan` singletons, Pydantic v2, SOLID `Protocol`.
5. `.gemini/skills/data-access-provider/SKILL.md` [MODIFY] — Hybrid `proto-contracts` + `ts-interfaces` + `py-interfaces`, `libs/utils/ts-core`, `lang:<lang>` tag, compliance suites.
6. `.gemini/skills/roadmap-tracker/SKILL.md` [MODIFY] — Sync stale paths to `libs/<domain>/<lang>-<name>`.
7. `.gemini/commands/add-data-access.toml` [MODIFY] — Sync stale `data-access-interfaces` / `libs/utils/core` paths.
8. `.gemini/agents/data-access-architect.md` [MODIFY] — Sync stale `data-access-interfaces` paths.
9. `GEMINI.md` [MODIFY] — 4-domain `libs/`, `libs/<domain>/<lang>-<name>`, hybrid `buf` + traits, `.gemini/MCP.md`, mandatory `engineering-standards` & `python-uv-service` skills.
10. `AGENTS.md` [MODIFY] — Sync AI orchestration guidance while preserving `<!-- nx configuration start/end -->`.
11. `eslint.config.mjs` [MODIFY] — Remove `* -> *` wildcard; enforce strict 6 `depConstraints` (`scope:utils`, `scope:ui`, `scope:data-access`, `scope:features`, `scope:app`, `type:interfaces`).
12. `pyproject.toml` [MODIFY] — `members = ["apps/api-*", "libs/*/py-*"]`.
13. `pnpm-workspace.yaml` [MODIFY] — `["apps/*", "libs/ui/*", "libs/utils/ts-*", "libs/data-access/ts-*", "libs/features/ts-*", "!libs/ui/fl-mat"]` (preserve `allowBuilds`).
14. `ROADMAP.md` [MODIFY] — Phase 2C Reflective Learning organisms/templates, Phase 3A–3C normalized paths (`proto-contracts`, `ts-interfaces`, `py-interfaces`, `py-reflective-nlp`, `ts-reflective-api`), Phase 4C `apps/api-reflective-learning`, Phase 5A–5D flagship apps, links to `PORTFOLIO_IDEAS.md` & `docs/projects/`.
15. `PORTFOLIO_IDEAS.md` [NEW] — 8 portfolio projects from `implementation_plan.md` line 156, each `Status: Needs Deep-Dive Design`.
16. `docs/projects/_TEMPLATE.md` [NEW] — Standardized blueprint template.
17. `docs/projects/reflective-learning.md` [NEW] — Complete generalized Reflective Learning blueprint from `/home/antigravity/migration.md` + `implementation_plan.md` line 158, normalizing target paths to `libs/utils/py-nlp`, `libs/data-access/py-reflective-nlp`, `libs/data-access/ts-reflective-api`, `libs/features/ts-reflective-learning`, `apps/api-reflective-learning` while preserving every schema, legacy bug fix, `export_legacy_pickles.py`, API endpoints, Two-Tier grading, LLM generator, and Atomic Design contracts.

## Out of Scope (Do NOT Modify)
- `package.json`, `tsconfig*.json`, `libs/*`, `apps/*`, `tools/*`, `.github/*`, `README.md`, `CLAUDE.md`
