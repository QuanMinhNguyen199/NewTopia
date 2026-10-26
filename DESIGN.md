---
name: Tra cứu và tổng hợp văn bản
description: Light, administrative-document look for Hanoi city leadership; answer first, evidence on demand.
colors:
  tint: "#eef1f5"
  paper: "#ffffff"
  paper-alt: "#f7f9fc"
  ink: "#16233a"
  ink-2: "#4f5b6e"
  rule: "#e3e7ed"
  rule-strong: "#c8d0da"
  action: "#1d3e73"
  action-hover: "#152f59"
  link: "#1f55a6"
  wash: "#eaf0f9"
  seal: "#a3201f"
  focus: "#2b5ba8"
  selection: "#c9d8ee"
  scrollbar: "#b5becb"
  backdrop: "#16233a73"
typography:
  title:
    fontFamily: "Manrope"
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.3
  heading:
    fontFamily: "Manrope"
    fontSize: "17px"
    fontWeight: 700
    lineHeight: 1.35
  subheading:
    fontFamily: "Manrope"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.6
  body:
    fontFamily: "Manrope"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.6
  small:
    fontFamily: "Manrope"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.45
  control:
    fontFamily: "Manrope"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.4
  micro:
    fontFamily: "Manrope"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  input-mobile:
    fontFamily: "Manrope"
    fontSize: "16px"
    fontWeight: 500
    lineHeight: 1.5
  excerpt:
    fontFamily: "Tinos"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.55
  excerpt-full:
    fontFamily: "Tinos"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.7
rounded:
  paper: "4px"
  small: "6px"
  control: "8px"
  surface: "12px"
spacing:
  compact: "6px"
  small: "12px"
  gutter: "16px"
  sheet-padding: "24px"
  section: "28px"
components:
  button-primary:
    backgroundColor: "{colors.action}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "48px"
  button-secondary:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "7px 14px"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "8px 10px"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
---

# Design System: Tra cứu và tổng hợp văn bản

## Overview

**Creative North Star: "Văn bản hành chính trên bàn làm việc"** (administrative documents on a desk)

The readers are Hanoi city leaders and their staff. They read in daylight offices and meeting rooms, often project the screen or print it, and judge credibility by sources. The interface borrows from the material they already trust: white official paper, ink-dark text, Times-set document bodies, and a red reserved for document identifiers.

Adopted 2026-10-24 at the user's request. It replaces the dark PDF recreation. The layout and interaction model of "Đọc theo lớp" are unchanged.

**Key characteristics:**
- Light canvas, white sheets, ink text. There is no dark mode yet.
- Manrope for the interface (switched from IBM Plex Sans on 2026-10-26): Plex set the second mark of stacked Vietnamese diacritics (ố, ế, ổ, ỗ) far to the right, opening uneven gaps in words that fill administrative text ("số", "phố", "Nghị quyết"); Manrope keeps them compact and fits slightly more per line. Its regular is thin for long reading, so body text is 500 and every former 600 emphasis is 700, keeping the hierarchy. Compared side by side with IBM Plex Sans and Be Vietnam Pro on the page's own text; not yet tested with readers. Tinos stays for document excerpts.
- Tinos (metric-compatible with Times New Roman) for every document excerpt and the document dialog. Nghị định 30/2020/NĐ-CP prescribes Times New Roman for administrative documents, so an excerpt reads as a real document fragment. This is the one memorable element; everything else stays quiet.
- Seal red appears only on document numbers in excerpts and in the document dialog title.

## Colors

- **Ink** (`ink`) carries body text. **Ink-2** carries metadata and meets at least 6.4:1 contrast on the canvas.
- **Action** (navy) is for the primary button, the selected tab underline, checkboxes and selected states (a pressed citation, the active source outline, the highlighted-point bullet).
- **Link** (a brighter blue) is for text links and citation labels, so links stay distinguishable from ink.
- **Wash** tints citations, the "Được trích" badge and highlighted answer points.
- **Seal** is never used for UI state or emphasis.
- Fonts are self-hosted through `@fontsource`, so the page works on networks without Google Fonts.

## Typography

Use the frontmatter roles. Sentence case throughout; no all-caps labels or eyebrows. Numerals in dates, counts and citations use tabular figures. Vietnamese decimal commas in prose ("0,522 giây").

Metadata is written as plain Vietnamese, never as a dot-joined chain. Example: issuer on one line, then "Báo cáo ngày 30/08/2026, trang 1".

