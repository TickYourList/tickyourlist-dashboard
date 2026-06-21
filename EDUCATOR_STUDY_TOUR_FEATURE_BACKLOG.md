# Educator Study Tour Feature Backlog

Audit date: 2026-06-21

Target dashboard route: `/educator-study-tours/:tourId`

Audited frontend files:
- `src/pages/EducatorStudyTour/StudyTourList.js`
- `src/pages/EducatorStudyTour/Participants.js`
- `src/helpers/educator_study_tour_helper.js`

Audited backend support:
- `commercee-backend/src/routes/v1/educatorStudyTour/studyTours.ts`
- `commercee-backend/src/database/model/educatorStudyTour/StudyTour.ts`
- `commercee-backend/src/database/model/educatorStudyTour/StudyTourParticipant.ts`
- `commercee-backend/src/services/educatorStudyTour/*`

## Goal

Build the educator study tour module into a complete ops cockpit for high-touch international educator cohorts: registration, sales follow-up, payment, documents, visa, flights, rooming, expenses, communication, reporting, and post-tour follow-up.

## Current Functionality Already Present

| Area | Existing functionality | Notes |
| --- | --- | --- |
| Tour list | List tours, create basic tour, delete tour | Creation captures name, slug, year, destination, status, summary, basic pricing. |
| Tour detail | Stage board, participant table, search, stage filter, solo filter, needs-attention filter | Route is `/educator-study-tours/:tourId`. |
| Participants | Add concierge participant, view participant, edit profile, delete participant | Profile editor covers core personal, institution, trip preference, emergency, medical fields. |
| Ops | Edit stage, travel cluster, solo flag, quote amount, paid amount, coordinator, internal notes | Payment milestones can be added and marked paid. |
| Documents | Per-participant checklist, upload files, remove files, verify, reject, add custom document | Missing reject reason and participant self-service link in UI. |
| Visa | Edit appointment, centre, deadline, form link, passport number, expiry, Schengen flag | Missing bulk scheduling and generated documents. |
| Flights | Edit PNR, departure city/airport, outbound and return flight basics | Missing flight times, baggage, terminals, e-ticket upload. |
| Messaging | Send single participant messages, preview email, select email/WhatsApp/SMS, channel availability | Templates live in backend code, not dashboard editable. |
| Bulk messaging | Send a template to all participants or one stage | Missing recipient preview, dry run, segmentation beyond stage. |
| Cohort tools | Analytics summary, live weather, run reminders, export rooming/dietary/flight CSV | Good base for ops dashboard. |
| Expenses | Add expenses, delete expenses, see expense summary | Missing edit, filters in UI, budget planning, attachments. |
| Tour settings | Bank details, coordinators, document checklist builder, load default Schengen checklist | Missing itinerary, host partner, dates, public page content. |
| Import | Bulk CSV import with preview | CSV parser is basic and does not handle quoted commas robustly. |
| Backend | Public registration endpoints, public upload, admin CRUD, messaging, automation, weather, analytics, expenses | Public frontend page/portal does not appear implemented in dashboard/frontend search. |

## Priority Legend

- P0: Needed for a reliable internal ops workflow.
- P1: Makes the product strong enough for repeat cohorts and scale.
- P2: Advanced differentiators and automation.
- P3: Nice-to-have polish or future platform work.

## Phase 1: Immediate Dashboard Gaps

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Done | Full tour edit screen | Edit slug, status, year, destination, start date, end date, summary, pricing, inclusions, exclusions, host partner, itinerary, and public registration settings. |
| P0 | Done | Public registration link panel | Show public form URL, copy link, open preview, show current status draft/open/closed, and warn when the tour is not open. |
| P0 | Done | Participant full-field editor | Add UI for schema fields not currently editable: DOB, gender, passport country, passport issue date, visa refusal, communication method, website, official email, students count, educators count, responsibilities, expected outcome, presentation interest, institution visit preferences, visited Nordic, dietary details, allergy details, emergency email, billing/GST fields, declarations. |
| P0 | Done | Accompanying-person editor | Add, edit, and remove accompanying persons with passport, visa support, meal, medical, contact, and participation type. |
| P0 | Done | Advanced participant filters | Filter by city, state, institution, cluster, document status, payment status, overdue milestone, visa deadline, passport expiry risk, flight missing, extension demand, source, coordinator. |
| P0 | Todo | Server pagination and sorting | Participant list should support large cohorts with page, limit, sort, and total count from backend. |
| P0 | Todo | Bulk selection actions | Select participants and update stage, coordinator, cluster, send message, export, mark solo, or delete/cancel in bulk. |
| P0 | Todo | Robust CSV import | Use a real CSV parser, header mapping, downloadable sample, dry-run validation, duplicate detection, and downloadable error report. |
| P0 | Todo | Expense edit UI | Backend supports expense update but dashboard only adds/deletes. Add edit modal, category filter, participant filter, attachments, and notes. |
| P0 | Todo | Build verification | Keep `yarn build` and `CI=true yarn build` passing after every module change. |

