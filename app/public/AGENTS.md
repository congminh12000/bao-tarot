# AGENTS

<skills_system priority="1">

## Available Skills

<!-- SKILLS_TABLE_START -->
<usage>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke: `npx openskills read <skill-name>` (run in your shell)
  - For multiple: `npx openskills read skill-one,skill-two`
- The skill content will load with detailed instructions on how to complete the task
- Base directory provided in output for resolving bundled resources (references/, scripts/, assets/)

Usage notes:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already loaded in your context
- Each skill invocation is stateless
</usage>

<available_skills>

<skill>
<name>wordpress-router</name>
<description>"Use when the user asks about WordPress codebases (plugins, themes, block themes, Gutenberg blocks, WP core checkouts) and you need to quickly classify the repo and route to the correct workflow/skill (blocks, theme.json, REST API, WP-CLI, performance, security, testing, release packaging)."</description>
<location>project</location>
</skill>

<skill>
<name>wp-abilities-api</name>
<description>"Use when working with the WordPress Abilities API (wp_register_ability, wp_register_ability_category, /wp-json/wp-abilities/v1/*, @wordpress/abilities) including defining abilities, categories, meta, REST exposure, and permissions checks for clients."</description>
<location>project</location>
</skill>

<skill>
<name>wp-block-development</name>
<description>"Use when developing WordPress (Gutenberg) blocks: block.json metadata, register_block_type(_from_metadata), attributes/serialization, supports, dynamic rendering (render.php/render_callback), deprecations/migrations, viewScript vs viewScriptModule, and @wordpress/scripts/@wordpress/create-block build and test workflows."</description>
<location>project</location>
</skill>

<skill>
<name>wp-block-themes</name>
<description>"Use when developing WordPress block themes: theme.json (global settings/styles), templates and template parts, patterns, style variations, and Site Editor troubleshooting (style hierarchy, overrides, caching)."</description>
<location>project</location>
</skill>

<skill>
<name>wp-interactivity-api</name>
<description>"Use when building or debugging WordPress Interactivity API features (data-wp-* directives, @wordpress/interactivity store/state/actions, block viewScriptModule integration, wp_interactivity_*()) including performance, hydration, and directive behavior."</description>
<location>project</location>
</skill>

<skill>
<name>wp-performance</name>
<description>"Use when investigating or improving WordPress performance (backend-only agent): profiling and measurement (WP-CLI profile/doctor, Server-Timing, Query Monitor via REST headers), database/query optimization, autoloaded options, object caching, cron, HTTP API calls, and safe verification."</description>
<location>project</location>
</skill>

<skill>
<name>wp-phpstan</name>
<description>"Use when configuring, running, or fixing PHPStan static analysis in WordPress projects (plugins/themes/sites): phpstan.neon setup, baselines, WordPress-specific typing, and handling third-party plugin classes."</description>
<location>project</location>
</skill>

<skill>
<name>wp-playground</name>
<description>"Use for WordPress Playground workflows: fast disposable WP instances in the browser or locally via @wp-playground/cli (server, run-blueprint, build-snapshot), auto-mounting plugins/themes, switching WP/PHP versions, blueprints, and debugging (Xdebug)."</description>
<location>project</location>
</skill>

<skill>
<name>wp-plugin-development</name>
<description>"Use when developing WordPress plugins: architecture and hooks, activation/deactivation/uninstall, admin UI and Settings API, data storage, cron/tasks, security (nonces/capabilities/sanitization/escaping), and release packaging."</description>
<location>project</location>
</skill>

<skill>
<name>wp-project-triage</name>
<description>"Use when you need a deterministic inspection of a WordPress repository (plugin/theme/block theme/WP core/Gutenberg/full site) including tooling/tests/version hints, and a structured JSON report to guide workflows and guardrails."</description>
<location>project</location>
</skill>

<skill>
<name>wp-rest-api</name>
<description>"Use when building, extending, or debugging WordPress REST API endpoints/routes: register_rest_route, WP_REST_Controller/controller classes, schema/argument validation, permission_callback/authentication, response shaping, register_rest_field/register_meta, or exposing CPTs/taxonomies via show_in_rest."</description>
<location>project</location>
</skill>

<skill>
<name>wp-wpcli-and-ops</name>
<description>"Use when working with WP-CLI (wp) for WordPress operations: safe search-replace, db export/import, plugin/theme/user/content management, cron, cache flushing, multisite, and scripting/automation with wp-cli.yml."</description>
<location>project</location>
</skill>

<skill>
<name>wpds</name>
<description>"Use when building UIs leveraging the WordPress Design System (WPDS) and its components, tokens, patterns, etc."</description>
<location>project</location>
</skill>

<skill>
<name>find-skills</name>
<description>Helps users discover and install agent skills when they ask questions like "how do I do X", "find a skill for X", "is there a skill that can...", or express interest in extending capabilities. This skill should be used when the user is looking for functionality that might exist as an installable skill.</description>
<location>global</location>
</skill>

</available_skills>
<!-- SKILLS_TABLE_END -->

</skills_system>
