# FORM. complete interface redesign plan

Date: 27 October 2026
Status: planning complete; application redesign not implemented.
Scope confirmed by the user: the React app in `opengym`.

## 1. Brief and boundaries

FORM. is a personal training and health log built on openGym. Its useful loop is plan a session, perform the work, record actual results, and decide what comes next. The redesign should make that loop obvious and satisfying on a phone in the gym, while giving planning and review room to breathe on a desktop.

Audience: people using their own training records, from a first routine to advanced strength, timed, cardio, and grouped exercise sessions. Existing users must retain their preferred units, layout options, account accents, scheduling mode, and data.

Job: get someone to the right next action quickly, make logging dependable with one hand, and explain progress through underlying records. Visual ambition belongs in typography, composition, and transitions between useful states.

Stack decision: retain React 19, Vite, React Router's hash routes, Zustand, current CSS, and Capacitor. They already support offline records, native wrappers, timers, history, and platform integrations; a framework migration would add risk without improving this interface.

This plan covers the product application, including authentication, onboarding, primary destinations, inner screens, sheets, Coach, settings, and administrative surfaces. The separate `website/` marketing site is outside this pass. Do not add the Budget/Daily features from the unrelated older Android brief.

Planning assumptions:

- The app remains offline-capable, with existing server/account behavior preserved.
- Monochrome becomes the default art direction. Existing user-selected accents remain supported and are treated as preferences, not silently reset.
- No new AI capabilities, health imports, training calculations, or authentication providers are implied by a redesigned screen.
- Example labels and wireframe values below are design fixtures only. They must never seed a real account.
- Changing destination names and adding a Health overview are intentional information-architecture changes. Existing deep links remain valid.

## 2. Evidence and present problems

Reviewed: `App.jsx`, `components/TabBar.jsx`, `index.css`, `Home.jsx`, the route inventory, Plan, Nutrition, Activity, Stats, Library, Coach, FocusView, settings organization, and the existing design notes. Visually reviewed local guest-mode Home and Plan through the browser on 27 October. This was an audit of the current development interface, not production performance verification.

| Evidence | Problem | Design response |
|---|---|---|
| Home's source and reading order put Nutrition and Activity before Training; desktop CSS visually reorders them | Priority and reading order differ across devices | Put the session first in both DOM and visual order |
| TabBar contains Home, Plan, a prominent Start action, Stats, Exercises | An action occupies the same hierarchy as destinations; health is indirect | Five destinations plus a separate Start/Resume action |
| Fresh guest Home shows Rest Day, zero nutrition/activity totals, and a zero-week streak | Unconfigured and unrecorded states look like established outcomes | Explicit unconfigured/no-record states; omit premature streak framing |
| Empty Plan displays a large empty-state area followed by seven Rest day rows | Repetition, dead space, and ambiguous meaning | One compact setup invitation; distinguish unassigned from intentional rest |
| Home has a broad two-column layout while Plan remains a narrow centered stack | Desktop feels like unrelated page widths | Shared shell and a defined width policy per task |
| Default surfaces use blue-slate fills; cards and nested controls have several radii | The app's identity is mostly tinted containers | Neutral grounds, fewer containers, stronger type and state grammar |
| Health summary detail drops to 9–10px on small widths | Secondary information becomes difficult to read | Reflow the value and unit rather than shrinking them |
| Plan uses multiple mode/section switches and a menu for broader operations | Similar-looking controls answer different questions | Separate current view from scheduling model and advanced operations |
| Seasonal decoration appears on audited Home and Plan | Decorations compete with useful state in a task interface | Preserve opt-in preference; constrain it outside active logging and key controls |

Not yet established: populated-screen usability, actual phone ergonomics, screen-reader behavior, all themes and locales, device keyboard behavior, or production performance. These belong to implementation QA, not claims about the current build.

## 3. Three concept territories

Scores: 1–5 for originality, product fit, feasibility; portability is also 1–5, with lower better. These are concept-selection judgments, not jury scores.

### A. Name: Form takes shape

A routine is assembled from exercise shapes, then resolves into its recorded form.

