
# CharacterBody2D Implementation

Expert CharacterBody2D feel systems — not beginner `move_and_slide` tutorials.

## NEVER Do

- **NEVER use `RigidBody2D` for standard player controllers** — RigidBody is for physics-simulated objects. For responsive, feel-driven player movement, always use `CharacterBody2D`.
- **NEVER multiply `velocity` by `delta` before `move_and_slide()`** — `move_and_slide()` handles delta internally. Manual multiplication makes movement framerate-dependent.
- **NEVER use `global_position` updates for gameplay movement** — Use `velocity` + `move_and_slide()`. Direct position hacks bypass collision, floor snap, and one-way rules.
- **NEVER "fall through" one-ways by nudging `position.y`** — Use one-way collision shapes + layer/mask (and temporary mask disable / collide-with-areas patterns). See [godot-2d-physics](../godot-2d-physics/DOC.md).
- **NEVER ignore floor/wall/ceiling state right after `move_and_slide()`** — `is_on_floor()`, `is_on_wall()`, `is_on_ceiling()`, and slide collisions drive coyote, wall jump, and bonk logic.
- **NEVER rely on default `floor_snap_length` for fast stair-climbing** — Default snapping is too small for high-velocity characters. Use custom raycast-based stair logic.
- **NEVER apply gravity while `is_on_floor()` is true** — Constant downward force causes micro-jitter and fights floor-snap. Reset `velocity.y` on land.
- **NEVER use `Area2D` as primary ground detection** — Prefer `is_on_floor()` / shapecasts; Areas are for triggers, not floor truth.
- **NEVER forget ceiling bonk** — Reset `velocity.y` when `is_on_ceiling()` or the player floats into the ceiling until gravity wins.
- **NEVER round physics positions for pixel art** — Keep physics high-precision; round **sprite** positions in `_process` only ([subpixel_movement_rounding.gd](scripts/subpixel_movement_rounding.gd)).
- **NEVER spam `queue_free()` for hordes** — Pool bullets/enemies when spawn/despawn is frequent ([performance_character_pooling.gd](scripts/performance_character_pooling.gd)).

---

## When to Use CharacterBody2D

| Need | Body |
|------|------|
| Feel-driven player / NPC / enemy locomotion | **CharacterBody2D** |
| Rolling debris, ragdoll-ish props, force piles | RigidBody2D |
| Static level colliders | StaticBody2D / TileMapLayer physics |

## Decision Tree → MANDATORY Scripts

| Task | Do First | Then (optional) | Do NOT Load |
|------|----------|-----------------|-------------|
| Platformer foundation (coyote, buffer, accel/friction) | **[expert_physics_2d.gd](scripts/expert_physics_2d.gd)** | — | Inline tutorial controllers |
| Isolate coyote/buffer only | [frame_perfect_coyote_time.gd](scripts/frame_perfect_coyote_time.gd) | — | Duplicate coyote blocks in SKILL |
| Variable jump / short hop | [variable_jump_height.gd](scripts/variable_jump_height.gd) | — | — |
| Slopes / stairs | [slope_stair_snapping.gd](scripts/slope_stair_snapping.gd) | [godot-raycasting-queries](../godot-raycasting-queries/DOC.md) | — |
| Wall slide / wall jump | [wall_slide_jump_refined.gd](scripts/wall_slide_jump_refined.gd) or [wall_jump_controller.gd](scripts/wall_jump_controller.gd) | — | Both unless comparing |
| Dash + i-frames | [dash_state_controller.gd](scripts/dash_state_controller.gd) or [dash_controller.gd](scripts/dash_controller.gd) | — | Both unless comparing |
| Air control polish | [aerial_drift_acceleration.gd](scripts/aerial_drift_acceleration.gd) | — | — |
| Ceiling stick / bonk | [ceiling_bonk_detection.gd](scripts/ceiling_bonk_detection.gd) | — | — |
| Knockback / wind impulses | [impulse_response_handler.gd](scripts/impulse_response_handler.gd) | — | — |
| Pixel-art visuals | [subpixel_movement_rounding.gd](scripts/subpixel_movement_rounding.gd) | — | Rounding `global_position` in physics |
| Many AI bodies | [performance_character_pooling.gd](scripts/performance_character_pooling.gd) | — | — |
| One-way platforms | Tile/StaticBody one-way + layers/masks | [godot-tilemap-mastery](../godot-tilemap-mastery/DOC.md) / [godot-2d-physics](../godot-2d-physics/DOC.md) | `position.y += 1` drop-through hacks |
| Top-down / tank locomotion | [movement-recipes.md](references/movement-recipes.md) | — | Inline 8-way tutorials |
| Jump arc debug tuning | [game_feel_profiler.gd](scripts/game_feel_profiler.gd) | — | — |
| Animation root motion | [root_motion_controller.gd](scripts/root_motion_controller.gd) | [godot-2d-animation](../godot-2d-animation/DOC.md) | — |

