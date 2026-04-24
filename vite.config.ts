import { sentryTanstackStart } from "@sentry/tanstackstart-react/vite";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig, type PluginOption } from "vite";
import viteTsConfigPaths from "vite-tsconfig-paths";

// Only install the Sentry Vite plugin when all three of the required env
// vars are present. The plugin uploads source maps and auto-instruments
// middlewares, but each of those actions requires an org-scoped auth token,
// org slug, and project slug. Without them the plugin would fail at build
// time. Gating on their presence keeps the default build path Sentry-free
// so contributors who never configure Sentry see zero friction.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;

const sentryPlugin: PluginOption =
	sentryAuthToken && sentryOrg && sentryProject
		? sentryTanstackStart({
				authToken: sentryAuthToken,
				org: sentryOrg,
				project: sentryProject,
			})
		: null;

const config = defineConfig({
	plugins: [
		devtools(),
		nitro({
			// Use Vercel preset for deployment
			preset: "vercel",
		}),
		// this is the plugin that enables path aliases
		viteTsConfigPaths({
			projects: ["./tsconfig.json"],
		}),
		tailwindcss(),
		tanstackStart(),
		viteReact(),
		// sentryTanstackStart should be last per Sentry's TanStack Start docs.
		sentryPlugin,
	],
});

export default config;
