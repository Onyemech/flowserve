# Requirements Document

## Introduction

FlowServe AI is a multi-business automation Progressive Web Application (PWA) that connects businesses to WhatsApp for automated customer interactions, order processing, and payment handling. The system supports multiple business types (Real Estate Sales and Event Planning in MVP) with industry-specific workflows, integrated payment processing via Paystack, media management through Cloudinary, and a comprehensive admin dashboard. All currency displays and transactions use Nigerian Naira (₦).

## Glossary

- **FlowServe System**: The complete multi-business automation platform including frontend PWA, backend services, database, and integrations
- **Admin User**: A business owner or manager who registers and manages their business through the dashboard
- **Customer**: An end-user who interacts with the business via WhatsApp
- **WhatsApp Agent**: The AI-powered chatbot that handles customer interactions on WhatsApp
- **Business Profile**: The configuration and data associated with a specific business registered in the system
- **Property**: A real estate listing with title, price, description, images, and location
- **Service**: An event planning offering with description, pricing, and sample images
- **Soft Delete**: A data deletion strategy where records are flagged as deleted but remain in the database for potential restoration
- **Paystack**: The payment gateway integration for automated payment processing and transfers
- **Cloudinary**: The cloud-based media storage and delivery service
- **Public Schema**: The PostgreSQL schema containing business application tables (users, properties, services, etc.)
- **Auth Schema**: The Supabase authentication schema containing auth.users and related authentication tables
- **Reset Token**: A time-limited token stored in public.users for password reset verification
- **Verification Token**: A time-limited token stored in public.users for email verification
- **SQL Function**: A PostgreSQL stored procedure used to update columns and tables in the public schema
- **PWA**: Progressive Web Application - a web application that functions like a native mobile app

## Requirements

### Requirement 1: Admin User Registration and Authentication

**User Story:** As a business owner, I want to register for an account using email/password or Google authentication, so that I can access the FlowServe System.

#### Acceptance Criteria

1. WHEN an Admin User accesses the registration page, THE FlowServe System SHALL display options for email/password registration and Google OAuth authentication
2. WHEN an Admin User completes email/password registration with valid credentials, THE FlowServe System SHALL create a record in auth.users and synchronize the user data to public.users using an SQL Function
3. WHEN an Admin User completes Google OAuth authentication, THE FlowServe System SHALL create a record in auth.users and synchronize the user data to public.users using an SQL Function
4. WHEN an Admin User registers via email/password, THE FlowServe System SHALL generate a Verification Token, store it in public.users, and send a verification email
5. THE FlowServe System SHALL display consistent brand colors across all authentication buttons and forms as defined in the design files

### Requirement 2: Admin User Login

**User Story:** As a registered business owner, I want to log in to my account, so that I can manage my business operations.

#### Acceptance Criteria

1. WHEN an Admin User accesses the login page, THE FlowServe System SHALL display email/password login and Google OAuth login options
2. WHEN an Admin User submits valid login credentials, THE FlowServe System SHALL authenticate against auth.users and grant access to the dashboard
3. IF an Admin User submits invalid credentials, THEN THE FlowServe System SHALL display an error message and prevent access
4. WHEN an Admin User successfully authenticates via Google OAuth, THE FlowServe System SHALL synchronize any updated profile data to public.users using an SQL Function
5. THE FlowServe System SHALL maintain consistent brand colors for all login buttons and interface elements

### Requirement 3: Password Reset Flow

**User Story:** As an Admin User who forgot my password, I want to request a password reset, so that I can regain access to my account.

#### Acceptance Criteria

