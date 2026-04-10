# Design System Specification: The Digital Curator
 
## 1. Overview & Creative North Star
The North Star of this design system is **"The Digital Curator."** We are moving away from the "utility-first" appearance of standard fintech apps and toward a high-end, editorial experience. This system treats financial data as a collection of precious assets, presented with the authority of a premium gallery and the precision of a Swiss vault.
 
To achieve this, we reject the rigid, boxed-in layouts of traditional UI. We embrace:
*   **Intentional Asymmetry:** Strategic use of whitespace and off-center alignments to guide the eye.
*   **Tonal Depth:** Replacing physical borders with light and shadow.
*   **Editorial Scale:** Bold, high-contrast typography that makes a statement.
 
---
 
## 2. Colors & Surface Architecture
 
### The Palette
The core environment is **OLED-first (#080d1a)**. This deep black provides the canvas for our "Emerald" accents and high-contrast editorial type.
 
*   **Primary (The Jewel):** `#4cdf9d` (Text/Iconography)
*   **Secondary (The Glow):** `#6cffbf`
*   **Surface:** `#0e1320` (The base foundation)
*   **Error:** `#ffb4ab` (With a signature soft glow using `#ff6b6b`)
 
### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define boundaries through **Tonal Transitions**. A section is never "boxed"; it is simply a different depth of dark blue-grey. If you feel the need for a line, use a background color shift instead.
 
### Surface Hierarchy & Nesting
Depth is achieved by stacking Material 3-style containers. Use these to create "nested" importance:
1.  **Background (`#0e1320`):** The canvas.
2.  **Surface-Container-Low (`#161b29`):** Subtle sections.
3.  **Surface-Container-Mid (`#1a1f2d`):** Secondary interactive zones.
4.  **Surface-Container-High (`#252a38`):** Prominent cards.
5.  **Surface-Container-Highest (`#303443`):** Active or hovered states.
 
### The "Glass & Gradient" Rule
To add "soul" to the UI, use **Feature Glass** for floating elements (modals, navigation bars, or highlighted stats).
*   **Opacity:** 60-70% of the surface color.
*   **Blur:** 20px Backdrop-Blur.
*   **Signature Glow:** Primary buttons must use a linear gradient (`#00b87a` → `#00e5a0`) to mimic the internal light of a cut emerald.
 
---
 
## 3. Typography
We have moved away from "Inter" to embrace a more sophisticated, editorial pairing.
 
*   **Headlines (DM Serif Display):** Used for "Editorial" moments—large balances, screen titles, and high-level summaries. It should feel authoritative and timeless.
*   **UI & Body (DM Sans):** Used for all functional text. It is modern, highly legible, and geometric, providing a clean contrast to the serif headings.
 
### Typography Scale
*   **Display LG:** 3.5rem (DM Serif Display) - Use for hero balances.
*   **Headline MD:** 1.75rem (DM Serif Display) - Use for section titles.
*   **Title MD:** 1.125rem (DM Sans, Medium) - Use for card headings.
*   **Body MD:** 0.875rem (DM Sans, Regular) - Standard reading text.
*   **Label SM:** 0.6875rem (DM Sans, Bold, All Caps) - Used for metadata and overlines.
 
---
 
## 4. Elevation & Depth
 
### The Layering Principle
Avoid "drop shadows" on standard cards. Instead, use the **Base-8 Spacing Scale** (4, 8, 16, 24, 32, 48, 64) to create separation. A `surface-container-low` card sitting on a `surface` background creates a natural, soft lift.
 
### Ambient Shadows
When an element must float (e.g., a bottom sheet or a detached menu), use **Ambient Shadows**:
*   **Blur:** 40px – 60px.
*   **Opacity:** 4% – 8%.
*   **Color:** Use a tinted version of `on-surface` (a very faint blue-grey) rather than black.
 
### The "Ghost Border" Fallback
If WCAG AA accessibility requires a container boundary, use a **Ghost Border**:
*   **Token:** `outline-variant` (#3c4a41).
*   **Opacity:** 20% max.
*   **Weight:** 1px.
*   This ensures contrast without breaking the "No-Line" editorial aesthetic.
 
---
 
## 5. Components
 
### Buttons
*   **Primary:** Emerald Gradient (`#00b87a` to `#00e5a0`). 0.75rem (xl) corner radius. White or `on-primary` text.
*   **Secondary:** Ghost Border with `on-surface` text.
*   **Tertiary:** Text-only, 0.75rem (xl) padding, DM Sans Bold.
 
### Cards & Lists
*   **Forbidden:** Divider lines. 
*   **Required:** Use 16px or 24px of vertical whitespace to separate items. For lists, use a subtle background shift (`surface-container-low`) on every other item or upon hover.
 
### Input Fields
*   **Structure:** Minimalist. No bottom line or full box. Use a `surface-container-high` background with a `0.25rem` radius.
*   **Focus State:** A 1px "Ghost Border" at 50% opacity in the primary emerald color.
 
### States & Feedback
*   **Empty States:** Use minimalist, thin-stroke illustrations. No heavy fills. Text should be `body-md` in `on-surface-variant`.
*   **Loading States:** Shimmer skeletons using a gradient from `surface-container` to `surface-container-highest`. Movement should be slow and fluid (2s duration).
*   **Error States:** Use `#ff6b6b`. Apply a 10px soft outer glow (drop shadow) to the error icon or text to make it feel urgent but integrated into the dark theme.
 
---
 
## 6. Do’s and Don’ts
 
### Do:
*   **Do** use asymmetrical layouts. Let a heading hang further left than the body text below it to create an editorial feel.
*   **Do** use "DM Serif Display" for numbers. They are the "hero" of a financial app.
*   **Do** use `surface-bright` for hover states to create a "bloom" effect on cards.
 
### Don’t:
*   **Don’t** use pure white (#FFFFFF) for body text. Use `on-surface` (#dee2f5) to reduce eye strain on dark backgrounds.
*   **Don’t** use standard shadows. If it doesn't look like light passing through glass, it's too heavy.
*   **Don’t** use "Inter" or "Roboto." This system relies on the specific character of DM Serif and DM Sans.