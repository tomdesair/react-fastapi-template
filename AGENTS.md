# Contributor Instructions

## Code quality

After every code change, run both formatting and linting for the affected
project. Before finishing, run all configured checks with:

```bash
uv run pre-commit run --all-files
```

For the FastAPI backend, formatting and linting are performed by Ruff:

```bash
uv run ruff format .
uv run ruff check .
```

For the React and TypeScript frontend, formatting is performed by Prettier and
linting is performed by ESLint:

```bash
pnpm run format
pnpm run lint
```

Do not consider a change complete while formatting or linting errors remain.