## Phase 2: Registration And Customer Portal

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Public registration frontend | Multi-step public page for `/educator-study-tours/public/:slug` or a frontend equivalent. Use backend `GET /public/:slug` and `POST /public/:slug/register`. |
| P0 | Todo | Registration confirmation page | Show successful submission, participant reference, next steps, and contact details. |
| P1 | Todo | Save-and-resume registration | Let participants save progress and continue later via secure token link. |
| P1 | Todo | Participant self-service portal | Secure link where participant can see status, payment milestones, document checklist, visa details, flights, itinerary, coordinator, and messages. |
| P1 | Todo | Participant document upload portal | Let participants upload documents themselves, replace rejected files, and see reject reasons. Backend public upload exists but needs a full portal flow. |
| P1 | Todo | Public form duplicate handling | If email already registered, guide user to resume or contact ops instead of only returning an error. |
| P1 | Todo | Consent and declarations | Clear privacy consent, visa disclaimer, cancellation policy, photo consent, medical declaration, and terms acceptance. |
| P1 | Todo | Mobile-first form UX | Public registration and document upload should be excellent on phone. |
| P2 | Todo | Multi-language public form | Add Hindi or other regional language support if cohorts need it. |
| P2 | Todo | Source attribution | Capture campaign source, referrer, UTM, partner/institution code, and conversion funnel. |

## Phase 3: Tour Setup And Programme Management

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Partial | Itinerary builder | Dashboard now edits backend-supported day, title, city, and details. Add richer academic visit, sightseeing, meals, transport, and notes fields when backend schema supports them. |
| P0 | Done | Host partner management | Add host partner name, contact person, email, phone, website, and internal notes. Backend schema exists. |
| P1 | Todo | Visit partner schedule | Track schools, universities, institutions, speaker sessions, contact people, addresses, timing, and confirmation status. |
| P1 | Todo | Tour duplication | Duplicate a previous tour into a new year/cohort including pricing, checklist, itinerary, coordinators, templates, and settings. |
| P1 | Todo | Registration capacity and waitlist | Capacity, max participants, waitlist mode, close registration automatically when full. |
| P1 | Todo | Public page content editor | Hero, description, highlights, inclusions, exclusions, FAQ, eligibility, important dates, price notes, cancellation terms. |
| P1 | Todo | Status workflow | Draft, open, closed, completed, archived with explicit publish/unpublish actions and warnings. |
| P2 | Todo | Country-specific checklist templates | Schengen, UK, USA, UAE, Singapore, custom country kits. |
| P2 | Todo | Tour templates | Save reusable programme templates such as Finland education immersion, Nordic leadership tour, school delegation, etc. |

## Phase 4: Sales, Pricing, Payments, Invoices

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Quote builder | Calculate final quote from base price, single supplement, accompanying persons, extension, discounts, taxes, add-ons, and currency. |
| P0 | Todo | Payment milestone workflow | Add due dates, paid date, payment method, transaction reference, receipt attachment, and automatic stage movement. |
| P0 | Todo | Outstanding payment dashboard | Aging buckets, overdue list, upcoming due milestones, paid vs quoted, reminders due. |
| P1 | Todo | Payment gateway links | Generate and track secure payment links rather than manual links only. |
| P1 | Todo | Invoice/proforma generation | Generate proforma invoice, GST invoice, receipt, credit note, cancellation/refund note. |
| P1 | Todo | Payment reconciliation | Reconcile gateway/webhook payments against milestones and participant records. |
| P1 | Todo | Refund and cancellation flow | Record cancellation reason, refund amount, refund status, credit note, and stage transition. |
| P2 | Todo | Margin forecast | Forecast expected margin from quoted revenue, expected costs, current expenses, and pending add-ons. |
| P2 | Todo | Multi-currency support | Keep INR default but allow international deposits or partner costs in other currencies. |

