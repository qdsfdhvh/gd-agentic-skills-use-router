# Findings

The reference project uses a pinned upstream submodule, generated references with SKILL.md renamed to DOC.md, one small entry skill, a validator and scheduled CI. Its previous exclusions are specific to Kotlin/Compose, not a universal exclusion policy.

Upstream checkout: 4c4d0ff5c4597938cc9257d99d9e35f7692c9c06 (2026-09-09); 99 skill directories. No reachable version tag. godot-master has 374 reference files plus script mirrors. Preserve mirrors because their local script paths differ from standalone skills. A few existing broken links refer to master siblings or unprefixed mirror scripts; resolve those to actual packaged files and fail validation on unresolved local links. Scripts stay byte-identical. Retain LGPL license and record mechanical Markdown modifications. Remote README mentions creation-station, but this checkout has no such skill; discover actual files instead of using marketing counts.