- Anchor: FORM.'s routine editor, muscle maps, and recorded sessions.
- Signature: a routine composition expands into the workout's exercise structure.
- Emotion: considered, visual, approachable.
- Screenshot: an asymmetric routine layout paired with its real muscle map.
- Rules: generous composition, anatomical media, modular exercise units, assembly motion.
- Scores: originality 4; fit 4; feasibility 3; portability 3.
- Weakness: body imagery could suggest technique analysis the app does not provide.

### B. Training material: The next set [selected]

The interface behaves like a training sheet: one next action is clear, and prescribed work becomes a permanent record only when logged.

- Anchor: actual set confirmation, previous-performance context, rest transitions, session recovery, and the distinction between routines and history.
- Signature: completing a set locks the recorded row into place, starts the appropriate rest state, and presents the next eligible action without moving the user's input unexpectedly.
- Emotion: prepared, decisive, steady.
- Screenshot: a large exercise name, readable load and reps, one active row, and completed rows receding into an ordered record.
- Rules: aligned numeric columns, outlined targets versus checked records, one dominant action, movement that advances and locks.
- Scores: originality 4; fit 5; feasibility 5; portability 2.

### C. Process: Intention and evidence

Every summary pairs what was planned with what actually happened and lets the person inspect the difference.

- Anchor: planned sessions, completed logs, progression explanations, and historical corrections.
- Signature: opening a progress measure reveals the relevant dated records and its calculation context.
- Emotion: trust, clarity, ownership.
- Screenshot: a selected exercise trend with its matching sessions alongside it.
- Rules: paired comparison, dated annotations, direct chart labels, detail unfolding in place.
- Scores: originality 3; fit 5; feasibility 4; portability 3.
- Weakness: comparison could dominate the immediate job of training.

Selected B because it creates an identity out of the product's most frequent and consequential interaction. Borrow C only for explaining progress, not as a second visual metaphor.

### Concept card

```text
Idea:        Know your next set. Keep an honest record of the work.
Metaphor:    A training sheet used between sets, then filed as history.
Signature:   Target row becomes recorded row, rest begins, next action appears.
Recipe:      Shared-element row/state transition; preserve stable row identity.
Emotion:     Ready and in control within the first three seconds.
Motion verb: Advance, then lock.
Screenshot:  Exercise title + active set + large inputs + completed record.
```

The concept must survive beyond Workout: Today shows the next session; Plan shows prescribed work; Library selects the next movement; Health labels what has been recorded; Progress traces claims to records; Coach distinguishes proposed changes from applied changes; a missing page offers a route back to the user's work.

## 4. Art direction system

### Palette

Default dark palette derives from charcoal training equipment, chalk marks, and an uncoated working sheet. The reason for a dark surface is gym use and continuity with the current app; neutral colors replace the blue tint.

| Role | Dark | Light | Use |
|---|---|---|---|
| Ground | `#101112` | `#F5F6F4` | App field |
| Surface | `#1B1D1F` | `#FFFFFF` | Inputs, dialogs, grouped records |
| Ink | `#F3F4F0` | `#181A1B` | Primary type and values |
| Muted | `#B1B5B7` | `#555C60` | Secondary readable information |
| Line | `#3D4346` | `#C8CDCF` | Dividers, quiet structural edges |
| Action | `#E4E9E0` | `#242C25` | Default primary action and selected mark |

Action text uses Ground in dark mode and white in light mode. The route-transition backdrop uses Ground, not a seventh decorative color. Lines are structural; essential input boundaries and focus indicators need their own tested contrast treatment.

Existing success/warning/error colors remain semantic aliases, always accompanied by words or icons. A user accent can override selection/action roles after contrast checks; it must not recolor every surface or change status meaning. Remove any assumption that 17px semibold text automatically qualifies for the relaxed large-text contrast threshold. Test normal-sized button labels at 4.5:1.

### Typography

Use Manrope for headings and interface copy, self-hosted from the OFL-licensed assets already included with the supplied FORM. source archive after verifying the font files and license. Keep a platform sans fallback. This gives the React app a deliberate FORM. identity without adding a network dependency. Use the same family's tabular figures for data; do not add a mono family merely to make small labels look technical.

