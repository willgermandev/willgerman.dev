# ACCESSIBILITY

Accessibility requirements for projects built on this template. Two standards apply: **WCAG 2.1 Level AA** (the international web content baseline) and **Section 508** of the US Rehabilitation Act (which incorporates WCAG 2.0 AA by reference and adds federal-procurement-specific obligations).

This document is **standards reference + Vue-specific applied patterns**. Sections 1–3 cover the standards themselves (stack-agnostic). Section 4 covers the Vue 3 / SPA patterns that satisfy them.

For visual tokens (color contrast, typography, spacing) see [DESIGN.md](DESIGN.md). For Vue component patterns where these rules get applied see [FRONTEND.md](FRONTEND.md).

---

## 1. WCAG 2.1 Level AA

WCAG 2.1 is organized around four principles — **Perceivable, Operable, Understandable, Robust** (POUR). Level AA includes every Level A success criterion **plus** the AA-specific ones listed below. All criteria in this section are required.

### 1.1 Perceivable

Information and UI must be presentable to users in ways they can perceive.

#### Level A (required as part of AA conformance)

- **1.1.1 Non-text Content** — All non-text content (images, icons, charts, controls) has a text alternative that serves the equivalent purpose. Decorative images use `alt=""` or are marked `aria-hidden="true"`.
- **1.2.1 Audio-only and Video-only (Prerecorded)** — Provide a transcript for prerecorded audio-only and a transcript or audio description for prerecorded video-only content.
- **1.2.2 Captions (Prerecorded)** — Captions are provided for all prerecorded audio in synchronized media.
- **1.2.3 Audio Description or Media Alternative (Prerecorded)** — Audio description or a full text alternative for prerecorded video in synchronized media.
- **1.3.1 Info and Relationships** — Structure conveyed visually is also exposed programmatically (use semantic HTML: `<h1>`–`<h6>`, `<nav>`, `<main>`, `<table>` with `<th>`, `<label for>`, `<fieldset>`/`<legend>`).
- **1.3.2 Meaningful Sequence** — Reading order in the DOM matches the visual order.
- **1.3.3 Sensory Characteristics** — Instructions don't rely solely on shape, color, size, or position ("click the green button on the right" is not enough on its own).
- **1.4.1 Use of Color** — Color is not the only visual means of conveying information (pair with text, icon, or underline).
- **1.4.2 Audio Control** — Audio that plays automatically for more than 3 seconds has a mechanism to pause, stop, or control volume.

#### Level AA

