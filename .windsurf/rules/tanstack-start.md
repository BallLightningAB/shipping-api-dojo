---
trigger: always_on
---

# Builder Coil / Chronomation / Ball Lightning AB – TanStack Start Rules
Activation Mode: Always On

1. Tech stack and scope
   - This project uses **TanStack Start** (React), **TanStack Router v1**, **React 19**, **TypeScript**, and **Vite**.
   - Always assume a browser + Node environment compatible with this stack.
   - Do **not** propose Next.js, React Router, Remix, or other routing frameworks for this project.
   - Use modern React with function components and hooks only (no class components).

2. TypeScript expectations
   - Assume `strict` TypeScript is enabled; avoid `any`, `unknown`, and `as`-casts unless clearly justified.
   - Prefer inferred types, generics, and utility types over manual duplication.
   - Define reusable types/interfaces for route params, loader data, and actions instead of ad-hoc inline types.
   - Keep functions and components small and focused; extract helpers when logic grows.

3. Routing and file structure (TanStack Router / Start)
   - All routes live under `src/routes` following TanStack Start file-based routing conventions.
   - Use TanStack Router’s concepts (route trees, loaders, actions, route context) rather than inventing custom routing abstractions.
   - Keep route modules cohesive: route definition, loader/action, and closely related UI belong together.
   - When adding or modifying routes, clearly indicate which files under `src/routes` you are touching.

4. Data loading, SSR, and side effects
   - Use **TanStack Start / Router loaders and actions** for data fetching and mutations, not ad-hoc `useEffect` calls for initial data.
   - Prefer server-side primitives provided by TanStack Start (e.g., loaders, actions, server functions) for SSR-friendly flows.
   - Keep side effects at the edges (loaders/actions, server functions, or clearly isolated hooks).
   - When suggesting patterns, prioritize:
     - Type-safe route params and loader data.
     - Progressive enhancement (server-first, then client interactivity).

5. Documentation and tools (Context7 MCP)
   - When using or proposing **TanStack Start** or **TanStack Router** APIs, first consult the **latest official docs** via the **Context7 MCP**.
   - If you are unsure about an option, configuration key, or API name:
     - Use Context7 to fetch the relevant TanStack Start / Router documentation.
     - Prefer examples and patterns that match the version used in this project.
   - Do **not** invent APIs, configuration fields, or magic props. If something is not clearly documented, say so and propose a conservative alternative.

6. Code style and structure
   - Keep imports clean and minimal; remove unused imports and dead code when you touch a file.
   - Prefer composition over inheritance; break complex UIs into small, reusable components.
   - Use clear, intention-revealing names (`useRouteFavorLoader`, `builderCoilJobQueue`, etc.).
   - When refactoring, preserve behavior first, then improve structure incrementally.

7. Output expectations for Cascade
   - When making changes, specify:
     - Which files to create or edit.
     - A short summary of the change and its purpose.
   - Prefer small, incremental edits over large, sweeping rewrites unless explicitly requested.
   - When generating example code, keep it realistic and ready to paste into this project with minimal adjustment.