## Phase 5: Documents And Visa Operations

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Reject reason and doc notes | When rejecting a document, capture reason, note, and next action. Show it to ops and participant. |
| P0 | Todo | Document readiness score | Show required docs uploaded/verified per participant and cohort-level completion. |
| P0 | Todo | Passport validity rules | Flag passport expiry under 6 months, missing passport number, missing issue date, name mismatch, old visa risk. |
| P1 | Todo | Visa task board | Board/calendar for document deadline, appointment date, centre, status, coordinator, and risk. |
| P1 | Todo | Bulk visa scheduling | Apply appointment details to multiple participants, then send a visa appointment message. |
| P1 | Todo | Visa document generation | Generate cover letter, NOC request, invitation letter, sponsorship letter, document index, and checklist PDF. |
| P1 | Todo | Visa risk scoring | Combine missing docs, passport expiry, refusal history, payment status, travel date proximity, and appointment status. |
| P1 | Todo | Secure file handling | Signed/private document access, file virus scan, storage cleanup, audit log for uploads/downloads. |
| P2 | Todo | OCR extraction | Extract passport number, expiry, name, PAN, Aadhaar, bank statement dates from uploaded documents for review. |
| P2 | Todo | Document comparison | Check names across passport, PAN, Aadhaar, bank statement, visa form, and registration. |

## Phase 6: Flights, Rooming, Transfers, On-Trip Ops

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Flight detail completion | Add depart time, arrive time, baggage, terminal, ticket number, e-ticket upload, return from/to fields. Backend schema has several of these fields. |
| P1 | Todo | PNR/e-ticket import | Import flight details from CSV or uploaded tickets and map to participants. |
| P1 | Todo | Rooming allocation builder | Match roommates, assign room numbers, hotel, check-in/out dates, solo handling, accompanying persons. |
| P1 | Todo | Transfer manifest | Build arrival/departure transfers, bus groups, pickup times, guide contact, emergency phone. |
| P1 | Todo | Insurance tracker | Policy number, provider, insured amount, policy document, emergency hotline. |
| P1 | Todo | On-trip readiness checklist | Passport, visa, insurance, ticket, hotel, emergency contact, payment, documents verified, weather email sent. |
| P2 | Todo | Live operations timeline | Day-wise operational run sheet with tasks, vendors, contacts, documents, and escalation notes. |
| P2 | Todo | Incident log | On-trip incidents, medical issues, lost passport, missed transfer, escalation owner, resolution. |
| P2 | Todo | eSIM/SIM and forex tracker | Track optional services sold, fulfilled, and delivered. |

## Phase 7: Communication And Automation

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Recipient preview for bulk messages | Show exact recipient count and list before send. |
| P0 | Todo | Dry-run mode | Render bulk messages without sending and show failures before dispatch. |
| P1 | Todo | Dashboard template editor | Manage templates in dashboard instead of hard-coded backend templates. Include variables, test render, version history. |
| P1 | Todo | Scheduled campaigns | Schedule messages for future dates, stage changes, or deadlines with a calendar view. |
| P1 | Todo | Advanced segmentation | Segment by city, institution, cluster, docs pending, payment due, visa date, flight missing, extension demand. |
| P1 | Todo | Delivery tracking | Show sent, failed, queued, opened, clicked, bounced, WhatsApp delivered/read when provider supports it. |
| P1 | Todo | Resend failed messages | Retry failed channel sends from participant or campaign log. |
| P1 | Todo | Communication timeline | Tour-level and participant-level timeline with manual, automation, and system messages. |
| P2 | Todo | Automation rule management | Configure reminders from dashboard instead of editing backend `RULES`. |
| P2 | Todo | Channel health dashboard | Show email/WhatsApp/SMS provider status, missing config, quota, recent failures. |
| P2 | Todo | AI message assistant | Draft professional cohort updates from tour context, then require human review before sending. |

