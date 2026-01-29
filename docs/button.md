# Button

## Usage

Buttons are interactive elements that trigger actions when clicked or activated. This design system provides two specialized button variants optimized for their specific use cases.

### Back Button

Use the back button to provide navigation back to a previous view or the homepage. It appears fixed in the top-left corner of detail pages.

~~~preview
<a href="#" class="back-button" style="position: static;" onclick="event.preventDefault()">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</a>
~~~

**When to use:**
- On detail/content pages to return to the list view
- When the browser back button may not provide the expected behavior
- To maintain context within a single-page application

**When not to use:**
- On the homepage or top-level navigation
- When standard browser navigation is sufficient
- As a general-purpose button for actions

### Theme Toggle

Use the theme toggle to allow users to switch between light and dark color modes. It appears fixed in the top-right corner and persists across all pages.

~~~preview
<button type="button" class="theme-toggle" style="position: static;">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="sun-icon" d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</button>
~~~

**When to use:**
- To give users control over their viewing preference
- On sites with both light and dark theme support

**When not to use:**
- If your site only supports a single color mode
- As a decorative element without functionality

## Style

### Visual Specifications

Both button variants share a consistent visual language designed for minimal footprint and maximum clarity.

| Property | Value |
|----------|-------|
| Width | 32px |
| Height | 32px |
| Border radius | 50% (circular) |
| Icon size | 16x16px |
| Position | Fixed |
| Z-index | 1000 |

### Design Tokens

| Token | Purpose | Light Mode | Dark Mode |
|-------|---------|------------|-----------|
| `--button-bg` | Default background | Semi-transparent gray | Semi-transparent gray |
| `--button-bg-hover` | Hover background | Slightly darker | Slightly lighter |
| `--color-text` | Icon color | Dark gray | Light gray |

### States

**Default**
- Background uses `--button-bg` with backdrop blur
- Icon inherits `--color-text`

**Hover**
- Background transitions to `--button-bg-hover`
- Scale transforms to 1.05 (5% larger)
- Transition duration: 200ms ease

**Focus**
- Visible focus ring for keyboard navigation
- Uses system focus styles

### Backdrop Blur

Both buttons use `backdrop-filter: blur(10px)` to create a frosted glass effect. This helps the buttons remain visible against varying background content while maintaining a lightweight appearance.

**Browser support note:** The `-webkit-backdrop-filter` prefix is included for Safari compatibility.

## Code

### Back Button

The back button uses an anchor element for semantic navigation.

```html
<a href="#" class="back-button" aria-label="Back to home">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</a>
```

**CSS class:** `.back-button`

**Required attributes:**
- `href` - Navigation destination
- `aria-label` - Accessible name for screen readers

### Theme Toggle

The theme toggle uses a button element with JavaScript functionality.

```html
<button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle dark mode">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path class="sun-icon" d="M12 3V4M12 20V21M4 12H3M6.31412 6.31412L5.5 5.5M17.6859 6.31412L18.5 5.5M6.31412 17.69L5.5 18.5M17.6859 17.69L18.5 18.5M21 12H20M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12C8 9.79086 9.79086 8 12 8C14.2091 8 16 9.79086 16 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path class="moon-icon" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</button>
```

**CSS class:** `.theme-toggle`

**Required attributes:**
- `type="button"` - Prevents form submission
- `id="theme-toggle"` - JavaScript hook
- `aria-label` - Accessible name

**Icon visibility:** The sun and moon icons toggle visibility based on `[data-theme]` attribute on the document root.

### JavaScript Integration

```javascript
const toggleButton = document.getElementById('theme-toggle');
toggleButton.addEventListener('click', function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
});
```

## Accessibility

### ARIA Requirements

| Attribute | Purpose | Required |
|-----------|---------|----------|
| `aria-label` | Provides accessible name for icon-only buttons | Yes |
| `role` | Implicit from element (`link` for `<a>`, `button` for `<button>`) | No |

### Keyboard Interaction

| Key | Action |
|-----|--------|
| Enter | Activates the button |
| Space | Activates the button (button element only) |
| Tab | Moves focus to/from the button |

### Focus Management

- Both buttons receive visible focus indicators when navigated via keyboard
- Focus order follows DOM order (back button before theme toggle due to position)
- Focus is not trapped; users can tab past these controls

### Screen Reader Considerations

- The `aria-label` attribute provides the accessible name since buttons contain only icons
- For the theme toggle, consider using `aria-pressed` to indicate current state:

```html
<button type="button" class="theme-toggle" aria-label="Dark mode" aria-pressed="false">
```

- Update `aria-pressed` via JavaScript when the theme changes

### Color Contrast

- Icon colors meet WCAG 2.1 AA contrast requirements in both light and dark modes
- The backdrop blur ensures buttons remain visible against varying backgrounds
- Hover states maintain sufficient contrast ratios

### Motion Considerations

- Scale transition is subtle (5%) and brief (200ms)
- Users with `prefers-reduced-motion` may benefit from disabling transforms:

```css
@media (prefers-reduced-motion: reduce) {
    .back-button:hover,
    .theme-toggle:hover {
        transform: none;
    }
}
```