## Layout

**Concept: "Sổ đăng ký văn bản" (the document register), 2026-10-24.** The page borrows from the register book and the case file that city offices use every day:
- The answer is laid out as register rows with a ruled left margin.
- The evidence is a file drawer with divider tabs.
- Excerpts are sheets of paper set in Tinos.
- Document numbers are entered in seal-red ink.

The memorable element is the file drawer and its sheets; everything else stays quiet.

- **Page.** One white page; no grey canvas, no cards. Sections open with a 17/700 title, with the section action at the right. Below 1100px: a single column, 1000px maximum, 16px gutters (14px at ≤640px); below 1100px the right gutter is 60px (46px at ≤640px) to clear the evidence rail.
- **Header.** The title (22/700) and the two original demo lines on the left, a plain labelled user select on the right. There is no logo tile.
- **Query.** The auto-growing question field with the Hỏi button beside it (both 48px, 8px radius). Below it, one row:
  - the two original checkboxes;
  - "Bộ lọc" as a text disclosure with a chevron and "(n)" when filters are set;
  - the original timing "Tìm 0.522s, LLM 8.927s", right-aligned in tabular figures.
- **Query bar (added 2026-10-24).** Pressing Hỏi collapses the whole top of the page at once, without waiting for the result: the title (kept as a visually hidden h1), the demo lines and the separate mode tabs fold into one sticky 56px row. The row holds the Hỏi đáp / Báo cáo tổng hợp text tabs (their 2px line sits on the bar's bottom rule), the question that produced the result (one line, ellipsis, full text in a tooltip), "Bộ lọc (n)" with "Xóa bộ lọc" when filters were applied, the timing ("Đang tìm…" while searching; hidden below 1100px), a "Sửa" button (accessible name "Sửa câu hỏi"; shortened 2026-10-26) in the primary navy (`.btn .btn-primary`: 32px, white 700 text, `action-hover` on hover; changed 2026-10-26 so the way back to the question stands out), and the user select (13px, tooltip carries the identity line; below 640px it is left to the full form, and the tabs take their own row). While searching, the answer dims to 50% and the results carry `aria-busy`. "Sửa câu hỏi" or a click on the question reopens the full form with focus in the field; "Hủy" or Escape restores the question and filters the result is based on, so the bar never shows an unsubmitted question. A click anywhere outside the form (header, mode tabs and the dialog excepted) also collapses it, without moving focus; a half-typed question or filter change is kept and comes back the next time "Sửa câu hỏi" is pressed, while "Hủy" and Escape discard it. The collapse listens for `click`, not `pointerdown`, so the layout change never shifts what the user is clicking. While reading, the bar gets out of the way: scrolling down more than 8px (past the first 80px) slides it up out of view, scrolling up brings it back, and it stays visible near the top of the page, within 40px of the end, or while focus is inside it. On desktop the sticky drawer and rail move up to the top edge while the bar is hidden. **Editing in place (2026-10-26):** when "Sửa câu hỏi" is pressed more than 80px down the page, only the form opens (no header or mode tabs), pinned 8px below the top of the screen over the content as a floating sheet (12px padding so the field's focus ring is never clipped, 1px `rule-strong` stroke, the 12px surface radius, a two-layer soft shadow; it extends 12px into the gutters so its contents stay aligned with the page), capped at the screen height and scrolling inside. The reading position is held by measuring an element in the middle of the screen before and after the layout change. "Hủy", Escape or a click outside close it in place; Hỏi scrolls to the top of the results. Near the top of the page the full header and form open as before. Submitting collapses the form again and returns focus to "Sửa câu hỏi". The status notice sits under the bar or form.
- **Answer, as register rows.** One row per issuing unit, on a two-column grid:
  - a 112px left margin, set off by a vertical rule, lists the sources that unit's points cite; this is real data, not decorative numbering. Closed, it is one line ("Nguồn 3, 4"). Open (changed 2026-10-26: a colour change alone did not tell readers which source they were reading), it lists each source as `[n]` over its document number in seal red, sticks below the query bar while the unit scrolls past, and the unit's margin rule turns 2px navy along its whole height; pointing at or focusing a point tints its source in the margin with `wash`. The open unit's name row also sticks below the query bar (on phones, where the margin is dropped, it carries "n ý, nguồn …"). The query bar's live height is exposed as `--bar-h` (0 while it is hidden) for these sticky offsets;
  - the main column holds the unit name (15/700), "n ý" in ink-2, and a chevron.
  The button sits inside an h3. Points sit in the main column with small ink-2 dots, 1.65 line height and a 72ch measure. The first unit is open; "Mở cả 16 ý" opens all. The original footnote closes the section.
