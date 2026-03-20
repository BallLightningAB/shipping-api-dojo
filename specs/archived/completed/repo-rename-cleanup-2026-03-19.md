# Repo Rename Cleanup

Date: 2026-03-19
Scope: Final cleanup after renaming the local folder and GitHub repository from `api-trainer` to `shipping-api-dojo`.

## Goals

- update local memory-bank/spec references that still pointed at the old repo name
- rename stale spec artifact filenames that still carried the old repo slug
- verify GitHub MCP access against the renamed repository
- verify Vercel MCP access against the corresponding Vercel project

## Local Cleanup

- renamed `specs/api-trainer-pdd.yaml` to `specs/shipping-api-dojo-pdd.yaml`
- renamed `specs/current-changes/api-trainer-pre-planning-info.yaml` to `specs/current-changes/shipping-api-dojo-pre-planning-info.yaml`
- updated memory-bank and spec references from `github.com/BallLightningAB/api-trainer` to `github.com/BallLightningAB/shipping-api-dojo`
- updated internal file references so docs now point at the renamed spec artifacts

## Verification

- Git remote now points to `https://github.com/BallLightningAB/shipping-api-dojo.git`
- GitHub MCP resolves `BallLightningAB/shipping-api-dojo`
- Vercel MCP lists a `shipping-api-dojo` project under the Ball Lightning team
- the local workspace is linked to Vercel via `.vercel/project.json`

## Follow-Up Note

- the remote Vercel project still reports historical `api-trainer` deployment metadata and domains, so the Git/Vercel linkage should be rechecked in the Vercel UI before relying on automatic deploys from the renamed repo
