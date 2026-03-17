import { spawn } from "node:child_process";
import { existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const repoRoot = resolve(__dirname, "..");
const tempDir = join(repoRoot, "scripts", ".tmp-og");
const profileDir = join(repoRoot, "scripts", `.tmp-og-profile-${process.pid}`);
const publicDir = join(repoRoot, "public");
const debugPort = 9222;

const browserCandidates = [
	"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
	"C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
	"C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
	"C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
];

const browserPath = browserCandidates.find((candidate) =>
	existsSync(candidate)
);

if (!browserPath) {
	throw new Error(
		"No supported Chromium browser was found. Install Chrome or Edge to generate OG images."
	);
}

const pages = [
	{
		id: "home",
		filename: "og-home.png",
		eyebrow: "Shipping API Dojo",
		title: "REST + SOAP<br/>Interview Prep",
		subtitle:
			"Lessons, drills, and incident scenarios for carrier integrations that fail in the real world.",
		tags: [
			{ label: "REST", tone: "blue" },
			{ label: "SOAP", tone: "green" },
			{ label: "INCIDENTS", tone: "amber" },
		],
		panelTitle: "Learning stack",
		panelBody: `
			<div class="feature-grid">
				<div class="feature-card tone-blue">
					<div class="feature-kicker">Track</div>
					<strong>REST + SOAP</strong>
					<p>Concepts, references, and patterns for carrier APIs.</p>
				</div>
				<div class="feature-card tone-green">
					<div class="feature-kicker">Practice</div>
					<strong>Scored Drills</strong>
					<p>MCQ, cloze, and builders with production-grade explanations.</p>
				</div>
				<div class="feature-card tone-amber">
					<div class="feature-kicker">Debug</div>
					<strong>Incident Arena</strong>
					<p>Timeouts, 429 storms, SOAP faults, and silent failures.</p>
				</div>
			</div>
			<div class="terminal">
				<div class="terminal-top">
					<span>carrier-playbook.ts</span>
					<span class="terminal-status">live practice</span>
				</div>
				<div class="code-row">
					<span class="code-dim">focus</span>
					<span class="code-value">retry safety</span>
					<span class="code-dim">score</span>
					<span class="code-value tone-blue-text">92</span>
				</div>
				<div class="code-row">
					<span class="code-dim">track</span>
					<span class="code-value tone-green-text">soap.faults</span>
					<span class="code-dim">mode</span>
					<span class="code-value tone-amber-text">arena</span>
				</div>
				<div class="code-row">
					<span class="code-dim">status</span>
					<span class="code-value">shipping integration ready</span>
				</div>
			</div>
		`,
	},
	{
		id: "rest",
		filename: "og-rest.png",
		eyebrow: "Shipping API Dojo",
		title: "REST Track",
		subtitle:
			"HTTP semantics, auth, idempotency, retries, and webhooks for carrier integrations.",
		tags: [
			{ label: "HTTP", tone: "blue" },
			{ label: "429", tone: "green" },
			{ label: "RETRY-AFTER", tone: "amber" },
		],
		panelTitle: "Request flow",
		panelBody: `
			<div class="request-shell">
				<div class="request-row">
					<span class="method-pill">POST</span>
					<span class="route-pill">/shipments</span>
					<span class="status-pill">202 Accepted</span>
				</div>
				<div class="kv-grid">
					<div class="kv-item">
						<span>Authorization</span>
						<strong>Bearer carrier_token</strong>
					</div>
					<div class="kv-item">
						<span>Idempotency-Key</span>
						<strong>ship-0317-a</strong>
					</div>
					<div class="kv-item">
						<span>X-Correlation-Id</span>
						<strong>corr_7f24e9</strong>
					</div>
					<div class="kv-item">
						<span>Retry-After</span>
						<strong>8 seconds</strong>
					</div>
				</div>
			</div>
			<div class="mini-grid">
				<div class="mini-card tone-blue">
					<strong>Safe methods</strong>
					<p>Know when a replay is harmless.</p>
				</div>
				<div class="mini-card tone-green">
					<strong>Rate limits</strong>
					<p>Backoff, queue, and recover without duplicates.</p>
				</div>
				<div class="mini-card tone-amber">
					<strong>Webhooks</strong>
					<p>Correlate events when responses lie.</p>
				</div>
			</div>
		`,
	},
	{
		id: "soap",
		filename: "og-soap.png",
		eyebrow: "Shipping API Dojo",
		title: "SOAP Track",
		subtitle:
			"Envelopes, namespaces, WSDL/XSD, and fault handling for legacy carrier integrations.",
		tags: [
			{ label: "ENVELOPE", tone: "blue" },
			{ label: "WSDL", tone: "green" },
			{ label: "FAULT", tone: "amber" },
		],
		panelTitle: "Contract debug",
		panelBody: `
			<div class="xml-card">
				<div class="xml-line"><span class="xml-tag">&lt;soap:Envelope&gt;</span></div>
				<div class="xml-line indent"><span class="xml-tag">&lt;soap:Header&gt;</span></div>
				<div class="xml-line indent-2"><span class="xml-accent">&lt;auth:Token&gt;</span>abc123&lt;/auth:Token&gt;</div>
				<div class="xml-line indent"><span class="xml-tag">&lt;/soap:Header&gt;</span></div>
				<div class="xml-line indent"><span class="xml-tag">&lt;soap:Body&gt;</span></div>
				<div class="xml-line indent-2"><span class="xml-tag">&lt;CreateShipmentRequest&gt;</span></div>
				<div class="xml-line indent-3"><span class="xml-error">&lt;soap:Fault&gt;</span> Invalid weight unit</div>
				<div class="xml-line indent-2"><span class="xml-tag">&lt;/CreateShipmentRequest&gt;</span></div>
				<div class="xml-line indent"><span class="xml-tag">&lt;/soap:Body&gt;</span></div>
				<div class="xml-line"><span class="xml-tag">&lt;/soap:Envelope&gt;</span></div>
			</div>
			<div class="mini-grid">
				<div class="mini-card tone-blue">
					<strong>Namespaces</strong>
					<p>Find the one tag that breaks the contract.</p>
				</div>
				<div class="mini-card tone-green">
					<strong>WSDL / XSD</strong>
					<p>Read structure before blaming the transport.</p>
				</div>
				<div class="mini-card tone-amber">
					<strong>Fault detail</strong>
					<p>Map carrier specifics to actionable fixes.</p>
				</div>
			</div>
		`,
	},
	{
		id: "arena",
		filename: "og-arena.png",
		eyebrow: "Shipping API Dojo",
		title: "Incident Arena",
		subtitle:
			"Practice timeouts, rate limits, SOAP faults, and silent failures from real carrier debugging.",
		tags: [
			{ label: "TIMEOUT", tone: "blue" },
			{ label: "429 STORM", tone: "green" },
			{ label: "FAULT DETAIL", tone: "amber" },
		],
		panelTitle: "Scenario ladder",
		panelBody: `
			<div class="incident-stack">
				<div class="incident-card active">
					<div class="incident-step">01</div>
					<div>
						<strong>Timeout after label creation</strong>
						<p>Did the carrier create the shipment before the socket died?</p>
					</div>
				</div>
				<div class="incident-card">
					<div class="incident-step">02</div>
					<div>
						<strong>429 during batch sync</strong>
						<p>Queue the retry, preserve order, avoid a replay storm.</p>
					</div>
				</div>
				<div class="incident-card">
					<div class="incident-step">03</div>
					<div>
						<strong>SOAP fault with detail</strong>
						<p>Trace the field mismatch before escalating the integration.</p>
					</div>
				</div>
			</div>
			<div class="decision-strip">
				<span>Log correlation IDs</span>
				<span>Check carrier state</span>
				<span>Retry safely</span>
			</div>
		`,
	},
];

await generateImages();

async function generateImages() {
	mkdirSync(tempDir, { recursive: true });
	mkdirSync(profileDir, { recursive: true });

	const browser = spawn(
		browserPath,
		[
			"--headless",
			"--disable-gpu",
			"--hide-scrollbars",
			"--force-color-profile=srgb",
			`--remote-debugging-port=${debugPort}`,
			`--user-data-dir=${profileDir}`,
			"about:blank",
		],
		{
			stdio: "ignore",
		}
	);

	try {
		await waitForBrowser();

		for (const page of pages) {
			const htmlPath = join(tempDir, `${page.id}.html`);
			const screenshotPath = join(publicDir, page.filename);

			writeFileSync(htmlPath, renderPage(page), "utf8");
			await captureScreenshot(pathToFileURL(htmlPath).href, screenshotPath);
		}
	} finally {
		browser.kill();
		await delay(300);
		rmSync(tempDir, { recursive: true, force: true });
		try {
			rmSync(profileDir, { recursive: true, force: true });
		} catch {
			// Chromium can hold the profile briefly on Windows; a unique dir per run avoids collisions.
		}
	}

	console.log(`Generated ${pages.length} OG images with ${browserPath}`);
}

async function waitForBrowser() {
	for (let attempt = 0; attempt < 50; attempt += 1) {
		try {
			const response = await fetch(
				`http://127.0.0.1:${debugPort}/json/version`
			);
			if (response.ok) {
				return;
			}
		} catch {
			// Browser is still starting.
		}

		await delay(200);
	}

	throw new Error("Chromium remote debugging endpoint did not start in time.");
}

async function captureScreenshot(url, outputPath) {
	const target = await createTarget();
	const client = await connectToTarget(target.webSocketDebuggerUrl);

	try {
		await client.send("Page.enable");
		await client.send("Runtime.enable");
		await client.send("Emulation.setDeviceMetricsOverride", {
			width: 1200,
			height: 630,
			deviceScaleFactor: 1,
			mobile: false,
			screenWidth: 1200,
			screenHeight: 630,
		});
		await client.send("Page.navigate", { url });
		await client.waitForEvent("Page.loadEventFired");
		await client.send("Runtime.evaluate", {
			expression:
				"new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))",
			awaitPromise: true,
		});
		const screenshot = await client.send("Page.captureScreenshot", {
			format: "png",
			fromSurface: true,
			captureBeyondViewport: false,
		});

		writeFileSync(outputPath, Buffer.from(screenshot.data, "base64"));
	} finally {
		client.close();
		await closeTarget(target.id);
	}
}

async function createTarget() {
	const response = await fetch(
		`http://127.0.0.1:${debugPort}/json/new?${encodeURIComponent("about:blank")}`,
		{ method: "PUT" }
	);

	if (!response.ok) {
		throw new Error(`Failed to create a Chromium target: ${response.status}`);
	}

	return response.json();
}

async function closeTarget(targetId) {
	await fetch(`http://127.0.0.1:${debugPort}/json/close/${targetId}`, {
		method: "PUT",
	});
}

async function connectToTarget(webSocketDebuggerUrl) {
	const socket = new WebSocket(webSocketDebuggerUrl);
	const pending = new Map();
	const eventWaiters = new Map();
	let id = 0;

	await new Promise((resolve, reject) => {
		socket.addEventListener("open", () => resolve(undefined), { once: true });
		socket.addEventListener("error", reject, { once: true });
	});

	socket.addEventListener("message", (event) => {
		const payload = JSON.parse(event.data);

		if (payload.id) {
			const request = pending.get(payload.id);
			if (!request) {
				return;
			}

			pending.delete(payload.id);

			if (payload.error) {
				request.reject(new Error(payload.error.message));
				return;
			}

			request.resolve(payload.result);
			return;
		}

		if (!payload.method) {
			return;
		}

		const queue = eventWaiters.get(payload.method);
		if (!queue?.length) {
			return;
		}

		const waiter = queue.shift();
		waiter?.(payload.params);
	});

	return {
		send(method, params = {}) {
			id += 1;

			return new Promise((resolve, reject) => {
				pending.set(id, { resolve, reject });
				socket.send(JSON.stringify({ id, method, params }));
			});
		},
		waitForEvent(method) {
			return new Promise((resolve) => {
				const queue = eventWaiters.get(method) ?? [];
				queue.push(resolve);
				eventWaiters.set(method, queue);
			});
		},
		close() {
			socket.close();
		},
	};
}

function delay(ms) {
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

function renderPage(page) {
	const tagMarkup = page.tags
		.map(
			(tag) =>
				`<span class="tag tone-${tag.tone}">${escapeHtml(tag.label)}</span>`
		)
		.join("");

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${stripHtml(page.title)}</title>
		<style>
			:root {
				--bg: #05070a;
				--border: rgba(148, 163, 184, 0.16);
				--text: #f7fafc;
				--muted: #b9c5d4;
				--blue: #3b82f6;
				--green: #10b981;
				--amber: #f59e0b;
			}

			* {
				box-sizing: border-box;
			}

			html,
			body {
				margin: 0;
				width: 1200px;
				height: 630px;
			}

			body {
				overflow: hidden;
				background: var(--bg);
				color: var(--text);
				font-family: "Bahnschrift", "Segoe UI Variable Display", "Segoe UI", sans-serif;
			}

			.canvas {
				position: relative;
				height: 100%;
				width: 100%;
				background:
					radial-gradient(circle at 15% 18%, rgba(59, 130, 246, 0.34), transparent 32%),
					radial-gradient(circle at 84% 14%, rgba(245, 158, 11, 0.26), transparent 30%),
					radial-gradient(circle at 80% 82%, rgba(16, 185, 129, 0.24), transparent 30%),
					linear-gradient(140deg, #04070b 0%, #07111b 46%, #051018 100%);
			}

			.canvas::before {
				content: "";
				position: absolute;
				inset: 0;
				background-image:
					linear-gradient(rgba(148, 163, 184, 0.08) 1px, transparent 1px),
					linear-gradient(90deg, rgba(148, 163, 184, 0.08) 1px, transparent 1px);
				background-size: 48px 48px;
				mask-image: radial-gradient(circle at center, black 48%, transparent 100%);
				opacity: 0.22;
			}

			.canvas::after {
				content: "";
				position: absolute;
				inset: 26px;
				border: 1px solid rgba(226, 232, 240, 0.12);
				border-radius: 28px;
				box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);
			}

			.content {
				position: relative;
				z-index: 1;
				display: grid;
				grid-template-columns: minmax(0, 1.08fr) minmax(0, 0.92fr);
				gap: 38px;
				height: 100%;
				padding: 56px 58px 46px;
			}

			.left {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				min-width: 0;
			}

			.eyebrow {
				display: inline-flex;
				width: fit-content;
				align-items: center;
				border: 1px solid rgba(226, 232, 240, 0.16);
				border-radius: 999px;
				padding: 9px 16px;
				background: rgba(10, 16, 24, 0.56);
				color: rgba(226, 232, 240, 0.84);
				font-size: 16px;
				font-weight: 600;
				letter-spacing: 0.14em;
				text-transform: uppercase;
			}

			h1 {
				margin: 18px 0 18px;
				font-size: 78px;
				line-height: 0.94;
				letter-spacing: -0.045em;
			}

			.subtitle {
				margin: 0;
				max-width: 560px;
				color: var(--muted);
				font-size: 28px;
				line-height: 1.28;
			}

			.tags {
				display: flex;
				flex-wrap: wrap;
				gap: 12px;
				margin-top: 28px;
			}

			.tag {
				display: inline-flex;
				align-items: center;
				border: 1px solid rgba(226, 232, 240, 0.12);
				border-radius: 999px;
				padding: 9px 16px;
				font-size: 16px;
				font-weight: 700;
				letter-spacing: 0.08em;
				text-transform: uppercase;
			}

			.tone-blue {
				border-color: rgba(59, 130, 246, 0.42);
				background: rgba(59, 130, 246, 0.14);
				color: #d7e7ff;
			}

			.tone-green {
				border-color: rgba(16, 185, 129, 0.42);
				background: rgba(16, 185, 129, 0.14);
				color: #d8fff0;
			}

			.tone-amber {
				border-color: rgba(245, 158, 11, 0.42);
				background: rgba(245, 158, 11, 0.14);
				color: #ffedc2;
			}

			.tone-blue-text {
				color: #8fbaff;
			}

			.tone-green-text {
				color: #71f0c1;
			}

			.tone-amber-text {
				color: #ffd278;
			}

			.footer {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 20px;
				margin-top: 28px;
				color: rgba(226, 232, 240, 0.74);
				font-size: 15px;
				font-weight: 600;
				letter-spacing: 0.16em;
				text-transform: uppercase;
			}

			.footer strong {
				font-weight: 700;
				color: rgba(255, 255, 255, 0.92);
			}

			.stage {
				position: relative;
				align-self: center;
				min-height: 420px;
				border: 1px solid rgba(226, 232, 240, 0.12);
				border-radius: 28px;
				padding: 24px;
				background: linear-gradient(180deg, rgba(11, 18, 28, 0.94), rgba(5, 9, 15, 0.98));
				box-shadow:
					0 28px 90px rgba(2, 6, 23, 0.62),
					inset 0 1px 0 rgba(255, 255, 255, 0.04);
				overflow: hidden;
			}

			.stage::before {
				content: "";
				position: absolute;
				inset: 0;
				background:
					radial-gradient(circle at 86% 14%, rgba(59, 130, 246, 0.15), transparent 24%),
					radial-gradient(circle at 14% 88%, rgba(16, 185, 129, 0.14), transparent 26%);
			}

			.stage > * {
				position: relative;
				z-index: 1;
			}

			.stage-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 20px;
			}

			.stage-title {
				font-size: 17px;
				font-weight: 700;
				letter-spacing: 0.12em;
				text-transform: uppercase;
				color: rgba(226, 232, 240, 0.78);
			}

			.signal {
				display: inline-flex;
				gap: 8px;
			}

			.signal span {
				width: 10px;
				height: 10px;
				border-radius: 999px;
			}

			.signal .blue {
				background: var(--blue);
				box-shadow: 0 0 12px rgba(59, 130, 246, 0.9);
			}

			.signal .green {
				background: var(--green);
				box-shadow: 0 0 12px rgba(16, 185, 129, 0.8);
			}

			.signal .amber {
				background: var(--amber);
				box-shadow: 0 0 12px rgba(245, 158, 11, 0.8);
			}

			.feature-grid,
			.mini-grid {
				display: grid;
				grid-template-columns: repeat(3, minmax(0, 1fr));
				gap: 12px;
			}

			.feature-card,
			.mini-card {
				min-height: 108px;
				border-radius: 20px;
				padding: 16px;
				background: rgba(15, 23, 34, 0.84);
				box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
			}

			.feature-kicker,
			.mini-card p,
			.kv-item span,
			.terminal-status,
			.code-dim {
				font-family: Consolas, "Cascadia Mono", monospace;
			}

			.feature-kicker {
				margin-bottom: 10px;
				font-size: 12px;
				letter-spacing: 0.14em;
				text-transform: uppercase;
				color: rgba(226, 232, 240, 0.62);
			}

			.feature-card strong,
			.mini-card strong {
				display: block;
				margin-bottom: 8px;
				font-size: 20px;
				line-height: 1.05;
			}

			.feature-card p,
			.mini-card p {
				margin: 0;
				font-size: 13px;
				line-height: 1.4;
				color: rgba(226, 232, 240, 0.74);
			}

			.terminal,
			.request-shell,
			.xml-card {
				margin-top: 16px;
				border: 1px solid var(--border);
				border-radius: 22px;
				padding: 18px;
				background: rgba(6, 11, 18, 0.9);
			}

			.terminal-top,
			.request-row {
				display: flex;
				justify-content: space-between;
				align-items: center;
				gap: 10px;
				margin-bottom: 14px;
				font-family: Consolas, "Cascadia Mono", monospace;
				font-size: 13px;
				color: rgba(226, 232, 240, 0.74);
			}

			.code-row {
				display: grid;
				grid-template-columns: auto 1fr auto auto;
				gap: 12px;
				padding: 10px 0;
				border-top: 1px solid rgba(148, 163, 184, 0.08);
				font-size: 15px;
			}

			.code-row:first-of-type {
				border-top: 0;
			}

			.code-dim {
				color: rgba(148, 163, 184, 0.72);
			}

			.code-value {
				color: rgba(255, 255, 255, 0.94);
				font-family: Consolas, "Cascadia Mono", monospace;
			}

			.method-pill,
			.route-pill,
			.status-pill {
				display: inline-flex;
				align-items: center;
				border-radius: 999px;
				padding: 8px 12px;
				font-size: 13px;
				font-weight: 700;
				letter-spacing: 0.08em;
				text-transform: uppercase;
			}

			.method-pill {
				background: rgba(59, 130, 246, 0.16);
				color: #d7e7ff;
			}

			.route-pill {
				background: rgba(255, 255, 255, 0.06);
				color: rgba(255, 255, 255, 0.92);
			}

			.status-pill {
				background: rgba(16, 185, 129, 0.16);
				color: #d8fff0;
			}

			.kv-grid {
				display: grid;
				grid-template-columns: repeat(2, minmax(0, 1fr));
				gap: 12px;
			}

			.kv-item {
				border-radius: 18px;
				padding: 14px;
				background: rgba(255, 255, 255, 0.04);
			}

			.kv-item span {
				display: block;
				margin-bottom: 8px;
				font-size: 12px;
				color: rgba(226, 232, 240, 0.66);
				letter-spacing: 0.1em;
				text-transform: uppercase;
			}

			.kv-item strong {
				display: block;
				font-size: 17px;
				line-height: 1.2;
			}

			.xml-line {
				font-family: Consolas, "Cascadia Mono", monospace;
				font-size: 15px;
				line-height: 1.55;
				color: rgba(226, 232, 240, 0.86);
				white-space: nowrap;
			}

			.xml-tag {
				color: #8fbaff;
			}

			.xml-accent {
				color: #71f0c1;
			}

			.xml-error {
				color: #ffd278;
			}

			.indent {
				padding-left: 18px;
			}

			.indent-2 {
				padding-left: 36px;
			}

			.indent-3 {
				padding-left: 54px;
			}

			.incident-stack {
				display: grid;
				gap: 12px;
			}

			.incident-card {
				display: grid;
				grid-template-columns: auto 1fr;
				gap: 14px;
				align-items: start;
				border: 1px solid rgba(226, 232, 240, 0.1);
				border-radius: 20px;
				padding: 16px;
				background: rgba(13, 20, 31, 0.82);
			}

			.incident-card.active {
				border-color: rgba(59, 130, 246, 0.28);
				box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.14);
			}

			.incident-step {
				display: inline-flex;
				height: 40px;
				width: 40px;
				align-items: center;
				justify-content: center;
				border-radius: 14px;
				background: rgba(59, 130, 246, 0.16);
				color: #d7e7ff;
				font-family: Consolas, "Cascadia Mono", monospace;
				font-size: 15px;
				font-weight: 700;
			}

			.incident-card strong {
				display: block;
				margin-bottom: 8px;
				font-size: 20px;
				line-height: 1.12;
			}

			.incident-card p {
				margin: 0;
				font-size: 14px;
				line-height: 1.45;
				color: rgba(226, 232, 240, 0.74);
			}

			.decision-strip {
				display: flex;
				justify-content: space-between;
				gap: 10px;
				margin-top: 16px;
			}

			.decision-strip span {
				flex: 1;
				border: 1px solid rgba(226, 232, 240, 0.12);
				border-radius: 999px;
				padding: 11px 12px;
				background: rgba(255, 255, 255, 0.04);
				font-size: 13px;
				font-weight: 700;
				letter-spacing: 0.06em;
				text-align: center;
				text-transform: uppercase;
				color: rgba(255, 255, 255, 0.9);
			}
		</style>
	</head>
	<body>
		<div class="canvas">
			<div class="content">
				<div class="left">
					<div>
						<div class="eyebrow">${escapeHtml(page.eyebrow)}</div>
						<h1>${page.title}</h1>
						<p class="subtitle">${escapeHtml(page.subtitle)}</p>
						<div class="tags">${tagMarkup}</div>
					</div>
					<div class="footer">
						<span>api-trainer.balllightning.cloud</span>
						<strong>Ball Lightning AB</strong>
					</div>
				</div>
				<div class="stage">
					<div class="stage-header">
						<div class="stage-title">${escapeHtml(page.panelTitle)}</div>
						<div class="signal">
							<span class="blue"></span>
							<span class="green"></span>
							<span class="amber"></span>
						</div>
					</div>
					${page.panelBody}
				</div>
			</div>
		</div>
	</body>
</html>`;
}

function escapeHtml(value) {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;");
}

function stripHtml(value) {
	return value.replaceAll(/<br\s*\/?>/gi, " ").replaceAll(/<[^>]+>/g, "");
}
