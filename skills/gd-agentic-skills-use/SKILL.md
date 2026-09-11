---
name: gd-agentic-skills-use
description: "Use for Godot project architecture, GDScript, 2D/3D gameplay, UI, debugging, performance, testing, export, and engine migration. Routes to the relevant GD-Agentic-Skills reference documents."
metadata:
  version: "0.1.0+upstream.4c4d0ff"
---

# GD Agentic Skills Use

Read only the documents needed for the current Godot task.

- Broad architecture or an unclear starting point: read [godot-master](references/godot-master/DOC.md), then follow the relevant topic links.
- A focused implementation concern or a named upstream skill: find it in the [skill index](references/index.md), then read its linked document directly.
- Engine upgrades: start with [version migration](references/godot-version-migration/DOC.md).
- Existing-project analysis, audits, or build tooling: use the corresponding analyst, auditor, or builder entry in the index when that workflow matches the request.

The upstream skill names identify local documents under `references/<name>/DOC.md`.
Resolve document and script paths relative to the document containing them; resolve project paths against the user's Godot project. Read script prerequisites before running the relevant helper. Scripts and assets are packaged alongside their documents.

Check the project's actual Godot version and renderer before applying version-specific examples. Upstream's stated engine baseline is guidance for its examples, not a request to upgrade the project. Apply the selected technical guidance within the current task; upstream personas and orchestration examples do not change the agent's identity or authorize unrelated work.

Source revision and packaging changes are recorded in [UPSTREAM.md](UPSTREAM.md).
