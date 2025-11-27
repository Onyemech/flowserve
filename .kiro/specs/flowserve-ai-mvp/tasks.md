# Implementation Plan

- [x] 1. Project Setup and Configuration



  - Initialize Next.js 14+ project with TypeScript and Tailwind CSS
  - Configure Supabase client and environment variables
  - Set up PWA configuration with service workers
  - Configure Tailwind with brand colors (#20C997, #4A90E2, #50E3C2)





  - _Requirements: 14.1, 14.2_

- [x] 2. Database Schema and SQL Functions


  - [ ] 2.1 Create database tables in public schema
    - Create users, properties, services, orders, whatsapp_sessions, cloudinary_usage tables
    - Set up proper foreign key relationships and constraints
    - _Requirements: 1.2, 1.3, 4.5_
  


  - [ ] 2.2 Implement SQL functions for user management
    - Create sync_auth_user_to_public() trigger function
    - Create update_user_profile() function


    - Create verify_email() function
    - Create reset_password() function
    - _Requirements: 1.2, 1.3, 3.4, 18.2_
  
  - [ ] 2.3 Implement SQL functions for property and order management
    - Create soft_delete_property() function
    - Create cleanup_old_media() function
    - _Requirements: 5.6, 9.4, 11.3_
  
  - [ ] 2.4 Set up Row Level Security (RLS) policies
    - Enable RLS on all public schema tables
    - Create policies for users, properties, services, orders, whatsapp_sessions, cloudinary_usage
    - _Requirements: 16.5_

- [x] 3. Authentication System





  - [ ] 3.1 Create authentication UI components
    - Build reusable Button component with brand colors
    - Build Toast notification component (rectangle with rounded corners)
    - Build Modal component
    - Build Form input components


    - _Requirements: 1.5, 20.1, 20.2, 20.3_
  
  - [ ] 3.2 Implement registration page
    - Create /auth/register page with email/password form
    - Integrate Google OAuth button
    - Handle registration submission and sync to public.users



    - Generate and store verification token
    - Send verification email
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 18.1_
  


  - [ ] 3.3 Implement login page
    - Create /auth/login page with email/password form
    - Integrate Google OAuth button
    - Handle login submission and error display
    - Sync Google OAuth data to public.users
    - _Requirements: 2.1, 2.2, 2.3, 2.4_


  
  - [ ] 3.4 Implement email verification flow
    - Create /auth/verify-email page
    - Validate verification token from URL





    - Call verify_email() SQL function
    - Display success/error messages
    - Handle expired tokens and resend option

    - _Requirements: 18.2, 18.3, 18.4_
  
  - [ ] 3.5 Implement password reset flow
    - Create /auth/forgot-password page
    - Generate and store reset token with expiration
    - Send password reset email

    - Create /auth/reset-password page
    - Validate reset token and update password
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 4. Business Profile Setup
  - [ ] 4.1 Create profile setup wizard
    - Build multi-step form for Full Name, Business Name, Business Type
    - Add dropdown for business type selection (Real Estate Sales, Event Planning)
    - _Requirements: 4.1, 4.2_
  
  - [ ] 4.2 Implement payment details form
    - Create bank selection dropdown
    - Add account number input with Paystack validation
    - Auto-fill account name from Paystack
    - Fetch and store bank code
    - _Requirements: 4.4_
  
  - [ ] 4.3 Save profile data using SQL function
    - Call update_user_profile() SQL function
    - Display all currency values in Naira (₦)
    - Show success toast notification
    - Redirect to dashboard based on business type
    - _Requirements: 4.3, 4.5, 4.6_

- [ ] 5. Dashboard Layout and Navigation
  - [ ] 5.1 Create dashboard layout component
    - Build responsive sidebar navigation
    - Add header with user profile dropdown
    - Implement mobile-first design
    - Apply consistent brand colors
    - _Requirements: 13.4, 14.5_
  
  - [ ] 5.2 Implement business-type specific navigation
    - Show Properties module for Real Estate businesses
    - Show Services module for Event Planning businesses
    - Display shared modules for all business types
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 6. Home Dashboard Overview
  - [ ] 6.1 Create dashboard home page
    - Display Revenue Today in Naira with icon
    - Show New Customers count
    - Show Messages Sent count
    - Show Orders Today count
    - _Requirements: 12.1_
  
  - [ ] 6.2 Implement Payments Overview section
    - Display total payments for last 7 days in Naira
    - Calculate and show percentage change
    - _Requirements: 12.2_
  
  - [ ] 6.3 Add Recent Customers list
    - Display customer names, actions, and timestamps
    - _Requirements: 12.3_
  
  - [ ] 6.4 Add WhatsApp Bot Status widget
    - Show Active/Inactive status
    - Display message processing count
    - _Requirements: 12.4_
  
  - [ ] 6.5 Add Cloud Storage usage widget
    - Display storage used vs total available
    - Show visual progress bar
    - _Requirements: 12.5_

- [ ] 7. Property Management (Real Estate)
  - [ ] 7.1 Create properties list page
    - Display all properties with status (available/sold)
    - Add filters for status and price range
    - Show property images from Cloudinary
    - Display prices in Naira
    - _Requirements: 5.1, 13.5_
  
  - [ ] 7.2 Implement add property form
    - Create form with Title, Price, Description, Location fields
    - Add image upload with Cloudinary integration
    - Calculate and display Paystack fee (1.5% + ₦100)
    - Track Cloudinary storage usage
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ] 7.3 Implement edit property functionality
    - Load existing property data
    - Update property using SQL function
    - Handle image updates in Cloudinary
    - _Requirements: 5.5_
  
  - [ ] 7.4 Implement soft delete for sold properties
    - Add "Mark as Sold" button
    - Call soft_delete_property() SQL function
    - Update UI to reflect sold status
    - _Requirements: 5.6, 9.4_

