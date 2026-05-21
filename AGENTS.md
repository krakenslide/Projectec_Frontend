# Codex UI Redesign Instructions

## Goal

Remake this React frontend into a polished, production-grade, productivity-focused UI.

The UI should feel:
- clean
- premium
- calm
- fast
- consistent
- usable for real operational work

Avoid generic AI-generated UI:
- no random purple/blue gradients
- no unnecessary glow effects
- no excessive glassmorphism
- no huge landing-page hero sections
- no over-rounded everything
- no decorative UI that does not improve usability

## Design Taste

Follow Emil Kowalski-style design engineering:
- beautiful interfaces are functional leverage
- animation should clarify state changes
- details like spacing, hover states, focus states, and transitions matter
- motion should be subtle, fast, and purposeful
- prefer transform and opacity animations
- avoid layout-jank animations

Follow Impeccable-style UI critique:
- audit before changing
- improve hierarchy, spacing, contrast, alignment, and interaction states
- preserve useful existing patterns
- reuse existing components and tokens
- polish what exists before inventing new patterns
- simplify noisy UI without removing required functionality

Use this design vocabulary:
- polish = refine spacing, alignment, contrast, states
- audit = identify hierarchy, consistency, accessibility issues
- critique = explain what feels off and why
- distill = simplify without losing functionality
- bolder = make important elements more confident
- quieter = reduce visual noise
- animate = add purposeful motion only where useful

## React Implementation Rules

Before making changes:
1. Inspect the existing component structure.
2. Identify shared components.
3. Identify global CSS/Tailwind/theme files.
4. Identify repeated button/input/table/modal patterns.
5. Preserve all existing business logic and API calls.

When redesigning:
1. Improve global styles/tokens first.
2. Improve shared primitives next.
3. Improve layout shell/navigation.
4. Then redesign individual pages.
5. Keep changes incremental and reviewable.

Do not:
- rewrite the whole app in one pass
- remove functionality
- rename API fields unnecessarily
- introduce new libraries unless clearly justified
- break routing
- break existing state logic
- hardcode fake data where real data already exists

## Component Quality Rules

Every interactive component should have:
- default state
- hover state
- focus-visible state
- disabled state
- loading state where applicable
- error/empty state where applicable

Buttons:
- one clear primary action per section
- secondary actions should be visually quieter
- destructive actions should be clearly marked
- icons should support meaning, not decorate randomly

Forms:
- clear labels
- accessible focus states
- helpful validation
- grouped related fields
- consistent spacing

Tables:
- compact but readable rows
- clear headers
- consistent column alignment
- useful status badges
- predictable right-aligned actions
- loading skeleton
- empty state

Modals:
- clear title
- short description
- obvious primary action
- cancel/close always available
- destructive actions require clarity

## Motion Rules

Use motion only for:
- modals
- drawers
- popovers
- row expansion
- status changes
- loading transitions
- drag/drop feedback

Motion should be:
- 100–220ms for most interactions
- subtle
- non-blocking
- accessible
- based on opacity/transform when possible

Avoid:
- bouncing
- flashy effects
- slow transitions
- animating layout-heavy properties

## Accessibility Rules

Always preserve:
- semantic HTML
- keyboard navigation
- visible focus states
- readable contrast
- aria labels where needed
- reduced-motion support

## Expected Codex Behavior

For every UI task:
1. audit the current code first
2. explain what is weak
3. propose the design direction
4. make focused code changes
5. preserve functionality
6. summarize changed files
7. mention visual QA needed