
# Deriverse Analytics — Solana Trading Dashboard

## Overview
A professional-grade, dark-themed trading dashboard and journal for the Solana ecosystem. Sleek DeFi-native aesthetic with comprehensive analytics, charts, and a trade journal.

---

## Pages & Layout

### Single-Page Dashboard
- **Dark theme** with deep navy/charcoal tones, neon accent colors (green for profit, red for loss, purple/blue accents)
- Responsive grid layout — desktop-optimized with mobile support

---

## Section 1: Header Bar
- Deriverse logo/branding
- **Wallet connect button** (mocked — shows truncated address when "connected")
- **Date range filter**: Last 24h, 7d, 30d, All
- **Symbol filter**: Multi-select for SOL, BONK, JUP, WIF, etc.

## Section 2: KPI Tiles Row
Four cards across the top:
1. **Total PnL** — large dollar value, percentage change badge, inline sparkline
2. **Win Rate** — circular progress gauge with percentage
3. **Volume & Fees** — total volume traded vs. cumulative fees
4. **Risk Metrics** — largest win, largest loss, average trade duration

## Section 3: Visual Analytics (Charts)
- **Equity Curve** — Area chart showing cumulative PnL over time with red-shaded drawdown overlay (Recharts)
- **Directional Bias** — Horizontal bar chart showing Long vs. Short ratio and PnL per direction
- **Time Analysis** — Bar chart showing PnL performance by hour of day and day of week (tab toggle)

## Section 4: Trade Journal & History
- Full data table with columns: Asset, Side (Long/Short with color badges), Entry Price, Exit Price, Size, Realized PnL, Fee
- Sortable and filterable
- Click a row to open a dialog for adding/editing trade annotations/notes
- Notes persist in local state

## Section 5: Advanced Insights
- **Order Type Efficiency** — Pie/donut chart comparing Market vs. Limit vs. Trigger order performance
- **Fee Composition** — Stacked bar or pie chart breaking down network fees vs. protocol fees

---

## Data
- Rich mock JSON dataset (~50+ trades) simulating realistic Solana trading activity across multiple tokens
- All filters and date ranges will dynamically filter the mock data

## Design Details
- Dark mode only with custom CSS variables
- Lucide icons throughout (TrendingUp, Wallet, BarChart3, Clock, etc.)
- Shadcn UI components for cards, tables, dialogs, badges, tabs, selects
- Recharts for all visualizations
- Subtle animations and hover states for a polished feel
