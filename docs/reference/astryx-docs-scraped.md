#1
Browser Support · Astryx
astryx.atmeta.com/docs/browser-support

[Skip to content](https://astryx.atmeta.com/docs/browser-support#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Browser Support

What browsers Astryx targets, which modern platform features it depends on, and how to support older browsers for your own audience.

## Overview

Copy link

Astryx is built on modern web platform features: the Popover API, CSS anchor positioning, and CSS `light-dark()`. These let components stay small, accessible, and dependency-free, but they also set a floor on which browsers render everything correctly.

A design system does not own its traffic; the products built on it do. Their audiences range from evergreen-Chrome-only internal tools to public sites with meaningful older-Safari share. So Astryx does not declare a single hard browser floor the way an app would. Instead it defines tiers that describe what works at each level, and hands the final decision to you. Pick the tier that matches your audience.

## Support Tiers

Copy link

Astryx officially supports Tier 1 and Tier 2. Tier 3 is best-effort: components will not crash, but positioning and theming may degrade.

| Tier | Baseline | Representative versions | What your users experience |
| --- | --- | --- | --- |
| Tier 1: Full fidelity | Current Baseline (2026) | Chrome 125+, Edge 125+, Safari 26+, Firefox 147+ | Everything works, including CSS anchor positioning. This is the reference target. |
| Tier 2: Functional | Baseline − 2 years (2024) | Chrome 114+, Edge 114+, Safari 17+, Firefox 125+ | Components open, dismiss, and are fully usable. Only anchor positioning is missing, so layered surfaces (tooltips, menus, popovers) may not be positioned next to their trigger. |
| Tier 3: Below Tier 2 | Older than Baseline − 2 | Anything older | Best-effort. The only guarantee is "does not crash." `light-dark()` is unavailable, so theme colors may fall back to defaults. |

## Which Features Set the Floor

Copy link

Only three modern features carry a browser requirement. Everything else Astryx uses (`:has()`, `color-mix()`, container queries, the `<dialog>` element) has been widely available since 2023 or earlier and needs no special handling.

| Feature | Role in Astryx | Widely available |
| --- | --- | --- |
| CSS Anchor Positioning | Positions layered surfaces relative to their trigger (tooltips, menus, popovers, dropdowns). | Baseline 2026: the tightest requirement. |
| Popover API | Opens, stacks, and light-dismisses layered surfaces via the top layer. | Baseline 2025. |
| CSS light-dark() | Compiles every theme color tuple into a single value that responds to color scheme. Underpins the whole theming system. | Widely available since mid-2024. |

The gap that matters is between Tier 1 and Tier 2: the Popover API and `light-dark()` reached wide availability well before anchor positioning. So in Tier 2 browsers, layered surfaces open and dismiss correctly; they just are not positioned. This is the one feature most consumers will need to reason about.

## Which Components Are Affected

Copy link

The browser requirement is concentrated in the layered-surface components: anything that renders content in an overlay positioned against a trigger:

- Tooltip
- HoverCard
- Popover
- ContextMenu
- Selector and MultiSelector (dropdown surfaces)
- Tokenizer (suggestion menu)
- Carousel (anchored controls)

If your product does not use any of these, it has no anchor-positioning requirement at all; it needs only `light-dark()` (Tier 2 and up) for correct theme colors. Layout, typography, forms, buttons, cards, tables, and navigation all work down to Tier 2 with no special handling.

## What Astryx Guarantees

Copy link

| Guidance | Practices |
| --- | --- |
| Do | Components never throw on missing platform APIs. Where a browser lacks the Popover API, layers fall back to plain visibility instead of crashing. |
| Do | Tier 1 and Tier 2 are officially supported and tested. |
| Do | Non-layered components render correctly down to Tier 2. |
| Don't | Astryx does not guarantee correct layer positioning below Tier 1 (anchor positioning). Closing that gap for a Tier 2 audience is a consumer choice; see below. |
| Don't | Astryx does not ship a `light-dark()` fallback, so theme colors are not guaranteed below Tier 2. |

## Supporting Older Browsers

Copy link

If your audience includes Tier 2 browsers and you need correct layer positioning, you have three options, cheapest first. All of them are decisions you make for your audience; Astryx does not impose one.

1. Polyfill anchor positioning. Load a CSS anchor positioning polyfill conditionally behind an `@supports` check so it costs nothing on Tier 1. This is the lowest-effort way to get correct positioning; note that polyfills may not cover every position-fallback feature.
2. Provide a JS positioning fallback. Detect missing support with `CSS.supports("anchor-name", "--x")` and position layers with a measurement-based library (e.g. a floating-element positioner) when it returns false. More code, full control.
3. Accept degraded positioning. Document for your users that on Tier 2 browsers, layered surfaces open correctly but may not sit next to their trigger. Cheapest, and often fine for internal tools on evergreen browsers.

Feature-detect at runtime rather than sniffing user agents:

Feature detection

```
js

// Popover API (Tier 2 and up)
const hasPopover = typeof HTMLElement !== 'undefined'
  && typeof HTMLElement.prototype.showPopover === 'function';
​
// CSS anchor positioning (Tier 1)
const hasAnchorPositioning = CSS.supports('anchor-name', '--x');
​
// CSS light-dark() (Tier 2 and up)
const hasLightDark = CSS.supports('color', 'light-dark(#000, #fff)');
```

## How These Tiers Move Over Time

Copy link

The tiers are rolling, not frozen to specific versions. They track the Web Baseline year:

- Tier 1 tracks the current Baseline year.
- Tier 2 tracks Baseline minus two years.
- Tier 3 is everything older, and remains best-effort.

This is not an arbitrary window: Baseline − 2 is close to where anchor positioning stops being available while the Popover API and `light-dark()` still are, so the tier boundary tracks a real capability edge, not a guessed date. The version floors above are reviewed and advanced roughly once a year as new Baseline years land. Always feature-detect rather than hardcoding version numbers, so your app adapts automatically as the platform moves.

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/browser-support)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#2
Working with AI · Astryx
astryx.atmeta.com/docs/working-with-ai

[Skip to content](https://astryx.atmeta.com/docs/working-with-ai#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Working with AI

How to set up AI coding tools to generate correct component code.

## Overview

Copy link

The design system is built to be AI-friendly: consistent naming, predictable prop patterns, and a CLI that feeds structured documentation directly into AI context windows. But models still need the right context to avoid falling back to generic React patterns or inventing props.

The CLI includes a built-in agent docs system that generates context files for your AI tool of choice. One command sets up everything your AI needs to write correct component code.

## Quick Start

Copy link

Tell your AI to install the CLI and set itself up:

Paste this into your AI

```
text

Install @astryxdesign/cli and run `npx astryx init --features agents` to set up your Astryx context. Read the generated file.
```

That's it. The `init --features agents` command generates everything your AI needs (component index, behavioral rules, CLI reference) pulled from your installed version. After a version bump, run it again to update in place.

If you prefer to target a specific file format:

Manual options

```
bash

npx astryx init --features agents --agent claude    # CLAUDE.md
npx astryx init --features agents --agent cursor    # .cursorrules
npx astryx init --features agents --agent codex     # AGENTS.md (Copilot, Codex, etc.)
```

## What Gets Generated

Copy link

The generated context teaches your AI a 3-step workflow before writing any UI code:

1. `npx astryx template --list`: find a related page pattern to use as reference
2. `npx astryx template <name> --skeleton`: study the layout structure
3. `npx astryx component <Name>`: read props and examples for every component used

It also includes rules that prevent common mistakes (no raw divs, no style={{}}, use tokens not magic values) and a CLI quick reference. After setup, you shouldn't need to manually correct your AI on these conventions; the agent docs handle it at the system level.

## Cursor Setup

Copy link

Cursor project rules aren't always picked up; it selects which rules to apply based on relevance. For reliable inclusion, install the design system context as a User Rule instead. User Rules live at ~/.cursor/rules/ and apply across all projects.

Install as a Cursor user rule

```
bash

mkdir -p ~/.cursor/rules
npx astryx init --features agents --agent-docs-path ~/.cursor/rules/xds.mdc
```

## Checking Your Setup

Copy link

Paste this into your AI before writing any component code. These three questions have a 0% pass rate without docs; models confidently guess wrong on all of them. If your AI can't answer them, it'll know to install the agent docs first.

Paste this into your AI

```
text

Before writing any Astryx code, check your knowledge:
​
1. What is the correct import path for Button?
2. How do you make an Dialog non-dismissible?
3. What prop does Selector use for its items?
​
If you don't know all three, run `npx astryx init --features agents` to generate agent docs, then read the generated file.
```

## The npx astryx Pattern

Copy link

AI agents frequently invoke the CLI with incorrect paths (e.g. node\_modules/@astryxdesign/cli/bin/docs.mjs instead of astryx.mjs), leading to silent failures. Adding an npm script alias with the correct path eliminates this entirely.

package.json

```
json

"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}
```

With this alias, agents use `npx astryx component --list` instead of guessing the binary path. The `--` separator is standard npm convention for passing flags to scripts.

Reliable CLI invocation

```
bash

npx astryx component --list
npx astryx component Dialog --dense
npx astryx docs styling --dense
npx astryx docs tokens --dense
```

## The --dense Flag

Copy link

Every CLI command supports --dense, which outputs a token-efficient format designed for AI context windows. Use it when pasting CLI output into a web-based AI tool like ChatGPT or Claude.

Dense output for pasting into AI conversations

```
bash

npx astryx component Dialog --dense
npx astryx docs styling --dense
npx astryx docs tokens --dense
```

## MCP Server

Copy link

Astryx ships a Model Context Protocol (MCP) server that any MCP-compatible AI tool can connect to. Instead of manually pasting CLI output, the AI can query the Astryx design system directly, searching for components, reading full documentation, and pulling code examples on demand.

The MCP server exposes two tools: search(query) for discovering components, doc topics, and templates; and get(name) for retrieving full documentation with props, usage, and examples.

Add the server to your MCP config file. This works with any MCP-compatible tool: Claude Desktop (claude\_desktop\_config.json), Cursor (.cursor/mcp.json), Windsurf (.windsurf/mcp.json), Cline, and others.

MCP config (same for all tools)

```
json

{
  "mcpServers": {
    "xds": {
      "type": "url",
      "url": "https://astryx.atmeta.com/mcp"
    }
  }
}
```

Once connected, your AI tool can search for components by natural language (e.g. "dropdown menu", "success message") and retrieve full documentation without any manual CLI invocation. The server uses the same keyword index from component docs, so search quality improves automatically as component documentation is updated.

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/working-with-ai)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#3
Migration Guide · Astryx
astryx.atmeta.com/docs/migration