| Role | Phone | Desktop | Weight / tracking / leading |
|---|---|---|---|
| Session display | 36–44px | 48–64px | 650–700 / -0.04em / 1.02 |
| Page heading | 28–32px | 36–44px | 650 / -0.035em / 1.1 |
| Section heading | 20–24px | 22–28px | 600 / -0.02em / 1.2 |
| Active numeric value | 32–40px | 40–48px | 600 / -0.025em / 1.1 |
| Body / input | 16–18px | 16–18px | 400–500 / -0.01em / 1.5 |
| Metadata / navigation | 13–14px | 13–14px | 450–550 / 0 / 1.4 |

Use fluid clamp ranges on the web, not viewport-only sizing. Keep numeral/unit pairs together; values may wrap onto a second line. At large text sizes, headings can wrap and navigation can reflow. Data entry stays readable with text enlargement. No headings so large that they push logging controls below the first viewport.

### Grid, rhythm, and geometry

- Phone: 4-column underlying grid, 20px margins at 390px, 16px at 360px, 12px gaps. Core tasks use one column.
- Tablet 768–1099px: compact navigation rail, 24px gutters, optional supporting pane when both panes remain usable.
- Desktop from 1100px: 216px navigation rail, 32–40px gutters, 12 content columns, maximum content width 1280px.
- Reading forms cap at 640px; workout workspace caps near 960px; planning and progress may use the full content grid. Align each page's title with its main content.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64px. Dense logging uses 8–12px; Today uses 24–32px; onboarding uses 48px pauses.
- Radius rule: 8px for controls and contained surfaces; 16px only for the outer edge of modal sheets. Circular shapes are reserved for appropriate icon controls and timer marks.
- Group using spacing and one surface boundary. Avoid card inside card, colored icon tiles on every row, and repeated shadows.
- Use native scroll. Reserve bottom space for safe areas, navigation, session return, and the on-screen keyboard.

### Motion and feedback

The product is intentionally still at rest. Never make numbers, food totals, charts, or training targets drift. Time-dependent countdowns are real state, not decorative idle motion.

- One family: existing `--ease: cubic-bezier(.32,.72,0,1)`.
- Press: 100–140ms, subtle 1–2% compression on the inner visual layer; hitbox stays fixed.
- State change: 160–220ms; selected indicator advances and stops cleanly.
- Sheet/detail transition: 220–280ms, larger surfaces move more slowly.
- Signature set transition: 220–320ms, with the recorded check, rest state, and next-row emphasis tied to the same completion event.
- Desktop primary buttons invert their full fill and shift the inner label 1–2px. Navigation moves a selection marker; utility links may use simpler feedback.
- No loader theatre, smooth-scroll layer, parallax, WebGL, or custom cursor in the application. These do not earn their cost during logging.
- Keep current page motion for routine navigation. If a signature sequence requires GSAP, use one scoped timeline and ticker for that sequence; do not add competing animation loops or replace timestamp-based timers with animation progress.
- Animate transform and opacity; preserve row height and input focus. Don't reorder DOM rows while a person edits a set.
- Reduced motion: immediate semantic state changes, no animated travel; every value and confirmation remains visible. Announce completed set and rest state without reading every timer tick.

## 5. Information architecture

Mobile bottom navigation: **Today · Plan · Health · Progress · Library**. All five are destinations. Start/Resume is a separate, labelled action above the navigation; its placement is consistent with the screen's primary action zone.

Desktop: same destinations in a left rail, with Settings/account below. Coach is a labelled secondary entry when available and a contextual action in Plan/Progress. It does not displace a primary destination. During an active workout, the rail remains reachable but a compact session-return strip persists across destinations.

| Proposed destination | Existing route or implementation | Children / links |
|---|---|---|
| Today | `/home`, retain link compatibility | Today's session, quick logs, check-in |
| Plan | `/plan` | Schedule, Routines, `/plan/r/:id`, Coach |
| Health | New `/health` overview | Existing `/nutrition`, `/activity`, body weight, measurements, photos |
| Progress | Existing `/stats`, label changes only | `/history`, exercise progress, structural balance, body records |
| Library | Existing `/library` | `/muscles`, exercise detail, favorites, custom exercise |
| Active session | Existing `/workout` | Start chooser, session, review, historical editing |
| Coach | Existing `/coach` and setup/intake routes | Context, proposal review, decisions |
| Settings | Existing `/settings/:page` | Preserve search and platform visibility rules |
| Admin | Existing `/admin` | Existing authorization boundary |

