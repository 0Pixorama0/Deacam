# Deacam

Design-engineering skills for Claude Code, vendored from
[emilkowalski/skills](https://github.com/emilkowalski/skills).

Any Claude Code session opened on this repository picks these up automatically.

---

## What is a "skill"?

A skill is a plain Markdown file that Claude reads *only when it's relevant*.

Claude does not hold all 13 of these in its head at once — that would be a waste. At
the start of a session it reads just the `name` and `description` line from each one.
When your request matches a description, it loads that full file and follows it for
that task. Then it moves on.

So a skill is **on-demand expertise**: specific knowledge that shows up exactly when
the task calls for it, and stays out of the way otherwise.

The layout is fixed — Claude Code looks for this exact path:

```
.claude/skills/<skill-name>/SKILL.md
```

Supporting files (`RECIPES.md`, `STANDARDS.md`, `API.md`, …) sit next to `SKILL.md`
and are pulled in by the skill itself when it needs them.

---

## The 13 skills

### Automatic — Claude loads these on its own when the task fits

| Skill | What it does |
|---|---|
| `emil-design-eng` | The umbrella skill: UI polish, component design, and the invisible details that make software feel good. |
| `animate` | Builds a web animation from scratch, in the order that actually decides whether it feels right — should it animate at all, which property, which curve, how it gets interrupted, how it exits. |
| `animate-expo` | Same job for React Native / Expo: Reanimated, Gesture Handler, haptics, keeping work off the JS thread. |
| `apple-design` | Apple's interface and motion principles translated to the web — springs, gestures, depth, typography, restraint. |
| `mobile-native` | The small CSS and meta-tag fixes that stop a web app feeling like "a website in a browser": sticky hover, the 100vh bug, inputs that zoom, tap highlights, pull-to-refresh. |
| `find-animation-opportunities` | Scans a UI for places that *should* move but don't — and rejects the places that shouldn't. Read-only; it proposes, it doesn't implement. |
| `improve-animations` | Audits a whole codebase's motion and produces a prioritised plan other agents can execute. Read-only. |
| `animation-vocabulary` | Reverse dictionary: "the bouncy thing when a popover opens" → *pop in*. For when you know the effect but not the word. |
| `ask-sonner` | Working with Sonner (the React toast library) — setup, promise toasts, and the usual "why is my toast behind the modal" problems. |
| `write-swift` | Modern Swift: value types, Swift 6 concurrency and data-race safety, generics, Swift Testing. |

### Manual only — you have to ask for these by name

These three are deliberately opted out of automatic loading, because they're
heavyweight or opinionated and shouldn't fire on their own.

| Skill | Invoke with | What it does |
|---|---|---|
| `review-animations` | `/review-animations` | Audits existing motion against a strict craft bar. Its stance is to flag by default — approval has to be earned. |
| `pick-ui-library` | `/pick-ui-library` | Opinionated recommendations for charts, OTP inputs, command menus, drag-and-drop, virtualisation, state, styling. |
| `prototype` | `/prototype` | Builds several genuinely different versions of a UI piece behind a visual picker, so you can flip through them and promote the one that feels right. |

---

## Using them

Nothing to install or configure. Open Claude Code in this repository and work normally:

- *"Add a dropdown that animates open"* → `animate` loads on its own.
- *"This feels janky on my phone"* → `mobile-native` loads on its own.
- *"/review-animations"* → runs the strict audit, because you asked for it by name.

To use these on a **different** project, copy the `.claude/skills/` directory into
that project's root. Alternatively, install upstream directly there:

```bash
npx skills@latest add emilkowalski/skills
```

---

## Also here

- `docs/performance-cheatsheet.md` — upstream reference on animation performance.
- `.claude/skills/ATTRIBUTION.md` — the MIT license and the exact upstream commit this
  snapshot came from.

## License

The skills are MIT, © Emil Kowalski. See `.claude/skills/ATTRIBUTION.md`.
