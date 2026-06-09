# Contributing

Thanks for taking an interest in contributing.

This project is a fully typed, cross-runtime event contract system for TypeScript. The goal is to define events once as a type map and get full inference at every emit and listener site across Node.js, browsers, Web Workers, and edge runtimes.

Contributions of all kinds are welcome as long as they meaningfully improve the project.

---

## Getting Started

### Requirements

- Node.js (Latest LTS recommended)
- pnpm
- Git

### Setup

Install dependencies:
```bash
pnpm install
```

Run tests:
```bash
pnpm test
```

Run lint:
```bash
pnpm run lint
```

## Project Structure

The codebase is intentionally separated into clear layers:
```
src/
├── core/         Event bus logic and type definitions. No I/O.
├── transports/   Adapters: local, WebSocket, worker, HTTP.
└── utils/        Opt-in debugging utilities.
```

## Testing

We use vitest:
```bash
pnpm test
```
- Add tests alongside new features
- Prefer small, focused test cases
- Ensure existing tests remain valid
- Avoid tests that depend on implementation details unless necessary

## Linting

We use ESLint:
```bash
pnpm run lint
```

## Git Workflow
- Work in feature branches
- Open a merge request for all changes
- Keep changes focused and reviewable

### Commit conventions
We follow a conventional commit style. Each commit should represent a single logical change and ideally leave the repository in a working state.

Preferred prefixes:
- `feat:` new functionality
- `fix:` bug fixes
- `refactor:` internal restructuring without behaviour change
- `test:` test additions or changes
- `docs:` documentation updates
- `chore:` tooling or maintenance
- `perf:` performance improvements

### Commit quality rules
- Keep commits small and focused
- Separate tests, implementation, and docs when possible
- Avoid mixed-purpose commits (e.g. refactor + feature + docs)
- Ensure code builds and tests pass

A clear history matters more than minimizing commit count.

### Merge Requests
When opening a merge request:
- Clearly describe the motivation behind the change
- Link related issues if applicable
- Include tests for new behaviour
- Highlight any breaking changes
- Keep the diff focused and reviewable

### Versioning
This project follows semantic versioning:
- Breaking changes -> Major version bump
- New features -> minor version bump
- Fixes -> patch version bump
Maintainer: Ashley <ashley@nullworks.dev>

### Issues
If you're unsure about a change, open an issue first.
Good issue types:
- Bug reports
- Feature proposals
- Architecture questions
- Transport ideas or improvements