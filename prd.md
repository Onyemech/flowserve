FlowServe AI is a multi-business automation PWA connected to WhatsApp.
Businesses sign up → choose their industry → get an AI assistant on WhatsApp that handles:

✔ Customer onboarding

✔ Product/property listing (based on business type)
✔ Automated order processing
✔ Payment (via Paystack or manual payments)
✔ Instant transfer of received Paystack payments to the business owner
✔ Images/media delivery to customers via WhatsApp
✔ Cloudinary usage tracking + automatic media clean-up
✔ Automated soft delete of sold real-estate properties
✔ Admin dashboard with business-type specific modules

2. TARGET BUSINESS TYPES (MVP)

When a new admin signs up, after Google/email authentication:

2.1 Business Type Selection

Dropdown 1 — Select Business Type (required):

Event Planning

Real Estate Sales

Based on this choice, the dashboard + WhatsApp workflow will be adjusted.

3. USER FLOWS
3.1 Admin Onboarding (Universal for all business types)

User signs up via:

Google Auth or

Email/Password

System prompts:

Business Name

Business Type (dropdown)

Admin chooses payment settlement method setup:

Enter Bank Name (select dropdown)

Enter Account Number

Enter Account Name (autofill if paystack resolves it)

System fetches the bank’s Paystack Bank Code automatically.

Admin dashboard is generated based on business type.

4. PAYMENT SYSTEM LOGIC
4.1 Supported Customer Payment Options

For any transaction:

Option A: Paystack Automated Payment

Customer pays using Paystack link.

FlowServe backend receives webhook → verifies payment.

System immediately initiates a Transfer to the admin using:

Paystack Transfer API

To admin’s saved account details

Customer gets instant confirmation on WhatsApp.

Option B: Manual Payment

AI tells customer:
"Manual payments take 5 minutes — 14 hours to confirm."

Admin marks payment as received manually in dashboard.

5. REAL ESTATE AUTOMATION (Business Type: Real Estate Sales)
5.1 Admin Features

Add property:

Title

Price

Description

Images (uploaded from phone in PWA)

Location (optional)

Properties stored in Cloudinary.

FlowServe tracks Cloudinary free plan usage.

Customers on WhatsApp can request:

“Available properties”

“3-bedroom properties”

“Budget properties under N10M”

AI sends images via WhatsApp + description.

5.2 Auto Property Soft-Delete When Sold

When Paystack confirms a customer payment:

System checks the property purchased.

Marks it as Sold (Soft Deleted).

Soft delete definition (in your earlier question):
→ You can still retrieve or restore data anytime since it’s only flagged, not permanently deleted.

5.3 14-Day Auto Media Cleanup

Soft-deleted properties older than 14 days → images automatically deleted from Cloudinary to save free-tier usage.

Property remains in DB as soft-deleted for audits.

6. EVENT PLANNING AUTOMATION (Business Type: Event Planner)
6.1 Admin Features

Services offered
(e.g., Decor, Catering, Ushers, Rentals, etc.)

Price cards

Add sample event images

Images uploaded to Cloudinary

Auto clean-up rules apply same as Real Estate

AI removes dependence on logos (you requested logo upload removal).

6.2 Customer WhatsApp Experience

“Show me your services”

“What packages do you have?”

AI shares images (Cloudinary URLs → WhatsApp media delivery)

“I want to book a wedding decorator”

AI creates booking summary

Customer chooses:

Paystack

Manual payment

Payment logic runs as described.

7. WHATSApp AUTOMATION LOGIC
WhatsApp Agent Capabilities

Understand intent based on business type

Show properties/services with images

Handle customer questions

Automate invoice sending

Provide payment options

Confirm payments via Paystack webhook

Trigger backend operations (orders, bookings, updates)

8. ADMIN DASHBOARD (PWA)
8.1 Shared Modules

Home Overview

Payments Overview

Customers

Whatsapp Bot Settings

Cloud Storage Tracker (Cloudinary usage)

8.2 Real Estate Only Modules

Properties (Add / Edit / Soft Delete / Restore)

Sold Properties Log

Auto-Cleanup Monitor

8.3 Event Planner Only Modules

Services & Pricing

Gallery (Event images)

No logo upload.

9. CLOUDINARY MANAGEMENT SYSTEM
9.1 Usage Tracking

Dashboard shows:

Total storage used (MB)

Number of assets

Monthly free-tier limits

9.2 Auto Cleanup Rules

Delete images of sold properties after 14 days

Delete stale gallery images marked for removal

10. SYSTEM ARCHITECTURE
10.1 Backend

Node.js (NestJS or Express)

Cloudinary SDK

Paystack API

WhatsApp Cloud API

PostgreSQL (with soft delete support)

Redis (optional, for caching)

10.2 Frontend (PWA)

React + Tailwind

Offline support

Mobile-first design

10.3 Integrations

Paystack Transfers

Paystack Webhooks

WhatsApp Cloud API

Cloudinary Asset Management

11. AI BEHAVIOR
AI should adapt based on business type:

Real Estate → Talk about listings, show images, pricing

Event Planning → Show services, event images, booking options

The AI must:

Understand customer messages

Trigger payments

Send images

Confirm actions

Maintain conversation memory (session-level, not long-term personal info)

12. FUTURE EXPANSION (You requested this to be included)

Even though Google services are not used now, the system must be designed so we can later integrate:

Google Sheets → logs

Google Drive → media backup

Google Calendar → bookings

Google Maps → property location

13. SECURITY + COMPLIANCE

All payment flows must follow Paystack best practices

Webhooks must be verified with secret keys

No sensitive personal data stored outside secure DB

Media served through secure Cloudinary URLs

14. NON-FUNCTIONAL REQUIREMENTS

Scalable architecture for multiple businesses

Real-time WhatsApp response (<1s where possible)

Optimized Cloudinary usage

Resilient Paystack integration (retry on failed transfers)

Audit logs on all financial actions

15. MVP SCOPE CHECKLIST
Included in MVP

✔ Multi-business onboarding
✔ Business type-specific dashboards
✔ WhatsApp automation
✔ Real estate listing + image delivery
✔ Event planner services
✔ Cloudinary integration
✔ Paystack payment + auto-transfer
✔ Soft delete for sold properties
✔ Auto-delete media after 14 days
✔ No logo upload

Not Included in MVP

✘ Google integrations (future-ready only)
✘ Multi-admin teams
✘ Advanced analyticsa