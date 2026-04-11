# Contributing to FastAPI Learning

Thank you for taking the time to contribute. The following guidelines will help you get started quickly and keep the project consistent.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)
- [Development Setup](#development-setup)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Adding or Editing Course Content](#adding-or-editing-course-content)
- [Style Guide](#style-guide)

---

## Code of Conduct

All contributors are expected to maintain a respectful and constructive environment. Harassment, discrimination, or hostile communication of any kind will not be tolerated.

---

## How to Contribute

There are several ways to contribute to this project:

- Fix a bug in the application logic or UI
- Improve or correct course content in any module
- Add a new module to the curriculum
- Improve accessibility, performance, or browser compatibility
- Improve documentation

---

## Reporting Bugs

Before opening a bug report, please check the existing [issues](https://github.com/JishnuPG-tech/FastAPI-Learning/issues) to avoid duplicates.

When filing a bug report, include:

1. A clear and descriptive title
2. Steps to reproduce the issue
3. Expected behavior vs. actual behavior
4. Your browser name and version
5. Any relevant console errors or screenshots

---

## Suggesting Features

Feature requests are welcome. Open an issue with the label `enhancement` and describe:

- The problem you are trying to solve
- The proposed solution or behavior
- Any alternatives you considered

---

## Development Setup

### 1. Fork the repository

Click the Fork button at the top right of the repository page.

### 2. Clone your fork

```bash
git clone https://github.com/your-username/FastAPI-Learning.git
cd FastAPI-Learning
```

### 3. Install dependencies

```bash
npm install
```

### 4. Create a feature branch

```bash
git checkout -b feature/your-feature-name
```

### 5. Start the development server

```bash
npm run dev
```

### 6. Make your changes, then lint

```bash
npm run lint
```

---

## Pull Request Guidelines

- Keep pull requests focused on a single change
- Write a clear description of what the PR does and why
- Reference any related issues using `Fixes #123` or `Closes #123`
- Ensure the development server runs without errors before submitting
- Do not include generated files such as `dist/` or `node_modules/`
- Follow the style guide below

---

## Adding or Editing Course Content

Course modules are Markdown files located in `src/content/`. Each file must follow this naming convention:

```
module_XX_topic_name.md
```

Where `XX` is the zero-padded module number (e.g., `03`, `15`).

### Module structure

Each module should follow this format:

```
# Module Title

## What This Covers
Plain English summary of the topic.

## Required Imports
List and explain every import used.

## Core Concepts
Explanation of the main functions, classes, or patterns.

## Code Example

    ```python
    # working example code
    ```

## Key Points
- Bullet recap of the most important takeaways
```

### Rules for content

- Do not use emojis in any Markdown file
- All code examples must be complete and runnable
- Use Python type hints consistently
- Keep examples concise and directly relevant to the module topic

---

## Style Guide

### JavaScript / JSX

- Use functional components with named exports where possible
- Prefer `const` over `let`; avoid `var`
- Use `useCallback` and `useRef` for performance-sensitive handlers
- Avoid inline styles except for dynamic values that cannot be expressed in Tailwind
- Component filenames use PascalCase: `MarkdownViewer.jsx`
- Utility filenames use camelCase: `courses.js`

### CSS / Tailwind

- Use Tailwind utility classes as the primary styling approach
- Define design tokens and global resets in `index.css`
- Avoid `!important`
- Use `transition-colors` and `transition-all` sparingly and only where the animation adds clarity

### Git Commits

Use clear, imperative commit messages:

```
Add search keyboard shortcut for mobile
Fix scroll position reset on module change
Update module 14: clarify JWT expiry example
```

---

## Questions

If you are unsure about anything, open a [GitHub Discussion](https://github.com/JishnuPG-tech/FastAPI-Learning/discussions) or reach out via the issue tracker.
