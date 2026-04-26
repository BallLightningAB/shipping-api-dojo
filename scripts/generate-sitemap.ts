/**
 * Generate public/sitemap.xml for Shipping API Dojo.
 *
 * Pulls slugs from the canonical content modules so the sitemap cannot drift
 * from the live wiki, carrier surface, lesson, and directory routes.
 *
 * Run with: pnpm tsx scripts/generate-sitemap.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { buildSitemapEntries, renderSitemap } from "../src/lib/seo/sitemap";

const OUTPUT_PATH = path.join(process.cwd(), "public", "sitemap.xml");

function main() {
	const entries = buildSitemapEntries();
	const xml = renderSitemap(entries);
	fs.writeFileSync(OUTPUT_PATH, `${xml}\n`, "utf-8");
	console.log(`Sitemap written to ${OUTPUT_PATH} (${entries.length} URLs)`);
}

main();
