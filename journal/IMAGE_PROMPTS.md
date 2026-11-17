# ViDo — Image Generation Prompts

Use this file to generate a consistent set of task illustrations with an image-capable LLM.

> This is practical guidance, not legal advice. Check the provider’s terms before publishing.

---

## 1. Master style prompt

Paste this once, then generate tasks in batches.

```text
You are designing a consistent set of flat cartoon task illustrations for a calm task-management app called ViDo.

STYLE BIBLE — keep identical across every image:
- flat 2D vector cartoon / sticker illustration
- thick, slightly imperfect dark warm-brown outlines (#3B342C)
- muted, friendly palette: sage green, clay/terracotta, warm sand, soft sky blue, cream
- simple rounded shapes, minimal detail
- no gradients, no 3D, no photorealism
- one clear action or object per image, centered
- readable at 40x40 px
- no text, no letters, no numbers, no logos, no trademarks, no watermarks
- no real person's likeness; use a generic adult character when a person is needed
- transparent background, PNG, square 1:1, 1024x1024
- consistent character design: round head, simple dot eyes, warm skin tone, same proportions
- calm, welcoming, not childish, not corporate

For every image, keep the exact same line weight, palette, character proportions, and composition.
Do not add text. Name each output with the task key.
```

## 2. Negative prompt

```text
No photorealism, no 3D render, no gradients, no heavy shadows, no text, no letters,
no logos, no branded products, no realistic faces, no celebrity likeness,
no extra objects, no busy background, no watermarks, no AI artifacts,
no distorted hands, no distorted teeth, no scary medical imagery.
```

## 3. Per-task prompt template

```text
Create one flat cartoon sticker illustration for the task "<TASK KEY / TASK NAME>".

Show: <one clear action or object>.
Use the same style bible, palette, line weight, and character design as the reference image.
Transparent background, square 1:1, 1024x1024. No text, no logos, no watermarks.
```

### Examples

```text
Create one flat cartoon sticker illustration for "laundry".
Show a generic cheerful adult carrying a laundry basket with folded clothes,
a few clothes pegs, and small bubbles. No brand logos.
```

```text
Create one flat cartoon sticker illustration for "gym".
Show a generic adult lifting a barbell overhead, with a simple sweatband and
two small motion lines. Calm and friendly, not aggressive.
```

```text
Create one flat cartoon sticker illustration for "dentist".
Show a generic adult reclining in a dental chair, with a calm dentist in a white coat
holding a small mirror and a tooth. Friendly, not scary.
```

```text
Create one flat cartoon sticker illustration for "groceries".
Show a shopping basket with a few vegetables and a paper bag.
No branded packaging, no text on labels.
```

```text
Create one flat cartoon sticker illustration for "heat pump".
Show a small outdoor heat-pump unit beside a wall, with a simple fan grille.
Do not use a spanner or a money symbol.
```

```text
Create one flat cartoon sticker illustration for "rubber washer".
Show a garden hose connector with a visible rubber washer/O-ring beside it.
Do not use a spanner.
```

## 4. Task list

Generate the core set first. Add more later.

### Household
- laundry
- dishes
- cleaning
- cooking
- groceries
- trash
- recycling
- plants / watering
- repairs
- heat pump / HVAC
- plumbing / hose washer
- gutters
- windows
- bed making
- ironing
- pet care
- childcare

### Work
- meeting
- email
- call
- presentation
- report
- review
- planning
- follow-up
- deadline
- research
- interview
- onboarding
- invoice
- expense
- timesheet

### Health
- doctor
- dentist
- medicine
- therapy
- exercise
- run / walk
- yoga
- sleep
- meditation
- hydration
- meal prep
- checkup
- vaccination

### Finance
- pay bill
- budget
- taxes
- insurance
- subscription
- bank
- savings
- receipts
- renewal

### Errands
- shopping
- post office
- bank
- pickup
- drop-off
- car service
- fuel
- car wash
- registration

### Social
- birthday
- party
- RSVP
- gift
- family call
- date
- event

### Learning
- read
- study
- course
- practice
- notes
- exam
- language

### Travel
- book flight
- pack
- passport
- hotel
- itinerary
- visa
- airport

### Admin
- forms
- application
- renewal
- license
- documents
- passwords
- backup

### Home projects
- paint
- assemble furniture
- declutter
- organise
- move
- garden

## 5. Workflow

1. Generate one **style reference** image first.
2. Keep that image attached as a reference for every later generation.
3. Use the **same style bible and negative prompt** every time.
4. Change only the subject line.
5. Generate in batches of 5–10 images.
6. Check each result at **40×40 px**; if you cannot recognise it, redraw or fall back to text.
7. Export transparent PNGs at 1024×1024, then resize copies for the app.
8. Name files by task key, e.g. `laundry.png`, `gym.png`, `dentist.png`.
9. Record the tool, date, and prompt version in `public/doodles/ai/README.md`.

## 6. Copyright and usage notes

- **OpenAI / ChatGPT:** outputs may be used commercially under OpenAI’s terms. Purely AI-generated images may not be copyrightable in some jurisdictions, so do not claim exclusive copyright.
- **Google / Gemini:** outputs are subject to Google’s terms. Check the current terms for commercial use.
- **Never** ask for a real person, celebrity, trademarked character, logo, or branded product.
- **Never** use an image you do not have rights to, including iStock/Pixabay results without checking the license.
- If the project is public, add a provenance note:
  - tool used
  - date generated
  - prompt version
  - “AI-generated; usage subject to provider terms”
- If you need a **clearly licensed** set for an open-source repo, open-source emoji/illustration sets remain safer:
  - Twemoji — CC-BY 4.0
  - OpenMoji — CC BY-SA 4.0
  - Tabler Icons — MIT

## 7. Gemini or ChatGPT?

Both can work. Pick one and stay with it for consistency.

| Need | Better choice |
|---|---|
| Easiest multi-image iteration and reference-image workflow | **ChatGPT / DALL·E** |
| Strong illustration quality and style control | **Gemini / Imagen** |
| Fast experiments with many variations | Either |
| Clearly licensed assets for a public repo | Neither — use Twemoji/OpenMoji |

Recommended: start with **ChatGPT** using the master prompt and one reference image. If the style feels too soft or too generic, try the same prompt in **Gemini** and compare a batch of five.
