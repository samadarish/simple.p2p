# Design references

These are the sources behind the simple.p2p look. For the rules themselves, see [`../ui-style-guide.md`](../ui-style-guide.md) and [`../image-style-guide.md`](../image-style-guide.md).

> ⚠️ **The screenshots in `horizon-style/` show ServiceNow's own pages and artwork.** They are here only so people and AI tools can see the target style. Never ship them in the product or copy them into it, and remove them before this repo is ever made public.

## Screenshots

### `horizon-style/`: the picture style the owner asked for
The owner circled the header art on each page.

| File | Page | What to take from it |
|---|---|---|
| `ref-1-record-page-header.jpg` | Horizon › Page templates › CSM Interaction Record | The header card: cream fading to mint and blue, a small monospace label (`WORKSPACE / PAGE TEMPLATES`), a huge bold title, and art on the right with thin guide lines |
| `ref-2-dashboard-header.jpg` | Horizon › Data visualization › Dashboard | Big fan and ring shapes filling the frame, grain, thin circles and small dots |
| `ref-3-getting-started-header.jpg` | Horizon › Getting started | Strong perspective shapes (a doorway with light rays) and a full-bleed gradient. Our sign-in picture is based on it |

We keep their **style**. The **colours** are our navy, teal and green, never their purple, pink or red.

### `feedback/`: the owner's notes on the demo
| File | What the owner asked for | Done |
|---|---|---|
| `home-before-blocks-moved.jpg` | Move the four KPI blocks up onto the hero picture: less blank space | ✅ KPIs overlap the bottom of the hero |
| `header-before-tabs-moved.png` | Move the tabs into the top bar, remove the centre "Home ★" pill, show starred items under All / Favorites / History | ✅ |

## Links

### ServiceNow Horizon design system
All of these were public and opened without a login (checked Nov 2026). They open in a normal browser, but automated fetchers get HTTP 403.

| Page | What it shows | Used for |
|---|---|---|
| [Workspace examples](https://horizon.servicenow.com/workspace/basics/examples) | Real workspace screens: the CSM case page (the owner's favourite), a software usage page, a dispatcher map | The whole look; the order page |
| [CSM workspace screenshot](https://static.horizon.servicenow.com/assets/csm_2x_a508bc8900.webp) | The exact screen the owner picked ("this looks very good") | Shell, tabs, record page |
| [Core UI examples](https://horizon.servicenow.com/core-ui/basics/examples) | Dark admin home, classic form, dark list with filters | Admin, lists, forms |
| [Dashboard](https://horizon.servicenow.com/workspace/foundations/data-visualization/dashboard) | Dashboards with totals, charts, gauge | Admin money totals, Market |
| [CSM Interaction Record](https://horizon.servicenow.com/workspace/page-templates/csm-interaction-record?release=brazil) | Live chat next to record details | Order page "Deal + chat" |
| [Record template](https://horizon.servicenow.com/workspace/page-templates/record?release=brazil) | Record page parts, numbered | Order page header, timer, activity |
| [Standard list](https://horizon.servicenow.com/workspace/page-templates/standard-list?release=brazil) | Saved-lists menu, table, priority tags, paging | Buy/Sell lists, admin queues |
| [KPI details](https://horizon.servicenow.com/workspace/page-templates/kpi-details?release=brazil) | One big number, trend and the records behind it | Wallet, admin drill-downs |
| [Creating an experience](https://horizon.servicenow.com/workspace/basics/creating-an-experience) | Landing, list and record page set | Page types |
| [App frameworks](https://horizon.servicenow.com/getting-started/app-frameworks) | Workspace, mobile, admin and portal looks | Choosing the look |
| [Native mobile examples](https://horizon.servicenow.com/native-mobile/basics/examples) | Phone screens with tabs and bottom buttons | Phone layout |
| [Cards](https://horizon.servicenow.com/workspace/patterns/cards/card-use-cases) | Kanban columns, number cards | Live board, KPI cards |
| [Form patterns](https://horizon.servicenow.com/workspace/patterns/forms/form-patterns) | Side-panel form, step playbook | Post ad, verification steps |
| [Contextual side bar](https://horizon.servicenow.com/workspace/patterns/contextual-side-bar/contextual-side-bar-use-cases) | Right-side panels | Order side info |
| [Filtering](https://horizon.servicenow.com/workspace/patterns/filtering) | Filter bar, condition builder | List filters |
| [Guided experiences](https://horizon.servicenow.com/workspace/patterns/guided-experiences) | Step-by-step progress | Order stage arrows, onboarding |

### ServiceNow docs and videos
- [Unified Navigation (global header)](https://www.servicenow.com/docs/r/platform-user-interface/using-the-next-experience-global-header.html)
- [Service Operations Workspace UI](https://www.servicenow.com/docs/r/it-service-management/service-operations-workspace/service-operations-workspace-ui.html)
- [CSM landing page](https://www.servicenow.com/docs/r/customer-service-management/csm-ws-landing-page-original.html)
- [Platform Analytics dashboards](https://www.servicenow.com/docs/r/now-intelligence/ac-elements.html)
- Videos:
  - [Next Experience workspaces](https://www.youtube.com/watch?v=LB0jG4fnc_8)
  - [Platform Analytics dashboards](https://www.youtube.com/watch?v=5n2HTbXS3VM)
  - [AI Experience](https://www.youtube.com/watch?v=lrQylmrcbXs)
- [Free developer instance](https://developer.servicenow.com/dev.do#!/home) (needs a free account): shows every real screen.

### Similar enterprise UIs (looked at, not chosen)
| System | Link | How it differs |
|---|---|---|
| Salesforce Lightning (SLDS 2) | https://www.lightningdesignsystem.com/ | Airier, rounder, bluer, with a white header |
| Microsoft Dynamics 365 / Fluent 2 | https://learn.microsoft.com/en-us/dynamics365/customer-service/implement/csw-overview | Feels like Office, with a lighter header |
| Zendesk Garden | https://garden.zendesk.com/components | Friendlier, green, roomier |
| Pega Constellation | https://design.pega.com/patterns/cases/ | Workflow chevrons, softer blue |
| SAP Fiori | https://www.sap.com/design-system/fiori-design-web/ | Tile launchpad, more whitespace |
| IBM Carbon | https://carbondesignsystem.com/ | Square corners, stricter |
| AWS Cloudscape | https://cloudscape.design/demos | Developer console look |

Jira, Oracle Redwood and Workday were left out because they are too round and friendly, or too decorative.
