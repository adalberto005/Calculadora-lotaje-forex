# Project memory

## Product intent & audience

- Technical calculator web app for engineers/technicians needing quick structural and electrical calculations.
- Two calculator tabs: **Cálculo de Viga** (beam load: moment, shear, bending stress, deflection, safety factor across supports/materials) and **Cálculo Eléctrico** (single/three-phase power: active, apparent, reactive power, line voltage drop, Joule losses).
- UI labels and button text in Spanish.

## Brand personality & voice

- Professional, modern, clean. Technical but approachable.
- Spanish-language interface throughout.

## Visual design & UX direction

- Slate/blue color palette.
- Sticky header with tab navigation.
- Responsive two-column layout: parameters card + results card.
- Result cards with stat highlights and a detailed result table below.
- Numeric inputs with validation; invalid entries handled gracefully.
- CSV export button downloads the result table.
- Icons via `lucide-react`.

## Decisions, constraints & rationale

- Stack: Vite + React + Tailwind CSS (template default).
- Authoritative global instructions live in `.bolt/prompt` (beautiful, production-worthy designs; JSX + Tailwind + Lucide only; `@/` path alias).
- No extra UI/icon packages installed beyond template defaults.
- Two distinct calculator domains chosen to fulfill "two tabs" requirement with meaningful technical depth.

## Open questions & assumptions

- Assumed beam and electrical domains for the two tabs; user may want different calculation types.
- Specific formulas/materials/support types chosen by assistant; may need domain verification.
- CSV chosen as export format; user may prefer Excel/JSON/PDF.
- Spanish language inferred from request; may need localization support later.