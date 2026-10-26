# FORM. interface direction

## Brief

FORM. is a self-hosted training and health log. The audience is a person planning workouts,
recording sets and body measurements, and checking nutrition and activity across their own
devices. This pass keeps the existing React/Vite app and every feature. It improves orientation
and hierarchy in the Home dashboard, with a composed desktop layout that keeps the phone flow
compact. No sample measurements or training history are introduced.

## Concept card

- **Idea:** A training week is a working scorecard: planned sessions are marks to keep, and
  completed sessions become part of the record.
- **Anchor:** FORM.'s existing week strip, workout plans, set-by-set logs, body measurements,
  activity, and food records.
- **Metaphor:** A practical training sheet with a clear date rail, a place for today's session,
  and measured side notes.
- **Signature:** The selected day and its plan sit together; finishing work adds a completed mark
  that can be traced to the underlying workout.
- **Emotion:** Focused and steady, without judgement or fabricated performance claims.
- **Motion verb:** Mark, then settle. Small press and hover feedback clarifies controls; reduce
  motion stays complete and calm.
- **Screenshot:** The week rail, today's session, and measured daily activity, with the workout
  action visible at a glance.

## Art direction

The existing dark slate interface remains the base because FORM. is a hands-on tracker used
throughout a session. The account-selected accent remains the only strong interface color and
continues to carry selection and progress. Data colors keep their meaning.

| Role | Source / use |
|---|---|
| Ground | `--bg` (`#0b1224` in the default dark theme) |
| Surface | `--surface` (`#17223a`) for grouped records |
| Ink | `--label` (`#f3f6ff`) |
| Muted | `--label-2` (`#a4b3d0`) for context and units |
| Line | `--sep` (`#293955`) for quiet structure |
| Accent | `--acc`, chosen in Settings; selection and primary action |
| Status | Existing named system colors for done, warning, and error states |

Typography uses the existing platform sans stack so the app stays fast, offline-capable, and
consistent with native wrappers. Headings use tighter tracking; measures use tabular numerals.
The Home page follows one strong alignment edge and uses a 12-column desktop split between the
training agenda and daily measures. The phone remains a single column. Existing card radii are
kept; thin surface edges and spacing do the grouping.

```text
Desktop:  [ FORM. · date · settings                           ]
          [ week + today's training      ] [ nutrition / steps ]
          [ gym check-in                 ] [ welcome / weight  ]
                                           [ training record  ]

Phone:    [ FORM. · date · settings ]
          [ nutrition ]
          [ steps ]
          [ week + today's training ]
          [ check-in ]
          [ welcome / weight / record ]
```

This is a utility, not a showcase page. Its useful state is intentionally still at rest; motion
is reserved for direct feedback and workout state changes. Existing routes and data remain the
source of truth.