**Golden path:** Read **expert_physics_2d.gd** first. Add dash/wall/jump scripts only after that controller is in place. Do not re-inline coyote/buffer/accel loops in the scene when the script already owns them.

## One-Way Platforms (correct recipe)

1. Author one-way on the **platform collider** (`CollisionShape2D` one-way / TileSet physics one-way), not by teleporting the player.
2. Put platforms and player on explicit **collision layers/masks** so drop-through can temporarily clear the platform bit (or disable collide-with) while holding down + jump — then restore next physics frames.
3. Keep drop-through on the **physics tick**; never bypass `move_and_slide` with `position` nudges.
4. For tile one-ways, align TileSet physics layers with CharacterBody masks — see [godot-tilemap-mastery](../godot-tilemap-mastery/DOC.md) + [godot-2d-physics](../godot-2d-physics/DOC.md).

## Expert Character Architectures

### 1. Wall Cling (Variable Friction)
Monitor `is_on_wall()` while falling; scale `velocity.y` by a friction factor (optionally from tile custom data) instead of a binary wall-slide bool. Prefer [wall_slide_jump_refined.gd](scripts/wall_slide_jump_refined.gd) over a bespoke cling fork.

### 2. Animation-Driven Movement (Root Motion)
Pull `AnimationTree.get_root_motion_position()`, convert to 2D, assign `velocity = motion / delta`, then `move_and_slide()`. Keeps feet locked to authored clips; pair with [godot-2d-animation](../godot-2d-animation/DOC.md).

### 3. Game-Feel Profiler (Jump Arcs)
Debug-draw historical positions + current velocity in `_draw()` to visualize apex, coyote, and buffer windows while tuning exports on **expert_physics_2d.gd** — [game_feel_profiler.gd](scripts/game_feel_profiler.gd).

> **MANDATORY** for top-down/tank recipes, moving platforms, slide-collision response, and gotcha tables: [movement-recipes.md](references/movement-recipes.md). **Do NOT Load** when expert_physics_2d.gd already covers your platformer scope.

## Reference

> Progressive disclosure: open Official Documentation links only when researching a specific API;
> load Related Skills when routing work to a peer domain — do not preload the whole lattice.

