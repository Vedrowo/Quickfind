---
name: Lumina Knowledge System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d0daf0'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d9e3f9'
  on-surface: '#121c2c'
  on-surface-variant: '#434844'
  inverse-surface: '#273141'
  inverse-on-surface: '#ebf1ff'
  outline: '#747873'
  outline-variant: '#c3c8c2'
  surface-tint: '#556158'
  primary: '#556158'
  on-primary: '#ffffff'
  primary-container: '#e8f5e9'
  on-primary-container: '#647167'
  inverse-primary: '#bdcabe'
  secondary: '#286b33'
  on-secondary: '#ffffff'
  secondary-container: '#abf4ac'
  on-secondary-container: '#2e7238'
  tertiary: '#5b5f61'
  on-tertiary: '#ffffff'
  tertiary-container: '#eff2f4'
  on-tertiary-container: '#6a6e70'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e6da'
  primary-fixed-dim: '#bdcabe'
  on-primary-fixed: '#131e17'
  on-primary-fixed-variant: '#3e4a41'
  secondary-fixed: '#abf4ac'
  secondary-fixed-dim: '#90d792'
  on-secondary-fixed: '#002107'
  on-secondary-fixed-variant: '#07521d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c3c7c9'
  on-tertiary-fixed: '#181c1e'
  on-tertiary-fixed-variant: '#434749'
  background: '#f9f9ff'
  on-background: '#121c2c'
  surface-variant: '#d9e3f9'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '700'
    lineHeight: 28px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px
  sidebar-width: 260px
  preview-panel-width: 400px
---

## Brand & Style

This design system is built for clarity, focus, and intellectual efficiency. It targets professionals who need to extract insights from vast datasets without visual distraction. The brand personality is **composed, helpful, and precise**.

The visual style is **Modern Minimalism** with a focus on functional hierarchy. It utilizes a "soft-utilitarian" approach—combining the clean structure of enterprise SaaS with the approachable warmth of organic tones. The UI leverages generous whitespace to reduce cognitive load, ensuring that the AI-generated content remains the primary focus. Subtle borders and soft shadows replace heavy fills to maintain a lightweight, airy feel.

## Colors

The palette is centered around a "Mint & Charcoal" high-legibility scheme. 

- **Primary (#E8F5E9):** Used for large surface highlights, active navigation states, and background washes for AI responses to signify a "safe" and "assisted" environment.
- **Secondary (#81C784):** A more saturated green used for icons, primary action buttons, and success states to provide necessary contrast.
- **Surface (#FFFFFF):** The base for all primary content cards and document previews.
- **Background (#F7FAFC):** A very cool grey used for the main application backdrop to make white cards pop.
- **Typography (#2D3748):** A deep charcoal that provides excellent readability without the harshness of pure black.
- **Subtle Border (#E2E8F0):** Used for hair-line dividers and component strokes.

## Typography

This design system utilizes **Inter** for its neutral, highly legible character, particularly at small sizes in data-heavy environments.

- **Headlines:** Use a tighter letter-spacing and heavier weight to anchor sections.
- **Body Text:** Optimized for long-form reading with a 1.5x line-height ratio. 
- **Labels:** Used for metadata, sidebar categories, and "Referenced Documents" headers. These use a slightly increased letter-spacing for better scanability.
- **Monospace (Optional):** For document IDs or code snippets, use `JetBrains Mono` at 13px.

## Layout & Spacing

The layout follows a **three-pane functional split**:
1.  **Navigation Sidebar:** Fixed width (260px), light-grey background, containing the logo, main navigation links, and user profile.
2.  **Main Content/Chat:** Fluid width, centered focus. Chat bubbles should have a maximum width of 800px to maintain line-length readability.
3.  **Contextual Preview:** A slide-in or fixed right panel (400px) used for viewing document sources without leaving the chat context.

**Breakpoints:**
- **Desktop (1280px+):** All three panes visible.
- **Tablet (768px - 1279px):** Sidebar collapses into a hamburger menu; Preview panel becomes an overlay.
- **Mobile (<767px):** Single pane focus. Margins reduce to 16px.

## Elevation & Depth

This design system avoids heavy shadows, opting for **Tonal Layering** and **Soft Outlines** to communicate depth.

- **Level 0 (Background):** Used for the main app shell (`#F7FAFC`).
- **Level 1 (Surface):** Main content cards and sidebars. Defined by a 1px border (`#E2E8F0`).
- **Level 2 (Interaction):** Active chat bubbles or hovered items. These use a very soft, diffused shadow: `0 4px 12px rgba(0, 0, 0, 0.03)`.
- **Level 3 (Overlays):** Modals and dropdowns. Use a more pronounced shadow: `0 10px 25px rgba(0, 0, 0, 0.08)`.

The Document Preview panel should use a 1px left-border to separate it from the main workspace rather than a shadow, maintaining a "split-screen" feel.

## Shapes

The shape language is consistently **Rounded**, creating a friendly and modern workspace. 

- **Containers:** Standard cards, chat bubbles, and the Document Preview panel use a 12px-16px radius.
- **Inputs:** Search bars and text inputs use a 12px radius.
- **Buttons:** Primary buttons use a slightly higher 12px radius or a full pill shape for secondary actions like "Tags" or "Chips."
- **Icons:** Should be encased in a 40px x 40px rounded-square container with an 8px radius when used in lists or sidebars.

## Components

### Buttons
- **Primary:** Background `#81C784`, Text `#FFFFFF`. Bold and clear.
- **Secondary:** Background `#E8F5E9`, Text `#2D3748`. Used for less urgent actions.
- **Ghost:** No background, border `#E2E8F0`, Text `#2D3748`. Used for sidebar items.

### Chat Bubbles
- **User:** Right-aligned, Background `#81C784`, Text `#FFFFFF`. 
- **Assistant:** Left-aligned, Background `#FFFFFF`, Border 1px `#E2E8F0`, Text `#2D3748`.
- **System/Context:** Background `#E8F5E9`, used for system messages or "Referenced Documents" containers within the chat.

### Inputs
- **Chat Input:** Large, white background, 1px border, 12px roundedness. The "Send" button should be nested inside the input on the right side.

### Cards & Lists
- **Document Source Card:** Minimalist. Icon on the left, title in `headline-md`, and a short snippet in `body-md`. 
- **Sidebar Nav Item:** Active state should use the primary mint color (`#E8F5E9`) for the background and a darker green for the icon and text to ensure high contrast.

### Chips
- Used for document tags or "suggested questions." Use a `#F7FAFC` background with a subtle `#E2E8F0` border and 20px height.