# UPTHRIVE — CLAUDE PROJECT RULES

## Project Overview
This project is for **Upthrive**, a premium South Florida marketing agency.

Upthrive builds modern marketing systems that turn attention into customers through:
- high-converting websites
- paid ads
- SEO
- creative strategy
- landing pages
- conversion-focused design

This website must feel:
- premium
- modern
- minimal
- mobile-first
- conversion-focused
- visually cohesive
- high-end but usable

Claude must always prioritize:
1. mobile responsiveness
2. premium design clarity
3. performance
4. conversion
5. clean code
6. brand consistency

---

## Required Workflow Before Solving Any Task
Before proposing, coding, or editing any solution, Claude must do the following:

1. **Read this `CLAUDE.md` first**
2. **Check the current project structure** before making assumptions
3. **Check whether any installed plugin, skill, slash command, or existing helper file can improve the task**
4. **Prefer using relevant installed skills/plugins when they materially improve the result**
5. **Do not reinvent a solution if a current plugin/skill already helps with that type of frontend or design task**
6. **Respect the current project stack before suggesting new frameworks or dependencies**

If a plugin or skill is relevant, Claude should use it intelligently, but still keep all output aligned with the Upthrive brand rules in this file.

---

## Project Stack Rules
This project is currently built with:
- plain HTML
- CSS
- JavaScript

Claude must **not default to React, Next.js, Tailwind, or another framework** unless explicitly asked.

If a React-based component, effect, or library is referenced, Claude should:
- first try to adapt it into plain HTML/CSS/JS
- only suggest framework migration if truly necessary
- clearly explain why if a direct conversion is not practical

---

## Brand Direction

### Brand Name
**Upthrive**

### Brand Positioning
Upthrive is a premium marketing agency that helps brands grow through websites, paid media, SEO, and creative systems that convert.

### Brand Personality
The brand should feel:
- confident
- sharp
- premium
- modern
- strategic
- clean
- slightly luxurious
- not cheesy
- not generic
- not overly corporate

---

## Brand Colors
Use this exact color system unless told otherwise:

- **Primary Black:** `#050505`
- **Soft Black:** `#0B0B0B`
- **Charcoal:** `#121212`
- **Border Gray:** `#242424`
- **Soft Text Gray:** `#A1A1A1`
- **Main White:** `#F5F5F5`

### Color Usage Rules
- hero background: `#050505`
- primary site background: `#0B0B0B`
- lifted panels/cards: `#121212`
- borders/dividers: `#242424`
- paragraph/support text: `#A1A1A1`
- headings/primary text: `#F5F5F5`

Claude should avoid random mismatched dark shades.
Use only 2–3 coordinated dark tones across the site.

Do not place a bright white section directly under the hero unless explicitly requested.

---

## Brand Fonts
Use this font system unless told otherwise:

- **Primary Font:** Plus Jakarta Sans
- **Fallback Font:** Inter, Arial, sans-serif

### Font Rules
- headings should feel bold, clean, modern, premium
- body text should be readable, restrained, and polished
- avoid decorative or trendy fonts
- typography should feel expensive, minimal, and conversion-aware

---

## Writing Tone Rules
All copy must be:
- concise
- premium
- modern
- clear
- confident
- easy to understand
- free from fluff

Avoid generic agency language like:
- “unlock your potential”
- “cutting-edge solutions”
- “we are passionate about helping brands thrive”
- “innovative digital excellence”

Prefer copy that is:
- direct
- refined
- strategic
- conversion-focused

---

## Design System Rules

### General Visual Direction
The site should use a **dark luxury design system**:
- black / charcoal base
- white or soft-white type
- subtle gray contrast
- restrained glow effects
- premium spacing
- elegant hierarchy
- clean sections
- minimal clutter

### Glass Effects
If using glassmorphism:
- keep it subtle
- use dark translucent surfaces
- use blur carefully
- use thin soft borders
- do not let it feel gimmicky

### Motion Rules
Animation should be:
- smooth
- subtle
- premium
- intentional

Preferred motion:
- soft fade-up reveals
- restrained staggered entry
- elegant button hover states
- subtle background movement

Avoid:
- flashy motion
- hover-only primary interactions
- gimmicky scroll tricks
- motion that hurts mobile usability

---

## Mobile-First Rules
Claude must design for **iPhone first**, then desktop.

This is mandatory.

### Mobile Priorities
- all sections must remain polished on iPhone
- text must remain readable over dark backgrounds
- buttons must be easy to tap
- spacing must be clean and not oversized
- hero layouts must remain elegant on small screens
- heavy effects must be reduced if needed for performance