## Phase 8: Analytics, Reporting, Exports

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Better cohort dashboard | Funnel by stage, docs completion, payment collection, visa readiness, flight readiness, extension demand, solo risk. |
| P1 | Todo | Conversion analytics | Registration to quoted, quoted to paid, paid to docs, docs to visa, visa to ready, with time-in-stage. |
| P1 | Todo | Financial reporting | Revenue, outstanding, expenses, cost per head, gross margin, category breakdown, reimbursables. |
| P1 | Todo | Risk dashboard | Participants needing attention ranked by payment, passport, docs, visa deadline, flights, emergency data. |
| P1 | Todo | Export to XLSX | Export participants, manifests, expenses, payment report, document report, communication log as Excel. |
| P1 | Todo | Partner-ready PDFs | Hotel rooming list, dietary/medical sheet, flight manifest, visa checklist, coordinator run sheet. |
| P2 | Todo | Scheduled reports | Weekly ops report to leadership/coordinators. |
| P2 | Todo | Cohort comparison | Compare current tour vs previous cohorts on conversion, collections, docs, visa, margin. |

## Phase 9: Permissions, Audit, Reliability

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Permission visibility | Hide/disable study tour actions based on granted permission and role. Backend uses `studyTours` permission key. |
| P0 | Todo | Audit trail | Track who changed participant fields, tour settings, documents, stage, payments, expenses, and messages. |
| P0 | Todo | Safer destructive actions | Replace `window.confirm` with typed confirmation modals for delete, bulk send, bulk delete, and run reminders. |
| P1 | Todo | Soft delete/archive | Archive participants/tours instead of hard delete, with restore option. |
| P1 | Todo | Change history timeline | Show before/after changes for key fields. |
| P1 | Todo | Background job logs | View automation runs, reminders sent/skipped/failed, and dedupe keys. |
| P1 | Todo | Error handling polish | Show API error details, validation field errors, retry buttons, and partial failure reports. |
| P2 | Todo | Optimistic concurrency | Prevent overwriting edits when two ops users edit the same participant. |
| P2 | Todo | SLA/task ownership | Assign tasks to ops users with due dates and escalation reminders. |

## Phase 10: Engineering Cleanup

| Priority | Status | Feature | What to build |
| --- | --- | --- | --- |
| P0 | Todo | Split `Participants.js` | Break the large file into components: page shell, table, detail modal, message modal, cohort tools, expenses, imports, settings. |
| P0 | Todo | Centralize constants | Share stages, labels, template keys, checklist helpers, attention rules, and money/date formatting. |
| P0 | Todo | Form validation | Add structured validation for participant, tour, payment, visa, flight, expense, import. |
| P1 | Todo | Typed API helper layer | Use request/response adapters so UI does not depend on raw response shapes everywhere. |
| P1 | Todo | Tests for critical flows | Build smoke tests for create tour, create participant, update stage, upload doc, send preview, import CSV, expenses. |
| P1 | Todo | Bundle/code splitting | Current CRA build produces a large main JS bundle. Lazy-load heavy modals/editors and route chunks. |
| P1 | Todo | Accessibility and responsive QA | Ensure modal tabs, tables, buttons, upload controls, and mobile layouts are accessible and usable. |
| P2 | Todo | Replace ad-hoc CSV download/import helpers | Use a shared CSV/XLSX utility with tests. |
| P2 | Todo | Data fetching cleanup | Add cancellation, stale request protection, loading states per panel, and consistent refresh behavior. |

## Suggested Build Order

1. P0 dashboard foundations: full tour edit, participant full-field editor, advanced filters, pagination/sorting, robust import.
2. P0 customer flow: public registration page, confirmation page, participant document upload portal.
3. P0 ops safety: audit trail, permissions, safer confirmations, reject reasons, payment due dashboard.
4. P1 scale features: quote builder, invoices, rooming builder, visa board, scheduled campaigns, richer analytics.
5. P2 differentiators: OCR, AI message drafts, automation rule editor, cohort comparison, incident timeline.

## First Implementation Tickets To Create

- [x] Create `StudyTourEditModal` or `/educator-study-tours/:tourId/settings` page for all tour fields.
- [x] Add public registration link/copy/open panel to the tour detail header.
- [x] Add participant detail tabs for full professional, billing, extension, accommodation, and accompanying-person fields.
- [x] Add advanced filter drawer and wire backend query support for missing filters. Dashboard filtering is done; backend query support remains part of server pagination/sorting.
- [ ] Replace basic CSV parser with robust import mapping and dry-run validation.
- [ ] Add document rejection reason and show it in participant detail.
- [ ] Add expense edit modal and expense filters.
- [ ] Split `Participants.js` into smaller components before major feature growth.
