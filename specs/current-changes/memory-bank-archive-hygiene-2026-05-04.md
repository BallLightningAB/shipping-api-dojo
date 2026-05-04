# Memory Bank Archive Hygiene

Date: 2026-05-04
Branch: `codex/issue-36-production-readiness`
Scope: Keep memory-bank initialization and changelog archive rotation below the
1,000-line file limit.

## Changes

- Split the oversized
  `specs/memory-bank/changelog-archive/changelog-archive-unknown-dates.yaml`
  archive into two closed archives under 1,000 lines.
- Added `specs/memory-bank/changelog-archive/README.md` to identify the latest
  closed archive and explain the quarter-numbered archive sequence.
- Updated `scripts/rotate-changelog.sh` so it creates a fresh archive file
  before appending would exceed `MAX_ARCHIVE_LINES` (default: 1,000).
- Fixed archive date parsing for extracted changelog entries that begin with
  `- date:`, so future rotations use quarter-based archive names instead of
  falling back to `UNKNOWN`.
- Updated the global `initiate-memorybank.md` workflow outside the repo so
  thread initialization reads only active memory-bank files by default and
  skips `specs/memory-bank/changelog-archive/` unless historical detail is
  explicitly needed.

## Validation

- `bash -n scripts/rotate-changelog.sh`: passed.
- Temp-file rotation test: passed, creating `2026-Q2-1` and `2026-Q2-2`
  archive files when a low test cap would otherwise be exceeded.
- Active memory-bank and current-change files: all under 1,000 lines.
- Changelog archive files: all under 1,000 lines.
