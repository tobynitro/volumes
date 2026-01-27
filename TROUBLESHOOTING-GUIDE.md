# Writing Troubleshooting Guides

Troubleshooting guides are special content types that appear as rich cards in the **Troubleshooting** tab. They're designed to help readers quickly find solutions to specific problems.

## Guide vs Post: What's the Difference?

### Regular Blog Posts (`type: "post"`)
- **Format**: Simple title link in list view
- **Purpose**: Educational content, tutorials, explanations
- **Structure**: Free-form, narrative style
- **Example**: "Understanding MOSFETs", "My First PCB Design"

### Troubleshooting Guides (`type: "guide"`)
- **Format**: Card with problem statement, difficulty badge, and tags
- **Purpose**: Problem-solving, debugging, fixing specific issues
- **Structure**: Problem → Diagnosis → Solution
- **Example**: "LED Not Lighting Up", "Fixing I2C Communication Errors"

## Creating a Troubleshooting Guide

### Step 1: Define the Problem

Ask yourself:
- What specific issue does this solve?
- How would someone search for this problem?
- Is it a common beginner mistake or advanced edge case?

**Good problem statements:**
- "LED doesn't light up when connected to power supply"
- "Arduino won't upload sketch - 'avrdude: stk500_recv(): programmer is not responding'"
- "Multimeter shows wrong voltage reading"

**Bad problem statements:**
- "Things aren't working"
- "General debugging tips"
- "Everything about LEDs"

### Step 2: Add to posts.json

```json
{
    "slug": "2025-01-27-led-not-lighting",
    "title": "LED Not Lighting Up",
    "description": "Your LED circuit isn't working? Check these common issues and solutions.",
    "date": "2025-01-27",
    "thumbnail": "/images/led-debug.jpg",
    "type": "guide",
    "problem": "LED doesn't light up when connected to power supply",
    "difficulty": "Beginner",
    "tags": ["LED", "Circuit", "Debugging"]
}
```

**Field Requirements:**
- `type: "guide"` - **Required** to show as card
- `title` - Short, searchable (e.g., "LED Not Lighting Up")
- `problem` - 1-2 sentence description (shown on card)
- `difficulty` - "Beginner", "Intermediate", or "Advanced"
- `tags` - 2-5 relevant tags (components, concepts, tools)

### Step 3: Write the Guide Content

Create `posts/2025-01-27-led-not-lighting.md`:

```markdown
# LED Not Lighting Up

LED circuits are simple, but several things can go wrong. This guide covers the most common causes and how to fix them.

## Quick Checklist

Before diving deep, check these first:
- [ ] Is the LED oriented correctly? (Long leg = positive)
- [ ] Is there a current-limiting resistor?
- [ ] Is the power supply on and working?
- [ ] Are all connections secure?

## Common Causes

### 1. LED Polarity Reversed

**Symptom**: LED doesn't light at all
**Solution**: Flip the LED around. The long leg (anode) goes to positive, short leg (cathode) to ground.

### 2. No Current-Limiting Resistor

**Symptom**: LED flashes briefly then dies, or doesn't light at all
**Solution**: Add a resistor (typically 220Ω - 1kΩ) in series with the LED.

**Why**: LEDs need current limiting. Without it, they draw too much current and burn out instantly.

### 3. Resistor Value Too High

**Symptom**: LED is extremely dim or barely visible
**Solution**: Use a smaller resistor value. Calculate proper value:
R = (Vsupply - Vled) / Iled

### 4. Dead LED

**Symptom**: LED doesn't work in any circuit
**Test**: Use a multimeter in diode test mode. Should show ~1.8-3.3V forward voltage.
**Solution**: Replace the LED.

### 5. Insufficient Voltage

**Symptom**: Red/yellow LEDs work, but blue/white don't
**Why**: Different colors need different forward voltages:
- Red: ~1.8-2.2V
- Blue/White: ~3.0-3.6V

**Solution**: Increase supply voltage or use fewer LEDs in series.

## Troubleshooting Flowchart

```
LED doesn't light
    ├─> Check power supply voltage
    │   └─> Too low? → Increase voltage
    │
    ├─> Check LED polarity
    │   └─> Wrong way? → Flip it
    │
    ├─> Check resistor value
    │   └─> Too high? → Use smaller value
    │
    └─> Test LED separately
        └─> Dead? → Replace LED
```

## Prevention Tips

1. **Always use a resistor** - Even for testing
2. **Mark polarity** - Use red wire for anode, black for cathode
3. **Buy quality LEDs** - Cheap LEDs fail more often
4. **Start with higher resistance** - You can always go lower

## Related Issues

- [Calculating LED Resistor Values](#link-to-other-guide)
- [Understanding LED Forward Voltage](#link-to-tutorial)
- [Multimeter Basics for Beginners](#link-to-guide)
```

## Best Practices

### Structure Your Guide

1. **Quick Checklist** - Fast checks before deep diving
2. **Common Causes** - Most likely issues first
3. **Step-by-Step Solutions** - Clear, actionable fixes
4. **Troubleshooting Flowchart** - Visual decision tree
5. **Prevention Tips** - How to avoid this in future
6. **Related Content** - Links to other guides/posts

