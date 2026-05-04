# Changelog Archive Index

The active memory-bank initialization workflow reads the current files in
`specs/memory-bank/` and `specs/current-changes/`. It does not read archived
changelog files unless a task explicitly needs historical release detail.

Archive files are closed history. Keep every archive file at or below 1,000
lines so the memory-bank can be initialized without oversized context files.

## Closed Archives

- Latest closed archive:
  `changelog-archive-2026-04-21-to-2026-04-26-v1.1.21-to-v1.4.1.yaml`
- Older archive:
  `changelog-archive-2026-03-17-to-2026-04-21-v1.0.5-to-v1.1.20.yaml`

Future automatic rotations use quarter-numbered files such as
`changelog-archive-2026-Q2-1.yaml`, then create `...-2.yaml` before appending
would push the current archive over 1,000 lines. Within the same quarter, the
highest number is the latest closed archive.
