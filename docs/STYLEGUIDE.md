# UI/UX Styleguide: "Fluid Utility"

## Visual Metaphor: Crystal Stream
The interface should feel "liquid", transparent, and non-pressuring.

## CSS Variables (Source of Truth)
Define these in your main CSS file to maintain consistency.

```css
:root {
  /* Colors */
  --bg-clean: #f8f9fa;        /* Off-white background */
  --bg-navy: #0a192f;         /* Deep liquid navy (dark mode) */
  --primary: #00ced1;         /* Vibrant Teal (water energy) */
  --accent-coral: #ff7f50;    /* Warm Coral (achievement) */
  --accent-gold: #ffd700;     /* Soft Gold (Caregiver touch) */
  
  /* Glassmorphism */
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-blur: blur(12px);
  --glass-border: rgba(255, 255, 255, 0.3);
  
  /* Shapes */
  --radius-lg: 24px;          /* Main cards */
  --radius-md: 16px;          /* Buttons, inputs */
  --shadow-liquid: 0 10px 30px rgba(0, 0, 0, 0.05);
}
```

## Component Patterns

### 1. Exercise Cards
- **Radius:** 24px.
- **Padding:** 16px to 20px.
- **Interaction:** Tapping toggles a soft "Done" state (desaturated background or checkmark appearance).

### 2. Buttons
- **Touch Targets:** Minimum 48x48px for mobile accessibility.
- **Style:** "Soft Organic" — high border-radius, subtle liquid shadows.

### 3. Typography Hierarchy
- **Workout Title:** Large, Bold, Sans-serif (Inter/Geist).
- **Section Headers:** Medium, Semi-bold, muted color.
- **Field Values:** Monospace or High-contrast Sans-serif for readability during activity.

## Design Rules
- **No Hard Edges:** Avoid 0px border-radius.
- **Spacing:** Use a 4px or 8px grid system.
- **Empty States:** Use "—" instead of leaving fields blank.
- **Feedback:** Use subtle color flashes when values change.