### Writing Style

**Do:**
- Use clear, direct language
- Start with most common causes
- Include photos/diagrams of the problem
- Explain the "why" behind solutions
- Provide specific values and measurements

**Don't:**
- Assume too much knowledge
- Skip verification steps
- Use vague language ("maybe", "probably")
- Forget safety warnings where needed

### Choosing Difficulty Levels

**Beginner:**
- Common mistakes everyone makes
- Simple fixes requiring basic tools
- Minimal theory needed
- Example: "LED polarity wrong"

**Intermediate:**
- Requires understanding of concepts
- May need oscilloscope or specialized tools
- Some calculation or theory involved
- Example: "Debugging I2C communication"

**Advanced:**
- Complex systems with multiple failure points
- Requires deep understanding
- Advanced tools and techniques
- Example: "RF impedance mismatch troubleshooting"

### Choosing Tags

**Component tags:**
- LED, Resistor, Capacitor, MOSFET, Arduino, etc.

**Concept tags:**
- Voltage, Current, PWM, I2C, SPI, Power Supply

**Tool tags:**
- Multimeter, Oscilloscope, Logic Analyzer

**Problem category tags:**
- Debugging, Testing, Measurement, Safety

**Good tag sets:**
- ["LED", "Circuit", "Debugging"]
- ["Arduino", "I2C", "Communication"]
- ["Power Supply", "Voltage", "Troubleshooting"]

**Bad tag sets:**
- ["Help", "Problem", "Question"] - Too vague
- ["Electronics"] - Too broad
- 10+ tags - Too many, keep it focused

## SEO Tips for Guides

### Title Optimization

**Good titles:**
- "Arduino Won't Upload Code"
- "Fixing 555 Timer Oscillation Issues"
- "Why Is My Circuit Overheating?"

**Bad titles:**
- "Problem #1"
- "Help needed"
- "A comprehensive guide to everything that could possibly go wrong"

### Description Optimization

Include:
- The problem (what's broken)
- The solution (what you'll learn)
- Who it's for (skill level)

**Example:**
"Your LED circuit isn't working? Learn the 5 most common causes and how to fix them. Beginner-friendly guide with photos and step-by-step solutions."

### Problem Statement

This shows on the card preview. Make it:
- Specific enough to match searches
- Short enough to read quickly
- Relatable to the reader's experience

**Good:**
- "LED doesn't light up when connected to power supply"
- "Multimeter shows wrong voltage on 5V rail"

**Bad:**
- "Something is wrong"
- "I don't know what's happening"

## Examples of Great Guides

### Example 1: Simple Guide
```json
{
    "slug": "2025-01-27-resistor-color-code-confusion",
    "title": "Can't Read Resistor Color Codes",
    "description": "Struggling with resistor bands? Quick reference and common mistakes.",
    "date": "2025-01-27",
    "type": "guide",
    "problem": "Can't determine resistor value from color bands",
    "difficulty": "Beginner",
    "tags": ["Resistor", "Basics", "Reference"]
}
```

### Example 2: Intermediate Guide
```json
{
    "slug": "2025-01-27-i2c-not-responding",
    "title": "I2C Device Not Responding",
    "description": "Debug I2C communication issues with pull-up resistors, addressing, and timing.",
    "date": "2025-01-27",
    "type": "guide",
    "problem": "I2C device doesn't ACK, SDA/SCL stuck high or low",
    "difficulty": "Intermediate",
    "tags": ["I2C", "Arduino", "Communication", "Debugging"]
}
```

### Example 3: Advanced Guide
```json
{
    "slug": "2025-01-27-switching-regulator-noise",
    "title": "Reducing Switching Regulator Noise",
    "description": "Advanced techniques for minimizing EMI and ripple in buck converters.",
    "date": "2025-01-27",
    "type": "guide",
    "problem": "Switching regulator causing high-frequency noise on power rails",
    "difficulty": "Advanced",
    "tags": ["Power Supply", "EMI", "Switching Regulator", "PCB Layout"]
}
```

## Maintenance

### Update Guides Regularly

When technology changes:
- Update component recommendations
- Add new troubleshooting methods
- Fix outdated information
- Add reader-submitted solutions

### Gather Feedback

- Monitor which guides get the most traffic
- Ask readers what problems they're facing
- Look for common questions in forums
- Track search terms that lead to your site

## Checklist Before Publishing

- [ ] Title is searchable and specific
- [ ] Problem statement is clear and relatable
- [ ] Difficulty level matches content complexity
- [ ] 2-5 relevant tags chosen
- [ ] Guide includes quick checklist
- [ ] Solutions are step-by-step
- [ ] "Why" is explained, not just "how"
- [ ] Photos/diagrams where helpful
- [ ] Prevention tips included
- [ ] Links to related content
- [ ] Tested on real problem
- [ ] SEO description is compelling
- [ ] Added to posts.json with `type: "guide"`
- [ ] Ran `node generate-seo.js`

---

**Remember**: Good troubleshooting guides save readers hours of frustration. Be thorough, be clear, and test everything!
