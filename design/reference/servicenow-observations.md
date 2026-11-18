> Raw notes from looking at ServiceNow's Horizon site and workspace screens first-hand (17 Nov 2026). The cleaned-up rules are in [../ui-style-guide.md](../ui-style-guide.md). Some early mapping ideas here were later changed by the owner, for example the 3-column deal page became "deal + chat" and the tabs moved into the top bar.

# ServiceNow (Horizon / Next Experience) style spec — seen first-hand 2026-11-17

The user picked the CSM workspace look as "very good". Copy the style only: no ServiceNow logo, name or brand marks.

## Sources viewed (horizon.servicenow.com, opens in Chrome, 403 to fetchers)
- Workspace examples: csm_2x (CSM agent workspace), itam_2x (software asset dashboard, filter pills), fsm_2x (Dispatcher workspace: map, schedule, "Contractor marketplace" side panel with bid cards + ratings)
- Core UI examples: landing_page_2x (admin home, dark), incident_form_2x (classic form), list_view_2x (classic list, dark)
- Structure diagrams: app shell, list page, record page, landing page
- Unified navigation text + menu overlay / pinned menu images
- Messaging (alerts) patterns, contextual side panel, palettes, typography, corner radius

## Colours (sampled from palette images)
- Primary/interactive: light #BCDFE7, base #0081A2, dark #00566E, darkest #002C38
- Header bar: very dark petrol ~#032B3A (≈ primary darkest)
- Record-tab strip: light blue band ~#BCDFE7 / #C9E3EA; active tab white
- App rail (far left, thin): vertical gradient dark petrol → teal → green (#0A3D52 → #2C7F8E → #4CAF50-ish)
- Neutrals (blue-grey): #FFFFFF #F4F6F6 #E2E4E6 #CFD5D7 #BDC2C7 #AAB3B7 #97A2A6 #859095 #727E84 #616D74 #4F5D63 #3D4A50 #36444B #28353A #1D262A #161E22
- Canvas: #F4F6F6-ish light grey; panels white; side panel bg pale blue-grey ~#E4EEF2, its icon bar ~#BFDCE5
- Semantic (light/base/dark): low #D6D8D9/#6D7376/#353639 · positive #CFE3BE/#3F8500/#2F6301 · info #CDE4F5/#0079CC/#005D9A · moderate #DED5FB/#7A5DF0/#5D47B7 · warning #FFF4B8/#FEDF1D/#85720E · high #FFE0B3/#FD9601/#854E00 · critical #F8CBD0/#E52238/#B71C2C
- Work notes (internal) on pale yellow; AI summary card has a green/teal border

## Type, shape, density
- Fonts: Cabin (headers/titles), Lato (body). Both on Google Fonts.
- Corner radius: 2px badges, 6px buttons/inputs, 8px modals/large containers/cards
- Compact, dense, small type (13–14px body in lists/forms), labels above fields in workspace forms (left of fields in classic forms), thin 1px grey borders, very little shadow, small line icons

## Shell and navigation
1. Unified header (dark): logo (home) · text menus All | Favorites | History | Workspaces | Admin | ⋮ · centered "context pill" (outlined pill with current place + ☆ favourite) · search box (dark field, magnifier) · icon buttons: globe/scope, AI sparkle, chat, help ?, bell, avatar
   - Menus open as dark overlay panels under the menu item (dim page), with Filter box + pin icon + tree list; pin → becomes fixed dark left sidebar
2. App shell: thin left icon rail (home, lists, dashboards, inbox; phone at bottom); record tabs strip under header: "Lists | INC000001 | INC000002 | … | +" with × close; active tab white
3. Page layouts:
   - Landing page: title, KPI/insight cards (sparklines, progress bars, big numbers, approve cards), right column of to-do cards
   - List page: left list menu (saved lists grouped, collapsible tree) + table; title + actions top right
   - Record page: title bar (record title left; outlined secondary buttons + one filled primary right), optional sub-tabs, then columns: left details form (sections, collapsible), center summary + activity stream, right contextual side panel; far-right narrow icon bar switches side panels
4. Pop-out windows dock bottom-right (e.g. Compose email: dark title bar, fields, filled primary send)

## Components / behaviours
- Lists: filter breadcrumb (All > Active=true), condition builder (Run, Save, And, OR, Add sort), per-column search row, sortable headers, record number as blue link, checkbox per row, "Actions on selected rows", pagination "1 to 20 of 622", coloured priority pills with dot ("• 1 - Critical")
- Filter pills with count badges ("(1) SaaS ▾", date range pill)
- Page tabs with green/teal underline for active
- Alerts: tinted bar with icon, bold header, text, link, × (critical/high/warning/moderate/low/info/positive)
- Side panel: header title + icon buttons, search + add, list of white cards (icon, title, meta, ⋮)
- Activity stream: timeline entries with avatar/icon, "X was assigned", field change list, work notes yellow
- SLA ring countdown in overview panel
- Marketplace cards (FSM): number, bold title, status pills (Scheduled, • 2-High, ⏱ 3 days), "3+ bids to review"; people rows with ★3.7 and rate

## Mapping to simple.p2p
- Header: logo, menus (Deals | Live | Wallet | Telegram | Admin), context pill (e.g. "Deal D-2091"), search, bell (deal alerts), avatar
- Tabs strip: "Deals" list tab + one tab per opened deal
- Deals = list page: left saved views (Buy USDT, Sell USDT, My offers, By payment method), dense table with filter breadcrumb + pills
- Deal = record page: title "Buying 500 USDT from amir_k" + Open dispute / Cancel / I paid; left trader card + deal details; center "what to do now" summary card + activity stream (locked, paid, released, admin notes yellow); right panel: time-to-pay ring + steps; icon bar: chat, receipts, trader profile, help; chat as bottom-right pop-out
- Live board = landing page with columns/cards (marketplace-card style)
- Admin = landing page: KPI cards (users' money, hot/cold, covered), disputes and approvals as cards/lists
