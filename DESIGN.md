# Design System: The Emerald Ledger

This design system is a bespoke framework crafted for a premium, mobile-first financial experience. It moves away from the sterile, "template-ready" look of traditional banking apps, opting instead for a high-end editorial aesthetic. By leveraging high-contrast typography and tonal layering, we create an environment that feels both authoritative and technologically advanced.

## 1. Creative North Star: "The Digital Private Bank"
The visual identity is built on the concept of a **"Digital Private Bank."** It evokes the feeling of a bespoke leather-bound ledger reimagined for the OLED era. 

To break the "standard PWA" feel, we employ:
*   **Intentional Asymmetry:** Avoid centering everything. Align large headlines to the left while tucking secondary data points into the right margin to create a sophisticated, unbalanced balance.
*   **Tonal Depth:** Instead of using lines to separate bank accounts or transactions, we use the "physics of light"—layering different shades of dark blue and green to create natural boundaries.
*   **The Emerald Pulse:** The accent color is not just a button color; it is a signal of health and vitality against the deep void of the background.

## 2. Color & Surface Architecture
We do not use borders. We use depth.

### The "No-Line" Rule
Explicitly prohibited: 1px solid borders for sectioning content. Boundaries must be defined solely through background color shifts or subtle tonal transitions. If two elements touch, their differentiation comes from their `surface-container` level, not a stroke.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the following hierarchy to "lift" content toward the user:
*   **Base Layer (`surface` / `#0e1320`):** The canvas.
*   **Secondary Layer (`surface-container-low` / `#161b29`):** Large grouping areas (e.g., the background of a transaction list).
*   **Action Layer (`surface-container-high` / `#252a38`):** Interactive cards or modals.
*   **Floating Layer (`surface-container-highest` / `#303443`):** Critical pop-overs or floating action buttons.

### The "Glass & Gradient" Rule
For high-priority items like "Total Balance" cards, use **Glassmorphism**. Apply `surface-variant` at 60% opacity with a `24px` backdrop-blur. This allows the deep emerald glows of the background to bleed through, softening the edges of the UI.

### Signature Textures
Main CTAs should never be flat. Use a subtle linear gradient:
*   **Primary CTA:** From `primary-container` (#00e5a0) to `primary` (#6effc0) at a 135-degree angle. This adds a "jewel-toned" luster that feels expensive.

## 3. Typography: Editorial Authority
We utilize a high-contrast pairing to distinguish between "The Story" (Headings) and "The Data" (UI).

*   **The Voice (Newsreader/Serif):** Used for `display` and `headline` scales. This provides an editorial, trustworthy feel. It should be used for large balance amounts and section headers.
*   **The Engine (Manrope/Sans):** Used for `title`, `body`, and `label` scales. This is a technical, highly legible font designed for rapid scanning of transaction names and dates.

**Typography Hierarchy Strategy:**
*   **Display Large (3.5rem):** Reserved exclusively for the primary account balance.
*   **Headline Medium (1.75rem):** Used for "Total Monthly Spend" or "Credit Health" section titles.
*   **Label Small (0.6875rem):** All-caps with 0.05em letter spacing for "URGENT" or "PENDING" status flags.

## 4. Elevation & Depth
In this design system, shadows are light, not dark.

*   **The Layering Principle:** To create a "card," place a `surface-container-lowest` (#090e1b) element on a `surface-container-low` (#161b29) background. This creates a "recessed" look that feels integrated into the interface.
*   **Ambient Shadows:** For floating elements, use a shadow color tinted with the primary emerald (`#00e5a0` at 8% opacity) with a blur of `32px`. This mimics the glow of an OLED screen rather than a physical shadow.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., in high-contrast mode), use `outline-variant` at **15% opacity**. It should be felt, not seen.

## 5. Components

### Cards & Lists (The Core)
*   **Rule:** Never use dividers. Use `16px` of vertical white space to separate list items.
*   **Context:** For bank transactions, use a `surface-container-low` background for the "Today" group and `surface-container-lowest` for the "Yesterday" group to create a visual temporal shift.

### Buttons
*   **Primary:** Gradient of `primary-container` to `primary`. Roundedness: `xl` (0.75rem).
*   **Secondary:** No background. `outline` color for text. When hovered/tapped, a `surface-container-high` subtle ghost fill appears.
*   **Tertiary:** Text-only in `primary-fixed-dim`, used for "View All" or "Dismiss."

### Financial Input Fields
*   **Style:** Minimalist. No box. Only a `surface-container-highest` bottom bar (2px).
*   **Focus State:** The bottom bar transitions to `primary` (#00e5a0) with a subtle outer glow.

### Status Chips (Urgency Scale)
*   **Safe (Green):** Text `on-primary-container`, background `primary-container` at 20% opacity.
*   **Warning (Gold):** Text `on-secondary-container`, background `secondary-container` at 20% opacity.
*   **Urgent (Red):** Text `on-tertiary-container`, background `tertiary-container` at 20% opacity.
*   **Interaction:** Chips should use `full` roundedness (pill shape) to contrast against the `xl` roundedness of cards.

### The "Credit Progress" Radial
*   A custom component for credit scores. Use a thick `primary` stroke with a `primary-fixed-variant` track. The center should be transparent, revealing the `surface` color behind it.

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme whitespace. If you think there is enough room between elements, add 8px more.
*   **Do** use `Newsreader` for any text that is meant to be "read" (storytelling) and `Manrope` for anything that is "processed" (data).
*   **Do** use "Emerald Glows"—small, blurred circles of `primary` color at 5% opacity tucked behind important cards to give the UI a signature atmosphere.

### Don’t:
*   **Don’t** use pure black (#000000). Use the `surface-container-lowest` (#090e1b) for OLED-friendly depth that still allows for subtle shadows.
*   **Don’t** use 100% opacity borders. It breaks the "Private Bank" premium feel.
*   **Don’t** use standard "Success Green" (#4CAF50). Only use the specified Emerald (`#00e5a0`) to maintain brand cohesion.