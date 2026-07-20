# UI Design & Anti-Slop Principles

## Principle 1: Data Dictates Form
UI must be built around the specific data it displays, not the other way around.
*   **Categorical Data:** Format sets of data (e.g., statuses, types) as visual chips.
*   **Number Alignment:** Right-align numbers so digits align by place value for easier scanning.
*   **Breathing Room:** Truncate long text strings to prevent columns from becoming cluttered.
*   **Visual Dimming:** Use shading or opacity reductions for inactive or deactivated rows.
*   **Appropriate Formats:** Convert time-delineated data into timelines rather than forcing it into standard time-sorted tables.

## Principle 2: Functional Color and Imagery
Colors and visual elements must convey meaning, not just decorate the page.
*   **Urgency:** Apply specific colors to draw the eye (e.g., a red icon for destructive or urgent actions).
*   **Visual Recognition:** Replace text names with avatars to speed up user scanning and recognition.
*   **Data Summarization:** Roll up time-dimension data into summary charts instead of forcing users to hunt through timestamp columns.

## Principle 3: Progressive Disclosure
Manage hierarchy by controlling what is shown immediately versus what is revealed on demand (the spectrum of explicitness).
*   **Tuck Infrequent Actions:** Place secondary actions into popovers rather than permanently engraving them in the UI.
*   **Hover States:** Reveal row-level actions (like deleting or copying a cell) only when the user hovers over them.
*   **Sequenced Onboarding:** Introduce functionality one tooltip at a time instead of dumping a dense, multi-bullet modal on the user upon first login.
*   **Invisible UI:** Incorporate hidden but essential UI components, like tooltips, to explain ambiguous labels or icons.

## Principle 4: Apple Liquid Glass Aesthetic
The Developer Dashboard relies on a specific liquid glass architectural style.
*   Apply a frosted backdrop blur and a sheen overlay[cite: 8].
*   Incorporate subtle mouse elasticity to mimic a liquid feel[cite: 8, 10].
*   Ensure edges and highlights dynamically take on the underlying light[cite: 10].
*   Utilize proper edgy bending, refraction, and configurable chromatic aberration[cite: 10].
*   Support Light, Dark, and System color schemes, driven by an inline color-scheme boot script to prevent FOUC[cite: 8].
*   Apply glass styling via pseudo-elements to cards for consistent layout rendering[cite: 8].

---

## Anti-Slop: Avoiding the "Vibe-Coded" AI Look
AI models default to highly recognizable, generic aesthetic patterns. Actively design against them.

| AI Slop Trait | Professional Polish |
| :--- | :--- |
| Random glowing lights and generic purple gradients | Earth tones, beige, off-white, or pastel palettes. |
| Overused default AI fonts (e.g., Inter) | Distinctive typography via Google Fonts (e.g., Serif fonts, Urbanist). |
| Generic, dense UI illustrations | Contextual photography, background videos, or targeted SVG assets. |
| Uneven spacing and cramped layouts | Consistent paddings and strict architectural alignment. |
| Over-reliance on default icon sets | Distinctive icon libraries (e.g., Basil, Iconoon). |
| Lazy selected states (e.g., uneven borders) | Clear, balanced, and intentional state indicators. |

## Systematizing Your Workflow
Enforce design standards technically so models do not default to slop.
*   **Rule Enforcement:** Feed the AI strict rules via a `DESIGN.md` or `agents.md` file containing typography, colors, and layout systems.
*   **Visual Context:** Provide high-quality URLs or screenshots as initial reference points for the model.
*   **Explicit Corrections:** Prompt away mistakes by explicitly naming the visual problems (e.g., "remove the random lights," "change the gradient to a solid dark background," "no illustrations").
*   **Section-by-Section Construction:** Construct layouts intentionally by defining necessary page architecture (hero, trusted by, features, pricing, testimonials, footer) rather than accepting a dense, single-pass generation.