1. WHEN an Admin User clicks the forgot password link, THE FlowServe System SHALL display a form requesting the registered email address
2. WHEN an Admin User submits a valid email address, THE FlowServe System SHALL generate a Reset Token, store it in public.users with an expiration timestamp, and send a password reset email
3. WHEN an Admin User clicks the reset link with a valid Reset Token, THE FlowServe System SHALL display a password reset form
4. WHEN an Admin User submits a new password with a valid Reset Token, THE FlowServe System SHALL update the password in auth.users using an SQL Function and invalidate the Reset Token in public.users
5. IF an Admin User attempts to use an expired or invalid Reset Token, THEN THE FlowServe System SHALL display an error message and prevent password reset

### Requirement 4: Business Profile Setup

**User Story:** As a newly registered Admin User, I want to set up my business profile with business type and payment details, so that I can start using the automation features.

#### Acceptance Criteria

1. WHEN an Admin User completes registration without providing Full Name, THE FlowServe System SHALL prompt for Full Name during profile setup
2. WHEN an Admin User completes profile setup, THE FlowServe System SHALL prompt for Business Name, Business Type selection (Real Estate Sales or Event Planning), and payment settlement details
3. WHEN an Admin User selects a Business Type, THE FlowServe System SHALL configure the dashboard modules specific to that business type
4. WHEN an Admin User enters bank account details, THE FlowServe System SHALL validate the account number with Paystack, auto-fill the Account Name, and fetch the Bank Code required for transfers
5. WHEN an Admin User saves valid payment details, THE FlowServe System SHALL store the Full Name, Business Name, Bank Name, Account Number, Account Name, and Bank Code in public.users using an SQL Function
6. THE FlowServe System SHALL display all currency values in Nigerian Naira (₦) throughout the business profile setup

### Requirement 5: Real Estate Property Management

**User Story:** As an Admin User with a Real Estate Sales business, I want to add, edit, and manage property listings, so that customers can view them via WhatsApp.

#### Acceptance Criteria

1. WHEN an Admin User navigates to the Properties module, THE FlowServe System SHALL display a list of all properties with their status (available or sold)
2. WHEN an Admin User adds a new property, THE FlowServe System SHALL accept Title, Price in Naira, Description, Images, and optional Location
3. WHEN an Admin User enters a property price, THE FlowServe System SHALL automatically calculate and display the Paystack fee (1.5% + ₦100) that will be deducted from the sale
4. WHEN an Admin User uploads property images, THE FlowServe System SHALL store them in Cloudinary and track the storage usage
5. WHEN an Admin User edits a property, THE FlowServe System SHALL update the property record in the public schema using an SQL Function
6. WHEN an Admin User marks a property as sold, THE FlowServe System SHALL perform a Soft Delete by setting a deleted_at timestamp using an SQL Function

### Requirement 6: Event Planning Service Management

**User Story:** As an Admin User with an Event Planning business, I want to manage my services and pricing, so that customers can view offerings via WhatsApp.

#### Acceptance Criteria

1. WHEN an Admin User navigates to the Services module, THE FlowServe System SHALL display all services with pricing in Naira
2. WHEN an Admin User adds a new service, THE FlowServe System SHALL accept service name, description, price in Naira, and sample images
3. WHEN an Admin User enters a service price, THE FlowServe System SHALL automatically calculate and display the Paystack fee (1.5% + ₦100) that will be deducted from the booking
4. WHEN an Admin User uploads service images, THE FlowServe System SHALL store them in Cloudinary and track the storage usage
5. WHEN an Admin User edits a service, THE FlowServe System SHALL update the service record in the public schema using an SQL Function
6. THE FlowServe System SHALL NOT require or display logo upload functionality for Event Planning businesses

### Requirement 7: WhatsApp Customer Interaction - Real Estate

**User Story:** As a Customer interested in real estate, I want to interact with the WhatsApp Agent to view available properties, so that I can find properties matching my needs.

#### Acceptance Criteria

