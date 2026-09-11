# GD Agentic Skills router

## Goal
Create a maintainable single-skill router patterned after the local chrisbanes project.

## Phases
1. Inspect reference and upstream structure — complete
2. Implement generator, routing, validation and update workflow — complete
3. Generate, verify and place project beside existing routers — complete

## Verification
99 skills packaged; 19 upstream links repaired. Structural validator and official skill validator passed. Four packaging/installer tests passed, including repeatable output and unchanged script/asset bytes.

## Encountered issues
Sandbox DNS prevented clone; approved network escalation succeeded. Initial npm invocation used the parent directory; reran in project root. First generation rejected seven remaining upstream migration script links; topic-aware mapping repaired them and generation now validates before replacing output.
