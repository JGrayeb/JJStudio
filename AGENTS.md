# JJStudio source and release safety

## Canonical application

- The maintained Next.js application is in **site/**.
- Its initial source was verified against all 200 source files from Production deployment dpl_9UMqZFk5SYcxj3d6YpVTKP1rHiiq on 2026-11-16.
- Root-level app/, components/, lib/, content/ and package files are legacy/unreconciled working files. Preserve them; do not deploy or silently overwrite them.
- .codex_build/ contains historical, isolated releases and QA experiments. Never select one as the current source merely because its date/name looks recent.
- Run application validation from site/. Follow docs/RELEASE-PROCESS.md and the reviewed-source manifest once present.
- A local copy and a prepared GitHub workflow do not mean CI is active or the remote repository is synchronized.

## Release boundaries

- Intended Vercel team: jjs-tudio-s-projects / team_DBehXwhISvWA7AVhQ5CBL7pS.
- Intended Vercel project: jj-studio / prj_rrKx2yBYJb9Uoo1f2gtzFjnFdePM.
- Verify the current production alias before any release. Keep a verified rollback deployment reference.
- Preview does not authorize Production promotion. Do not bypass a failing release check.
- Never deploy repository root or send tmp/, artifacts/, snapshots, credentials, .env files, or QA data as application source.
- Do not apply all local Supabase migrations indiscriminately: historical local and remote versions differ.

## Customer data

- Automatic balances remain hidden until the user approves their tested publication.
- Imported contacts are not automatically Auth users or package owners.
- Never merge/link records based only on matching names, email addresses or phone numbers.
- Buyer and beneficiary can differ. Require reviewed stable identity evidence before a future ownership link.
- No real/test payment, balance change, bulk invitations, staff email or 5am automation change is implied by routine validation.
- Private review remains read-only; do not add write actions under a read-only label.