1. WHEN a Customer sends the first message to the WhatsApp Agent, THE WhatsApp Agent SHALL greet the Customer with the Business Name (e.g., "Hello! I am Kasungo AI, welcome to [Business Name]")
2. WHEN a Customer sends a message to the WhatsApp Agent for a Real Estate business, THE WhatsApp Agent SHALL understand the intent and respond appropriately
3. WHEN a Customer requests available properties, THE WhatsApp Agent SHALL retrieve non-soft-deleted properties from the public schema and send images with descriptions via WhatsApp
4. WHEN a Customer requests properties with specific criteria (e.g., "3-bedroom" or "under ₦10M"), THE WhatsApp Agent SHALL filter properties and send matching results
5. WHEN a Customer expresses interest in a property, THE WhatsApp Agent SHALL provide payment options with clear messaging: "Paystack (Instant)" and "Manual Payment (5 minutes - 14 hours)"
6. THE WhatsApp Agent SHALL deliver property images from Cloudinary URLs via WhatsApp media delivery

### Requirement 8: WhatsApp Customer Interaction - Event Planning

**User Story:** As a Customer interested in event services, I want to interact with the WhatsApp Agent to view services and book events, so that I can plan my event.

#### Acceptance Criteria

1. WHEN a Customer sends the first message to the WhatsApp Agent, THE WhatsApp Agent SHALL greet the Customer with the Business Name (e.g., "Hello! I am Kasungo AI, welcome to [Business Name]")
2. WHEN a Customer sends a message to the WhatsApp Agent for an Event Planning business, THE WhatsApp Agent SHALL understand the intent and respond appropriately
3. WHEN a Customer requests services or packages, THE WhatsApp Agent SHALL retrieve services from the public schema and send images with descriptions via WhatsApp
4. WHEN a Customer requests to book a service, THE WhatsApp Agent SHALL create a booking summary and provide payment options with clear messaging: "Paystack (Instant)" and "Manual Payment (5 minutes - 14 hours)"
5. THE WhatsApp Agent SHALL deliver service images from Cloudinary URLs via WhatsApp media delivery
6. THE WhatsApp Agent SHALL maintain session-level conversation memory without storing long-term personal customer information

### Requirement 9: Paystack Automated Payment Processing

**User Story:** As a Customer, I want to pay for a property or service using Paystack, so that my payment is processed instantly and confirmed automatically.

#### Acceptance Criteria

1. WHEN a Customer selects Paystack payment, THE WhatsApp Agent SHALL generate a Paystack payment link with the amount in Naira and send it via WhatsApp
2. WHEN a Customer completes payment via Paystack, THE FlowServe System SHALL receive and verify the webhook notification
3. WHEN Paystack payment is verified, THE FlowServe System SHALL initiate an immediate transfer to the Admin User's saved bank account using the Paystack Transfer API
4. WHEN payment and transfer are successful, THE FlowServe System SHALL send instant confirmation to the Customer via WhatsApp
5. IF the payment is for a Real Estate property, THEN THE FlowServe System SHALL mark the property as sold using Soft Delete via an SQL Function

### Requirement 10: Manual Payment Processing

**User Story:** As a Customer who prefers manual payment, I want to pay outside the automated system and have the Admin confirm receipt, so that I can complete my purchase.

#### Acceptance Criteria

1. WHEN a Customer selects Manual Payment, THE WhatsApp Agent SHALL inform the Customer that confirmation takes 5 minutes to 24 hours
2. WHEN an Admin User receives manual payment, THE FlowServe System SHALL allow the Admin to mark the payment as received in the dashboard
3. WHEN an Admin User confirms manual payment, THE FlowServe System SHALL update the order status in the public schema using an SQL Function
4. WHEN manual payment is confirmed, THE FlowServe System SHALL send confirmation to the Customer via WhatsApp
5. IF the manual payment is for a Real Estate property, THEN THE FlowServe System SHALL mark the property as sold using Soft Delete via an SQL Function

### Requirement 11: Cloudinary Media Management and Cleanup

**User Story:** As an Admin User, I want the system to automatically manage my media storage, so that I stay within free-tier limits and avoid unnecessary costs.