- **1.2.4 Captions (Live)** — Captions for all live audio in synchronized media.
- **1.2.5 Audio Description (Prerecorded)** — Audio description for all prerecorded video in synchronized media.
- **1.3.4 Orientation** — Content does not restrict its view and operation to a single display orientation (portrait or landscape) unless essential.
- **1.3.5 Identify Input Purpose** — Input fields collecting common user information use the appropriate `autocomplete` attribute (e.g., `autocomplete="email"`, `"given-name"`, `"street-address"`).
- **1.4.3 Contrast (Minimum)** — Text and images of text have a contrast ratio of at least **4.5:1**. Large text (≥18pt, or ≥14pt bold) needs at least **3:1**. Logos and incidental text are exempt.
- **1.4.4 Resize Text** — Text can be resized up to 200% without loss of content or functionality (no horizontal scrolling, no clipped text).
- **1.4.5 Images of Text** — Use real text instead of images of text, except for logotypes or where the presentation is essential.
- **1.4.10 Reflow** — Content reflows at 320 CSS pixels wide without requiring horizontal scrolling (except for content that requires 2D layout: maps, data tables, complex diagrams).
- **1.4.11 Non-text Contrast** — UI components (button borders, form input borders, focus indicators) and graphical objects required to understand content have a contrast ratio of at least **3:1** against adjacent colors.
- **1.4.12 Text Spacing** — No loss of content or functionality when users override: line height to 1.5×, paragraph spacing to 2× font size, letter spacing to 0.12×, word spacing to 0.16×.
- **1.4.13 Content on Hover or Focus** — Tooltips and popovers triggered by hover/focus are **dismissible** (Escape closes them), **hoverable** (the user can move the pointer over the popup without it disappearing), and **persistent** (they don't disappear until dismissed or the trigger is removed).

### 1.2 Operable

UI components and navigation must be operable.

#### Level A

- **2.1.1 Keyboard** — All functionality is operable through a keyboard, without requiring specific timings for individual keystrokes.
- **2.1.2 No Keyboard Trap** — Keyboard focus can be moved away from any component using only the keyboard (Tab, Shift+Tab, or documented exit keys).
- **2.1.4 Character Key Shortcuts** — Single-character key shortcuts can be turned off, remapped, or are active only on focus.
- **2.2.1 Timing Adjustable** — Users can turn off, adjust, or extend any time limit (except real-time events like auctions or where the limit is essential).
- **2.2.2 Pause, Stop, Hide** — Moving, blinking, or auto-updating content lasting more than 5 seconds can be paused, stopped, or hidden.
- **2.3.1 Three Flashes or Below Threshold** — Nothing flashes more than 3 times per second.
- **2.4.1 Bypass Blocks** — Provide a "skip to main content" link or equivalent landmark to bypass repeated content.
- **2.4.2 Page Titled** — Every page has a descriptive `<title>` that identifies its topic or purpose.
- **2.4.3 Focus Order** — Tab order matches a meaningful sequence that preserves the meaning of the content.
- **2.4.4 Link Purpose (In Context)** — The purpose of each link is clear from its text alone or its text combined with its programmatically determined context.
- **2.5.1 Pointer Gestures** — Multi-point or path-based gestures (pinch, swipe-path) have a single-pointer alternative.
- **2.5.2 Pointer Cancellation** — Single-pointer actions activate on the up-event, not the down-event (so users can abort by dragging away).
- **2.5.3 Label in Name** — The accessible name of a control contains the visible label text.
- **2.5.4 Motion Actuation** — Functionality triggered by device motion (shake, tilt) can also be triggered by UI controls and can be disabled.

#### Level AA

- **2.4.5 Multiple Ways** — More than one way is available to locate a page within the site (search, site map, navigation menu) — except where the page is a step in a process.
- **2.4.6 Headings and Labels** — Headings and form labels describe their topic or purpose.
- **2.4.7 Focus Visible** — Any keyboard-operable interface has a visible focus indicator. Don't remove `:focus` outlines without providing an equivalent.

### 1.3 Understandable

Information and operation of the UI must be understandable.

#### Level A

- **3.1.1 Language of Page** — The default human language of the page is set with `<html lang="...">`.
- **3.2.1 On Focus** — Receiving focus does not initiate a context change (no auto-submit, no redirect on focus).
- **3.2.2 On Input** — Changing the setting of a control does not automatically cause a context change unless the user has been advised in advance.
- **3.3.1 Error Identification** — Input errors are identified in text and the field in error is described to the user.
- **3.3.2 Labels or Instructions** — Labels or instructions are provided when content requires user input.

#### Level AA

- **3.1.2 Language of Parts** — The human language of each passage or phrase in different language from the page default is identified with `lang="..."`.
- **3.2.3 Consistent Navigation** — Navigation that appears on multiple pages is in the same relative order each time.
- **3.2.4 Consistent Identification** — Components with the same functionality are identified consistently across the site (same icon, same label).
- **3.3.3 Error Suggestion** — When an input error is detected and suggestions for correction are known, they are provided to the user.
- **3.3.4 Error Prevention (Legal, Financial, Data)** — For submissions that cause legal commitments, financial transactions, or modify/delete user-controllable data: submissions are reversible, checked for errors, or confirmed before finalizing.

### 1.4 Robust

Content must be robust enough to be reliably interpreted by user agents, including assistive technologies.

#### Level A

- **4.1.1 Parsing** — _(Obsolete and removed in WCAG 2.2 — no longer required.)_
- **4.1.2 Name, Role, Value** — For all UI components, the name and role can be programmatically determined; states, properties, and values can be programmatically set; notification of changes is available to assistive technologies. Use native HTML elements first; reach for ARIA only when native semantics are insufficient.

#### Level AA

- **4.1.3 Status Messages** — Status messages (form validation results, toasts, loading states) can be programmatically determined through role or properties so assistive tech can present them without receiving focus. Use `role="status"`, `role="alert"`, or `aria-live="polite"` / `"assertive"` as appropriate.

---

## 2. Section 508 (ADA / Rehabilitation Act)

Section 508 of the US Rehabilitation Act requires federal agencies and their contractors to make information and communication technology (ICT) accessible. The current **Revised 508 Standards** (effective January 18, 2018) **incorporate WCAG 2.0 Level A and AA by reference** for all web content, software, and electronic documents.

In practice: **meeting WCAG 2.1 AA (section 1 above) covers the WCAG portion of 508 with margin to spare**, since 2.1 is a superset of 2.0. The criteria below are the **additional 508-specific obligations** that go beyond WCAG and must be satisfied on top of section 1.

### 2.1 Functional Performance Criteria (Chapter 3, §302)

ICT with closed functionality (or where WCAG doesn't apply, like a kiosk or hardware control) must support users with the following disabilities. At least one mode of operation must be usable by each:

- **§302.1 Without Vision** — Operable without vision.
- **§302.2 With Limited Vision** — Operable with limited vision (zoom, high contrast).
- **§302.3 Without Perception of Color** — Operable without perception of color.
- **§302.4 Without Hearing** — Operable without hearing.
- **§302.5 With Limited Hearing** — Operable with limited hearing (volume control, captions).
- **§302.6 Without Speech** — Operable without speech (no voice-only inputs).
- **§302.7 With Limited Manipulation** — Operable with limited reach and strength.
- **§302.8 With Limited Reach and Strength** — Operable without fine motor control.
- **§302.9 Minimize Photosensitive Seizure Triggers** — Doesn't use flashing that could trigger seizures (overlaps with WCAG 2.3.1).
- **§302.10 With Limited Cognitive, Language, and Learning Abilities** — Features that support cognitive accessibility (clear language, predictable behavior).

### 2.2 Hardware (Chapter 4)

Applies to physical ICT (keyboards, kiosks, peripherals). Not directly relevant to a web application, but called out for procurement completeness:

- **§402 Closed Functionality** — Closed-functionality ICT must include speech-output mode and tactile/audible controls.
- **§403 Biometrics** — Biometrics cannot be the only means of identification.
- **§407 Operable Parts** — Tactilely discernible controls, operable with one hand without tight grasping/pinching/twisting, with operating force ≤5 lbf.

### 2.3 Software (Chapter 5)

Applies to any software (desktop, mobile, embedded) that isn't a web page. WCAG 2.0 AA applies; in addition:

- **§502.2.1 User Control of Accessibility Features** — Platform accessibility services (screen readers, switch access) cannot be disrupted by the application.
- **§502.2.2 No Disruption of Accessibility Features** — The application doesn't override or interfere with documented accessibility features of the OS.
- **§502.3 Accessibility Services** — Software exposes name, role, state, boundary, description, parent/child relationships, and events through the platform accessibility API. Web equivalent: WCAG 4.1.2 via the accessibility tree.
- **§502.4 Platform Accessibility Features** — Software conforms to the documented accessibility features of the platform it runs on.
- **§503.2 User Preferences** — Applications permit user preferences from platform settings for color, contrast, font type, font size, and focus cursor.
- **§503.3 Alternative User Interfaces** — If an alternative accessibility-focused UI is provided, it must have feature parity.
- **§503.4 User Controls for Captions and Audio Description** — Media players provide user-controllable captions and audio description with parity to other player controls.

### 2.4 Electronic Documents (Chapter 5, §504)

Authoring tools (and any documents this app generates: PDFs, Word docs, spreadsheets, slides) must:

- **§504.2 Content Creation or Editing** — The authoring tool preserves accessibility information when content is created or edited.
- **§504.2.1 Preservation of Information Required for Accessibility** — Conversions (e.g., HTML → PDF) preserve accessibility metadata (alt text, headings, table structure, language).
- **§504.3 Prompts** — Authoring tools prompt the author to provide required accessibility information (e.g., alt text on image insert).
- **§504.4 Templates** — Templates provided by the authoring tool are themselves accessible.

### 2.5 Support Documentation and Services (Chapter 6)

This is the obligation most often missed by web teams. It applies to the **product itself**:

- **§602.2 Accessibility and Compatibility Features** — Product documentation lists and explains the accessibility and compatibility features of the product.
- **§602.3 Electronic Support Documentation** — Documentation provided electronically (user guides, help pages, API docs) conforms to WCAG 2.0 AA.
- **§602.4 Alternate Formats for Non-Electronic Support Documentation** — Print documentation is available in an alternate accessible format on request.
- **§603.2 Information on Accessibility and Compatibility Features** — Support services (help desk, chat, phone support) provide information on the accessibility and compatibility features of the product.
- **§603.3 Accommodation of Communication Needs** — Support services accommodate the communication needs of users with disabilities.

### 2.6 Procurement implications

If this template is used to build software that will be sold to or used by a US federal agency:

- A **Voluntary Product Accessibility Template (VPAT)** / **Accessibility Conformance Report (ACR)** must be produced, documenting conformance against each applicable criterion above.
- Any third-party dependency (JavaScript library, embedded widget, font, video player, SaaS integration) inherits the same obligations. Vet vendor VPATs before integrating.
- Accessibility cannot be retrofitted at audit time without significant rework. Bake the WCAG 2.1 AA criteria from section 1 into the component library (`common/templates/components/`) so every consumer is conformant by default.

---

## 3. Testing

Accessibility cannot be proven with automated tools alone. Industry-accepted figures from axe-core, WebAIM, and Deque put automated coverage at roughly **30–40%** of WCAG success criteria — the remaining 60–70% require human judgment (is this alt text _meaningful_, is this focus order _logical_, is this label _descriptive_). A real conformance claim requires a **layered approach**: automated scans catch regressions, manual checks catch judgment-bound failures, assistive-tech walkthroughs catch the things only a real screen reader will surface, and user testing with people with disabilities catches the things no checklist anticipates.

The layers below are ordered from cheapest/fastest (run on every commit) to most expensive/slowest (run before release or quarterly). Apply them all — none of them is sufficient on its own.

### 3.1 The testing pyramid

| Layer                                           | Frequency                  | Catches                                                                                                     | Cost     |
| ----------------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------- | -------- |
| Automated unit/integration scans                | Every commit / PR          | Missing alt, label-less inputs, contrast (when computable), invalid ARIA, missing `lang`                    | Low      |
| Linters & build-time checks                     | Every save / build         | Inline-style anti-patterns, banned attributes (`tabindex` > 0, `autofocus`, `accesskey`), missing `<title>` | Very low |
| Manual keyboard pass                            | Per feature, every release | Focus traps, missing focus indicators, illogical tab order, mouse-only interactions                         | Low      |
| Screen-reader walkthrough                       | Per feature, every release | Unannounced state changes, broken reading order, ambiguous link/button names, missing live regions          | Medium   |
| Zoom / reflow / text-spacing checks             | Per feature, every release | Clipped text at 200%, horizontal scroll at 320px, broken layouts when users override spacing                | Low      |
| Cross-platform AT matrix                        | Pre-release                | Browser/screen-reader-specific bugs (NVDA + Firefox vs. JAWS + Chrome differ)                               | Medium   |
| Manual audit against full WCAG 2.1 AA checklist | Per release / quarterly    | Everything the prior layers miss; produces the conformance evidence for a VPAT/ACR                          | High     |
| User testing with people with disabilities      | Quarterly / annually       | Real-world friction; cognitive-load issues; problems no spec captures                                       | High     |

### 3.2 Automated tooling

Automated scanners are necessary but not sufficient. Use at least one rules engine in CI, and supplement with an in-browser checker for spot-checks during development.

**Rules engines (use in CI / unit tests):**

- **axe-core** (Deque, open source) — the most widely used accessibility rules engine. Has bindings for virtually every test framework: `@axe-core/playwright`, `@axe-core/puppeteer`, `jest-axe`, `cypress-axe`, `axe-core-selenium`. Zero false positives is its design goal — if axe-core flags it, it's almost certainly a real issue.
- **Pa11y** (open source, CLI) — wraps axe-core and HTML_CodeSniffer; runs scans against URLs or HTML files. Useful for crawling staging environments and producing CI reports. Pa11y CI runs against a sitemap and fails the build on regressions.
- **HTML_CodeSniffer** — checks raw HTML against WCAG 2.x rules. Best for static-site / template linting.
- **Google Lighthouse** (built into Chrome DevTools) — runs an axe-core subset plus performance/SEO checks. Good for a single-page sanity check; less suited to CI because the rule set is a subset.

**In-browser developer extensions (for hands-on triage):**

- **axe DevTools** (Chrome / Firefox / Edge extension) — scans the current page and groups issues by severity and WCAG criterion.
- **WAVE** (WebAIM, browser extension and online tool at `wave.webaim.org`) — overlays icons on the page so you can see structure, ARIA roles, and contrast failures in context.
- **Accessibility Insights for Web** (Microsoft, open source) — runs a "FastPass" axe scan plus a guided assessment that walks you through the manual WCAG checks.
- **ARC Toolkit** (TPGi) — deeper structural analysis than axe DevTools; useful for ARIA debugging.
- **Stark** (Figma plugin and browser extension) — contrast, color blindness simulation, focus order visualization. Good at design-time, before code exists.

**Contrast checkers (color and non-text):**

- **WebAIM Contrast Checker** (`webaim.org/resources/contrastchecker`) — pasteable hex values; checks against 1.4.3 and 1.4.11.
- **Colour Contrast Analyser** (TPGi, desktop app for macOS and Windows) — eyedropper-based; tests live UI even outside the browser.
- **Stark** — integrates into Figma so designers catch failures before handoff.

**Browser built-ins:**

- Chrome / Edge DevTools → **Lighthouse** tab + **Issues** tab + **Accessibility** sidebar on the Elements panel (shows computed accessible name, role, and ARIA tree).
- Firefox DevTools → **Accessibility** panel; can simulate color-vision deficiencies and check contrast across the page.
- Safari → **Develop → Show Web Inspector → Audit** tab.

**CI integration recommendations:**

- Pick one rules engine as the source of truth (axe-core is the safe default) and run it against representative pages or rendered components in unit/integration tests. Fail the build on any new violation.
- Snapshot the current violation count when adopting on a legacy codebase; gate on **no new violations** rather than zero, then burn down the backlog.
- Run a Pa11y CI crawl against a deployed preview environment on every PR for end-to-end coverage.
- Cache nothing — accessibility regressions are easy to introduce and hard to spot in review.

### 3.3 Manual keyboard testing

Most accessibility bugs that automated tools miss are reachable by keyboard alone. This pass takes minutes per page and catches more than any single scanner.

**The keyboard-only walkthrough:**

1. Put the mouse away. Reload the page.
2. Press **Tab** repeatedly from the top of the page through every interactive element.
3. For each focused element, verify:
    - The **focus indicator is visible** (WCAG 2.4.7) — outline, ring, background change, or border shift. Test on both light and dark backgrounds if applicable.
    - The **focus order makes sense** (WCAG 2.4.3) — tab order matches reading order.
    - The element is **actually reachable** — custom controls (`div role="button"`) often aren't.
4. **Shift+Tab** back through the page; confirm reverse order matches.
5. Activate every control: **Enter** on links and buttons, **Space** on buttons and checkboxes, **arrow keys** on radio groups / sliders / menus / tabs, **Escape** on dialogs / popovers / menus.
6. Open every modal, drawer, dropdown, menu, autocomplete, date picker, and tooltip. Verify:
    - Focus moves **into** the component when opened.
    - Focus is **trapped inside** modal dialogs while open.
    - Focus **returns to the trigger** when closed.
    - **Escape closes** the component.
7. Try to escape any iframe, embedded widget, or media player — **no keyboard traps** (WCAG 2.1.2).

**What this catches:** missing focus indicators, illogical tab order, `div` and `span` masquerading as buttons, keyboard traps, modals that don't trap focus, mouseover-only menus.

### 3.4 Screen-reader testing

Screen readers expose what assistive tech actually announces — automated tools cannot tell you whether "button" is a meaningful label. Test on the canonical browser-pair for each screen reader; bugs are often browser-specific.

| Screen reader     | Platform      | Cost                                  | Canonical browser pairing | Notes                                                              |
| ----------------- | ------------- | ------------------------------------- | ------------------------- | ------------------------------------------------------------------ |
| **NVDA**          | Windows       | Free (open source)                    | Firefox or Chrome         | The most-used SR in WebAIM surveys; start here.                    |
| **JAWS**          | Windows       | Commercial (free 40-minute demo mode) | Chrome                    | Required for many enterprise / government audits.                  |
| **VoiceOver**     | macOS         | Built in (Cmd+F5 to toggle)           | Safari                    | Required Safari pairing — VoiceOver behaves differently in Chrome. |
| **VoiceOver iOS** | iPhone / iPad | Built in (Settings → Accessibility)   | Safari                    | Test touch gestures, rotor navigation.                             |
| **TalkBack**      | Android       | Built in (Settings → Accessibility)   | Chrome                    | Test swipe navigation, explore-by-touch.                           |
| **Narrator**      | Windows       | Built in                              | Edge                      | Lower priority unless your user base skews Windows-default.        |
| **Orca**          | Linux         | Free (open source)                    | Firefox                   | Lower priority unless explicitly in scope.                         |

**Minimum coverage matrix for a public web product:**

- NVDA + Firefox (Windows)
- JAWS + Chrome (Windows)
- VoiceOver + Safari (macOS)
- VoiceOver + Safari (iOS)
- TalkBack + Chrome (Android)

**The screen-reader walkthrough (per page):**

1. Turn on the screen reader **before** loading the page.
2. Listen to the page-load announcement — is the page title meaningful (WCAG 2.4.2)? Is the language correct (3.1.1)?
3. Use the screen reader's **headings list** (NVDA: `H`; VoiceOver: VO+U → Headings; JAWS: `H`) — do headings form a logical outline (`h1` → `h2` → `h3`, no skips)?
4. Use the **landmarks list** to confirm `<main>`, `<nav>`, `<header>`, `<footer>` exist and have meaningful labels.
5. Use the **links list** and **form-controls list** — does every entry make sense out of context (WCAG 2.4.4)?
6. Navigate the page top-to-bottom; for every interactive element, the screen reader should announce **role, name, and state** (WCAG 4.1.2): "Search, edit, blank", "Submit, button", "Show details, button, collapsed".
7. Submit forms with errors — does the SR announce the error message (WCAG 4.1.3)? Does focus move to the first error, or is the error linked to the field via `aria-describedby`?
8. Trigger toasts, async loaders, and validation messages — are they announced via live regions?

**Tip:** learning a screen reader is a real skill. Budget time. The WebAIM "Designing for Screen Reader Compatibility" guide and Deque's free "axe Academy" courses are the standard starting points.

### 3.5 Visual / zoom / reflow testing

These checks are cheap and catch a surprising number of failures.

- **200% zoom** (WCAG 1.4.4) — browser zoom (Cmd/Ctrl + `+`) to 200%; no text clipped, no horizontal scroll on the main content, all functionality available.
- **400% zoom + reflow** (WCAG 1.4.10) — set the viewport to **1280×1024** at **400% zoom** (or equivalently 320 CSS pixels wide) and confirm content reflows without horizontal scroll, except for genuinely 2D content (maps, complex tables).
- **Text-only zoom** — Firefox: `View → Zoom → Zoom Text Only`. Tests that the layout survives larger text without proportional spacing.
- **Text spacing override** (WCAG 1.4.12) — install a bookmarklet (search "Steve Faulkner text spacing bookmarklet") that applies line-height 1.5, paragraph-spacing 2×, letter-spacing 0.12×, word-spacing 0.16× and confirm nothing clips or overlaps.
- **Forced-colors / high-contrast mode** — Windows Settings → Accessibility → Contrast themes; macOS System Settings → Accessibility → Display → Increase contrast. Verify content is still visible and interactive elements still have boundaries.
- **Color-vision simulation** — Chrome DevTools → Rendering → Emulate vision deficiencies (protanopia, deuteranopia, tritanopia, achromatopsia, blurred vision). Confirms WCAG 1.4.1 (use of color).
- **Reduced motion** — set the OS "Reduce motion" preference; confirm CSS respects `prefers-reduced-motion` and disables non-essential animation (overlaps with WCAG 2.3.3 at AAA but is best practice at AA).
- **Orientation** (WCAG 1.3.4) — rotate a phone/tablet to landscape; nothing should be locked to portrait unless essential.

### 3.6 Cognitive / content checks

These are manual judgment calls and need a careful reader, not a tool.

- Read every heading and link out loud — does it describe its target?
- Read every form label — could a first-time user fill out the form?
- Read every error message — does it say _what_ is wrong and _how_ to fix it (WCAG 3.3.3)?
- Check reading level — aim for plain language. Tools like the Hemingway Editor, `textstat` (Python), or built-in Word/Docs grade-level meters give a rough Flesch-Kincaid score; WCAG AAA targets ~grade 9, AA has no formal bar but plain language is always preferred.

### 3.7 PDFs and other electronic documents

If the product emits PDFs, Word documents, or spreadsheets (Section 508 §504 territory), each needs its own pass:

- **Adobe Acrobat Pro** → **Accessibility → Accessibility Check** runs the PDF/UA rules.
- **PAC (PDF Accessibility Checker)** — free, more rigorous than Acrobat's built-in; the de facto reference for PDF/UA conformance.
- **CommonLook PDF** — commercial; used by federal contractors for remediation.
- **Microsoft Word / Excel / PowerPoint** → File → Info → **Check Accessibility** flags missing alt text, bad table structure, missing slide titles.
- Tagged structure, alternative text, table headers, document language, and reading order all need to be set and verified — automated checkers catch the structural failures but not whether the alt text is meaningful.

### 3.8 User testing with people with disabilities

No automated tool, no manual checklist, and no internal screen-reader pass substitutes for watching a real user navigate the product. Recommended at minimum once per major release or quarterly.

- **Recruiting:** Fable (`makeitfable.com`), Access Works, Knowbility AccessWorks, and Applause provide panels of users with disabilities for moderated and unmoderated sessions.
- **Scope:** include users of multiple assistive technologies — at minimum a screen-reader user, a keyboard-only user, and a voice-control user (Dragon NaturallySpeaking, Voice Control). Cognitive accessibility testing (people with dyslexia, ADHD, low literacy) is often skipped and shouldn't be.
- **Compensate participants fairly.** This work is labor, not a favor.

### 3.9 Recommended cadence

A practical schedule for a product team:

- **Every commit:** automated rules-engine scan in CI, lint-time checks (no banned attributes, semantic HTML enforced).
- **Every PR that touches UI:** developer runs the keyboard-only walkthrough (§3.3) on the affected page; spot-checks contrast on any new color combinations.
- **Every feature merge:** one screen-reader pass on the canonical pairing for the developer's platform (e.g., VoiceOver+Safari for macOS devs, NVDA+Firefox for Windows devs).
- **Every release:** full manual WCAG 2.1 AA checklist on changed pages, cross-platform SR matrix (§3.4), zoom/reflow/text-spacing (§3.5).
- **Quarterly:** third-party audit or internal full-site sweep; user testing session with people with disabilities; refresh the VPAT/ACR if one is published.
- **Annually:** full external audit by an accessibility consultancy (Deque, TPGi, Level Access, WebAIM, Knowbility are the common names) for the conformance claim that backs a VPAT or government bid.

### 3.10 Documenting results

For any conformance claim, keep an audit trail:

- A **statement of conformance** stored with the product (e.g., `/accessibility/` page on the site) listing the standard targeted (WCAG 2.1 AA + Section 508), known exceptions, and a contact for feedback.
- The latest **VPAT 2.x / ACR** if the product is sold to or used by US federal agencies.
- The latest **audit report** from internal or third-party testing.
- A public **feedback channel** (email or form) for users to report accessibility barriers, and a documented response SLA.

These artifacts are what auditors, procurement officers, and (in the worst case) plaintiffs' attorneys will ask for. Producing them at audit time from a cold start is far more expensive than maintaining them continuously.

---

## 4. Vue 3 / SPA applied patterns

Standards conformance happens in real components. The patterns below cover the things an SPA gets wrong by default — they are **prescriptive defaults** for components in this template.

### 4.1 SPAs need explicit route announcements

A traditional multi-page app announces the new page title to screen readers on every navigation. An SPA changes the DOM in place; the screen reader stays quiet. Wire a route guard that updates `document.title` and announces the change via a live region:

```js
// src/router/index.js
router.afterEach((to) => {
    document.title = to.meta.title
        ? `${to.meta.title} — App Name`
        : "App Name";

    // announce to screen readers
    const announcer = document.getElementById("route-announcer");
    if (announcer) {
        announcer.textContent = `Navigated to ${to.meta.title ?? to.name}`;
    }
});
```

```vue
<!-- App.vue -->
<template>
    <div
        id="route-announcer"
        role="status"
        aria-live="polite"
        class="sr-only"
    />
    <RouterView />
</template>
```

Without this, WCAG 2.4.2 (Page Titled) and 4.1.3 (Status Messages) fail on every navigation.

### 4.2 Focus management on route change

By default the focused element stays focused across a route change — often pointing at something that no longer exists on the new view. Move focus to the new view's main heading or the `<main>` landmark:

```js
router.afterEach(async () => {
    await nextTick();
    const main = document.querySelector("main");
    if (main) {
        main.setAttribute("tabindex", "-1");
        main.focus();
    }
});
```

Covers WCAG 2.4.3 (Focus Order) and avoids the "tab key starts from a stale element" trap.

### 4.3 Skip link

WCAG 2.4.1 (Bypass Blocks) requires a way to skip repeated content. In `App.vue`:

```vue
<template>
    <a
        href="#main-content"
        class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:p-2"
    >Skip to main content</a>
    <NavBar />
    <main id="main-content">
        <RouterView />
    </main>
</template>
```

Tailwind's `sr-only` + `focus:not-sr-only` is the canonical pattern — invisible until focused, then fully visible.

### 4.4 ARIA on dynamic state

Vue's reactive bindings make ARIA attributes trivial to keep in sync with state. Always bind, never set imperatively:

```vue
<button
    :aria-expanded="isOpen"
    :aria-controls="panelId"
    @click="toggle"
>
    {{ isOpen ? "Hide" : "Show" }} details
</button>
<div
    :id="panelId"
    :hidden="!isOpen"
    role="region"
>
    …
</div>
```

For controls without a native role (custom dropdowns, tabs, accordions), reach for **`@vueuse/core`** or **`reka-ui`** (formerly Radix Vue) headless primitives before hand-rolling — they get the ARIA semantics, keyboard handling, and focus management right.

### 4.5 Focus trap in modals

Modal dialogs must trap focus (WCAG 2.1.2). Use `useFocusTrap` from `@vueuse/integrations` (built on `focus-trap`):

```vue
<script setup>
import { useFocusTrap } from "@vueuse/integrations/useFocusTrap";
import { useTemplateRef } from "vue";

const modalRef = useTemplateRef("modal");
const { activate, deactivate } = useFocusTrap(modalRef);
</script>
```

Don't try to hand-roll keyboard-only focus containment — the edge cases (Shift+Tab on the first element, focus on iframes inside the modal, screen-reader virtual cursor) are subtle.

### 4.6 Live regions for async state

When the user submits a form, triggers a search, or kicks off a long action, screen readers must be told the outcome (WCAG 4.1.3). Two patterns:

```vue
<!-- For polite status updates (form save success) -->
<div
    role="status"
    aria-live="polite"
>
    {{ statusMessage }}
</div>

<!-- For urgent errors (validation failure, network error) -->
<div
    role="alert"
    aria-live="assertive"
>
    {{ errorMessage }}
</div>
```

The `role` and `aria-live` together are the safer bet — older screen readers honor one or the other.

### 4.7 Forms

Already covered in [FRONTEND.md §7](FRONTEND.md). The accessibility-critical rules:

- Every input has `<label for="…">`. Placeholders are not labels.
- Errors link via `aria-describedby` (not just visual proximity).
- `autocomplete` set per WCAG 1.3.5 (`autocomplete="email"`, `"given-name"`, etc.).
- Required fields use `required` (the attribute), not just visual `*` indicators.
- Validation errors are announced via a live region (§4.6).

### 4.8 `prefers-reduced-motion`

Tailwind ships a `motion-reduce:` variant. Gate non-essential animation:

```html
<div class="animate-spin motion-reduce:animate-none">…</div>
<div class="transition-all motion-reduce:transition-none">…</div>
```

For JS-driven animation (`gsap`, `motion`, Vue's `<Transition>`), check `window.matchMedia("(prefers-reduced-motion: reduce)").matches` and short-circuit.

### 4.9 Keep the language attribute current

`<html lang="…">` (WCAG 3.1.1) is set in [index.html](../index.html) — the scaffold now ships with `lang="en"` and a real `<title>Vue Template</title>` (replacing the prior empty `lang=""` and placeholder `<title>Vite App</title>`). If the deploy targets a non-English audience, update `lang` accordingly before the build.

If the app supports multiple languages, update `document.documentElement.lang` when the locale changes (typically in a `vue-i18n` watcher).

### 4.10 Color and theme

Color contrast (WCAG 1.4.3, 1.4.11) is checked at the **design token** level, not per-component — see [DESIGN.md §2](DESIGN.md). When tokens land:

- Every `--color-surface` + `--color-surface-content` pair meets ≥4.5:1 (text) or ≥3:1 (large text / non-text UI).
- Dark mode tokens (if adopted) are independently checked — light-mode contrast does not imply dark-mode contrast.
- Tooling: Stark (Figma + browser), WebAIM Contrast Checker, Chrome DevTools' contrast checker on the Elements panel.

### 4.11 Recommended Vue accessibility ecosystem

- **`@vueuse/core`** — `useFocus`, `useFocusTrap`, `useFocusWithin`, `usePreferredReducedMotion`, `useMediaQuery` for media-query-driven a11y branches.
- **`reka-ui`** (formerly Radix Vue) — headless UI primitives (dialog, popover, dropdown, tabs, etc.) with ARIA and keyboard semantics baked in.
- **`vue-axe-next`** — runs axe-core checks on every render in dev. Catches regressions at the time they're introduced.
- **`eslint-plugin-vuejs-accessibility`** — lint-time checks for missing alt, missing labels, `tabindex > 0`, autofocus, etc. Wire alongside `eslint-plugin-vue` when ESLint lands.

Adopt these deliberately as the project grows; don't bundle them all up front.