- **Evidence, as a file drawer.**
  - Text tabs sit flush with the content edge over a 1px rule. There is no band, box or fill. The selected tab is ink 700 with its count in navy, and a 2px navy ink line slides beneath it. Counts are plain tabular numbers.
  - Documents are register rows: the number in seal red (a stretched click target), the date right-aligned in tabular figures, a two-line description, and a "Xem n đoạn trích" button.
  - Excerpts are paper sheets: white, 1px rule, 4px radius, a 1px paper-edge shadow and a Tinos body.
  - Relations are register rows with clickable document numbers.
- **Desktop split (≥1100px).** 1240px maximum; the answer (`minmax(0,1fr)`) and a 360px drawer with a 32px gap (narrowed from 410px on 2026-10-24 so the answer gets more width). The drawer is sticky, scrolls internally, and pins its heading and tabs. Linking works both ways: a citation pulls its sheet; "Xem n ý dùng nguồn này" opens the matching units and focuses the first point.
- **Follow-up composer at the bottom (below 768px, standalone only; 2026-10-26).** After trying the whole query bar at the bottom, the user chose to keep the current question at the top (the compact bar, "Sửa câu hỏi" and the in-place edit sheet work as on wider screens) and to add, Google-style, a separate field at the bottom for asking a new or follow-up question.
  - Fixed to the bottom edge, white with a 1px top rule and a soft upward shadow, safe-area padding, sitting on top of the on-screen keyboard (`visualViewport` sets `--kb`): a 48px field ("Hỏi tiếp hoặc hỏi câu mới", `paper-alt` until focused) and the 48px navy "Hỏi" button. The page keeps an 88px bottom gutter.
  - Asking runs a new search with that question and the filters in force, replaces the current result (no conversation thread), clears the field, closes the keyboard and scrolls to the top of the results; the top bar then shows the new question.
  - Scrolling down slides it out below the screen together with the top bar; scrolling up brings both back. It stays visible near the top, at the end of the page (where a follow-up is most likely) and while the field has focus.
  - Hidden while the question is being edited or the evidence panel is open.
  - Unconfirmed: whether the real backend carries the previous question as context (a true follow-up) or treats it as a new search, and whether results should stack as a thread. With the PDF fixture both behave the same. Not yet tested on real phones (iOS keyboard) or with users.
- **Mobile review fixes (2026-10-26, from a review on iPhone Safari).**
  - *Safe area.* The viewport meta carries `viewport-fit=cover`; without it iOS reports every `env(safe-area-inset-*)` as 0, which is why the follow-up field sat on Safari's toolbar and the home indicator. The follow-up bar now keeps 16px plus the bottom inset under its controls, and the side insets in landscape.
  - *Touch targets.* On coarse pointers every button, text action, tab and checkbox row is at least 44px tall, "Sửa" included; citations keep their 22 to 26px look and get an invisible 44px hit area (`::after`, 10px above and below, 6px each side).
  - *Reading.* No text in the product was justified; long points and excerpts are set left-aligned with `text-wrap: pretty`, and points get a 1.7 line height at 640px and below.
  - *Evidence on phones.* A horizontal floating "Bằng chứng" button was tried below 768px and rolled back the same day at the user's request: phones keep the vertical navy rail described under the evidence panel.
  - *App feel.* A web manifest (`display: standalone`, white theme, the site icon as 192, 512, maskable 512 and a 180px Apple touch icon in `public/icons/`) and the iOS web-app metas let the page be added to the home screen and open without browser chrome; in standalone mode the page, the sticky bar, the in-place edit sheet and the evidence panel pad for the status bar and notch. Inside Safari the browser chrome cannot be removed by the page. A native iOS app is out of scope for this frontend.
