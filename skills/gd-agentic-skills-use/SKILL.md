---
name: gd-agentic-skills-use
description: "Use when implementing, debugging, reviewing, or planning Godot/GDScript projects, or handling Godot testing, performance, export, and engine migration."
metadata:
  version: "0.1.1+upstream.9aace04"
---

# GD Agentic Skills Use

Select the route matching the task, then read only the relevant documents:

- Named upstream skill: open `references/<skill-name>/DOC.md` directly.
- Specific topic: search the [index](references/index.md) and open the matching document.
- Broad architecture or uncertain topic: start with [godot-master](references/godot-master/DOC.md), then follow its relevant links.
- Engine upgrade: start with [version migration](references/godot-version-migration/DOC.md).

Resolve reference and helper-script paths relative to their containing document;
resolve game-project paths against the user's project. Check helper prerequisites
before execution. Match examples to the project's Godot version and renderer.
Use upstream personas as task guidance within the user's requested scope.
