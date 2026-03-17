import { TanStackDevtools } from "@tanstack/react-devtools";
import {
	ClientOnly,
	createRootRoute,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Layout } from "@/components/layout/Layout";
import { ProgressHydrator } from "@/components/progress/ProgressHydrator";
import { generateMeta, SITE_URL } from "@/lib/seo/meta";
import {
	generateRootEntityGraphSchema,
	jsonLdScript,
} from "@/lib/seo/structured-data";
import appCss from "../styles.css?url";

function RootNotFound() {
	return (
		<main className="py-20">
			<div className="container mx-auto max-w-3xl px-4 text-center">
				<h1 className="mb-4 font-bold text-3xl">Page not found</h1>
				<p className="mb-6 text-muted-foreground">
					The page you are looking for does not exist.
				</p>
				<a className="text-bl-red hover:underline" href="/">
					Go back home
				</a>
			</div>
		</main>
	);
}

export const Route = createRootRoute({
	head: () => {
		const title = "Shipping API Dojo | REST & SOAP Interview Prep";
		const description =
			"Interactive carrier-integration learning for REST and SOAP interview prep and troubleshooting.";

		return {
			meta: [
				{
					charSet: "utf-8",
				},
				{
					name: "viewport",
					content: "width=device-width, initial-scale=1",
				},
				{
					title,
				},
				{
					name: "theme-color",
					content: "#3B82F6",
				},
				{
					name: "msapplication-TileColor",
					content: "#3B82F6",
				},
				...generateMeta({
					title,
					description,
					url: SITE_URL,
					image: "/og-home.png",
					imageAlt:
						"Shipping API Dojo preview showing REST, SOAP, and incident practice.",
					type: "website",
				}),
			],
			links: [
				{
					rel: "stylesheet",
					href: appCss,
				},
				{
					rel: "preconnect",
					href: "https://fonts.googleapis.com",
				},
				{
					rel: "preconnect",
					href: "https://fonts.gstatic.com",
					crossOrigin: "anonymous",
				},
				{
					rel: "stylesheet",
					href: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Montserrat:wght@400;500;600;700&display=swap",
				},
				{
					rel: "icon",
					href: "/favicon.ico",
					sizes: "any",
				},
				{
					rel: "icon",
					href: "/favicon-16x16.png",
					sizes: "16x16",
					type: "image/png",
				},
				{
					rel: "icon",
					href: "/favicon-32x32.png",
					sizes: "32x32",
					type: "image/png",
				},
				{
					rel: "apple-touch-icon",
					href: "/apple-touch-icon.png",
				},
				{
					rel: "manifest",
					href: "/site.webmanifest",
				},
			],
			scripts: [
				{
					type: "application/ld+json",
					children: jsonLdScript(generateRootEntityGraphSchema()),
				},
			],
		};
	},
	notFoundComponent: RootNotFound,
	shellComponent: RootDocument,
	component: RootComponent,
});

function RootComponent() {
	return (
		<Layout>
			<ClientOnly fallback={null}>
				<ProgressHydrator />
			</ClientOnly>
			<Outlet />
		</Layout>
	);
}

function RootDocument({ children }: { children: React.ReactNode }) {
	const isDev = import.meta.env.DEV;

	return (
		<html className="dark" lang="en">
			<head>
				<HeadContent />
			</head>
			<body className="scroll-smooth">
				{children}
				{isDev && (
					<TanStackDevtools
						config={{
							position: "bottom-right",
						}}
						plugins={[
							{
								name: "Tanstack Router",
								render: <TanStackRouterDevtoolsPanel />,
							},
						]}
					/>
				)}
				<Scripts />
			</body>
		</html>
	);
}