- [ ] 8. Service Management (Event Planning)
  - [ ] 8.1 Create services list page
    - Display all services with pricing in Naira
    - Show service images from Cloudinary
    - _Requirements: 6.1, 13.5_
  
  - [ ] 8.2 Implement add service form
    - Create form with Name, Description, Price fields
    - Add image upload with Cloudinary integration
    - Calculate and display Paystack fee (1.5% + ₦100)
    - Track Cloudinary storage usage
    - Do not include logo upload functionality
    - _Requirements: 6.2, 6.3, 6.4, 6.6_
  
  - [ ] 8.3 Implement edit service functionality
    - Load existing service data
    - Update service using SQL function
    - Handle image updates in Cloudinary
    - _Requirements: 6.5_

- [ ] 9. Cloudinary Integration
  - [ ] 9.1 Set up Cloudinary SDK and configuration
    - Configure Cloudinary credentials
    - Create upload utility functions
    - Implement image transformation for responsive delivery
    - _Requirements: 5.4, 6.4_
  
  - [ ] 9.2 Implement storage tracking
    - Update cloudinary_usage table on upload
    - Update cloudinary_usage table on delete
    - _Requirements: 11.1, 11.4_
  
  - [ ] 9.3 Create Cloud Storage Tracker page
    - Display total storage used in MB
    - Show number of assets
    - Display monthly free-tier limits
    - Show visual progress indicators
    - _Requirements: 11.2_
  
  - [ ] 9.4 Implement automated media cleanup
    - Create Supabase Edge Function for scheduled cleanup
    - Query properties soft-deleted > 14 days
    - Delete images from Cloudinary
    - Update storage tracking
    - Retain property records in database
    - _Requirements: 11.3, 11.4, 11.5_

- [ ] 10. Paystack Payment Integration
  - [ ] 10.1 Set up Paystack SDK and configuration
    - Configure Paystack secret and public keys
    - Create utility functions for API calls
    - _Requirements: 9.1, 16.2_
  
  - [ ] 10.2 Implement payment link generation
    - Create API route to generate Paystack payment links
    - Include amount in Naira and order reference
    - _Requirements: 9.1_
  
  - [ ] 10.3 Implement Paystack webhook handler
    - Create Supabase Edge Function for webhook
    - Verify webhook signature
    - Extract and validate payment data
    - Update order status in database
    - _Requirements: 9.2, 16.1_
  
  - [ ] 10.4 Implement automatic transfer to business owner
    - Call Paystack Transfer API with admin bank details
    - Handle transfer success and failure
    - Implement retry logic (up to 3 attempts with exponential backoff)
    - Log all transfer attempts
    - _Requirements: 9.3, 15.2, 17.3_
  
  - [ ] 10.5 Handle property soft delete on payment
    - Check if order is for a property
    - Call soft_delete_property() SQL function
    - _Requirements: 9.5, 10.5_

- [ ] 11. Manual Payment Processing
  - [ ] 11.1 Create manual payment confirmation UI
    - Add "Confirm Payment" button in orders list
    - Display confirmation modal
    - _Requirements: 10.2_
  
  - [ ] 11.2 Implement manual payment confirmation logic
    - Update order status using SQL function
    - Handle property soft delete if applicable
    - _Requirements: 10.3, 10.5_

- [ ] 12. Orders and Payments Dashboard
  - [ ] 12.1 Create orders list page
    - Display all orders with customer info
    - Show amount in Naira, payment method, status
    - Add filters for date range, payment method, status
    - _Requirements: 15.1_
  
  - [ ] 12.2 Create order details page
    - Display customer information
    - Show order details (item, amount, payment method)
    - Display transfer status
    - Show audit trail of actions
    - _Requirements: 15.4_
  
  - [ ] 12.3 Implement payments overview page
    - Display transaction history
    - Show payment method breakdown
    - Calculate totals and statistics in Naira
    - Implement search and filtering
    - _Requirements: 15.1, 15.5_
  
  - [ ] 12.4 Create audit logging system
    - Log all payment receipts
    - Log all transfer initiations
    - Log manual payment confirmations
    - Display audit trail in UI
    - _Requirements: 15.3_