### Official Documentation
- [Using CharacterBody2D](https://docs.godotengine.org/en/stable/tutorials/physics/using_character_body_2d.html) — Canonical `move_and_slide` / floor-wall-ceiling contracts; do not set `position` for gameplay motion.
- [CharacterBody2D](https://docs.godotengine.org/en/stable/classes/class_characterbody2d.html) — API for `velocity`, snap, `is_on_floor` / wall / ceiling, and slide-collision accessors.
- [Physics introduction](https://docs.godotengine.org/en/stable/tutorials/physics/physics_introduction.html) — Why CharacterBody vs RigidBody/StaticBody, and how layers/masks gate every contact.
- [Collision shapes (2D)](https://docs.godotengine.org/en/stable/tutorials/physics/collision_shapes_2d.html) — Capsule/box sizing and why scaled `CollisionShape2D` nodes corrupt normals and floor detect.
- [2D movement](https://docs.godotengine.org/en/stable/tutorials/2d/2d_movement.html) — Input axes into velocity for top-down and platformer starters before juice systems.
- [Kinematic character (2D)](https://docs.godotengine.org/en/stable/tutorials/physics/kinematic_character_2d.html) — Classic slide/collision loop patterns that still inform custom stair and slope handling.
- [Troubleshooting physics issues](https://docs.godotengine.org/en/stable/tutorials/physics/troubleshooting_physics_issues.html) — One-way platforms, tunneling, and jitter diagnoses that show up in CharacterBody feel bugs.
- [Ray-casting](https://docs.godotengine.org/en/stable/tutorials/physics/ray-casting.html) — Direct-space rays for stair snaps, ledge checks, and ground probes beyond `is_on_floor()`.
- [KinematicCollision2D](https://docs.godotengine.org/en/stable/classes/class_kinematiccollision2d.html) — Per-slide normals/remainders from `get_slide_collision` for wall jumps and ceiling bonks.
- [Physics interpolation introduction](https://docs.godotengine.org/en/stable/tutorials/physics/interpolation/physics_interpolation_introduction.html) — Smooth visuals at high refresh while keeping jump/coyote logic on the physics tick.
- [InputEvent](https://docs.godotengine.org/en/stable/tutorials/inputs/inputevent.html) — Action just-pressed timing that jump buffers and coyote windows depend on.

### Related Skills

#### Prerequisites
- [godot-project-foundations](../godot-project-foundations/DOC.md) — Default gravity, physics tick rate, and 2D layer names must be set before coyote/jump feel is tunable.
- [godot-gdscript-mastery](../godot-gdscript-mastery/DOC.md) — Typed `_physics_process`, timers, and `move_toward` discipline underpin every movement script here.
- [godot-2d-physics](../godot-2d-physics/DOC.md) — Collision layer/mask matrices, one-way shapes, and query hygiene CharacterBody motion sits on.
- [godot-input-handling](../godot-input-handling/DOC.md) — Physics-step action sampling so jump buffer / coyote windows stay frame-stable.

#### Complements
- [godot-raycasting-queries](../godot-raycasting-queries/DOC.md) — Stair snaps, wall cling probes, and ledge rays that extend beyond `is_on_*` helpers.
- [godot-tilemap-mastery](../godot-tilemap-mastery/DOC.md) — One-way tiles and tile physics layers must match CharacterBody masks for platforms.
- [godot-2d-animation](../godot-2d-animation/DOC.md) — Drive walk/jump/fall clips from floor/air/dash state without fighting `move_and_slide`.
- [godot-state-machine-advanced](../godot-state-machine-advanced/DOC.md) — Dash, wall-slide, and airborne states scale cleaner than giant `_physics_process` switches.
- [godot-camera-systems](../godot-camera-systems/DOC.md) — Follow/look-ahead cameras couple tightly to CharacterBody velocity and landing snaps.
- [godot-signal-architecture](../godot-signal-architecture/DOC.md) — Landed/dashed/wall-jumped events need clean ownership so UI/VFX listeners do not spam.

#### Downstream / consumers
- [godot-genre-platformer](../godot-genre-platformer/DOC.md) — Genre-level platformer feel consumes coyote, buffer, slopes, and one-ways from this skill.
- [godot-genre-metroidvania](../godot-genre-metroidvania/DOC.md) — Ability-gated movement (wall jump, dash) builds on the controllers defined here.
- [godot-combat-system](../godot-combat-system/DOC.md) — Knockback and hitstun apply impulses through the same `velocity` + slide loop.
- [godot-monte-carlo-balancer](../godot-monte-carlo-balancer/DOC.md) — Coyote frames, jump height, dash cooldown, and air accel are balance knobs — simulate them instead of guessing.

#### Master
- [godot-master](../godot-master/DOC.md) — Library router and mirrored entry point for CharacterBody2D alongside sibling domains.
