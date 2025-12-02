# Husbandometrics Design System

## 1. Aesthetic Overview
**Style:** Kawaii-Tech / Y2K Futurist / "Decorated Notebook"
**Core Vibe:** Clean, data-driven, yet playful. Combines soft rounded elements with sharp, high-saturation tech accents.
**Metaphors:** ID Cards, Event Tickets, Personnel Dossiers, System Manuals.

---

## 2. Color Palette

### Brand Colors
| Role | Name | Hex | Tailwind Usage |
|------|------|-----|----------------|
| **Primary** | **Tech Pink** | `#ff5d8f` | `text-[#ff5d8f]`, `bg-[#ff5d8f]` |
| **Secondary** | **Holo Blue** | `#4cc9f0` | `text-[#4cc9f0]`, `bg-[#4cc9f0]` |
| **Accent** | **Deep Violet** | `#7209b7` | `text-[#7209b7]`, `bg-[#7209b7]` |
| **Tertiary** | **Soft Pink** | `#ff8fa3` | Used in gradients |

### Functional Colors
| Role | Hex/Tailwind | Usage |
|------|--------------|-------|
| **Background** | `#f8f9fc` / `bg-slate-50` | Main app background |
| **Modal Bg** | `#f0f2f5` | Folder/Dossier background |
| **Card Surface**| `#ffffff` | Character cards, Filter bar |
| **Success** | `#06d6a0` | "Rising" trend, "Hot" badge |
| **Danger** | `#ef476f` | "Falling" trend |
| **Warning** | `#ffca3a` | Rank #1 Gold |

### Text Colors
| Role | Tailwind Class | Hex Equiv (Approx) |
|------|----------------|--------------------|
| **Headings** | `text-slate-800` | `#1e293b` |
| **Body** | `text-slate-600` | `#475569` |
| **Muted** | `text-slate-400` | `#94a3b8` |
| **Placeholder**| `text-slate-300` | `#cbd5e1` |

### Gradients
*   **Logo Icon:** `bg-gradient-to-tr from-[#ff5d8f] to-[#ff8fa3]`
*   **Background Blobs:** `bg-pink-200` and `bg-blue-200` with `blur-3xl` and `opacity-30`.

---

## 3. Typography

### Font Families
| Role | Font Name | Import Source | Fallback |
|------|-----------|---------------|----------|
| **Display/Headings** | **Satoshi** | Fontshare CDN | `sans-serif` |
| **Body/UI** | **M PLUS Rounded 1c** | Google Fonts | `sans-serif` |
| **Handwritten** | **Gochi Hand** | Google Fonts | `cursive` |

### Scale & Weights
*   **Hero/Logo:** `text-4xl` / `text-xl`, Weight: `900` (Black)
*   **Card Names:** `text-2xl`, Weight: `900` (Black)
*   **Stats/Scores:** `text-3xl`, Weight: `900` (Black)
*   **Body Text:** `text-sm` or `text-base`, Weight: `500` or `700` (Bold used frequently for UI labels).
*   **Meta/Tags:** `text-[9px]` or `text-xs`, Weight: `700` (Bold), Uppercase.

---

## 4. Spacing & Layout

### Global Layout
*   **Container:** `max-w-7xl` centered (`mx-auto`).
*   **Padding:** `px-4 sm:px-6 lg:px-8` (Horizontal), `pt-32` (Top padding to clear floating header).
*   **Grid:** `grid-cols-1 md:grid-cols-2` with `gap-6` (24px).

### Component Spacing
*   **Card Padding:** `p-3` (Internal), `pl-5` (Content side).
*   **Modal Padding:** `p-8`.
*   **Border Radius:**
    *   Cards: `rounded-3xl`
    *   Modals: `rounded-[2rem]`
    *   Images: `rounded-2xl`
    *   Buttons/Pills: `rounded-full` or `rounded-lg`

---

## 5. Components

### Character Card ("The Ticket")
*   **Base:** `bg-white`, `border-2 border-slate-100`.
*   **Shape:** Includes decorative "cutout" circles (`w-6 h-6`) absolutely positioned on left/right edges to mimic a ticket stub.
*   **Image:** 3D perspective wrapper (`perspective-500`). Image container rotates slightly on hover.
*   **Barcode:** Visual-only div bars using `bg-slate-800` with random heights.

### Header ("Floating Pill")
*   **Style:** `bg-white/90`, `backdrop-blur-md`.
*   **Shape:** `rounded-full`.
*   **Border:** `border border-slate-200/60`.
*   **Shadow:** `shadow-lg shadow-slate-200/20`.

### Detail Modal ("The Dossier")
*   **Style:** Split layout (Left: Profile, Right: Data).
*   **Decoration:**
    *   "Tape" element: `bg-[#ff5d8f]/20 rotate-1`.
    *   "Confidential" stamps.
    *   "Paper Clip" icon on the AI notes section.
    *   Background pattern: `graphy.png` or css radial dots on the right side.
*   **AI Note:** `bg-[#fff9c4]` (Post-it yellow) with `font-hand`.

### Filter Bar ("Tech Pills")
*   **Container:** `bg-white/50 backdrop-blur-sm`.
*   **Tabs:**
    *   Inactive: `text-slate-400`.
    *   Active: `bg-white text-[#ff5d8f] shadow-sm ring-2 ring-[#ff5d8f]/20 scale-105`.

---

## 6. Effects & Animation

### Hover States
*   **Cards:** `hover:-translate-y-2`, `hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.1)]`.
*   **Images:** `group-hover:scale-110`, `group-hover:rotate-6`.
*   **Buttons:** `active:scale-95` (Click press), `hover:scale-110` (Icon buttons).

### Keyframe Animations
*   **`animate-fade-in-up`**: Custom. 0.5s duration. Moves from `y: 10px` to `0` while fading in. Used for page load elements.
*   **`animate-float`**: 3s infinite ease-in-out. Moves `y: 0` -> `-5px` -> `0`. Used for badges and background elements.
*   **`animate-pulse`**: Standard Tailwind. Used for "Live" indicators.

### Glassmorphism
*   Used on Header and Filter Bar.
*   `bg-white/90` + `backdrop-blur-md`.

---

## 7. Tailwind Utility Patterns

*   **Centering:** `flex items-center justify-center`.
*   **Transitions:** `transition-all duration-300 ease-in-out`.
*   **Typography:** `font-display font-black leading-none`.
*   **Absolute positioning:** Used heavily for decorative elements (circles, glowing blobs, tape strips).
*   **Group Hover:** `group` on parent, `group-hover:opacity-100` or `group-hover:scale-110` on children.