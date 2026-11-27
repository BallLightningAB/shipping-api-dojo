# Security and PR review — 2026-11-27

## Inventory and sequence

Connected GitHub PR search and the REST pull collection both returned **zero
open PRs** for `BallLightningAB/shipping-api-dojo`. Remote main remains
`1b8fe82b057b4ff8bff6999813b3ae4ea4bcfa53`, the October #42 squash merge.
There was no pending PR to rebase, merge, or deploy at initial inventory.
The new dependency findings below require a maintenance PR after local
validation, followed by the sequential settling gates documented below.

The original checkout is still on `codex/issue-40-manual-activation-checks`
with existing uncommitted edits. Testing and preparation use a detached
worktree at `.local/pr-review-2026-11-27` on
`codex/security-review-2026-11-27`, based on current main. Original
activation edits, deleted rule files, and untracked user files are preserved.
Tracked TanStack/Ultracite rules were read from Git; no Paraglide rule exists.

## Findings and remediation

The fresh full dependency audit found **six moderate advisories**, with no
high or critical advisories:

| Dependency | Finding | Prepared remediation |
| --- | --- | --- |
| `@vitest/mocker` | [Manual mock code injection](https://github.com/advisories/GHSA-qxg6-89mg-rqv8), [Windows allowlist traversal](https://github.com/advisories/GHSA-xp26-3454-mjgp) | Vitest 4.1.11 → 4.1.12 and matching mocker |
| `seroval` | [Typed-array constructor injection](https://github.com/advisories/GHSA-f86p-h4j2-7qgj), [RegExp script injection](https://github.com/advisories/GHSA-9wx9-5pv9-3349) | Existing override 1.6.9 → 1.6.11 |
| `glob` | [Cancellation bypass](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4) | Scoped `ultracite>glob` and `@sentry/bundler-plugins>glob` overrides to 14.0.6 |
| `minimatch` | [Globparts amplification denial of service](https://github.com/advisories/GHSA-g3hv-75wg-m249) | Glob 14.0.6 resolves patched Minimatch 11.x |

The initial audit exposed a deduplicated Glob path through Ultracite; after
patching it, the Sentry build-tool path remained. Both parent paths are now
covered. Glob is a major transitive tooling update, kept scoped to these two
parents. Ultracite CLI and the production build are part of validation.
Sentry source-map upload with real credentials remains deferred.

The updated audit reports **zero advisories at every severity**. This result
applies to the prepared worktree; main remains unchanged until a future commit
and merge. Dependency deprecation notices remain separate maintenance work.

## Verification

- Initial and final frozen-lockfile installs: passed after allowing normal Windows
  package-link permissions; install scripts for Sentry CLI remain unapproved.
- Updated dependency audit: passed, zero advisories.
- Unit/auth tests: 161 passed across 30 files.
- `pnpm format`, `pnpm lint`, and `pnpm run typecheck`: passed.
- Configured `pre-commit run --all-files` private-key scan: passed. Windows
  Git Bash needed normal process permissions. The invocation cleared the
  process-local Sites-only `GIT_CONFIG_COUNT` to avoid Python/Git losing empty
  credential-helper entries; no persistent Git/auth configuration was changed.
- Full serial Chromium suite: **19 passed, zero skipped**, including English
  metadata, public/interactive surfaces, and all five signed-in tiers.
- After GitHub authentication was completed and verified, the full suite ran
  three times with **four concurrent workers, zero retries**, and failure
  tracing enabled: **57 passed, zero failed/skipped** in 1.7 minutes. This
  includes three successful concurrent runs of each previously failing test.
- Vercel-preset production build: passed with test environment excluded.
  Source-map upload was not enabled; existing framework/bundler warnings remain.
- Drizzle schema check: passed. No application schema changed.
- Ultracite CLI check: passed, exercising the patched Glob dependency.
- Gitleaks scans of project specifications and the dependency diff: passed,
  no leaks. Structured active/changelog/archive YAML parses successfully and
  every archive stays below 1,000 lines. The Markdown usage guide happens to
  have a `.yaml` extension; it was not treated as structured YAML.

The first sandboxed browser attempt could not report correctly. The first
normal-permission run passed 17 tests but aborted navigations to `/cookies`
and `/settings` with `net::ERR_ABORTED`. The subsequent full serial run passed
all 19 tests in 53 seconds, without test retries or application/test changes.
The authenticated follow-up then passed all 57 checks concurrently, without
application or test changes. Neither aborted navigation recurred. This is a
reasonable maintenance acceptance baseline for the parked artifact, while the
cause of the original transient aborts remains unproven. The run still logged
aborted background requests during page transitions/teardown; it does not
establish that every background request completed or certify hosted auth.

## Test environment and localization

Reused the retained isolated Neon test branch `br-wild-dawn-al62eyca`, after
verifying its endpoint maps to that branch rather than shared preview or
production. The guarded local seed refreshed only fake tier fixtures and
their subscription periods; production/preview seeding guards remain intact.
Test-only env/credential files remain gitignored. No shared preview or
production database was seeded, and no real billing or email send was run.

The application declares `html[lang=en]`; browser smoke asserts this. There
are no Paraglide catalogs, locale routes, or translated-locale acceptance
targets. English rendering/metadata can be verified; translations cannot.
The artifact remains parked, with hosted auth/provider acceptance deferred
as described in [resumption notes](artifact-resumption-notes.md).

## Access limits and handoff

The initial CLI token was invalid and the connected GitHub tool did not expose
security-alert endpoints. At the user's request, browser/device authorization
was completed before further navigation tests. `gh auth status` and `gh api
user` now verify the active account as `BallLightningAB`, with credentials in
the system keyring. Authenticated API checks show four open medium Dependabot
alerts: #89/#90 for Vitest mocker and #91/#92 for Seroval. All four are covered
by the prepared updates, but remain open on unchanged main. There are zero
open CodeQL alerts, zero open secret-scanning alerts, and zero open PRs.
The registry audit also covered the two Glob/Minimatch advisories that are not
listed in those four hosted alerts. Main's branch metadata
reports `protected: false`; requiring security/test checks before future
merges is a repository-policy follow-up, not a setting changed in this pass.

Local validation is complete for the commit/PR/check/merge sequence requested
after the successful authentication and concurrent-test follow-up. This
maintenance change does not activate hosted auth or paid features.
Memory-bank release is 1.4.1.17; the
previous entry now references the actual #42 squash merge. The changelog was
rotated because its 618 lines exceeded the workflow's 600-line threshold.

For any future PR sequence: wait for all required checks and preview to
finish, allow at least 60 seconds for new review/check results, fetch main,
inspect fresh findings, then rebase only if main advanced. After a merge,
confirm the resulting deployment and public routes before the next PR. Time
alone is not a substitute for passing checks. There is no such progression
to perform while the queue remains empty.

The queue was rechecked after validation and still contained no open PRs.
The original checkout's tracked/untracked work remains unchanged. The review
worktree is retained with the prepared changes and gitignored test artifacts.

Commit message:

```text
fix(security): patch serialization and test/tooling dependency advisories

Refs: I5D14, #42
```