Measurements and photos may be reached from both Health and Progress; preserve the originating destination on Back. Deep-link fallbacks select the canonical parent. Do not indicate Today as selected just because nutrition was historically reached from Home.

Bottom action rules:

1. No active session: Today offers Start planned session or Choose workout. Other destinations offer their own primary action, with Start workout in a compact shared action menu.
2. Active session elsewhere: Resume with session name and elapsed time replaces the shared Start action. It never starts another session.
3. In Workout: Log set or rest controls own the bottom action zone. Global Start is absent, and Finish is a distinct header/menu action with review.
4. While editing a historical workout: show Editing saved workout, never a live clock or Resume label.
5. Keyboard open: inputs and local form actions remain visible; navigation and return strips yield space without losing state.

## 6. Screen-by-screen composition

Wireframes show hierarchy, not final copy or real user data. Each screen uses the layout appropriate to its task rather than one universal card template.

### Today: session-led composition

```text
PHONE                             DESKTOP
FORM.                 Settings    [rail] Today / date
Today / date                             [Next session: 8 cols] [Week: 4 cols]
[Next session title]                      [exercise preview   ] [quick logs   ]
[routine context + Start]                 [recent session row across content]
[compact week rail]
[food / activity as readable rows]
[latest body record or Log weight]
[recent workout]
[Today Plan Health Progress Library]
```

The session is the hero, using a large routine title and a short exercise preview, not a dashboard metric. Weekly context supports it instead of dominating the top. Quick logs are a ledger of values and dates, with clear actions. Check-in appears as a compact shortcut if enabled.

Design distinct states: no plan, intentional rest, planned, active, completed, and editing history. No plan reads Set up your training, not Rest day. After completion, show the actual session and Review workout. Keep Train again as secondary. An intentional rest day names the next scheduled session if known. Without a record, show No activity recorded rather than assuming measured zero. If the model cannot distinguish missing from zero, add a narrowly scoped presence selector before changing the copy.

### Plan: schedule beside routine inventory

```text
[Plan]                              [Create routine] [Options]
[Schedule | Routines]                 Scheduling: Fixed week [Change]
DESKTOP: [week agenda: 7 cols]       [routine inventory: 5 cols]
PHONE:   [date / session rows]
         [assign / move actions]
         [routine inventory below or separate tab]
```

Keep Fixed week versus Rotation as an explicit model choice with an explanation and preview of its effects. It is not another visually equivalent top-level tab. Rotation shows the real sequence and current position rather than pretending to be a weekday calendar. Days with nothing assigned say Unassigned; planned recovery days say Rest if that distinction is supported by stored state. Otherwise use No session planned without inventing a new rest flag.

A new account gets one compact invitation to choose a starter plan or create a routine. Do not render seven redundant setup prompts. Preserve multiple routines per day, one-day overrides, queue behavior, import/export, print/share, and existing approval semantics. Dragging can accelerate desktop rearrangement; Move to… remains the accessible primary equivalent.

### Routine editor: structured prescription

```text
[Back] Routine title                 [Save / saved state]
[exercise order]  [selected exercise prescription]
                  Sets / reps / load / rest
                  [Advanced settings disclosure]
[Add exercise]
```

Phone stacks the order list and selected exercise, with an explicit route back to the list. Desktop allows a master/detail arrangement. Basic prescription stays visible; progression, warm-ups, superset grouping, and advanced targets are labelled disclosures. Never hide current non-default settings: show a short summary even when collapsed. Preserve draft behavior and leave/save decisions.

### Workout: the signature work surface

```text
[Back] Session name          Elapsed     [Finish]
Exercise name, large                         [Menu]
Previous performance / target explanation
Set       Load            Reps          State
1         recorded        recorded      Done
2         [input]         [input]       Current
3         target          target        Planned
[rest status or next action]
[                  Log set                    ]
```

