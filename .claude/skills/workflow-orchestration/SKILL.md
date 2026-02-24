---
name: workflow-orchestration
description: Workflow discipline for complex tasks. Enforces plan-first thinking, structured task tracking, subagent delegation, verification-before-done, and continuous self-improvement via lessons learned. Use PROACTIVELY at the start of any non-trivial task (3+ steps, architectural decisions, multi-file changes). Also use when the user says "plan this", "break this down", "track progress", or when a task feels complex enough to warrant structure.
---

# Workflow Orchestration

Behavioral discipline for HOW to work — not what tools exist, but WHEN and WHY to use them.

## 1. Plan Mode Default

Enter plan mode (`EnterPlanMode`) for ANY task with:
- 3+ implementation steps
- Architectural decisions
- Multi-file changes
- Unclear requirements

If something goes sideways mid-implementation: **STOP, re-plan, don't push through.**

Write detailed specs upfront to reduce ambiguity. Use plan mode for verification steps, not just building.

Skip plan mode only for: single-line fixes, typos, obvious bugs, or tasks with very specific instructions.

## 2. Task Tracking

Use `TaskCreate` / `TaskUpdate` for all planned work:

```
1. Create tasks with clear acceptance criteria BEFORE coding
2. Set status to in_progress BEFORE starting each task
3. Mark completed ONLY after verification passes
4. After completing a task, check TaskList for next work
```

Never mark a task completed if:
- Build is failing
- Implementation is partial
- Errors are unresolved

## 3. Subagent Strategy

Use `Task` tool subagents liberally to:
- Keep main context window clean
- Parallelize independent research/exploration
- Isolate complex analysis from implementation

Rules:
- One task per subagent — focused execution
- Use `Explore` type for broad codebase research
- Use `general-purpose` for multi-step analysis
- Don't duplicate work between main thread and subagents

## 4. Verification Before Done

Never mark a task complete without proving it works:

1. Run `bun run build` — must pass
2. Check for type errors and lint issues
3. Diff behavior between before/after when relevant
4. Ask: "Would a staff engineer approve this?"

If verification fails, keep task as `in_progress` and fix.

## 5. Demand Elegance (Balanced)

For non-trivial changes, pause and ask: "Is there a more elegant way?"

- If a fix feels hacky: implement the elegant solution
- If simple and obvious: don't over-engineer
- Challenge your own work before presenting it

## 6. Autonomous Bug Fixing

When given a bug report:
1. Point at logs, errors, failing tests
2. Identify root cause — don't guess
3. Fix it. Don't ask for hand-holding
4. Verify the fix with build/tests
5. Zero context switching required from the user

## 7. Self-Improvement Loop

After ANY correction from the user:

1. Identify the pattern that caused the mistake
2. Update auto-memory (`~/.claude/projects/.../memory/MEMORY.md`) with the lesson
3. Write rules that prevent the same mistake
4. Review lessons at session start for relevant project

Format for lessons:
```
- YYYY-MM-DD: [What went wrong] → [Rule to prevent it]
```

## Core Principles

- **Simplicity First** — Make every change as simple as possible. Minimal code impact.
- **No Laziness** — Find root causes. No temporary fixes. Senior developer standards.
- **Minimal Impact** — Touch only what's necessary. Avoid introducing new bugs.
- **Explain Changes** — High-level summary at each step so user stays informed.
