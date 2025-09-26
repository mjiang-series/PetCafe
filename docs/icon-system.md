# Icon System Documentation

## Current Implementation (Week 2)

We're using emoji icons as placeholders during development. This provides immediate visual feedback without requiring icon fonts or SVG assets.

### Icon Mapping

| UI Element | Emoji | Unicode | Purpose |
|------------|-------|---------|---------|
| Coins | 🪙 | U+1FA99 | Currency display |
| Premium | 💎 | U+1F48E | Premium currency |
| Subscribers | 👥 | U+1F465 | Subscriber count |
| Settings | ⚙️ | U+2699 | Settings button |
| Notifications | 🔔 | U+1F514 | Notification bell |
| Blog | 📝 | U+1F4DD | Blog/Memory posts |
| Gacha | 🎰 | U+1F3B0 | Pet adoption/gacha |
| Shop | 🛍️ | U+1F6CD | In-game shop |
| Pets | 🐾 | U+1F43E | Pet collection |
| Back Arrow | ← | U+2190 | Navigation |
| Lightning | ⚡ | U+26A1 | Instant actions |
| XP/Level | ⭐ | U+2B50 | Experience points |
| Memory | 📸 | U+1F4F8 | Memory/photo |

### CSS Classes

```css
.icon-emoji {
  display: inline-block;
  font-size: 1.2em;
  line-height: 1;
  vertical-align: middle;
  margin-right: 0.25em;
}
```

### Usage Examples

```html
<!-- In buttons -->
<button class="btn">
  <span class="icon-emoji">🎰</span>
  Adopt Pets
</button>

<!-- In stats display -->
<div class="stat-item">
  <span class="icon-emoji">🪙</span>
  <span>1234</span>
</div>
```

## Future Implementation (Production)

For the final game, we'll replace emojis with:

1. **Custom SVG Icons** - Scalable, themed icons matching the art style
2. **Icon Font** - For frequently used UI icons
3. **Animated Icons** - Lottie or CSS animations for special effects

### Benefits of Current Approach

- ✅ No additional assets needed
- ✅ Works on all browsers/devices
- ✅ Clear visual indicators during development
- ✅ Easy to replace with final assets later
- ✅ Accessible (screen readers announce emoji names)

### Migration Plan

When ready to implement final icons:
1. Create SVG components for each icon
2. Replace `<span class="icon-emoji">🪙</span>` with `<Icon name="coins" />`
3. Update CSS to handle SVG styling
4. Add loading states for icon fonts
