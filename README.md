# FastAPI Learning

A modern, interactive course reader for learning FastAPI from scratch — built with React, Vite, and Tailwind CSS.

---

## Overview

FastAPI Learning is a self-contained frontend application that renders a structured 22-module FastAPI curriculum as an elegant, navigable course. It supports persistent progress tracking, fuzzy search, and a clean reading experience across devices.

The application does not require a backend server. All course content is stored as Markdown files and bundled at build time via Vite's static import system.

---

## Features

- 22 structured modules covering FastAPI from installation to a full production project
- Persistent progress saved to browser localStorage
- Module-level completion tracking with a visual sidebar progress bar
- Fuzzy full-text search across all modules (Ctrl + K)
- Syntax-highlighted code blocks with one-click copy
- Responsive layout with an animated collapsible sidebar
- Smooth module transitions powered by Framer Motion
- Optimized scroll performance using requestAnimationFrame and direct DOM updates

---

## Tech Stack

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 8 | Build tool and dev server |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animation and transitions |
| react-markdown | Markdown rendering |
| react-syntax-highlighter | Code block highlighting |
| Fuse.js | Client-side fuzzy search |
| Lucide React | Icon library |

---

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/JishnuPG-tech/FastAPI-Learning.git
cd FastAPI-Learning
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## Project Structure

```
FastAPI-Learning/
├── public/                  Static assets
├── src/
│   ├── components/
│   │   ├── MarkdownViewer.jsx   Renders markdown content with syntax highlighting
│   │   ├── ModuleFooter.jsx     Previous / Next navigation
│   │   ├── SearchModal.jsx      Full-screen fuzzy search
│   │   └── Sidebar.jsx          Module list with progress indicator
│   ├── content/                 Course markdown files (modules 01 to 22)
│   ├── utils/
│   │   └── courses.js           Parses and sorts markdown files via Vite glob
│   ├── App.jsx                  Root component with layout and state management
│   ├── main.jsx                 React entry point
│   └── index.css                Global styles and design tokens
├── index.html
├── vite.config.js
├── tailwind.config.js
├── package.json
├── LICENSE
└── README.md
```

---

## Course Modules

| Module | Topic |
|---|---|
| 01 | Installation and Setup |
| 02 | First API |
| 03 | Path Parameters |
| 04 | Query Parameters |
| 05 | Request Body |
| 06 | Validation |
| 07 | Response Models and Status Codes |
| 08 | Error Handling |
| 09 | Headers, Cookies, Forms, and Files |
| 10 | Dependency Injection |
| 11 | Background Tasks and Middleware |
| 12 | CORS |
| 13 | Security and OAuth2 |
| 14 | JWT Authentication |
| 15 | Database Connection |
| 16 | Models and Tables |
| 17 | Schemas |
| 18 | CRUD Operations |
| 19 | Relationships |
| 20 | Migrations with Alembic |
| 21 | Project Structure and Routers |
| 22 | Final Full Project |

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Build the production bundle to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

---

## Adding Course Content

Course modules are plain Markdown files in `src/content/`. The naming convention is:

```
module_XX_topic_name.md
```

Where `XX` is the zero-padded module number. The application automatically discovers, parses, and sorts all `.md` files in that directory. The first `# Heading` line is used as the module title.

---

## Browser Support

| Browser | Minimum Version |
|---|---|
| Chrome | 90 |
| Firefox | 88 |
| Safari | 14 |
| Edge | 90 |

---

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before submitting a pull request.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Author

Jishnu PG — [GitHub](https://github.com/JishnuPG-tech)