Give the active input row enough room for large touch targets; previous performance supports the current decision. Target values remain visually distinct from recorded values even when prefilled. Log set is the explicit confirmation; field focus, timer expiry, or navigation does not complete a set.

Keep the existing FocusView and supported Cards/List/Compact choices, harmonized to the same tokens. Do not remove advanced logging to simplify the first frame. Place warm-up/drop/rest-pause, unilateral, equipment, load convention, plate math, RPE/RIR, substitution, notes, and add-set operations behind clear contextual controls with visible summaries when active.

On completion, change the stable row to a checked recorded state. Start only the rest interval allowed by existing rules. Emphasize the next eligible set; preserve keyboard focus and avoid a viewport jump. A rest display offers adjust/skip and uses existing timestamps. Undo restores the log and dependent state through existing domain actions, not visual reversal alone. Pause, backfill, session recovery, supersets, and editing history each retain explicit state labels.

Desktop uses an exercise-order pane plus an active exercise pane; phone keeps one focused work area with an expandable order list. Media is supporting reference, never large enough to push the active controls off-screen.

### Finish and saved-session detail: review then record

```text
[Review session]
[actual duration / exercises / logged work]
[Completed and unfinished work, with clear labels]
[Notes / optional feedback]
[Back to session]                     [Save workout]
AFTER SAVE: [recorded result] [View history] [Return to Today]
```

No confetti or fabricated achievement. Show only verified PRs according to existing definitions. Preserve incomplete sessions honestly. Retain current routine-update decisions as separate explicit choices rather than silently modifying the plan on save. Historical correction displays its effect and keeps the current undo behavior.

### Health: records and sources

```text
[Health]                              [Date control]
[Nutrition: primary daily total + Log food]
[Activity: steps / source / recorded time]
[Body: latest weight + date / Log weight]
[Measurements]                       [Private photos]
```

On desktop, nutrition occupies the larger pane and activity/body records form a supporting column. On phone, use distinct vertical sections with readable unit lines. Do not wrap every nutrient in a separate card.

Nutrition detail: one daily energy measure, protein and other supported nutrients as labelled horizontal measures, followed by meal groups. Add food opens search/recent/custom paths, quantity and unit entry, then a reviewable save. Unknown nutrients remain unknown. Do not imply the user has eaten zero just because no foods are logged; a logged zero may be valid.

Activity detail: period and source appear beside totals. Manual total replacement is described before save. Retain existing preferred-source/deduplication behavior. Do not imply Health Connect exists on a platform where it does not. Body records show last recorded date; photos retain existing privacy and deletion controls. No new photo inference or automatic uploads.

### Progress and history: a measure with evidence

```text
[Progress]                     [Period / compare]
[one primary selected measure + summary]
[large chart: 8 cols]        [definition / records: 4 cols]
[Training | Body]            [Exercise selector]
[dated session history rows]
[advanced: fatigue / balance / volume details]
```

Default to a training overview that answers what was recorded in the selected period. Put dense specialist analysis behind labelled sections. Keep all existing metrics available, including structural balance, effort, fatigue, lifetime volume, exercise records, and bodyweight trends. Do not substitute new formulas during visual work.

Use directly labelled axes and values. No decorative sparklines pretending to be analysis. Chart selection exposes corresponding records in a panel on desktop and an inline detail area on phone. Keyboard and text alternatives work without pointer scrubbing. Missing data stays a gap. Every comparison identifies period, units, and relevant calculation basis. History is a searchable dated list with detail, edit, export, and current repeat-workout behavior retained.

### Library and exercise detail: search first

```text
[Library]                      [Add custom exercise]
[Search exercises ___________________________]
[Muscle] [Equipment] [Favorites] [More filters]
RESULT ROW: thumbnail / name / equipment / key muscles
DETAIL: movement reference / technique / history / Add
```

Search owns the first action. Show an honest result count and active filters; give every filter a clear removal path. Optional body-map browsing is a useful alternate entry, not a gate before results. On desktop, results and selected detail coexist. On phone, detail gets its own focusable screen or full-height sheet.