[Skip to content](https://astryx.atmeta.com/docs/migration#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Migration Guide

How to migrate an existing Tailwind, shadcn, or Radix application to the design system incrementally.

## Overview

Copy link

Treat migration as a product-shell and workflow migration, not a global class replacement. Start by putting the app inside Theme and AppShell, then move one route or surface at a time to design system primitives while keeping existing data, routing, and business logic intact.

Tailwind can coexist during migration. Use it for legacy wrappers and local layout while replacing interactive controls, navigation, command surfaces, forms, alerts, dialogs, and settings UI with components.

## Recommended Order

Copy link

1. Install the design system and run init so the project has package scripts, theme CSS, and agent docs.
2. Wrap the app root with Theme and choose the initial light, dark, or system mode behavior.
3. Make Tailwind and design system CSS layer order explicit before replacing components.
4. Render the foundation smoke test page and confirm primitives keep their padding before migrating any surface.
5. Move the persistent frame first: AppShell, TopNav, SideNav, page content, and mobile navigation.
6. Replace shared primitives: Button, IconButton, TextInput, NumberInput, Switch, CheckboxInput, RadioList, Selector, Tabs, Dialog, AlertDialog, Banner, Toast, Badge, Card, Table, and ListItem.
7. Replace global workflows: command palette, settings popover, theme toggle, search, filters, create flows, and destructive confirmation dialogs.
8. Remove legacy Tailwind classes from each completed surface, keeping only token-backed layout utilities or local wrappers that still need to be migrated.
9. Verify both light and dark modes, keyboard navigation, responsive layout, and empty/error/loading states before moving to the next route.

## CLI Workflow

Copy link

Use the CLI as the migration checklist. Read the docs for the pattern you are about to touch, inspect a matching template skeleton, then read the exact component docs before editing.

Migration-oriented CLI pass

```
bash

npx astryx docs migration
npx astryx docs theme
npx astryx docs styling
npx astryx template --list --type block
npx astryx template AppShellTopNavWithSideNav --skeleton
npx astryx template PopoverSettingsPanel --skeleton
npx astryx component AppShell
npx astryx component SideNav
npx astryx component TopNav
npx astryx component CommandPalette
npx astryx component Button
npx astryx component TextInput
```

Use --dense when pasting output into an AI coding tool, and use --json when building automated migration reports.

Dense and JSON modes

```
bash

npx astryx docs migration --dense
npx astryx component Button --json
```

## Theme and CSS Setup

Copy link

Mount Theme at the app root so every migrated component reads the same token set. Keep the mode in application state if users can switch between light and dark themes.

Root provider with explicit mode

```
tsx

import {Theme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import {useState} from 'react';
import '@astryxdesign/theme-neutral/theme.css';
​
export function AppRoot({children}: {children: React.ReactNode}) {
  const [mode, setMode] = useState<'system' | 'light' | 'dark'>('system');
​
  return (
    <Theme theme={neutralTheme} mode={mode}>
      <SettingsContext.Provider value={{mode, setMode}}>
        {children}
      </SettingsContext.Provider>
    </Theme>
  );
}
```

When Tailwind remains in the app, declare layer order once in the global CSS file. design system reset and theme CSS should load before Tailwind utilities so migrated components keep design system defaults while legacy utility classes still work.

Tailwind v4 coexistence

```
css

@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;
​
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);
```

On Tailwind v3 there is no preflight.css to import, so wrap the @tailwind base directive in a named layer instead. Keep utilities unlayered so existing app utility classes still win everywhere.

Tailwind v3 coexistence

```
css

@layer reset, tw-preflight, astryx-base, astryx-theme;
​
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
​
@layer tw-preflight {
  @tailwind base; /* layered: astryx-theme now wins over preflight */
}
@tailwind components;
@tailwind utilities; /* unlayered: legacy utility classes keep winning */
```

## Cascade Layer Safety

Copy link

In a stylesheet with no layers at all, a zero-specificity reset like `* { padding: 0 }` loses to any class selector, so most developers treat resets as harmless. Layers change the rules twice: unlayered styles beat every named layer, and a later layer beats an earlier one, both regardless of specificity. The same reset therefore wins against every component style either by staying unlayered or by landing in a layer declared after astryx-base. Same CSS, opposite outcome, and no error or warning when it happens.

This is the most common way an adoption breaks, through one of two @import mechanisms. A top-level @import without the layer() keyword keeps the legacy reset unlayered, where it overrides every design system layer. And an @import nested inside a file that was itself imported into a layer inherits that surrounding layer, so a reset can silently land in a consumer layer above astryx-base. Either way the fix is the same: import the legacy reset into the lowest layer explicitly.

Legacy reset, explicitly layered

```
css

/* was: @import "./legacy-reset.css";  (unlayered: beats every layer) */
@import "./legacy-reset.css" layer(reset);
```

Audit the layers around the design system with this checklist before building screens.

- Declare the canonical @layer order once, before any @import. With webpack-based bundlers (including Next.js) the order declaration must live in its own CSS file imported first, such as layers.css, because webpack hoists @import content above the inline CSS that follows it.
- Audit every pre-existing global or reset stylesheet and assign each one to a layer deliberately. Top-level imports without layer() stay unlayered and beat every layer; imports nested inside a layered file inherit that layer.
- Remove or demote the app legacy reset. The design system ships its own :where() reset in the lowest layer, so any app reset belongs in that same reset layer and never in a layer above astryx-base.
- Layer Tailwind preflight. On Tailwind v4, import preflight.css with layer(base). On Tailwind v3, wrap the @tailwind base directive in a named layer (see the snippet in Theme and CSS Setup). Unlayered preflight overrides theme CSS silently.
- Set moduleResolution to bundler or node16 and newer so subpath imports like @astryxdesign/core/reset.css resolve.
- Theme with defineTheme and the accent family API instead of hand-writing individual color tokens. Derived tokens like --color-on-accent are generated from the accent scale automatically; hand-writing only --color-accent leaves --color-on-accent at its stale white default with no contrast guarantee against the new accent.
- Run the foundation smoke test below and view a few components in both light and dark mode before migrating any route.

One more mental model shift: a className or utility class you write on a component still reaches the DOM either way, but whether it overrides the component is a layer question, not a source order question. Keep app utilities in the utilities layer so they keep winning.

## Foundation Smoke Test

Copy link

A broken layer order fails silently and identically on every page, so catch it before feature work instead of after N migrated screens. Render one throwaway page with a few primitives as the first migration step.

Foundation check page

```
tsx

import {useState} from 'react';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Table} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {VStack} from '@astryxdesign/core/VStack';
​
export default function FoundationCheck() {
  const [email, setEmail] = useState('');
​
  return (
    <div data-foundation-check>
      <VStack gap={4}>
        <Button label="Primary action" variant="primary" />
        <TextInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
        />
        <Card>One card with default padding</Card>
        <Table
          data={[{name: 'Foundation', status: 'ok'}]}
          columns={[\
            {key: 'name', header: 'Name'},\
            {key: 'status', header: 'Status'},\
          ]}
        />
      </VStack>
    </div>
  );
}
```

If the button renders with visible padding, a filled primary background, and the input and card have borders and internal spacing, the foundation is sound. For an assertion that can run in any test runner or a dev-only effect, check that a primitive keeps non-zero padding:

Foundation assertion

```
ts

const button = document.querySelector<HTMLButtonElement>(
  '[data-foundation-check] button',
);
if (!button) {
  throw new Error('Foundation check page did not render a button.');
}
if (getComputedStyle(button).paddingInline === '0px') {
  throw new Error(
    'Foundation broken: an unlayered reset or a later cascade layer is ' +
      'overriding component styles. Check that no app reset sits outside ' +
      'the reset layer.',
  );
}
```

When this fails, the fix is almost always in the layer order: find the stylesheet that zeroes padding, and move it into the reset layer or delete it.

## Move the App Frame First

Copy link

Start with AppShell so page migration happens inside the final navigation, spacing, surface, and responsive frame. This also exposes theme and color issues early because every route shares the same shell.

| Legacy surface | Component | Notes |
| --- | --- | --- |
| Header | TopNav | Use for product identity, global actions, account entry, and command/search trigger. |
| Sidebar | SideNav | Use sections and nested nav items for route groups. Keep selection state driven by the router. |
| Main page wrapper | AppShell + Layout | Let the shell own persistent structure; let route components own page content. |
| Mobile drawer nav | MobileNav or AppShell mobile behavior | Verify focus, close behavior, and route changes on narrow viewports. |
| Settings menu | Popover + Layout + Switch | Use as the home for theme mode and app preferences. |

## Map shadcn and Radix Primitives

Copy link

Do not wrap old shadcn components in design system styles. Replace the primitive with the component that owns the behavior, accessibility, state classes, and token usage.

| Existing primitive | Component | Migration note |
| --- | --- | --- |
| button / shadcn Button | Button or IconButton | Use Button for labeled commands and IconButton for icon-only toolbar actions. |
| input | TextInput | Keep validation state in status props rather than ad hoc border classes. |
| textarea | TextArea | Use when multiline editing is the primary action. |
| switch | Switch | Use for persisted boolean settings, including theme mode when represented as a binary choice. |
| checkbox | CheckboxInput or CheckboxList | Use list variants for grouped selection. |
| radio group | RadioList | Use when one option must be selected from a visible set. |
| select / combobox | Selector or Typeahead | Use Selector for bounded options and Typeahead for searchable async options. |
| tabs used as page nav | TabList | Use route state or current page state as the source of truth. |
| command dialog | CommandPalette | Keep app-specific search sources outside the shell and feed searchable items. |
| dropdown action menu | DropdownMenu or MoreMenu | Use MoreMenu for compact overflow actions. |
| alert / callout | Banner or Toast | Use Banner for page or section messages and Toast for transient feedback. |
| dialog | Dialog or AlertDialog | Use AlertDialog for destructive confirmation and Dialog for task flows. |
| card-like list row | ListItem | Prefer ListItem for selectable rows instead of styling Button as a row. |

## Command Palette, Settings, and Theme

Copy link

Move global search to CommandPalette once the shell exists. Treat the palette as a view over app commands: routes, contextual actions, create actions, filters, recent items, and entity results. Keep data normalization in app code so search sources always return arrays of searchable items.

Put light and dark mode controls in the settings popover or account menu. The switch or selector should update the mode passed to Theme, not toggle isolated body classes.

Settings popover theme control

```
tsx

function ThemeModeSwitch() {
  const {mode, setMode} = useSettings();
  const isDark = mode === 'dark';
​
  return (
    <Switch
      label="Dark mode"
      description="Use the dark color theme"
      value={isDark}
      onChange={next => setMode(next ? 'dark' : 'light')}
    />
  );
}
```

## Verification Checklist

Copy link

- Run the app in light and dark mode and check that surfaces, borders, text, icons, hover states, focus rings, and status colors flow together.
- Open the command palette from the shell, type into it, select items by keyboard, and confirm focus returns to the trigger.
- Check the SideNav at collapsed, expanded, active, hover, nested, and mobile states.
- Verify settings popovers and dialogs in jsdom and in a real browser because native dialog and Popover APIs may need test shims.
- Search for leftover hardcoded Tailwind colors, arbitrary hex values, and one-off hover colors after each route migration.
- Run component tests, build, and at least one browser screenshot pass for each migrated route.

## AI Migration Prompt

Copy link

When using an AI coding agent, give it an explicit migration loop instead of asking for a full-app rewrite.

Paste this into your AI

```
text

We are migrating this existing Tailwind/shadcn app to Astryx incrementally.
​
First run:
- npx astryx docs migration --dense
- npx astryx docs theme --dense
- npx astryx docs styling --dense
- npx astryx template AppShellTopNavWithSideNav --skeleton
​
Then migrate one route or shell surface at a time. Keep business logic and routing intact. Replace shadcn/Radix/Tailwind primitives with Astryx components, remove hardcoded colors, verify light and dark mode, and take screenshots before moving to the next surface.
```

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/migration)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#4
Getting Started · Astryx
astryx.atmeta.com/docs/getting-started