- **Embedded in GeoAgent (added 2026-10-24).** GeoAgent, the AI chat, shows this page inside its conversation as an iframe, the way it shows result tables in a reply. The page detects being framed (or `?embed`; `?mode=report` opens the report) and then:
  - drops the header, demo lines, mode tabs and query bar, because the question is already the user's chat message; a 13px ink-2 line states that the data is a PDF fixture with no API connected;
  - lays out by the frame's width, not the screen: from 720px the answer and a 340px evidence column sit side by side, the column as tall as the answer (at least 480px) and scrolling inside; below 720px one column with inline excerpts. The tablet slide-in panel and sticky elements are never used;
  - never scrolls itself: it posts `{type:'van-ban/resize', version:1, height}` to the parent whenever its height changes so GeoAgent can size the iframe (target origin from `VITE_GEOAGENT_ORIGIN`, otherwise `*`; the height carries no data);
  - opens the document dialog next to the control that opened it, since the frame is as tall as its content.
  The message contract, frame widths and whether follow-up questions should come from the chat or from this page are still to be agreed with the GeoAgent team.
- **Collapsing the drawer (≥1100px).** "Thu gọn" (text action in the drawer heading) folds the drawer into a 44px sticky rail drawn as an action (changed 2026-10-24: the outlined white rail was easy to miss): navy fill, white 700 vertical "Bằng chứng" label, the document count in white under a thin white rule (while evidence is matched to open units or a document it reads "shown/total", e.g. "1/15", like the tab counts, and flashes briefly when it changes; its accessible name names the unit), and a soft shadow so it reads as a tab standing off the page. Hover darkens to `action-hover` and pulls the rail 4px out (two signals; the shadow stays put); no grey states. The rail is with an accessible name "Mở bằng chứng: n văn bản, 8 đoạn nguồn". The answer takes the freed width; its points keep the 72ch measure. The choice is remembered per browser. Pressing the rail or any citation reopens the drawer. The drawer is open by default and cannot be collapsed when there is no answer.
- **Evidence panel (below 1100px, extended to phones on 2026-10-24: users lost the evidence when the window narrowed).** Below 640px the rail is 36px and the page keeps a 46px right gutter for it; the panel leaves a 48px strip of scrim to tap. Below 768px citations still open their excerpt inline under the point; the panel is for browsing documents, excerpts and relations. When there is no answer, evidence stays in the page. The answer has the page; the same rail sits fixed at the right edge, vertically centred. The rail or a citation slides the drawer in from the right as a modal panel (440px maximum, the dialog's shadow, the backdrop scrim): the rest of the page is inert, focus moves into the panel, and "Đóng", Escape or the scrim close it and return focus to the control that opened it. Citations behave as on desktop (pull the sheet); "Xem n ý dùng nguồn này" closes the panel and focuses the first point.
- **Matched evidence (drawer at ≥1100px and the panel below 1100px; fixed 2026-10-26 after it stopped following the answer in panel mode).** Matching is kept while the drawer is collapsed or the panel is closed, so it is already in sync when opened. The drawer shows everything at first.
  - **Activation.** Opening a unit, or pressing a citation inside the answer, switches the drawer to the sources of the open units.
    - "Đoạn nguồn" shows only those excerpts.
    - "Văn bản" shows only documents cited by them.
    - "Quan hệ" is never filtered, because relations do not map to units; it says so while matching.
  - **While matching.**
    - Tab counts read "shown/total" (e.g. "1/8").
    - A context line under the tabs reads "Đang xem nguồn của <unit>" with a "Hiện tất cả" text button. It is the only way out and is always visible while matching.
    - With several units open the sources are combined; with more than two, the name reads "<first> và n đơn vị khác".
    - When no listed document matches (Thành phố [1], Ứng Hòa [6]), the list states "Nguồn của đơn vị này không có trong danh sách văn bản tìm thấy." instead of going blank.
  - **Back to everything.** The drawer returns to "all" when every unit is closed, when "Mở cả 16 ý" opens all, or when "Hiện tất cả" is pressed. "Xem n đoạn trích" in the document list replaces unit matching with document matching.
  - **Motion.** The drawer panel fades when the context changes.
- **Mobile (≤640px).**
  - The register margin is dropped: the unit row shows the name, then "n ý, nguồn 3, 4" below it, so answer text gets the full width.
  - Unit rows are at least 56px.
  - Citations keep their footnote look but get a 24px or larger touch area.
  - Checkboxes, "Bộ lọc" and the excerpt text actions are at least 40–44px tall.
- **Copy.** All copy is the original PDF wording. The interface adds only control labels.

## Anti-AI rules (mandatory)

Every change is checked against this list. A banned pattern may come back only if the brief itself asks for it.

| Banned | Use instead |
|---|---|
| Icon tiles or decorative icons beside headings | Text headings; icons only where they carry function (disclosure chevron, download) |
| Pill badges and pill counts | Plain ink-2 numbers, or "(n)" |
| Cards with soft shadows; identical card grids; grey canvas plus white cards | One white page structured by rules; the only boxed objects are paper excerpts and the dialog |
| Segmented controls, boxed "browser" tabs, toggle switches, buttons inside the search field | Text tabs with a sliding ink line, native checkboxes, a field with an adjacent button |
| One large radius everywhere | Four distinct steps, as tokens (softened 2026-10-26 to suit Manrope's round forms; the 4px controls read stiff): `--radius-paper` 4px for excerpt sheets, highlighted points and tags; `--radius-small` 6px for citations; `--radius-control` 8px for fields, selects, every button and the evidence rail; `--radius-surface` 12px for the dialog and the in-place edit sheet |
| Gradient washes, glass or blur, glow rings | Flat colour; focus is a 2px outline |
| Metadata chained with "·", all-caps eyebrows, "→" appended to links, numbered markers that are not a real sequence | Vietnamese sentences, sentence case, plain labels, real data in the register margin |
| Generic fade-and-rise on every block, hover lift on cards, scroll reveals | Motion only for the moments listed under Motion |
| Copy the data does not contain (summaries, "every point is sourced", interpretations) | The PDF's own wording |

## Motion

**Thesis:** the drawer is the focal moment. Pulling a source out of the file is the one authored motion; everything else is quick state feedback.

| Moment | Motion | Timing | Reduced motion |
|---|---|---|---|
| Citation → source (desktop) | The drawer scrolls smoothly to the sheet. The sheet is "pulled": `translateX(-10px)` plus a deeper paper shadow, settling back, with its border turning navy. | Scroll is native smooth; the pull is 520ms `cubic-bezier(.16,1,.3,1)` | Instant scroll; the border and tint change only |
| Unit open or close | Height reveals through `grid-template-rows: 0fr→1fr` plus opacity; the chevron rotates 180°. | 240ms open, 160ms close | Opacity only |
| Inline excerpt (mobile) | Reveals top-down with `clip-path: inset(0 0 100% 0)→inset(0)`. | 260ms | Opacity only |
| Tab change | The 2px ink line slides to the chosen tab (`translateX` plus `scaleX` on a fixed 100px line, transform only); the new panel fades in over a 4px vertical shift. | 220ms line, 180ms panel | The line jumps; the panel fades only |
| Evidence panel (below 1100px) | Slides in from the right (`translateX(100%)→0`); the scrim fades. Closing slides out faster. | 260ms in `cubic-bezier(.16,1,.3,1)`, 200ms out | Appears and disappears without sliding |
| Evidence rail | Slides in from the right edge when it appears (`translate: 100% → 0` plus opacity); hover changes colour only. | 360ms in, 120ms hover, `cubic-bezier(.16,1,.3,1)` | No slide; colour change only |
| Drawer reopens (≥1100px) | Slides in 24px from the right with opacity, the same direction as the rail. | 280ms `cubic-bezier(.16,1,.3,1)` | Opacity only |
| Query bar and follow-up hide/show | The top bar slides up and the mobile follow-up field slides down by their own height when scrolling down; both return when scrolling up. | 180ms out `ease-in`, 220ms in `cubic-bezier(.16,1,.3,1)` | Appears and disappears without sliding |
| In-place edit form | Drops 12px into place with opacity. | 220ms `cubic-bezier(.16,1,.3,1)` | Opacity only |
| Highlighted points | The background tints in. | 200ms | Same |
| Dialog | Opacity plus `scale(.98→1)`; the backdrop fades. | 200ms | Opacity only |
| Hover and press | Colour or border change. | 120ms | Same |

Collapsed unit content stays rendered for the animation but is `inert` and `aria-hidden`. No animation hides content by default, so the page reads correctly without JavaScript timing.

## Elevation & Depth

There is no elevation system. Paper sheets have a 1px paper-edge shadow; a pulled sheet deepens it briefly. The dialog and the in-place edit sheet have one soft shadow. The tablet evidence panel also uses a shadow; the evidence rail is flat. Every shadow is a token in `:root` (`--edge`, `--shadow-pull`, `--shadow-sheet`, `--shadow-dialog`, `--shadow-bar-up`), as is the ink on navy (`--on-action`, and `--on-action-rule` for the rule inside the rail); no colour literal appears outside the token block (Hallmark audit, 2026-10-26). Focus is a 2px `focus` outline with 2px offset.

## Components

- **Buttons.** Primary: navy, white 700 text, 48px, 8px radius. Secondary (`.btn`): white, `rule-strong` border, 32px, text only. Small primary (`.btn-primary`): the secondary's 32px size in navy with `--on-action` 700 text and `action-hover` on hover, used only for "Sửa câu hỏi". It must stay after `.btn` in the stylesheet, or `.btn`'s white fill wins (a 2026-10-26 refactor merged it into `.primary` above `.btn` and turned it white; rolled back). While editing a question that already has a result, the submit button reads "Xác nhận" and "Hủy" is a 48px secondary button beside it (`.btn .btn-secondary`: white, `rule-strong` stroke, ink 15/700, navy stroke and text on hover), on the left of the primary; below 640px both drop to their own right-aligned row under the field (changed 2026-10-26 from a text link in the options row). Text actions (`.link-btn`) use `link` with an underline on hover.
- **Citations** (`.cite`). `[n]` drawn as a small outlined control so it reads as clickable: a 1px `rule-strong` border, 6px radius, white fill, `link` 13/700 tabular text, 22px tall (24px+ touch area on mobile). On hover the wash fill and a `link` border appear; when open or selected it turns navy with white text. Desktop citations carry a native tooltip naming the document number. (Changed 2026-10-24: users did not recognise bare `[n]` text as clickable.)
- **Document row action.** "Trích ở [3] [4] [8]" is replaced by one verb button, "Xem n đoạn trích" (`.btn`, 30px, 40px on mobile). It switches the drawer to "Đoạn nguồn" filtered to that document's excerpts and pulls the first one. The context line reads "Đang xem đoạn trích của <số hiệu>" with "Hiện tất cả". This works on every screen size.
- **Excerpt sheet.** `[n]` in ink-2, the document number in seal red. The issuer is in ink 500, and the kind, date and pages in ink-2. A rule separates them from the Tinos body, clamped to four lines through an inner span. Text actions follow.
- **Tags.** "ngoài kho" uses a 1px `rule-strong` outline and a 4px radius.
- **Dialog.** Seal-red title, a metadata line, the Tinos body between rules, and the original footer note.

## Do's and Don'ts

- Do keep the answer first and the evidence on demand; keep the default view short.
- Do keep the PDF's own wording; don't add summaries or commentary the data does not contain.
- Do set every document excerpt in Tinos, and reserve seal red for document numbers.
- Do write metadata as Vietnamese sentences, not "A · B · C" chains.
- Do retain visible focus, native disclosure, and 24px text-action targets.
- Don't add drop shadows, gradient washes, all-caps eyebrows, or identical card grids.
- Don't present fixture content as newly retrieved or generated information.

## Visual simplification (2026-10-26)

At the user’s request, section headings (including Bằng chứng and Câu trả lời) use typography and spacing without a top rule. Removed the filter footer rule, the vertical divider before the query text, and the extra navy line on an expanded unit’s source margin. The evidence rail has no shadow, hover translation or count flash. Keep list separators, input borders, selected-tab indicators and keyboard focus outlines: they convey grouping or interaction. These are design decisions; usability improvements have not been measured with users.

## Touch drawer reliability (2026-10-26)

On coarse pointers, the evidence drawer opens/closes without a sliding transition and its rail appears without an entrance animation, keeping hit targets stable during repeated taps. A closed drawer immediately has pointer-events:none. The mobile rail is 44px wide with a 54px page gutter. Buttons use touch-action:manipulation (pinch zoom stays available). Closing restores focus without scrolling; on Safari, where a tapped button may not receive focus, the rail is the fallback. The query form is inert while the drawer is open. Automated touch checks cover WebKit and Chromium; physical iPhone verification remains outstanding.

## Stable unit headings (2026-10-26)

Source labels retain the same text (for example, Nguồn 6) and DOM position when a unit opens or closes. Only the source details and answer body expand below. Unit headings and source margins remain in normal document flow rather than becoming sticky on expansion. The page reserves scrollbar space to avoid horizontal movement when content becomes scrollable. This supersedes earlier sticky unit-heading/source-margin guidance.