When entered from a routine or workout, retain that context and label Add to routine or Add to workout. Standalone browsing must not accidentally start a session. Preserve custom media, attribution, equipment profiles, aliases, and localized exercise naming. Missing media uses an intentional text-first row.

### Coach: context, proposal, decision

```text
[Coach]                         [Connection / settings]
[What Coach can access / current context]
[conversation]
[proposal: changes / rationale / affected routine]
[Review changes] -> [before and after] -> [Apply]
[composer / attachment controls if supported]
```

Use readable conversation width, not a dashboard of promotional AI cards. A proposal is a review surface with an explicit proposed/applied/rejected status. Show which routine or session it concerns, the changed targets, and any current validation constraints. Keep consent, provider configuration, streaming, failure, cancel, and retry states. Preserve draft input when a request fails. Never show a typing animation as evidence of an unavailable provider.

On desktop, proposal review may sit beside chat. On phone, it opens into a clear review screen with a stable Apply action. No automatic application of suggestions. Live Coach files are already modified in the workspace, so review their final behavior before touching their presentation.

### Settings, account, onboarding, and administration

```text
[Settings] [Search preferences]
Account / connection status
Training and equipment
Health and units
Appearance and accessibility
Notifications and devices
Data / export / backup / privacy
Advanced / administration when authorized
```

Keep existing searchable nested pages and platform-specific visibility. Grouping labels can change, but current settings and deep links remain reachable. Show current values and a concise consequence where needed. Destructive data operations live in a distinct final group with their existing confirmations.

Sign-in: direct brand statement, passkey action, account creation, device-code recovery, guest entry, and a plain explanation of where data lives. No abstract hero animation before sign-in.

Onboarding: choose only what is needed for a useful first session; units, available equipment, and starter-plan choice can be progressively requested. Manual setup remains available. Reuse existing profile/onboarding flows; any new interview logic is a separately estimated feature, not assumed part of styling.

Admin: apply the shared shell, type, tables, filters, and status components. Preserve authorization and server-side enforcement. No account or security change is inferred from this plan.

Missing route: replace the unconditional wildcard redirect with a useful recovery screen that retains the shell, explains that the view was not found, and links to Today or Resume. A client-side hash-route fallback is not a claim of an HTTP 404 status.

## 7. Shared components and state contract

Build a small product system rather than a collection of screen-specific overrides.

| Component | Responsibility | Required states |
|---|---|---|
| AppShell / Navigation | Rail, bottom destinations, safe areas, current location | Phone, desktop, keyboard, active session |
| PageHeader | Title, context, primary/overflow actions | Back navigation, long title, busy |
| ActionButton / IconButton | Primary, secondary, destructive, utility roles | Hover, focus, press, busy, disabled |
| SegmentedControl | Switch a peer view | Keyboard arrows, selected, overflow |
| SessionPanel / SessionReturn | Next planned session or recoverable active work | No plan, rest, planned, live, finished, historical edit |
| SetRow / SetEntry | Stable identity, targets and actual values | Planned, current, done, warm-up, invalid, paused |
| RestControl | Real countdown and allowed adjustments | Running, skipped, ended, restored |
| RecordRow / MetricValue | Value, units, period, source | Present, missing, partial, stale |
| FilterBar / SearchField | Query, filters, count, clear | Searching, empty, no matches, offline |
| Sheet / Dialog | Modal interaction and actions | Focus trap, Escape/Back, keyboard, unsaved input |
| StatusNotice / Toast | Saved, undo, sync, permission and error feedback | Retry, offline, conflict, expiration |
| ChartFrame | Labels, period, chart, text/table alternative | Empty, one point, missing intervals, selection |
| ProposalReview | Explain pending changes before Apply | Proposed, invalid, applying, applied, rejected |

Loading uses structural placeholders only for genuinely pending data. Offline data appears immediately when available. Errors state what failed and whether input is preserved. Never replace existing values with zero while a fetch is pending. A sync warning lives in one consistent shell location with access to details; avoid stacked banners and toasts saying the same thing.

## 8. Implementation map and migration strategy