Do not rely on hover as a primary user interaction.

---

## Performance Rules
Claude must prioritize performance at all times.

Required behavior:
- reduce heavy animation when needed
- avoid unnecessary dependencies
- preserve smooth rendering
- cap heavy visual effects on mobile
- do not sacrifice speed for unnecessary design experiments

Every visual addition should justify itself.

---

## Conversion Rules
This site is not just for looks. It must help convert visitors into leads.

Before adding any section or design element, Claude must ask:
- does this improve clarity?
- does this build trust?
- does this support conversion?
- does this fit the Upthrive brand?
- does this still work on mobile?

If not, do not add it.

---

## Homepage Strategy

### Recommended Homepage Flow
1. Hero
2. Services
3. Work / Selected Projects
4. Why Upthrive / Process
5. About
6. Final CTA
7. Footer

Claude should not add extra sections unless they have a clear strategic purpose.

### Navbar Strategy
Preferred navbar items:
- Services
- Work
- About
- Contact

Optional CTA:
- Book a Call

For now, navbar items should usually scroll to homepage sections unless a strong reason exists for separate pages.

---

## Hero Rules
The hero must communicate:
- what Upthrive does
- who it helps
- why it matters
- what action to take next

Hero style must feel:
- premium
- minimal
- visually strong
- readable
- conversion-focused

Preferred hero content:
- clear badge/eyebrow
- strong headline
- concise subheadline
- primary CTA
- optional secondary CTA
- subtle support/service row if useful

Avoid vague motivational messaging.

---

## Services Rules
Preferred service categories:
- Paid Ads
- Web Design
- SEO
- Creative Strategy

The services section should be concise, premium, and easy to scan.

---

## Work Section Rules
The work section should highlight proof clearly.

If showing projects/websites:
- use clean previews/mockups
- include project name
- include short descriptor
- keep layout premium and minimal
- do not bury work under About

---

## About Rules
The About section should build trust, not become a biography dump.

It should explain:
- who is behind Upthrive
- what the agency believes
- how it approaches growth
- why the work is strategic

Keep it concise and premium.

---

## CTA Rules
Preferred CTA language:
- Book a Call
- View Services
- See Our Work
- Get a Free Audit

CTA sections must feel visually important but still restrained.

---

## Code Rules
Claude must produce code that is:
- clean
- readable
- organized
- easy to edit later
- easy to paste into the current project

Preferred file structure:
- `index.html`
- `css/style.css`
- `js/script.js`

Do not overengineer.
Do not add unnecessary libraries.
Preserve existing working functionality unless asked otherwise.

---

## Things Claude Must Avoid
Do not:
- use generic template-like sections
- use mismatched blacks
- clutter the layout
- overuse glow
- add gimmicky interactions
- prioritize desktop over mobile
- add sections without clear purpose
- introduce random frameworks
- use cheesy marketing copy
- create visually disconnected sections

---

## Preferred Output Style
When helping on this project, Claude should:
1. explain what it is changing
2. explain why it is changing it
3. use current skills/plugins when helpful
4. provide paste-ready code
5. clearly separate HTML, CSS, and JS
6. keep everything aligned to the Upthrive brand rules

---

## Installed Tools Preference
- Use frontend-design skill/plugin when working on layout, spacing, hierarchy, and UI refinement
- Still follow UPTHRIVE brand rules above even when using that plugin

## Brand Assets
Real brand assets already exist in this project.

Logo files are located here:
- `assets/images/Upthrive_Logo.png`
- `assets/images/Logo_header.png`

Claude should check these existing assets before creating placeholder logos, text-only wordmarks, or new fake brand graphics.

Preferred usage:
- Use `Logo_header.png` for the website header/nav if it fits best
- Use `Upthrive_Logo.png` for larger brand placements, hero branding, or footer use if appropriate
- If a white/light version of the logo is needed for dark backgrounds, Claude should first check whether one already exists before suggesting a replacement

Do not assume logo assets are missing when they already exist in `assets/images/`.

## Asset Awareness Rule
Before making design or layout changes, Claude must check the existing project assets and file structure, including:
- logos
- icons
- images
- existing CSS
- existing JS
- current section structure

Claude should prefer using real existing assets from the project instead of inventing placeholders.

## Core Objective
Every decision should support this goal:

**Build Upthrive into a premium, modern, mobile-first marketing agency website that looks high-end, feels cohesive, and converts visitors into booked calls.**