[Skip to content](https://astryx.atmeta.com/docs/getting-started#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Getting Started

Add the design system to your project and start building.

## Quick Start with AI

Copy link

Paste this into your AI coding tool and let it handle the setup:

Paste this into your AI

```
text

Install @astryxdesign/core, @astryxdesign/theme-neutral, and @astryxdesign/cli in this project. Run `npx astryx init` to set up agent docs. Read the generated files to learn the conventions.
```

## Install

Copy link

Add the core package, a theme, and the CLI to your existing project.

Terminal

```
bash

npm install @astryxdesign/core @astryxdesign/theme-neutral @astryxdesign/cli
```

Then run the init wizard to set up AI agent docs, pick a starter template, and learn about theming.

Terminal

```
bash

npx astryx init
```

## Add the theme CSS

Copy link

Import the reset stylesheet and a theme in your global CSS file. Themes provide all design tokens (colors, spacing, radius, typography) as CSS custom properties.

globals.css

```
css

@import '@astryxdesign/core/reset.css';
@import '@astryxdesign/core/astryx.css';
@import '@astryxdesign/theme-neutral/theme.css';
```

Available themes: @astryxdesign/theme-neutral (muted minimal, a good starting point), @astryxdesign/theme-butter, @astryxdesign/theme-chocolate, @astryxdesign/theme-gothic (dark-only), @astryxdesign/theme-matcha, @astryxdesign/theme-stone, and @astryxdesign/theme-y2k. See `npx astryx docs theme` for the full theming guide.

These stylesheets are cascade-layered: the reset loads in @layer reset and component styles in @layer astryx-base. If your project has existing global CSS, a legacy reset, or Tailwind, declare the layer order explicitly and assign every stylesheet to a layer deliberately: unlayered styles and later layers both override astryx-base regardless of specificity. See the Cascade Layer Safety section in `npx astryx docs migration` before building screens.

## Add your first component

Copy link

Components are imported from per-category subpath entrypoints. This keeps bundles small and makes intent clear.

app/page.tsx

```
tsx

import {Button} from '@astryxdesign/core/Button';
import {VStack} from '@astryxdesign/core/Layout';
​
export default function Page() {
  return (
    <VStack gap={2}>
      <Button label="Hello Astryx" onClick={() => alert('Hi!')} />
    </VStack>
  );
}
```

## Customize with StyleX

Copy link

Astryx components support various styling solutions, from plain CSS and `className` to Tailwind and CSS-in-JS. See the [styling docs](https://astryx.atmeta.com/docs/styling) for the full guide. Astryx also has a deep integration with [StyleX](https://stylexjs.com/), an atomic CSS-in-JS library: create styles with `stylex.create()` and pass them to components with the `xstyle` prop.

Style overrides

```
tsx

import * as stylex from '@stylexjs/stylex';
​
const overrides = stylex.create({
  save: { alignSelf: 'flex-end', marginTop: 16 },
});
​
<Button label="Save" xstyle={overrides.save} />
```

## Example Apps

Copy link

For a full working project, clone one of the example apps from the repo. These are complete setups with routing, theming, and components wired together.

| Example | Stack | Path |
| --- | --- | --- |
| Next.js | Next.js + theme CSS | [apps/example-nextjs](https://github.com/facebook/astryx/tree/main/apps/example-nextjs) |
| Next.js + StyleX | Next.js + StyleX for custom styles | [apps/example-nextjs-stylex](https://github.com/facebook/astryx/tree/main/apps/example-nextjs-stylex) |
| Next.js + Tailwind | Next.js + Tailwind bridge | [apps/example-nextjs-tailwind](https://github.com/facebook/astryx/tree/main/apps/example-nextjs-tailwind) |
| Next.js Source | Next.js importing from source | [apps/example-nextjs-source](https://github.com/facebook/astryx/tree/main/apps/example-nextjs-source) |
| Vite | Vite | [apps/example-vite](https://github.com/facebook/astryx/tree/main/apps/example-vite) |

Clone and run an example

```
bash

git clone https://github.com/facebook/astryx.git
cd astryx/apps/example-nextjs
pnpm install
pnpm dev
```

## Explore the CLI

Copy link

The CLI is your reference for components, tokens, templates, and docs. For reliable invocation (especially with AI assistants), add this script to your package.json:

package.json

```
json

"scripts": {
  "astryx": "node node_modules/@astryxdesign/cli/bin/astryx.mjs"
}
```

Then discover what's available:

Terminal

```
bash

npx astryx component          # list all components
npx astryx component Button   # props, usage, theming for Button
npx astryx docs               # list all doc topics
npx astryx template --list    # available page templates
npx astryx docs tokens        # spacing, color, radius reference
```

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/getting-started)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#5
Theme System · Astryx
astryx.atmeta.com/docs/theme

[Skip to content](https://astryx.atmeta.com/docs/theme#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Theme System

Theme provider, custom themes, theme build for production/SSR, light/dark mode, and component style overrides.

## Quick Start

Copy link

Install a theme package

```
bash

npm install @astryxdesign/theme-neutral
```

Basic theme setup (runtime injection)

```
tsx

import {Theme} from '@astryxdesign/core';
import {neutralTheme} from '@astryxdesign/theme-neutral';
​
function App() {
  return (
    <Theme theme={neutralTheme}>
      <YourApp />
    </Theme>
  );
}
```

Optimized setup (pre-built CSS)

```
tsx

import {Theme} from '@astryxdesign/core';
import {neutralTheme} from '@astryxdesign/theme-neutral/built';
import '@astryxdesign/theme-neutral/theme.css';
​
function App() {
  return (
    <Theme theme={neutralTheme}>
      <YourApp />
    </Theme>
  );
}
```

Each theme ships as its own npm package. Install the one you want, then wrap your app in `<Theme>`. The same pattern works for every theme; just swap the package and import name.

The default import uses runtime style injection, which works everywhere with no build step. The `/built` import skips injection and relies on the pre-compiled CSS file for better performance and SSR support.

## Available Themes

Copy link

Install the theme package you want with `npm install @astryxdesign/theme-{name}`, then import its theme object as shown below.

| Theme | Import | Description |
| --- | --- | --- |
| Neutral | import {neutralTheme} from '@astryxdesign/theme-neutral' | Muted, minimal aesthetic with system fonts. A good starting point. |
| Butter | import {butterTheme} from '@astryxdesign/theme-butter' | Golden, buttery surfaces with blue accents; Sarina + Outfit type. |
| Chocolate | import {chocolateTheme} from '@astryxdesign/theme-chocolate' | Warm brown tones and cozy beige; Fraunces + Albert Sans type. |
| Gothic | import {gothicTheme} from '@astryxdesign/theme-gothic' | Dark-only atmospheric theme; deep blue-gray surfaces, distressed display type. |
| Matcha | import {matchaTheme} from '@astryxdesign/theme-matcha' | Earthy green theme with Figtree typography. |
| Stone | import {stoneTheme} from '@astryxdesign/theme-stone' | Warm stone and slate tones; Montserrat + Figtree type. |
| Y2K | import {y2kTheme} from '@astryxdesign/theme-y2k' | Playful Y2K pop; periwinkle body, holographic accents, Poppins + Crimson Text. |

All theme packages export from two subpaths:
\- `@astryxdesign/theme-{name}`: source theme (runtime injection)
\- `@astryxdesign/theme-{name}/built`: pre-built theme (pair with `theme.css`)

## Theme Props

Copy link

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| theme | DefinedTheme | - | Theme object (required) |
| mode | 'system' \| 'light' \| 'dark' | 'system' | Color mode. system follows OS preference. |
| children | ReactNode | - | App content |

## Creating a Custom Theme

Copy link

Use the CLI wizard (recommended) or create manually with defineTheme. Only override tokens that differ from defaults; omitted tokens use the design system defaults.

Scaffold with CLI

```
bash

npx astryx theme
```

## defineTheme

Copy link

defineTheme creates a theme from token overrides and optional scale configs. Scale configs generate tokens from parameters. Explicit token overrides always take precedence over scale-generated values.

defineTheme with scale configs

```
tsx

import {defineTheme} from '@astryxdesign/core/theme';
​
const myTheme = defineTheme({
  name: 'my-theme',
  color: { accent: '#7B61FF', neutralStyle: 'cool' },
  typography: {
    scale: { base: 14, ratio: 1.2 },
    body: { family: 'Inter', fallbacks: '-apple-system, sans-serif' },
  },
  radius: { base: 4, multiplier: 1 },
  motion: { fast: 175, medium: 410, ratio: 0.75 },
  tokens: {
    // Explicit overrides take precedence over scale-generated values
    '--color-accent': ['#7B61FF', '#9B85FF'],
  },
  components: {
    button: { 'variant:primary': { color: 'white' } },
  },
});
```

| Config | Generates | Parameters |
| --- | --- | --- |
| color | --color-accent, --color-background-\*, --color-text-\*, --color-border, etc. | accent (hex), neutralStyle? (warm\|cool\|neutral), contrast? (standard\|high) |
| typography.scale | --text-heading-\*-size/weight/leading, --text-body-size/weight/leading | base (px), ratio |
| typography.body/heading/code | --font-family-body, --font-family-heading, --font-family-code | family, fallbacks?, url?, weight? |
| radius | --radius-inner, --radius-element, --radius-container, --radius-page, --radius-chat | base (px), multiplier (0–2) |
| motion | --duration-fast-min/fast/fast-max, --duration-medium-min/medium/medium-max | fast (ms), medium (ms), ratio, easing? |

## Extending a Theme

Copy link

`extends` lets you derive a new theme from an existing one, inheriting its tokens, component overrides, icons, and fonts. Only specify what you want to change; everything else carries over from the base theme.

Extending the neutral theme

```
tsx

import {defineTheme} from '@astryxdesign/core/theme';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {myIcons} from './icons';
​
const brandTheme = defineTheme({
  name: 'brand',
  extends: neutralTheme,
  icons: myIcons,
  tokens: {
    '--color-accent': ['#7B61FF', '#9B85FF'],
  },
});
```

| Field | Merge behavior |
| --- | --- |
| tokens | Base tokens are copied first, then child tokens override on top. |
| components | Deep-merged: child component rules override matching keys from the base. |
| icons | Shallow-merged: child icons override matching names from the base. |
| fonts | Base fonts included first, then child fonts appended. |
| typography, motion, radius, color | Child config replaces base entirely (these are scale inputs, not additive). |

## Component Style Overrides

Copy link

The `components` field in defineTheme uses semantic component keys and style keys, not raw CSS selectors. Use `base` for all instances, `variant:value` or `stateName` for specific props/states, and let the theme pipeline choose the underlying selector. For raw external CSS escape hatches, prefer the data-attribute selector surface documented in `astryx docs styling`.

Component overrides with standard CSS

```
tsx

components: {
  // Standard CSS properties are expanded automatically.
  // borderRadius also sets the internal radius var for concentric math.
  // padding on container components (card, section, dialog) expands to layout tokens.
  card: {
    base: { borderRadius: '20px', padding: '24px' },
  },
  button: {
    base: { borderRadius: '9999px', textTransform: 'uppercase' },
    'variant:ghost': { borderWidth: '2px', borderStyle: 'solid' },
  },
  // Some components have public CSS vars for properties that don't map
  // to standard CSS. Set these directly.
  button: {
    base: { '--button-press-scale': 'scale(0.95)' },
  },
}
```

Run `npx astryx component <Name>` to see a component's theming targets, public CSS variables, and which standard CSS properties are supported.

- Write standard CSS properties (borderRadius, padding); the pipeline expands them into internal vars.
- Set public CSS vars directly when no standard property equivalent exists.

- Set private CSS vars (prefixed --\_) directly. Use standard CSS properties instead. `astryx theme build` will error.

## Custom Variants

Copy link

Themes can add new prop values to any component. Any `prop:value` key where the value isn't a built-in gets treated as a new variant. Use `astryx theme build` to generate TypeScript augmentations for type safety.

Adding custom variants

```
tsx

components: {
  button: {
    // Override an existing variant
    'variant:secondary': { backgroundColor: 'rgba(0,0,0,0.06)' },
    // Add a new variant — generates type augmentation on build
    'variant:primary-muted': {
      backgroundColor: 'light-dark(#F2F4F6, #28292C)',
      color: 'var(--color-text-primary)',
    },
  },
  banner: {
    // Any extensible prop axis works — not just variant
    'status:neutral': {
      backgroundColor: 'var(--color-muted)',
      color: 'var(--color-text-secondary)',
    },
  },
}
```

After building, the new values are type-safe in JSX:

Using custom variants

```
tsx

// TypeScript knows about 'primary-muted' after astryx theme build
<Button variant="primary-muted" label="Save draft" />
<Banner status="neutral" title="Note" />
```

Custom variants only work when the theme that defines them is active. The component's variant map is extended via module augmentation, with no changes to the component source needed.

## Building Themes for Production

Copy link

`npx astryx theme build` compiles a defineTheme file into production-ready artifacts. Recommended for SSR apps (Next.js, Remix) where styles must be present on first paint.

Build a theme

```
bash

npx astryx theme build ./src/themes/ocean.ts
```

This generates the following files alongside the source:

| File | Description |
| --- | --- |
| ocean.css | Pre-compiled CSS with token overrides, component overrides, and prose element styles in @scope rules |
| ocean.js | ES module exporting the theme object with `__built: true` and pre-resolved token values. Also re-exports the icon registry if the source theme declares one. |
| ocean.d.ts | TypeScript declarations for the theme and icon registry exports |
| ocean.variants.d.ts | (Optional) Module augmentations for custom component prop values found in the theme's component overrides |

The `__built: true` flag tells Theme to skip runtime `<style>` injection; the CSS file handles it.

Using a custom built theme

```
tsx

import {oceanTheme} from './themes/ocean';
import './themes/ocean.css';
​
<Theme theme={oceanTheme}>
  <App />
</Theme>
```

## Runtime vs Built Themes

Copy link

Themes work in two modes:

|  | Runtime (source) | Built |
| --- | --- | --- |
| Import (published theme) | @astryxdesign/theme-{name} | @astryxdesign/theme-{name}/built + theme.css |
| Import (custom theme) | defineTheme() directly | Built .js + .css from `npx astryx theme build` |
| How it works | useInsertionEffect injects <style> at hydration | Pre-compiled .css file loaded with the page |
| Component overrides | Injected client-only | In static CSS: present during SSR |
| SSR safe | Tokens yes, component overrides flash on hydration | Fully SSR safe: no flash |
| Best for | Dev, prototyping, client-only SPAs | Production, SSR apps (Next.js, Remix) |

- Use the /built subpath + theme.css for production SSR apps.
- Use runtime themes during development for fast iteration.
- Run `npx astryx theme build` for custom themes to get the built artifacts.

- Use runtime themes in production SSR apps; component overrides will flash on hydration.
- Import /built without the CSS file; component overrides won't apply.

## Light/Dark Mode

Copy link

Use \[light, dark\] tuples in token values for automatic mode switching. Use mode='system' (default) on Theme to follow OS preference.

Light/dark tuple

```
tsx

'--color-accent': ['#0064E0', '#2694FE'],
//                   ^light     ^dark
```

Toggle with a button

```
tsx

const [mode, setMode] = useState<'light' | 'dark'>('light');
​
<Theme theme={myTheme} mode={mode}>
  <Button
    label={mode === 'light' ? 'Switch to Dark' : 'Switch to Light'}
    onClick={() => setMode(m => (m === 'light' ? 'dark' : 'light'))}
  />
</Theme>;
```

## Nesting Themes

Copy link

Wrap different sections in separate <Theme> providers.

Dark sidebar with light content

```
tsx

<Theme theme={lightTheme} mode="light">
  <Layout
    header={<LayoutHeader>...</LayoutHeader>}
    start={
      <Theme theme={darkTheme} mode="dark">
        <LayoutPanel>{/* Dark sidebar */}</LayoutPanel>
      </Theme>
    }
    content={<LayoutContent>{/* Light content */}</LayoutContent>}
  />
</Theme>
```

## Token Utilities

Copy link

Use `tokenVar()` when a non-StyleX styling library wants a CSS variable reference, and `resolveThemeTokens()` when JavaScript needs token values for a specific theme and mode without React context.

CSS var references for styling-library configs

```
ts

import {tokenVar, tokenVars} from '@astryxdesign/core/theme/tokens';
​
const pandaOrEmotionTheme = {
  colors: {
    text: tokenVar('--color-text-primary'),
    surface: tokenVars['--color-background-surface'],
  },
  spacing: {
    4: tokenVars['--spacing-4'],
  },
};
```

Resolve token values without a hook

```
ts

import {resolveThemeTokens} from '@astryxdesign/core/theme/tokens';
import {neutralTheme} from '@astryxdesign/theme-neutral';
​
const lightTokens = resolveThemeTokens(neutralTheme, {mode: 'light'});
const chartTheme = {
  textColor: lightTokens['--color-text-primary'],
  seriesColor: lightTokens['--color-data-categorical-blue'],
};
```

The `@astryxdesign/core/theme/tokens` subpath is server-safe and does not require React. The main `@astryxdesign/core/theme` barrel also re-exports these helpers for client code that already imports theme APIs.

## useTheme Hook

Copy link

`useTheme()` uses the same token resolution as `resolveThemeTokens()`, but reads the nearest Theme and effective color mode from React context and media query state. Use it inside client components for SVG, canvas, charts, maps, and third-party configuration objects that need token values in JavaScript instead of `var(...)` references.

Access resolved token values in React

```
tsx

import {useMemo} from 'react';
import {useTheme} from '@astryxdesign/core/theme';
​
function ChartConfig() {
  const {mode, tokens} = useTheme();
​
  const options = useMemo(
    () => ({
      mode,
      textColor: tokens['--color-text-primary'],
      gridColor: tokens['--color-border'],
      seriesColor: tokens['--color-data-categorical-blue'],
    }),
    [mode, tokens],
  );
​
  return <Chart options={options} />;
}
```

Prefer CSS variables, StyleX token imports, xstyle, or className for ordinary styling. To change the theme or mode, manage state at the app level and pass it to <Theme>.

See `npx astryx docs styling-libraries` for styling-library interop and `npx astryx docs tokens` for the full token reference.

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/theme)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#6
Styling Components · Astryx
astryx.atmeta.com/docs/styling

[Skip to content](https://astryx.atmeta.com/docs/styling#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Styling Components

How to customize component appearance: xstyle prop, Tailwind, StyleX, className, rest props, compound component patterns, theming hooks, and styling-library interop.

## Overview

Copy link

There are several ways to style things. Here is when to use each:

| Approach | Use for | Example |
| --- | --- | --- |
| StyleX | Component-specific overrides, reusable styles, pseudo-classes, and typed tokens | const styles = stylex.create(...); <Button xstyle={styles.save} /> |
| Tailwind utilities | Layout, wrappers, and utility styling | className="flex gap-3 p-4" |
| className | Integrating with external CSS or Tailwind on components | className="my-card shadow-lg" |
| Styling-library token aliases | Keeping Panda, Chakra, MUI, Emotion, styled-components, UnoCSS, CSS Modules, or Sass in sync with the system | colors.surface = 'var(--color-background-surface)' |

All approaches resolve to the same design tokens, so theming and dark mode work regardless of which you choose. For external styling libraries, run `npx astryx docs styling-libraries`; it covers Tailwind, StyleX, Panda, Chakra, MUI, CSS-in-JS, CSS Modules, Sass, and `useTheme()` for non-CSS processing.

## xstyle Prop

Copy link

Every component accepts an xstyle prop for style customization. It accepts StyleX styles created via stylex.create(), not inline objects or class name strings. StyleX styles are compiled at build time for optimal deduplication and dead-code elimination.

Simple overrides

```
tsx

import * as stylex from '@stylexjs/stylex';
​
const overrides = stylex.create({
  card: { maxWidth: 400, marginBlock: 16 },
  saveButton: { alignSelf: 'flex-end' },
});
​
<Card xstyle={overrides.card} />
<Button label="Save" xstyle={overrides.saveButton} />
```

Pseudo-classes and conditional styles

```
tsx

import * as stylex from '@stylexjs/stylex';
​
const overrides = stylex.create({
  card: {
    boxShadow: {
      default: 'none',
      ':hover': { '@media (hover: hover)': '0 4px 12px rgba(0,0,0,0.1)' },
    },
  },
});
​
<Card xstyle={overrides.card}>...</Card>
```

- All xstyle values must come from stylex.create()
- Pseudo-classes (:hover, :focus-visible) are supported inside stylex.create
- All :hover styles MUST use @media (hover: hover) guard
- For non-StyleX styling (Tailwind, external CSS), use className instead

## Tailwind Integration

Copy link

The package ships a Tailwind v4 theme bridge that maps all design tokens to Tailwind utility classes. Import it once and use Tailwind classes backed by design tokens: colors, spacing, radius, shadows, and typography all resolve to the active theme.

globals.css: import the bridge

```
css

@layer reset, theme, base, astryx-base, astryx-theme, components, utilities;
​
@import "tailwindcss/theme.css" layer(theme);
@import "tailwindcss/preflight.css" layer(base);
@import "@astryxdesign/core/reset.css";
@import "@astryxdesign/core/astryx.css";
@import "@astryxdesign/theme-neutral/theme.css";
@import "@astryxdesign/core/tailwind-theme.css";
@import "tailwindcss/utilities.css" layer(utilities);
```

Tailwind utilities alongside components

```
tsx

<div className="text-primary bg-surface rounded-container p-4 flex gap-3">
  <Button label="Save" variant="primary" />
  <Button label="Cancel" variant="secondary" />
</div>
```

The bridge is pure CSS with zero JS. Theme changes (dark mode, custom themes) apply automatically because the utilities reference the same CSS custom properties that components use. This is the paved Tailwind path; for other styling libraries that follow the same aliasing pattern, run `npx astryx docs styling-libraries`.

## className and style Props

Copy link

Every component also accepts standard className and style props. className is appended after the component's own classes. style is merged after StyleX inline styles, so consumer values win on conflict.

className with Tailwind utilities

```
tsx

<Card className="shadow-lg hover:shadow-xl transition-shadow">
  ...
</Card>
<Button label="Save" className="my-app-save-btn" />
```

For layout and wrapper styling, Tailwind utilities on className work well. For component-specific overrides (padding, colors, borders), prefer xstyle; it integrates with StyleX deduplication and the component's internal style pipeline.

## Rest Props (Prop Drilling)

Copy link

Components extend HTML attributes and spread rest props onto their root DOM element. This means data-\* attributes, aria-\* attributes, event handlers, and other HTML props pass through automatically.

Data attributes, event handlers, and ARIA

```
tsx

<Card
  data-testid="user-card"
  data-user-id={user.id}
  onMouseEnter={handleHover}
  aria-label="User profile card"
>
  ...
</Card>
```

Ref forwarding

```
tsx

const cardRef = useRef<HTMLDivElement>(null);
<Card ref={cardRef}>...</Card>
```

A few HTML attributes are intentionally omitted from the base type (contentEditable, dangerouslySetInnerHTML). children is not in the base type either; components that accept children declare it explicitly, so slot-based components don't silently drop JSX children.

## Compound Components

Copy link

Complex components are composed from smaller components. Each sub-component accepts its own xstyle, className, and rest props. You style the parts individually; there's no single "drill into sub-part" prop.

Dialog with individually styled parts

```
tsx

import * as stylex from '@stylexjs/stylex';
​
const overrides = stylex.create({
  dialog: { maxWidth: 500 },
  content: { gap: 'var(--spacing-4)' },
});
​
<Dialog isOpen={isOpen} onClose={close} xstyle={overrides.dialog}>
  <Layout
    header={
      <LayoutHeader hasDivider>
        <Heading level={2}>Edit Profile</Heading>
      </LayoutHeader>
    }
    content={
      <LayoutContent xstyle={overrides.content}>
        <TextInput label="Name" value={name} onChange={setName} />
      </LayoutContent>
    }
    footer={
      <LayoutFooter hasDivider>
        <Button label="Cancel" variant="secondary" onClick={close} />
        <Button label="Save" variant="primary" onClick={save} />
      </LayoutFooter>
    }
  />
</Dialog>
```

The pattern: the parent component (Dialog) controls structure and behavior, child components (Layout, Header, Button) control their own appearance. Style each piece where it lives.

## Preferred Selector Surface: Data Attributes

Copy link

When external CSS needs to target an Astryx component by prop or state, combine the stable component class with reflected data attributes. The component class identifies the component (`.astryx-button`, `.astryx-card`); data attributes identify the axis and value (`data-variant`, `data-size`, `data-level`, etc.). This is the preferred selector surface for new CSS because it is explicit and collision-resistant.

```
css

.my-app .astryx-button[data-variant="primary"] {
  /* primary buttons in this app context */
}
​
.my-app .astryx-button[data-variant="primary"][data-size="sm"] {
  /* small primary buttons */
}
​
.my-app .astryx-heading[data-level="2"] {
  /* level 2 headings; numeric values stay literal in data attrs */
}
```

What components reflect

```
tsx

// <Button variant="primary" size="sm" />
// preferred selector attrs: data-variant="primary" data-size="sm"
​
// <Card variant="elevated" />
// preferred selector attrs: data-variant="elevated"
​
// <Heading level={2} />
// preferred selector attrs: data-level="2"
```

For systematic theming, use defineTheme component overrides instead of raw CSS selectors. defineTheme keeps the higher-level `prop:value` API (`variant:primary`, `size:sm`) and handles selector generation for you. Run `npx astryx docs theme` for the full theming guide.

## Deprecated: Bare Prop and State Classes

Copy link

Astryx still emits legacy bare prop/state classes such as `.primary`, `.sm`, `.level-2`, and `.checked` for compatibility with existing apps and built themes. Do not write new CSS against these bare classes. The stable base component classes (`.astryx-button`, `.astryx-card`, etc.) are not deprecated; only the unprefixed prop/state classes are the legacy surface.

```
css

/* Deprecated compatibility selector — avoid in new CSS */
.my-app .astryx-button.primary {
  /* use .astryx-button[data-variant="primary"] instead */
}
​
/* Deprecated compatibility selector — avoid in new CSS */
.my-app .astryx-heading.level-2 {
  /* use .astryx-heading[data-level="2"] instead */
}
```

## Design Tokens

Copy link

When writing custom styles, use design tokens instead of hardcoded values. Tokens are CSS custom properties that adapt to the active theme and color mode. The system provides tokens for spacing, color, radius, shadow, typography, and size.

Using tokens in stylex.create

```
tsx

import * as stylex from '@stylexjs/stylex';
​
const styles = stylex.create({
  surface: {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
  },
});
​
<Card xstyle={styles.surface} />
```

Using typed token imports in stylex.create

```
tsx

import {colorVars, spacingVars, radiusVars} from '@astryxdesign/core/theme/tokens.stylex';
​
const styles = stylex.create({
  highlight: {
    backgroundColor: colorVars['--color-accent-muted'],
    padding: spacingVars['--spacing-3'],
    borderRadius: radiusVars['--radius-element'],
  },
});
```

Both approaches work: var() strings or typed imports from tokens.stylex. The typed imports give autocomplete and catch typos at build time.

See `npx astryx docs tokens` for the full token reference (all spacing, color, radius, shadow, and typography tokens with values). See `npx astryx docs theme` for how to override tokens via defineTheme.

## StyleX Build Setup (required for swizzled components)

Copy link

Astryx components ship pre-compiled, so consuming the published package needs no StyleX setup. But `astryx swizzle <Component>` copies the raw StyleX \*source\* into your app, and StyleX source requires a build-time StyleX compiler to produce atomic CSS. Without one the component compiles but renders completely unstyled: no error, no warning. If a swizzled component looks unstyled, a missing StyleX compiler is almost always why. The same applies if you author your own StyleX with `stylex.create()`.

| Bundler | StyleX plugin |
| --- | --- |
| Webpack | @stylexjs/webpack-plugin |
| Vite / Rollup | @stylexjs/rollup-plugin (or a community Vite plugin) |
| Babel (any bundler) | @stylexjs/babel-plugin + @stylexjs/postcss-plugin |
| Next.js (App Router, SWC) | An SWC-based transform; see the Next.js note below |

Next.js (App Router) is the sharp edge. StyleX's canonical compiler is a Babel plugin, but introducing a Babel config in Next.js disables the SWC compiler, which in turn breaks SWC-dependent features like `next/font`. So the "obvious" Babel setup is actively incompatible with a standard Next 15 App Router app.

The working path on Next.js is an SWC-based StyleX transform (e.g. the community `@stylexswc/nextjs-plugin`) wired into `next.config`, which keeps SWC and `next/font` intact. See the example app `apps/example-nextjs-stylex` in the repo for a complete, working Next.js + StyleX + SWC configuration.

next.config.mjs: SWC-based StyleX transform (keeps next/font working)

```
js

import stylexPlugin from '@stylexswc/nextjs-plugin';
​
export default stylexPlugin({
  rsOptions: {
    // Resolve @astryxdesign/core's StyleX so swizzled component source compiles.
    aliases: {'@/*': ['./src/*']},
    unstable_moduleResolution: {type: 'commonJS'},
  },
})({
  // your existing Next.js config
});
```

- Symptom of a missing compiler: swizzled component renders with no styles, but no build or runtime error.
- Do NOT add @stylexjs/babel-plugin to a Next.js App Router app; it disables SWC and breaks next/font.
- Pure theming (defineTheme + astryx theme build) needs NO StyleX compiler; only swizzled/authored StyleX source does.

## What NOT to Do

Copy link

| Guidance | Practices |
| --- | --- |
| Don't | style={{}} on raw <div> wrappers. Use xstyle on the component directly. |
| Don't | Hardcoded colors (#fff, rgb(...)). Use var(--color-\*) tokens or Tailwind semantic classes (text-primary, bg-surface). |
| Don't | Hardcoded spacing (16px, 1rem). Use var(--spacing-\*) tokens or Tailwind spacing utilities (p-4, gap-3). |
| Don't | Wrapping a component in a <div> just to add margin. Use xstyle with stylex.create on the component. |
| Don't | Using !important. If styles aren't applying, check specificity; xstyle is merged last. |

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/styling)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#7
Elevation · Astryx
astryx.atmeta.com/docs/elevation

[Skip to content](https://astryx.atmeta.com/docs/elevation#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Elevation

Shadow tokens for visual elevation and inset state rings.

## Overview

Copy link

Elevation tokens create depth through box-shadow. Three levels (low, med, high) establish a visual hierarchy for floating elements. Inset shadows provide focus and selection rings for interactive components.

### Elevation Scale

Copy link

Each level adds stronger offset and spread. Shadow color adapts to dark mode automatically via light-dark().

| Token | Preview |
| --- | --- |
| --shadow-low |  |
| --shadow-med |  |
| --shadow-high |  |
| --shadow-inset-hover |  |
| --shadow-inset-selected |  |
| --shadow-inset-success |  |
| --shadow-inset-warning |  |
| --shadow-inset-error |  |

## Usage

Copy link

Applying elevation

```
tsx

import {shadowVars} from '@astryxdesign/core';
​
const styles = stylex.create({
  dropdown: {
    boxShadow: shadowVars['--shadow-med'],
  },
  dialog: {
    boxShadow: shadowVars['--shadow-high'],
  },
  inputFocused: {
    boxShadow: shadowVars['--shadow-inset-selected'],
  },
});
```

## Best Practices

Copy link

| Guidance | Practices |
| --- | --- |
| Do | Match elevation to interaction context: low for tooltips, med for dropdowns, high for dialogs. |
| Do | Use inset shadows for input focus/selection states; they compose better than outlines. |
| Don't | Stack multiple elevation levels on the same element. |
| Don't | Use elevation shadows for decorative borders. Use --color-border tokens instead. |

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/elevation)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#8
Color · Astryx
astryx.atmeta.com/docs/color

[Skip to content](https://astryx.atmeta.com/docs/color#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Color

Semantic color tokens for surfaces, text, icons, borders, and status indicators.

## Overview

Copy link

Colors are semantic: tokens describe purpose, not appearance. Every color adapts automatically between light and dark modes via CSS light-dark(). Themes override the resolved values, so your code never references raw hex colors.

### Surface Colors

Copy link

Layered surface hierarchy: body → surface → card → popover. Each level sits visually above the previous one.

| Token | Value |
| --- | --- |
| --color-accent | #262626 / #ebebeb |
| --color-accent-muted | #f1f1f1 / #262626 |
| --color-on-accent | #ffffff / #171717 |
| --color-neutral | #0000000F / #FFFFFF1A |
| --color-background-surface | #ffffff / #262626 |
| --color-background-body | #f1f1f1 / #1b1b1b |
| --color-overlay | #00000080 / #000000CC |
| --color-overlay-hover | #0000000D / #FFFFFF0D |
| --color-overlay-pressed | #0000001A / #FFFFFF1A |
| --color-background-muted | #f1f1f1 / #1b1b1b |
| --color-text-primary | #171717 / #fafafa |
| --color-text-secondary | #737373 / #a3a3a3 |
| --color-text-disabled | #a3a3a3 / #525252 |
| --color-text-accent | #262626 / #ebebeb |
| --color-on-dark | #ffffff |
| --color-on-light | #171717 |
| --color-icon-accent | #262626 / #ebebeb |
| --color-icon-primary | #171717 / #fafafa |
| --color-icon-secondary | #737373 / #a3a3a3 |
| --color-icon-disabled | #a3a3a3 / #525252 |
| --color-background-card | #ffffff / #1b1b1b |
| --color-background-popover | #ffffff / #1b1b1b |
| --color-background-inverted | #0A1317 / #FFFFFF |
| --color-background-error-inverted | #AA071E / #E3193B |
| --color-success | #007004 / #9fe59b |
| --color-success-muted | #c5e5c0 / #84c9803D |
| --color-on-success | #ffffff / #171717 |
| --color-error | #a50c25 / #ffc6c1 |
| --color-error-muted | #facecb / #ff9e973D |
| --color-on-error | #ffffff / #171717 |
| --color-warning | #745b00 / #fdcf4f |
| --color-warning-muted | #f8da9d / #deb4333D |
| --color-on-warning | #171717 |
| --color-border | #ebebeb / #FFFFFF1A |
| --color-border-emphasized | #d4d4d4 / #525252 |
| --color-skeleton | #ebebeb / #525252 |
| --color-track | #CCD3DB / #5A5E66 |
| --color-shadow | #0000001A / #0000004D |
| --color-tint-hover | black / white |
| --color-background-blue | #c4ddfb / #9eb7ff3D |
| --color-border-blue | #b1c9e7 / #6d9cfe |
| --color-icon-blue | #00458c / #9eb7ff |
| --color-text-blue | #00458c / #c7d3ff |
| --color-background-cyan | #a3e0ef / #83c2d43D |
| --color-border-cyan | #91d3e3 / #67a7b8 |
| --color-icon-cyan | #00505f / #83c2d4 |
| --color-text-cyan | #00505f / #9edef0 |
| --color-background-gray | #e5e5e5 / var(--color-neutral) |
| --color-border-gray | #d4d4d4 / #262626 |
| --color-icon-gray | #525252 / #a3a3a3 |
| --color-text-gray | #262626 / #e5e5e5 |
| --color-background-green | #c5e5c0 / #84c9803D |
| --color-border-green | #b2d1ac / #69ad67 |
| --color-icon-green | #0c5700 / #84c980 |
| --color-text-green | #0c5700 / #9fe59b |
| --color-background-orange | #fad0b5 / #ffa2583D |
| --color-border-orange | #e6bda2 / #e2883e |
| --color-icon-orange | #6e3500 / #ffa258 |
| --color-text-orange | #6e3500 / #ffc9a2 |
| --color-background-pink | #fccadc / #ff99c33D |
| --color-border-pink | #e7b7c8 / #f273aa |
| --color-icon-pink | #83004b / #ff99c3 |
| --color-text-pink | #83004b / #ffc3da |
| --color-background-purple | #eccef3 / #f297ff3D |
| --color-border-purple | #d8bbdf / #dd74f0 |
| --color-icon-purple | #700084 / #f297ff |
| --color-text-purple | #700084 / #fac1ff |
| --color-background-red | #facecb / #ff9e973D |
| --color-border-red | #e6bab8 / #ff6f6c |
| --color-icon-red | #89001a / #ff9e97 |
| --color-text-red | #89001a / #ffc6c1 |
| --color-background-teal | #a5e3d6 / #7ec6b83D |
| --color-border-teal | #94d6c8 / #63ab9d |
| --color-icon-teal | #005348 / #7ec6b8 |
| --color-text-teal | #005348 / #99e2d3 |
| --color-background-yellow | #f8da9d / #deb4333D |
| --color-border-yellow | #e4c279 / #c0990e |
| --color-icon-yellow | #584400 / #deb433 |
| --color-text-yellow | #584400 / #fdcf4f |
| --color-syntax-keyword | #700084 / #efa8ff |
| --color-syntax-string | #005600 / #a6d2a2 |
| --color-syntax-comment | #737373 / #a3a3a3 |
| --color-syntax-number | #6e3500 / #ffb37f |
| --color-syntax-function | #00458c / #a0caff |
| --color-syntax-type | #700084 / #efa8ff |
| --color-syntax-variable | #171717 / #e5e5e5 |
| --color-syntax-operator | #737373 / #a3a3a3 |
| --color-syntax-constant | #6e3500 / #ffb37f |
| --color-syntax-tag | #89001a / #ffaeaa |
| --color-syntax-attribute | #584400 / #eec12f |
| --color-syntax-property | #005348 / #83dac9 |
| --color-syntax-punctuation | #a3a3a3 / #525252 |
| --color-syntax-background | #fafafa / #0a0a0a |
| --color-data-categorical-blue | #0171E3 |
| --color-data-categorical-orange | #EB6E00 |
| --color-data-categorical-purple | #6B1EFD |
| --color-data-categorical-green | #0B991F |
| --color-data-categorical-pink | #F351C0 |
| --color-data-categorical-cyan | #0171A4 |
| --color-data-categorical-red | #F5394F |
| --color-data-categorical-teal | #08A3A3 |
| --color-data-categorical-brown | #965E03 |
| --color-data-categorical-indigo | #6F8AFF |
| --color-data-neutral | #8494A3 / #8C939B |
| --color-data-blue-5 | #02165E |
| --color-data-blue-4 | #004CBC |
| --color-data-blue-3 | #2694FE |
| --color-data-blue-2 | #78BEFF |
| --color-data-blue-1 | #DBECFF |
| --color-data-shamrock-5 | #0B603D |
| --color-data-shamrock-4 | #138546 |
| --color-data-shamrock-3 | #24BB5E |
| --color-data-shamrock-2 | #8EF7AA |
| --color-data-shamrock-1 | #D6FEE4 |
| --color-data-orange-5 | #A13F04 |
| --color-data-orange-4 | #D66100 |
| --color-data-orange-3 | #FD9537 |
| --color-data-orange-2 | #FDB876 |
| --color-data-orange-1 | #FFE6CF |
| --color-data-pink-5 | #8E1073 |
| --color-data-pink-4 | #D123A1 |
| --color-data-pink-3 | #F989D3 |
| --color-data-pink-2 | #FEADE3 |
| --color-data-pink-1 | #FCE3F4 |
| --color-data-purple-5 | #3E0697 |
| --color-data-purple-4 | #6B1EFD |
| --color-data-purple-3 | #9081FF |
| --color-data-purple-2 | #B3B0FE |
| --color-data-purple-1 | #E8E8FB |
| --color-data-red-5 | #9D0519 |
| --color-data-red-4 | #D31130 |
| --color-data-red-3 | #FB7D87 |
| --color-data-red-2 | #FFB2B8 |
| --color-data-red-1 | #FEE4E6 |
| --color-data-teal-5 | #08767D |
| --color-data-teal-4 | #0C9293 |
| --color-data-teal-3 | #0DB7AF |
| --color-data-teal-2 | #6CE6D8 |
| --color-data-teal-1 | #D7FCF8 |
| --color-data-yellow-5 | #8A5001 |
| --color-data-yellow-4 | #D69804 |
| --color-data-yellow-3 | #FBCE03 |
| --color-data-yellow-2 | #FCEC85 |
| --color-data-yellow-1 | #FDF6BA |
| --color-data-gray-5 | #25363F / #333338 |
| --color-data-gray-4 | #5D6C7B / #666A72 |
| --color-data-gray-3 | #AFB9C4 / #B2B8BE |
| --color-data-gray-2 | #CCD3DB / #D0D3D6 |
| --color-data-gray-1 | #F1F4F7 / #F2F4F6 |
| --color-brand |  |

## Usage

Copy link

Applying color tokens

```
tsx

import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';
​
const styles = stylex.create({
  container: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    borderColor: colorVars['--color-border'],
  },
  accent: {
    color: colorVars['--color-text-accent'],
  },
});
```

## Best Practices

Copy link

| Guidance | Practices |
| --- | --- |
| Do | Use semantic tokens (--color-text-primary) instead of raw hex values. |
| Do | Rely on the surface hierarchy (body → surface → card → popover) for layering. |
| Do | Use status colors (success, error, warning) only for their semantic meaning. |
| Don't | Hardcode hex values, since they won't adapt to dark mode or custom themes. |
| Don't | Mix accent colors with status colors in the same context. |
| Don't | Use --color-on-accent on non-accent backgrounds. |

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/color)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#9
Internationalization · Astryx
astryx.atmeta.com/docs/internationalization


[Skip to content](https://astryx.atmeta.com/docs/internationalization#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Internationalization

Localize astryx component strings, provide translation catalogs, override default text, coexist with your own i18n library, swap languages at runtime, and test translations with the pseudo locale.

## Quick Start

Copy link

Internationalization ships with `@astryxdesign/core`. There is nothing to install. Wrap your app in `<InternationalizationProvider>` and set a `locale`, and astryx components pick up localized strings automatically.

Wrap your app

```
tsx

import {InternationalizationProvider} from '@astryxdesign/core';
​
function App() {
  return (
    <InternationalizationProvider locale="en">
      <YourApp />
    </InternationalizationProvider>
  );
}
```

Read strings inside a component

```
tsx

import {useTranslator} from '@astryxdesign/core';
​
function SaveButton() {
  const t = useTranslator();
  return <button>{t('@myapp.actions.save')}</button>;
}
```

The hook is available to consumer components too, but using it is entirely optional: many teams keep their app strings on their existing i18n library (react-intl, i18next, next-intl, LinguiJS) and only use `useTranslator` when reading astryx keys. If you do route your own strings through it, we recommend namespacing them (`@myapp.*` or your npm scope) to keep them separated from `@astryx.*`, but this is a convention, not a requirement; the resolver treats every key as an opaque string.

Astryx ships translations only for English today. First-party translations for other locales are on the roadmap; track https://github.com/facebook/astryx/issues/3641. In the meantime, if you want astryx UI translated into another locale, you can ship your own catalog through the `messages` prop (covered in the next section). If you're using `useTranslator` for your own strings, you'll want to ship your own catalog either way, since astryx only carries the fallback for `@astryx.*` keys, not the ones you author.

## Providing locale catalogs

Copy link

Astryx bundles only the English catalog today. To render in any other locale, provide a translation catalog through the `messages` prop and set `locale` accordingly. This matches how MUI, Ant Design, and AG Grid work: the consumer app supplies the catalogs it actually needs so unused translations stay out of the bundle.

Add French

```
tsx

import {InternationalizationProvider} from '@astryxdesign/core';
import fr from './locales/astryx/fr.json';
​
<InternationalizationProvider locale="fr" messages={{fr}}>
  <App />
</InternationalizationProvider>;
```

See `@astryxdesign/core/locales/en.json` for the full inventory of keys to translate. Copy it as the starting point: every key you translate replaces the English default; anything you omit falls back through the locale chain to English (e.g. `pt-BR` walks to `pt` then to shipped `en`), so a partial translation renders as a mix rather than empty text or raw key names.

A community-maintained set of astryx translations is on the roadmap but not shipped yet. For now, consumer apps that ship in multiple languages own their astryx catalogs alongside their app catalogs. Contributions to a first-party set are welcome; track discussion at https://github.com/facebook/astryx/issues/3641.

## Overriding astryx's default text

Copy link

Use `overrides` to change individual strings without shipping a full catalog. Overrides are keyed by locale and merged on top of the built-in and user-supplied catalogs.

Change one string in English

```
tsx

<InternationalizationProvider
  locale="en"
  overrides={{en: {'@astryx.pagination.next': 'Next →'}}}
>
  <App />
</InternationalizationProvider>
```

Overrides win over both bundled English and any `messages` catalog for the same key. Use them for brand voice tweaks or one-off wording changes.

## Using astryx with your own i18n library

Copy link

Astryx components render astryx strings through astryx's provider. Consumer components render consumer strings through whatever i18n library you already use: react-intl, i18next, next-intl, LinguiJS, and so on. The two systems coexist and read from the same source of truth for the active locale.

Astryx + react-intl side by side

```
tsx

import {InternationalizationProvider} from '@astryxdesign/core';
import {Selector} from '@astryxdesign/core/Selector';
import {Button} from '@astryxdesign/core/Button';
import {FormattedMessage, IntlProvider, useIntl} from 'react-intl';
import astryxFr from './locales/astryx/fr.json'; // astryx's UI, in French
import appFr from './locales/app/fr.json';       // your app strings, in French
​
function Pricing() {
  // Consumer strings — resolved by react-intl.
  const intl = useIntl();
​
  return (
    <section>
      <h1><FormattedMessage id="pricing.heading" /></h1>
​
      {/* Astryx Selector — trigger placeholder, search-box placeholder,
          clear-button aria-label all resolved by
          <InternationalizationProvider>. Options come from react-intl. */}
      <Selector
        label={intl.formatMessage({id: 'pricing.region.label'})}
        options={[\
          {value: 'na', label: intl.formatMessage({id: 'pricing.region.na'})},\
          {value: 'eu', label: intl.formatMessage({id: 'pricing.region.eu'})},\
        ]}
        hasSearch
        hasClear
      />
​
      <Button label={intl.formatMessage({id: 'pricing.cta.subscribe'})} />
    </section>
  );
}
​
export default function App() {
  return (
    // Same locale, two providers reading their own catalogs.
    <IntlProvider locale="fr" messages={appFr}>
      <InternationalizationProvider locale="fr" messages={{fr: astryxFr}}>
        <Pricing />
      </InternationalizationProvider>
    </IntlProvider>
  );
}
```

Keep the two providers in sync on locale, and each library owns its own catalog. Astryx never sees your app strings, and your i18n library never sees astryx internals. Runtime locale swap works the same way: re-render both providers with a new `locale` prop and the whole tree updates live.

Single-catalog usage (where an external i18n runtime like react-intl or i18next resolves both your app strings AND astryx's strings through one provider) is on the roadmap via a `Translator` adapter. Track https://github.com/facebook/astryx/issues/4029. For now, run the two providers side by side as shown above.

## Runtime language swap

Copy link

Re-render `<InternationalizationProvider>` with a new `locale` prop and every astryx string updates live. No reload, no separate API call.

Toggle between locales

```
tsx

const [locale, setLocale] = useState<'en' | 'fr'>('en');
​
<InternationalizationProvider locale={locale} messages={{fr}}>
  <Button
    label={locale === 'en' ? 'Français' : 'English'}
    onClick={() => setLocale(l => (l === 'en' ? 'fr' : 'en'))}
  />
  <App />
</InternationalizationProvider>;
```

Persisting the user's choice (localStorage, cookie, URL segment, account setting) is up to the consumer. Astryx reads whatever `locale` you pass in.

## Testing your translations

Copy link

Astryx generates a `pseudo` locale that wraps every string in `⟦…⟧` and replaces letters with accented look-alikes. Switching to it in development instantly reveals any astryx string that isn't going through the translator, plus any layout that breaks under longer text.

Turn on pseudo-localization

```
tsx

import pseudo from '@astryxdesign/core/locales/pseudo.json';
​
<InternationalizationProvider locale="pseudo" messages={{pseudo}}>
  <App />
</InternationalizationProvider>;
```

Any bare English text you still see on screen is a hardcoded string that needs to be routed through `useTranslator`.

Pseudoloc also has a subtle caveat worth knowing: the pseudo catalog is complete (astryx generates it from every shipped key), so a component using an astryx-shipped key will always render its pseudo version. Your handwritten translation catalogs, on the other hand, only cover the keys you translated; anything missing falls back to English. That means "looks perfect in pseudo" is not the same guarantee as "looks perfect in French." Check each real locale by hand for coverage gaps.

## For contributors

Copy link

Astryx's own strings live in `packages/core/locales/en.json`. New user-facing strings must go through `useTranslator`; this is enforced by the `@astryx/no-hardcoded-i18n-string` ESLint rule. See the AI contribution guide for the alias-and-resolve pattern used when adding new keys.

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/internationalization)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.

#10
Icons · Astryx
astryx.atmeta.com/docs/icons


[Skip to content](https://astryx.atmeta.com/docs/icons#astryx-app-shell-main)

Type to search

`↑``↓`Navigate`↵`Select`Esc`Close

# Icons

Semantic icon names available in the design system. These adapt to the active theme's icon registry.

## Available Names

Copy link

Components that accept an icon prop use IconType: either a semantic name string or a direct SVG component. The semantic names below are resolved through the global icon registry.

| Name | Usage |
| --- | --- |
| close | Dismiss, close dialogs/panels |
| chevronDown | Dropdown triggers, expand/collapse |
| chevronLeft | Navigate back, previous |
| chevronRight | Navigate forward, next |
| check | Checkbox checked, confirm |
| success | Success status indicator |
| error | Error status indicator |
| warning | Warning status indicator |
| info | Info status indicator, tooltips |
| calendar | Date pickers, scheduling |
| clock | Time pickers, timestamps |
| externalLink | Links opening in new tab |
| menu | Hamburger menu, navigation toggle |
| moreHorizontal | Overflow menu, additional actions |
| search | Search inputs, find |
| arrowUp | Sort ascending, move up |
| arrowDown | Sort descending, move down |
| arrowsUpDown | Sortable column indicator |
| funnel | Filter controls |
| eyeSlash | Hidden/visibility toggle |
| viewColumns | Column visibility settings |
| copy | Copy to clipboard |
| checkDouble | Copied confirmation |
| wrench | Settings, configuration |
| stop | Stop/cancel action |
| microphone | Voice input, audio recording |

## Custom Icons

Copy link

For icons not in the semantic list, pass an SVG component directly. Any ComponentType<SVGProps<SVGSVGElement>> works; Icon applies size and color styling automatically.

Using custom SVG components

```
tsx

import { PhotoIcon } from '@heroicons/react/24/outline';
import { HeartIcon } from 'lucide-react';
​
<Icon icon={PhotoIcon} size="lg" />
<Icon icon={HeartIcon} color="negative" />
```

## Theme Overrides

Copy link

Themes can replace the default SVGs for any semantic name using registerIcons(). This lets you swap the entire icon set (e.g. heroicons → lucide) without touching component code.

Registering theme icons

```
tsx

import { registerIcons } from '@astryxdesign/core/Icon';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
​
registerIcons({
  close: <XMarkIcon />,
  chevronDown: <ChevronDownIcon />,
  // ... override as many as needed
});
```

## Adding New Icons

Copy link

To add a new semantic icon name to the design system:

1. Add the name to IconName type in packages/core/src/Icon/globalIconRegistry.tsx
2. Add the default SVG to packages/core/src/Icon/defaultIcons.tsx
3. Add a row to the Available Names table in packages/cli/docs/icons.doc.mjs

[Astryx](https://astryx.atmeta.com/)

[Docs](https://astryx.atmeta.com/docs/getting-started) [Components](https://astryx.atmeta.com/components) [Templates](https://astryx.atmeta.com/templates) [Themes](https://astryx.atmeta.com/themes) [Playground](https://astryx.atmeta.com/playground) [Blog](https://astryx.atmeta.com/blog) [Community](https://astryx.atmeta.com/community) [Changelog](https://astryx.atmeta.com/changelog) [Canary docs](https://astryx-canary.vercel.app/docs/icons)

[GitHub](https://github.com/facebook/astryx)

GitHub

[Discord](https://discord.com/invite/XnsUcFykEP)

Discord

[Facebook](https://www.facebook.com/astryxdesign)

Facebook

[Instagram](https://www.instagram.com/astryxdesign)

Instagram

[Threads](https://www.threads.com/@astryxdesign)

Threads

[X](https://x.com/Astryxdesign)

X

[Meta Open Source](https://opensource.fb.com/)

[Terms of use](https://opensource.fb.com/legal/terms) [Privacy policy](https://opensource.fb.com/legal/privacy)

©2026 Meta Platforms, Inc.