#### Acceptance Criteria

1. WHEN an Admin User uploads images, THE FlowServe System SHALL track the total storage used in megabytes and number of assets
2. WHEN an Admin User accesses the Cloud Storage Tracker, THE FlowServe System SHALL display total storage used, number of assets, and monthly free-tier limits
3. WHEN a property is soft-deleted for 14 days, THE FlowServe System SHALL automatically delete the associated images from Cloudinary
4. WHEN images are deleted from Cloudinary, THE FlowServe System SHALL update the storage tracking metrics
5. THE FlowServe System SHALL retain soft-deleted property records in the database for audit purposes after image deletion

### Requirement 12: Admin Dashboard - Home Overview

**User Story:** As an Admin User, I want to view key business metrics on my dashboard home page, so that I can monitor my business performance.

#### Acceptance Criteria

1. WHEN an Admin User accesses the dashboard home, THE FlowServe System SHALL display Revenue Today in Naira, New Customers count, Messages Sent count, and Orders Today count
2. WHEN an Admin User views the Payments Overview, THE FlowServe System SHALL display total payments in Naira for the last 7 days with percentage change
3. THE FlowServe System SHALL display Recent Customers with names, actions, and timestamps
4. THE FlowServe System SHALL display WhatsApp Bot Status (Active/Inactive) with message processing count
5. THE FlowServe System SHALL display Cloud Storage usage with a visual progress bar showing used storage versus total available

### Requirement 13: Admin Dashboard - Business-Specific Modules

**User Story:** As an Admin User, I want to access modules specific to my business type, so that I can manage my business operations efficiently.

#### Acceptance Criteria

1. WHEN an Admin User with Real Estate Sales business type accesses the dashboard, THE FlowServe System SHALL display Properties, Sold Properties Log, and Auto-Cleanup Monitor modules
2. WHEN an Admin User with Event Planning business type accesses the dashboard, THE FlowServe System SHALL display Services & Pricing and Gallery modules
3. THE FlowServe System SHALL display shared modules (Home Overview, Payments Overview, Customers, WhatsApp Bot Settings, Cloud Storage Tracker) for all business types
4. THE FlowServe System SHALL apply consistent brand colors to all dashboard buttons, cards, and navigation elements
5. THE FlowServe System SHALL display all monetary values in Nigerian Naira (₦) throughout the dashboard

### Requirement 14: Progressive Web App Functionality

**User Story:** As an Admin User, I want to use FlowServe as a mobile app, so that I can manage my business from my phone with offline support.

#### Acceptance Criteria

1. WHEN an Admin User accesses FlowServe from a mobile browser, THE FlowServe System SHALL provide an option to install the PWA
2. WHEN an Admin User installs the PWA, THE FlowServe System SHALL function as a native mobile application
3. WHILE the Admin User is offline, THE FlowServe System SHALL cache essential data and allow viewing of previously loaded content
4. WHEN the Admin User regains internet connectivity, THE FlowServe System SHALL synchronize any pending changes to the backend
5. THE FlowServe System SHALL implement a mobile-first design optimized for phone screens

### Requirement 15: Payment Audit and Financial Tracking

**User Story:** As an Admin User, I want to view all payment transactions and transfers, so that I can track my business finances and resolve any issues.

#### Acceptance Criteria

1. WHEN an Admin User accesses the Payments Overview module, THE FlowServe System SHALL display all transactions with amounts in Naira, payment method, status, and timestamps
2. WHEN a Paystack transfer fails, THE FlowServe System SHALL retry the transfer and log the failure in the audit trail
3. THE FlowServe System SHALL maintain an audit log of all financial actions including payments received, transfers initiated, and manual payment confirmations
4. WHEN an Admin User views a transaction, THE FlowServe System SHALL display the Customer information, order details, payment method, and transfer status
5. THE FlowServe System SHALL allow filtering and searching of transactions by date range, payment method, and status