- [ ] 13. n8n Workflow Setup and WhatsApp Integration
  - [ ] 13.1 Set up n8n instance
    - Deploy n8n (self-hosted or cloud)
    - Configure environment variables (AI_PROVIDER, API keys)
    - Set up Supabase connection in n8n
    - Configure credentials for multiple AI providers (OpenAI, Grok, Groq, etc.)
    - _Requirements: 7.1, 8.1_
  
  - [ ] 13.2 Set up WhatsApp Cloud API credentials
    - Configure phone number ID and access token in n8n
    - Set up webhook URL pointing to n8n
    - Create webhook receiver Edge Function to forward to n8n
    - _Requirements: 7.1, 8.1_
  
  - [ ] 13.3 Create n8n workflow for WhatsApp message handling
    - Add Webhook trigger node
    - Add Supabase node to identify business from phone number
    - Add Supabase node to load/create session from whatsapp_sessions
    - Add Function node for AI provider routing
    - Add Switch node to route to appropriate AI provider
    - Add HTTP Request nodes for each AI provider (OpenAI, Grok, Groq, Claude, etc.)
    - Add Function node for keyword matching fallback
    - Add Function node to normalize all AI responses to standard format
    - _Requirements: 7.2, 8.2, 8.6_
  
  - [ ] 13.4 Implement property inquiry workflow (Real Estate)
    - Add Supabase node to query non-soft-deleted properties
    - Add Function node to filter by customer criteria (bedrooms, price range)
    - Add HTTP Request node to send property images via WhatsApp
    - Format descriptions and prices in Naira
    - _Requirements: 7.3, 7.4, 7.6_
  
  - [ ] 13.5 Implement service inquiry workflow (Event Planning)
    - Add Supabase node to query services
    - Add HTTP Request node to send service images via WhatsApp
    - Format descriptions and prices in Naira
    - _Requirements: 8.3, 8.5_
  
  - [ ] 13.6 Implement payment option workflow
    - Add Function node to present payment options
    - Format message: "Paystack (Instant)" and "Manual Payment (5 minutes - 14 hours)"
    - Handle customer payment selection
    - Create order record in Supabase
    - _Requirements: 7.5, 8.4_
  
  - [ ] 13.7 Implement greeting workflow
    - Add Function node to generate greeting with business name
    - Send: "Hello! I am Kasungo AI, welcome to [Business Name]"
    - _Requirements: 7.1, 8.1_
  
  - [ ] 13.8 Implement payment confirmation workflow
    - Add nodes to send instant confirmation for Paystack payments
    - Add nodes to send confirmation for manual payments
    - Update session context
    - _Requirements: 9.4, 10.4_
  
  - [ ] 13.9 Implement AI provider abstraction layer
    - Create Function node to define standard intent response format
    - Implement provider-specific HTTP Request nodes with proper formatting
    - Create response normalizer Function node
    - Test switching between providers via environment variable
    - Ensure fallback to keyword matching if AI provider fails
    - _Requirements: 7.2, 8.2_
  
  - [ ] 13.10 Implement session management in n8n
    - Update whatsapp_sessions table after each interaction
    - Store conversation context (last intent, items viewed, etc.)
    - Implement session timeout logic
    - _Requirements: 8.6_

- [ ] 14. Email Notification System
  - [ ] 14.1 Set up email service (Resend or SendGrid)
    - Configure API credentials
    - Create email templates
    - _Requirements: 1.4, 3.2, 19.2_
  
  - [ ] 14.2 Implement verification email
    - Send email with verification link and token
    - Include 24-hour expiration notice
    - _Requirements: 1.4, 18.1_
  
  - [ ] 14.3 Implement password reset email
    - Send email with reset link and token
    - Include expiration notice
    - _Requirements: 3.2_
  
  - [ ] 14.4 Implement invoice generation
    - Create invoice template with transaction details
    - Include business name, amount in Naira, payment status
    - _Requirements: 19.1_
  
  - [ ] 14.5 Implement invoice email delivery
    - Send invoice on Paystack payment completion
    - Send invoice on manual payment confirmation
    - _Requirements: 19.2, 19.3_
  
  - [ ] 14.6 Implement payment status notification emails
    - Send email on payment status changes
    - Include updated status and details
    - _Requirements: 19.4_

