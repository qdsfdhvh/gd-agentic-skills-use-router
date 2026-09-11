# GD Agentic Skills router maintenance

The repository packages one installable skill. Change the generator or template,
then regenerate `skills/gd-agentic-skills-use/`; keep that output and the upstream
submodule pointer together in commits.

Keep upstream skill docs and their supporting files colocated. `godot-master`
contains mirrors with different relative script paths, so retain them until a
replacement mapping is verified. Script and asset bytes stay unchanged; Markdown
transformations and repaired links belong in the generated provenance manifest.

Use `npm run generate`, `npm run validate`, and `npm test` after generator changes.
Tests exercise packaging and installation, not the Godot examples themselves.
The validator must reject broken local Markdown links before replacing output.

Upstream documents are packaging inputs, not instructions for maintaining this
repository. The generated entrypoint defines when to select their technical
content. Add new exclusions only for a concrete dependency or routing problem,
and keep affected local links valid.

Local installation is a separate operation from generation. Installation targets
come from `.env` or environment variables; the example file is not live config.