The repo already contains uncommitted work in API Coach modules and frontend Coach, Plan, Nutrition, and CSS files. Implementation must build on that work without resetting it. This planning pass changes only this document.

Suggested organization, adapted to existing conventions during implementation:

- `src/styles/tokens.css`: palette, type, spacing, radii, motion, focus roles.
- `src/styles/shell.css`: navigation, page widths, safe-area/action placement.
- `src/components/`: shared shell/header/actions, session return, record rows and chart frame.
- `src/views/Health.jsx`: new overview composed from existing health selectors and actions.
- `src/components/TabBar.jsx`, `src/App.jsx`: navigation labels, parent mapping, new Health route, recovery route.
- `src/views/Home.jsx`, `Plan.jsx`, `RoutineEdit.jsx`: hierarchy, setup, prescription views.
- `src/views/Workout.jsx`, `FocusView.jsx`, `FocusView.css`: set-entry system and active state treatments.
- `src/views/Nutrition.jsx`, `Activity.jsx`, `Measurements.jsx`, `ProgressPhotos.jsx`: health family.
- `src/views/Stats.jsx`, `History.jsx`, `StructuralBalance.jsx`: review family.
- `src/views/Library.jsx`, `Muscles.jsx`, `sheets.jsx`: browsing and contextual pickers.
- `src/views/Coach*.jsx`, `components/CoachConsentSheet.jsx`: presentation over existing Coach contracts.
- `src/views/Settings.jsx`, `settings-pages.js`, Login/onboarding/Admin views: remaining surfaces.
- `src/lib/i18n.js` and locale packs: new labels and copy using existing translation conventions.

Extract tokens first, then move component rules out of `index.css` as each component is migrated. Do not append a second global redesign stylesheet full of increasingly specific overrides. Keep a temporary explicit scope for migrated components; remove superseded rules when their last consumer is migrated. No permanent parallel theme engine.

Preserve Zustand/store contracts and domain actions wherever possible. A UI-only migration must not rewrite workout history, change set IDs, convert units in persisted records, rename saved preference keys, or alter progression logic. New presence selectors and route-parent context are small explicit changes with separate behavioral checks.

## 9. Rollout sequence and review gates

Each stage produces a coherent reviewable result. Stages are ordered by dependencies rather than a promised calendar deadline.

| Stage | Deliverable | Exit condition |
|---|---|---|
| 0. Baseline | Current route/state inventory, populated and empty fixtures, phone/desktop captures | Critical flows and existing data contracts identified; baseline failures recorded |
| 1. Foundation | Tokens, fonts, buttons, inputs, shell, navigation, modal behavior | Light/dark, custom accent, keyboard, safe-area and type scaling checks pass |
| 2. Daily loop | Today, session return, Workout, rest, finish and saved detail | Start → log → rest → leave → resume → finish → history works with honest actuals |
| 3. Planning and discovery | Schedule/rotation, routine editor, Library and exercise detail | Assignment, substitution, multiple routines, custom exercise, and save/Back work |
| 4. Health and evidence | Health overview, food/activity/body records, Progress and History | Missing versus zero correct; source rules unchanged; chart data matches records |
| 5. Supporting workflows | Coach, account, onboarding, settings, admin, missing-route screen | Consent, Apply, search, visibility rules, and recovery work without lost input |
| 6. Full QA and restraint pass | Production-build review, fixes, fresh critique, final documentation | All acceptance criteria below met; weakest unnecessary decoration removed |

Before broad implementation, produce detailed static compositions for Today, Workout and Plan at 390px and 1440px, including empty and active states. These establish the reusable system; they are implementation artifacts still to be made, not completed mockups attached to this plan. Include Health and Progress compositions in the next review so the concept is tested beyond training.

Priorities if scope must be reduced: logging accuracy and recovery first, then orientation and readability, then planning and evidence, then animation polish. Never trade an existing working log path for a prettier prototype.

## 10. Acceptance and QA plan

Run against a production build. Cover at least one instance of every route type and every workflow below. Complete two full visual passes; each pass includes actual screenshot review and an independent critic brief from the awwwards skill. Scores require evidence and are reported only after implementation.

