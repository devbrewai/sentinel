# Contributing

Thank you for your interest in contributing to this project.

This project is maintained by [Devbrew](https://devbrew.ai/) as an **open-source research case study** and is under active development. The code will likely change pretty significantly. While it is **not production-ready**, we welcome contributions that improve clarity, reproducibility, and research value.

Following these guidelines helps us respect everyone’s time. In return, we’ll do our best to review issues, assess changes, and help finalize pull requests.

## What we're looking for

We currently prioritize contributions in these areas:

- **Bug reports** and **security fixes**.
- **Documentation improvements** (README, tutorials, comments).
- **Small enhancements** to code clarity, reproducibility, or research usability.

If you want to propose a **new feature** or significant change, please open an issue first and discuss before starting work. Unsolicited large PRs may be closed if they don’t align with project goals.

## Ground rules

- Be respectful and inclusive. We follow the [Contributor Covenant](https://www.contributor-covenant.org/).
- Keep PRs focused. Multiple unrelated fixes should be submitted separately.
- Any changes must not violate dataset licenses (e.g., **no redistribution of IEEE-CIS data or trained models**).
- Ensure your code runs without breaking existing functionality. Add tests or notebook checks where relevant.

## Your first contribution

If you’re new, here are good ways to get started:

- Review documentation and suggest clarifications.
- Open issues for bugs, errors, or confusing behavior.
- Try running notebooks and report reproducibility issues.

Resources for first-time contributors:

- [How to contribute to open source on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github)
- [First timers only](https://www.firsttimersonly.com/)

## Development workflow

1. Fork the repository and create a topic branch (e.g., `fix/data-catalog` or `feat/shap-explainability`).
2. Make your changes, keeping commits atomic and descriptive.
3. Run linting/tests if applicable.
4. Submit a pull request:
   - Fill in the **PR template** (or include similar information) when you create the PR - please follow its structure.
   - Ensure your **PR title** follows the Angular convention: `<type>(<scope>): <subject>`
   - Include:
     - **What** the change does
     - **Why** it's needed
     - **How** it works
   - Make sure your branch is up-to-date with main and that you have resolved merge conflicts.
   - Mark the PR as Ready for review only when you believe it is in a merge-able state.

## Bug reports

If you discover a bug:

- File a new issue with:
  1. Steps to reproduce
  2. Expected behavior
  3. Actual behavior
  4. Environment (OS, Python version, etc.)

**Security issues** (e.g., exposed credentials, vulnerable dependencies) should be reported via GitHub Issues or emailed to **hello@devbrew.ai**.

## Feature requests

If you’d like to propose a new feature:

- Open an issue first to discuss feasibility.
- Explain the use case, why it’s needed, and how it might work.
- Keep in mind this is a **research case study** - not all production-style features are in scope.

## Code review process

- A maintainer will be assigned as reviewer.
- Expect feedback and possibly requests for changes — nothing personal, we care about consistency and maintainability.
- Once a PR meets the bar, it will be merged (usually squash-merged).

## Community

All communication happens via GitHub Issues and Discussions.  
Please be patient — maintainers review contributions as bandwidth allows.

## Legal / licensing

- This project is licensed under **Apache 2.0**.
- The **IEEE-CIS dataset** is licensed for non-commercial research use only. Do not commit or redistribute it.
- Devbrew makes no representations or warranties regarding the suitability of this code for production use.

By contributing, you agree your contributions will be licensed under the Apache 2.0 License.

## Git commit guidelines

We follow the **Angular commit message conventions**. This leads to more readable messages and a consistent history.

### Commit message format

Each commit message consists of a header, a body, and a footer:

```
<type>(<scope>): <subject>

<body>

<footer>
```

- The header includes:
  - type: what kind of change it is
  - scope: the module/feature affected
  - subject: a short description
- Lines should not exceed 100 characters.

### Types of commits

Must be one of the following:

- feat: A new feature
- fix: A bug fix
- docs: Documentation only changes
- style: Changes that do not affect the meaning of the code (formatting, whitespace)
- refactor: A code change that neither fixes a bug nor adds a feature
- perf: A code change that improves performance
- test: Adding or updating tests
- chore: Changes to auxiliary tools or scripts
- build: Changes to dependencies or build tooling
- ci: Changes to CI configuration

### Scope

The scope should describe the area of the code being changed.
Examples:

- `fix(data-catalog): correct dataset path`
- `docs(readme): clarify setup instructions`

### Subject

- Use **imperative, present tense**: "add feature" not "added" or "adds"
- Don’t capitalize the first letter
- Don’t end with a period

### Body

- Use imperative, present tense
- Explain the motivation for the change
- Bullet points are preferred over long paragraphs
- Contrast with previous behavior

### Footer

- Reference GitHub issues: `Fixes #123` or `Closes #456`
- Document breaking changes clearly

### Examples

```
fix(api): handle empty request payloads

Prevent API crash when payload is missing by adding validation.

Fixes #42
```

```
feat(model): add SHAP explainability

- Include SHAP values for fraud model predictions
- Display top contributing features in demo UI

Closes #101

```

```
refactor(config): simplify Redis connection setup

BREAKING CHANGE: env var REDIS_URL is now required instead of host/port pairs.
```

By following these commit rules, we keep history clean and changelogs meaningful.