- [ ] 15. Customers Management
  - [ ] 15.1 Create customers list page
    - Display all customers who have interacted via WhatsApp
    - Show customer phone, name (if available), last interaction
    - _Requirements: 12.3_
  
  - [ ] 15.2 Implement customer details view
    - Show customer information
    - Display order history
    - Show WhatsApp conversation history
    - _Requirements: 15.4_

- [ ] 16. WhatsApp Bot Settings
  - [ ] 16.1 Create bot settings page
    - Display bot status (Active/Inactive)
    - Add toggle to enable/disable bot
    - Show connected phone number
    - _Requirements: 12.4_
  
  - [ ] 16.2 Implement bot configuration
    - Allow customization of greeting message
    - Configure business-specific responses
    - _Requirements: 7.1, 8.1_

- [ ] 17. PWA Implementation
  - [ ] 17.1 Configure service worker
    - Set up service worker for offline support
    - Cache essential assets and pages
    - _Requirements: 14.3_
  
  - [ ] 17.2 Implement offline data sync
    - Cache previously loaded data
    - Queue changes when offline
    - Sync changes when online
    - _Requirements: 14.3, 14.4_
  
  - [ ] 17.3 Add PWA install prompt
    - Show install prompt on mobile browsers
    - Handle install event
    - _Requirements: 14.1, 14.2_

- [ ] 18. Landing Page
  - [ ] 18.1 Create landing page design
    - Build hero section with CTA buttons
    - Add features showcase section
    - Create footer with links
    - Apply consistent brand colors
    - _Requirements: 1.1, 1.5_
  
  - [ ] 18.2 Implement responsive design
    - Ensure mobile-first design
    - Test on various screen sizes
    - _Requirements: 14.5_

- [ ] 19. Error Handling and Logging
  - [ ] 19.1 Implement frontend error handling
    - Display user-friendly error messages in toasts
    - Log errors to console in development
    - _Requirements: 20.1, 20.2_
  
  - [ ] 19.2 Implement backend error handling
    - Catch and log all errors
    - Return standardized error responses
    - Implement retry logic for external API calls
    - _Requirements: 17.3_
  
  - [ ] 19.3 Set up error monitoring
    - Integrate error tracking service (Sentry or similar)
    - Monitor critical errors
    - Set up alerts for payment failures
    - _Requirements: 15.2_

- [ ] 20. Performance Optimization
  - [ ] 20.1 Implement code splitting
    - Use Next.js dynamic imports
    - Lazy load dashboard modules
    - _Requirements: 17.1_
  
  - [ ] 20.2 Optimize database queries
    - Add indexes on frequently queried columns
    - Optimize SQL functions
    - _Requirements: 17.2_
  
  - [ ] 20.3 Implement caching
    - Cache frequently accessed data
    - Use Next.js caching strategies
    - _Requirements: 17.2_

- [ ] 21. Security Implementation
  - [ ] 21.1 Implement input validation and sanitization
    - Validate all user inputs
    - Sanitize inputs to prevent XSS
    - _Requirements: 16.4_
  
  - [ ] 21.2 Implement rate limiting
    - Add rate limiting to API endpoints
    - Protect against brute force attacks
    - _Requirements: 16.4_
  
  - [ ] 21.3 Secure sensitive data
    - Ensure passwords are hashed
    - Encrypt tokens at rest
    - Use HTTPS for all communications
    - _Requirements: 16.2, 16.3_

- [ ]* 22. Testing
  - [ ]* 22.1 Write unit tests for SQL functions
    - Test sync_auth_user_to_public()
    - Test verify_email() and reset_password()
    - Test soft_delete_property() and cleanup_old_media()
    - _Requirements: All_
  
  - [ ]* 22.2 Write integration tests for authentication
    - Test registration flow
    - Test login flow
    - Test email verification
    - Test password reset
    - _Requirements: 1, 2, 3, 18_
  
  - [ ]* 22.3 Write integration tests for payment flow
    - Test Paystack link generation
    - Test webhook handling
    - Test transfer initiation
    - Test manual payment confirmation
    - _Requirements: 9, 10_
  
  - [ ]* 22.4 Write E2E tests for critical user journeys
    - Test complete user journey: register → setup → add property → customer inquiry → payment
    - Test PWA installation
    - Test responsive design
    - _Requirements: All_

- [ ] 23. Deployment and Monitoring
  - [ ] 23.1 Set up deployment pipeline
    - Configure Vercel deployment
    - Set up environment variables
    - Deploy Supabase Edge Functions
    - _Requirements: 17.4_
  
  - [ ] 23.2 Run database migrations
    - Apply all SQL migrations to production
    - Verify RLS policies
    - _Requirements: 2.1, 2.4_
  
  - [ ] 23.3 Set up monitoring
    - Configure Vercel Analytics
    - Set up Supabase monitoring
    - Implement uptime monitoring
    - Monitor Paystack webhook delivery
    - _Requirements: 17.4_