### Functional journeys

- New guest → starter routine or manual routine → first workout, without invented history.
- Existing fixed-week and rotation users → correct next session and all scheduling modes preserved.
- Planned and freestyle start → explicit set confirmation → rest → undo → finish → saved history.
- Strength, bodyweight, timed, cardio, unilateral, warm-up, drops, rest-pause, and supersets in each supported layout.
- Pause → route exit → Resume; reload/relaunch during session and during rest; timestamp recovery preserved.
- Edit historical workout → save/discard → recalculated summaries, with no live-session timer confusion.
- Log/edit food, manual activity replacement, bodyweight and supported body records; no duplicate source totals.
- Coach request → review → Apply or decline, including disabled feature, consent, invalid proposal and provider failure.
- Settings search, theme, accents, units, languages, equipment profiles, reminders, device links, import/export and backups.
- Guest/account transitions and native Back behavior retain current safety rules.

### Visual, access, and responsive checks

- Widths: 360, 390, 768, 1024, 1440px, plus landscape and an open keyboard. Include native iOS/Android safe-area checks because web success does not certify WebView behavior.
- Keyboard-only navigation, visible focus at every stop, labelled icons, modal focus restore, Escape/Back order and no hidden focus targets.
- Screen-reader review of destination/current state, set confirmation, validation and alerts. Timer updates do not overwhelm announcements.
- Normal-text AA contrast of at least 4.5:1; meaningful non-text control contrast at least 3:1. Test light/dark and each supported accent treatment.
- Main touch controls aim for 48px, never below 44px. Input labels remain associated and visible. Test 200% text zoom, long translations, Arabic/RTL and long exercise names.
- No horizontal overflow. Fixed action bars never cover the final row, modal actions, input errors or keyboard-focused fields.
- Reduced motion exposes all content and suppresses animated travel. Hover is an enhancement; touch has the same functions.
- Every primary pointer target has considered press/hover/focus feedback, beyond a text-color swap alone.

### Performance and release checks

- Reuse lazy loading and local data paths; load charts/Coach/media only when appropriate. Self-host/subset fonts, with readable fallback during load.
- Target throttled mobile LCP below 2.5s, CLS below 0.05, responsive input, and smooth scrolling near 60fps. Measure on the actual production artifact and state fixture; do not claim from visual inspection.
- Compare bundle and route load cost with baseline; no animation dependency added without a visible benefit. No new continuous render loop on a resting screen.
- Zero new console errors, serious/critical axe violations, broken deep links or missing essential assets. Document pre-existing environment/service failures separately.
- Run the relevant existing behavioral and layout suites after each stage. Update assertions tied to labels/navigation while retaining domain coverage. Run the full frontend suite and build before release; include relevant API tests only when behavior there changes.
- SEO work applies to public marketing pages separately. Private hash-routed records should not be published through sitemaps, social previews, or indexable user-data pages.
- Deployment is a later explicit action. This planning request authorizes a plan, not a release.

## 11. Genericness and restraint check

A generic fitness redesign would use glowing rings, colored metric tiles, large stock athlete photos, and streak pressure. This direction replaces those defaults with the actual prescription-to-record transition, a readable set sheet, measured hierarchy, and source-backed progress.

Changes made during planning: moved the session before health in reading order; replaced the central navigation action with Health; separated unassigned days from intentional rest; committed to neutral material colors and type instead of another blue dashboard; reserved the signature motion for actual logging; made stillness a deliberate product choice.

The recognisable frame is the active set, not a decorative hero. The final restraint pass should first question colored icon tiles, repeated cards, decorative seasonal overlays and redundant summary measures. Keep feedback and state clarity.

## 12. Completion record

Completed now: current-source audit, visual inspection of guest Home and Plan, confirmed scope, three concepts, selected concept, art direction tokens, information architecture, screen compositions, state contract, implementation map, rollout and acceptance plan.

Not completed or claimed: redesigned application code, high-fidelity mockups, production QA, user testing, measured performance results, an external critic score, or deployment. No user-data placeholders need replacing because no records or production content were created. The wireframes use generic labels and must be populated from the user's real state during implementation.