### Requirement 16: Data Security and Compliance

**User Story:** As an Admin User, I want my business and customer data to be secure, so that I can trust the platform with sensitive information.

#### Acceptance Criteria

1. THE FlowServe System SHALL verify all Paystack webhook notifications using secret keys before processing payments
2. THE FlowServe System SHALL store all sensitive data (passwords, payment details, tokens) in encrypted format in the database
3. THE FlowServe System SHALL serve all media through secure Cloudinary URLs with appropriate access controls
4. THE FlowServe System SHALL NOT store sensitive personal customer data outside the secure database
5. THE FlowServe System SHALL implement Row Level Security (RLS) policies on all public schema tables to ensure Admin Users can only access their own business data

### Requirement 17: System Performance and Reliability

**User Story:** As a Customer, I want the WhatsApp Agent to respond quickly, so that I can get information and complete transactions efficiently.

#### Acceptance Criteria

1. WHEN a Customer sends a message to the WhatsApp Agent, THE FlowServe System SHALL respond within 1 second for simple queries
2. WHEN the FlowServe System processes a Paystack webhook, THE FlowServe System SHALL complete verification and transfer initiation within 5 seconds
3. IF a Paystack transfer fails, THEN THE FlowServe System SHALL retry the transfer with exponential backoff up to 3 attempts
4. THE FlowServe System SHALL support multiple concurrent Admin Users and Customers without performance degradation
5. THE FlowServe System SHALL maintain 99.5% uptime for the WhatsApp Agent and payment processing services

### Requirement 18: Email Verification and Token Management

**User Story:** As a newly registered Admin User, I want to verify my email address, so that I can confirm my account ownership and access all features.

#### Acceptance Criteria

1. WHEN an Admin User registers with email/password, THE FlowServe System SHALL generate a Verification Token with a 24-hour expiration and store it in public.users
2. WHEN an Admin User clicks the verification link, THE FlowServe System SHALL validate the Verification Token from public.users and mark the email as verified using an SQL Function
3. IF an Admin User attempts to verify with an expired Verification Token, THEN THE FlowServe System SHALL display an error and offer to resend the verification email
4. WHEN an Admin User requests a new verification email, THE FlowServe System SHALL generate a new Verification Token, invalidate the old token, and send a new email
5. THE FlowServe System SHALL prevent access to certain features (e.g., payment setup) until email verification is complete

### Requirement 19: Invoice Generation and Email Notifications

**User Story:** As a Customer, I want to receive an invoice via email when I make a payment, so that I have a record of my transaction.

#### Acceptance Criteria

1. WHEN a Customer completes a Paystack payment, THE FlowServe System SHALL generate an invoice with transaction details, amount in Naira, Business Name, and payment status
2. WHEN an invoice is generated, THE FlowServe System SHALL send the invoice to the Customer's email address
3. WHEN an Admin User confirms a manual payment, THE FlowServe System SHALL generate an invoice and send it to the Customer's email address
4. WHEN a payment status changes (pending, completed, failed), THE FlowServe System SHALL send an email notification to the Customer with the updated status
5. THE FlowServe System SHALL store invoice records in the public schema for Admin User access and audit purposes

### Requirement 20: User Interface Components and Notifications

**User Story:** As an Admin User, I want to receive clear visual feedback through toast notifications, so that I know when actions succeed or fail.

#### Acceptance Criteria

1. WHEN an Admin User performs an action (save, delete, update), THE FlowServe System SHALL display a toast notification with the action result
2. THE FlowServe System SHALL render toast notifications in a rectangle shape with rounded corners (not sharp edges)
3. THE FlowServe System SHALL apply branded color contrast to toast notifications for success (green), error (red), warning (yellow), and info (blue) states
4. THE FlowServe System SHALL implement reusable UI components following separation of concerns principles
5. THE FlowServe System SHALL implement loose coupling between frontend components and backend services to enable independent updates and testing
