# FORM. implementation notes

FORM. extends the latest main branch of [DuarteSantos8/openGym](https://github.com/DuarteSantos8/openGym). The React/Vite PWA, Capacitor clients, Node API, passkey authentication, JSON profile state, offline cache, Codex Coach, workouts, plans, history, Health Connect, and Apple Health support remain intact. The AGPL-3.0 license and upstream attribution are retained.

## Architecture and persistence

- Frontend: React 19, Vite, Zustand. Main user state is stored under the existing `gym_state_v1` local key and mirrored by the existing mobile file adapter where applicable.
- Server: the existing API stores a profile's complete state in its user-scoped JSON file. The existing authenticated `/api/data` push/pull path carries the additive nutrition and activity namespaces; no new service or database is introduced.
- Existing workouts, routines, bodyweight history, passkeys, and Coach fields remain in the same objects.
- New profile fields are `nutrition` (`goals`, `foods`, `meals`) and `activity` (`stepGoal`, `records`). `mergeHealthState()` fills defaults for existing profiles, old backups, and incomplete new state. There is no SQL schema migration.
- Nutrition entries keep a food snapshot and the amount in grams. Source-food nutrients are explicitly per 100 g. Updating or removing a saved food does not rewrite previously logged meal snapshots.
- Activity records have a profile owner when signed in, source provider and device, local aggregation date, UTC interval, metric, value, unit, external record ID, and synchronization time. The UI records manual steps and active-energy values, and can import deduplicated daily step totals from Health Connect or Apple Health when enabled in Settings. Daily source selection chooses one provider/device by priority and recency, then deduplicates external IDs; it never adds overlapping day totals from different sources.
- Health data is not included in the existing Coach payload. Any future sharing needs its own consent categories and payload tests before connecting it.

## Implemented in this milestone

- FORM. browser metadata, PWA manifest and icon, mobile display names, passkey display name, push notification identity, and Midnight Blue tokens. Native app and relying-party IDs/origins are unchanged.
- FORM. branding for the web title, login/onboarding screens, PWA display name, icons, and Home heading. The source project identity and required media attribution remain credited in Settings and repository documentation.
- Nutrition and Activity are added as Home-linked destinations. The upstream Home, Train, Stats, Library, Coach and Settings navigation remains available, including all existing workout, planning, history, and progress features.
- Manual foods, per-100-g nutrients, grams-based food logging, meal categories, daily calorie and macro goals, editable goal type, and a daily nutrition view.
- Manual steps and active-energy records, configurable step goals, a seven-day steps chart, source labels, and a conservative daily source-priority rule.
- Home dashboard summaries that read from the profile's actual nutrition and activity records.
- Coach destination has an honest not-configured state. It does not fabricate replies or send nutrition/activity data.

## Backup, rollback, and recovery

Before deployment, stop the stack and copy the complete existing `./data` directory, `.env`, and any user-held JSON exports. Restore by stopping containers, replacing those files from the backup, and starting the same release again. The change is additive at the profile-state layer; rolling application code back does not require a database downgrade. Keep the backup until the restored release has been checked. Guest-only browser data should be exported from Settings before clearing browser storage.

Existing profile and export records are not rewritten on upgrade. `mergeHealthState()` supplies defaults in memory and on the next normal save. The native application ID and Android package identity remain unchanged to retain installed-app data; only the visible app name is updated.

## Not implemented or not verified yet

- Saved recipes/meals, barcode scanning, Open Food Facts lookup, meal editing, and AI text/photo food estimation.
- Native workout and weigh-in writes remain upstream; activity step reads are implemented with optional user permission. Resting-energy calculation, total expenditure, and energy-balance history are not implemented. No energy totals are inferred from steps.
- Cross-device conflict UI and a dedicated sync queue for nutrition/activity. Current state follows the existing whole-profile synchronization behavior.
- Expanded Coach consent and payload support for nutrition/activity.
- Full PWA install/update/offline QA and native build/device QA on physical Android and iPhone devices. Native icon and splash assets are regenerated, but have not yet been checked in built apps on devices.
- Production deployment, domain, HTTPS, server backup, and restoration on the target ThinkPad were not run from this workspace.

## License and origin

The repository remains AGPL-3.0-or-later. Upstream copyright/license files and exercise-data attribution are preserved. The public source link uses the requested repository URL, and Settings identifies the project as forked from DuarteSantos8/openGym.
