---
name: Tra cứu và tổng hợp văn bản
description: Compact Vietnamese document search interface faithful to the supplied PDF.
colors:
  bg: "#171715"
  panel: "#20201e"
  border: "#30302d"
  text: "#dddeda"
  muted: "#999a92"
  blue: "#7db5df"
  badge-bg: "#283945"
  badge-text: "#93adc0"
typography:
  title:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "20px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  badge: "3px"
  control: "5px"
  row: "6px"
  panel: "7px"
  dialog: "8px"
spacing:
  compact: "5px"
  small: "12px"
  gutter: "16px"
  section: "22px"
  large: "24px"
components:
  button-primary:
    backgroundColor: "{colors.blue}"
    textColor: "#17232c"
    rounded: "{rounded.control}"
    padding: "8px 15px"
  button-secondary:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "7px 12px"
  input:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.control}"
    padding: "7px 10px"
  badge:
    backgroundColor: "{colors.badge-bg}"
    textColor: "{colors.badge-text}"
    rounded: "{rounded.badge}"
    padding: "1px 5px"
  panel:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.text}"
    rounded: "{rounded.panel}"
---

# Design System: Tra cứu và tổng hợp văn bản

## Overview

**Creative North Star: "The supplied PDF"**

The supplied PDF is the visual authority. Preserve its compact Vietnamese document interface: a dark reading surface, narrow centered content, restrained blue actions, and dense evidence lists. This is a faithful recreation rather than a new visual identity.

**Key Characteristics:**
- Compact Arial typography.
- Flat dark panels with fine borders.
- Blue actions and citations.
- Dense document and source information.

## Colors

Blue identifies primary actions, selected navigation, links, and keyboard focus. Warm dark neutrals separate the canvas, panels, and borders; muted text carries metadata. Blue-gray badges distinguish citation and validity information without competing with body text.

**The Reference Rule.** Preserve the supplied PDF palette and density when extending this interface.

## Typography

Use the frontmatter title, body, and label roles. Section headings are bold (15px); document descriptions are compact (13px); badges and answer footnotes are smaller (11px). Retain sentence case and Vietnamese diacritics. The title stays modest rather than becoming a display headline.

## Layout

Center a single column with an outer maximum width of 1000px and 16px horizontal padding. At viewport widths of at least 1600px, the implemented outer maximum becomes 1040px. Desktop header columns use a 1.7:1 ratio and a 24px gap. Keep tightly grouped rows and 22px separation between major sections.

At widths up to 640px, stack the header, use 14px page gutters, wrap action controls and document metadata, and stack filter fields. Preserve the long reading flow; truncate document descriptions with an ellipsis while allowing answer and source text to wrap.

## Elevation & Depth

Panels use tonal separation and a fine one-pixel border. There are no decorative shadows or animated entrances. The native document dialog has a translucent black backdrop. Focus uses a visible blue two-pixel outline with a three-pixel offset.

## Shapes

Use the small radii defined in frontmatter. Controls, rows, panels, and the dialog remain subtly rounded; badges have the tightest corners. Avoid ornamental shapes.

## Components

Primary action buttons use blue fill and dark bold text; secondary buttons use the panel surface. Hover increases button brightness. Disabled buttons reduce opacity and show a waiting cursor. Text links underline on hover.

Fields use the panel surface, fine border, and visible focus outline. The question field is vertically resizable. Native checkboxes use a brighter blue accent. Navigation uses ordinary buttons with pressed state, muted inactive text, and a blue active underline.

Answer panels contain bulleted prose with inline source citations. Document rows pair a bold identifier with a validity badge and date; descriptions truncate. Relationship groups use native disclosures and fine row separators. Source panels preserve line breaks, show compact metadata, and provide a full-excerpt action. Dialogs must retain an accessible name and native keyboard behavior.

## Do's and Don'ts

- Do preserve the PDF's compact hierarchy and reading order.
- Do keep Vietnamese text, source citations, and metadata legible.
- Do retain visible keyboard focus and native disclosure behavior.
- Don't introduce a new color scheme, display font, imagery, or decorative motion.
- Don't present fixture content as newly retrieved or generated information.
