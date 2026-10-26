# CloudShare Web App

CloudShare is a full-stack file-sharing web application that lets users
upload and manage files, control file visibility, share files publicly,
and use a credit-based plan for uploads. The application combines a
React frontend with a Spring Boot REST API and MongoDB.

> **Project status:** Update this README as features and deployment
> configuration evolve. Values such as API routes, payment settings, and
> environment-variable names should match the current source code before
> publishing.

## Features

-   **Authentication:** User sign-in and session management using Clerk.
-   **File uploads:** Upload files through the web interface, with
    application-level limits for file count, file size, and available
    credits.
-   **File management:** View and manage uploaded files from the
    dashboard.
-   **Public sharing:** Toggle file visibility and access a public
    file-view page using a shareable file URL.
-   **Credit-based usage:** Display user credits and restrict uploads
    when the available balance is insufficient.
-   **Subscription and payments:** Premium plan checkout using Razorpay,
    with backend payment-order creation and payment verification.
-   **REST API:** Spring Boot backend for application logic and data
    access.
-   **Database persistence:** MongoDB for application data.

## Technology Stack

  Layer                  Technologies
  ---------------------- -------------------------------------------
  Frontend               React, Vite, JavaScript, HTML, CSS
  Authentication         Clerk
  Backend                Java 24, Spring Boot, Spring Security
  Database               MongoDB, Spring Data MongoDB
  Payments               Razorpay
  API security           Clerk JWT verification / Bearer tokens
  Build tools            npm, Maven
  Additional libraries   Axios and Lombok where used in the source

## Architecture

``` text
User / Browser
     |
     v
React + Vite frontend
     |  Clerk authentication token
     |  REST requests
     v
Spring Boot REST API
     |---------------------> Clerk JWKS / token validation
     |---------------------> Razorpay payment APIs
     |
     v
MongoDB
```

The frontend is responsible for the user interface and authenticated API
requests. The backend validates requests, applies application rules,
coordinates payment verification, and reads or writes application data
in MongoDB.

## Repository Structure

The repository layout may vary depending on how the frontend and backend
repositories are organized. A typical layout is:

``` text
CloudShare/
├── src/                         # React frontend source (if frontend is at repository root)
├── public/                      # Static frontend assets
├── package.json                 # Frontend scripts and dependencies
├── vite.config.js
├── .env.example                 # Safe template for frontend configuration
└── Backend/
    └── cloudshareapi/
        ├── pom.xml              # Maven dependencies and build configuration
        └── src/
            └── main/
                ├── java/        # Spring Boot controllers, services, models, repositories
                └── resources/  # Application configuration
```

If your frontend is stored in a separate directory, adjust the paths
above to match your repository.

## Prerequisites

Install the following before running the application:

-   Java Development Kit (JDK) 24, or the version configured by the
    backend project.
-   Node.js and npm.
-   MongoDB Community Server or a reachable MongoDB instance.
-   A Clerk application with a frontend publishable key.
-   Razorpay test credentials for testing checkout and payment
    verification.

## Getting Started

### 1. Clone the repository

``` bash
git clone <YOUR_GIT_REPOSITORY_URL>
cd CloudShare
```

Replace `<YOUR_GIT_REPOSITORY_URL>` with your repository URL.

### 2. Configure MongoDB

Start MongoDB locally and ensure it is reachable at
`mongodb://localhost:27017`.

The backend has been configured to use the `CloudShare` database in
local development. Confirm the MongoDB URI in the backend configuration
before running the application.

### 3. Configure the backend

Open a terminal in the backend project directory:

``` bash
cd Backend/cloudshareapi
```

Create or update the backend configuration (for example,
`src/main/resources/application.properties`) with the settings required
by your current source code.

Example local-development settings:

``` properties
server.port=8080
server.servlet.context-path=/api/v1.0

spring.data.mongodb.uri=${MONGODB_URI:mongodb://localhost:27017/CloudShare}
spring.data.mongodb.auto-index-creation=true

# Configure these using your Clerk application settings.
clerk.jwks-url=${CLERK_JWKS_URL}

# Add Razorpay configuration using environment variables or a secret manager.
# Do not commit API secrets.
```

The exact property names for Clerk and Razorpay must match those read by
your application. If the project already defines these settings, keep
the existing names and values rather than duplicating them.

Build and run the backend:

``` bash
mvn clean package
mvn spring-boot:run
```

Alternatively, open the backend folder in IntelliJ IDEA and run the
Spring Boot application.

With the default local configuration, the API base URL is:

``` text
http://localhost:8080/api/v1.0
```

### 4. Configure the frontend

Open a separate terminal in the frontend directory (the directory
containing `package.json`):

``` bash
npm install
```

Create a `.env` file in the frontend root:

``` dotenv
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_API_BASE_URL=http://localhost:8080/api/v1.0
```

Use `VITE_API_BASE_URL` only if the frontend code reads that variable.
Otherwise, set the API base URL using the configuration already present
in the project.

Start the Vite development server:

``` bash
npm run dev
```

Vite commonly serves the development frontend at
`http://localhost:5173`. Open the URL printed in your terminal.

### 5. Configure Clerk

1.  Create or open your application in the Clerk dashboard.
2.  Add the frontend publishable key to the frontend environment file.
3.  Configure the backend JWT verification settings to match your Clerk
    application, including the JWKS URL or issuer settings used by the
    code.
4.  Configure the local frontend origin in the backend CORS settings.
5.  Restart the frontend and backend after changing environment
    variables.

Never expose secret keys in frontend variables. Variables prefixed with
`VITE_` are bundled into client-side code and must not contain secrets.

### 6. Configure Razorpay

For local testing, use Razorpay test-mode credentials and the backend
configuration expected by the payment service. Keep the key secret on
the backend, never in React code or a committed file. Test order
creation and payment verification before enabling live payments.

## Running the Application

Run the MongoDB service first, then the backend and frontend in separate
terminals.

  Component               Local address
  ----------------------- ----------------------------------
  React + Vite frontend   `http://localhost:5173`
  Spring Boot API base    `http://localhost:8080/api/v1.0`
  MongoDB                 `mongodb://localhost:27017`

These are local-development defaults; your configuration may differ.

## Application Workflow

1.  A user signs in through Clerk.
2.  The frontend obtains an authentication token and sends it with
    protected API requests.
3.  The backend validates authentication and processes the request.
4.  File and account-related data is persisted in MongoDB.
5.  The dashboard displays files and credit information returned by the
    API.
6.  When a user purchases a plan, the backend creates a Razorpay order
    and verifies the payment response before applying the corresponding
    application-side update.

## API Overview

The backend API is mounted under `/api/v1.0` in the current local
configuration. The application includes API areas for file operations,
credit information, and payment processing.

Payment routes used in the project include:

-   `POST /api/v1.0/payments/create-order`
-   `POST /api/v1.0/payments/verify-payment`

The frontend also uses file, credit, and public-file endpoints. Check
the controller classes for the complete and current endpoint list, HTTP
methods, request bodies, and authorization requirements. Do not assume
every endpoint is public; protected routes require valid authentication.

## Security Notes

-   Do not commit `.env`, API secrets, signing keys, database
    credentials, or private certificates.
-   Keep Razorpay secret credentials on the backend.
-   Validate payment signatures on the server before granting credits or
    subscription benefits.
-   Apply authorization checks so users can access only their own
    private files and account data.
-   Validate file type, size, and upload permissions on the backend, not
    only in the frontend.
-   Configure CORS with trusted frontend origins.
-   Use HTTPS and production-grade secret management when deploying.
-   Use a secure public-sharing mechanism and avoid exposing private
    storage paths or internal identifiers unnecessarily.

## Troubleshooting

**Frontend cannot reach the backend** - Confirm that Spring Boot is
running on the expected port. - Check the API base URL and the
`/api/v1.0` context path. - Confirm that the frontend origin is allowed
by backend CORS configuration.

**Protected API requests return `401` or `403`** - Confirm that the
frontend sends a valid Clerk Bearer token. - Check that the backend
issuer/JWKS configuration matches the Clerk application. - Verify the
endpoint's authorization rules and token expiration.

**MongoDB connection fails** - Confirm that MongoDB is running and
reachable. - Check `spring.data.mongodb.uri` and the database name. -
Check the backend logs for connection or repository errors.

**Payment checkout fails** - Confirm that the backend payment-order
endpoint is reachable. - Check Razorpay test credentials and server-side
signature verification. - Inspect the browser network panel and backend
logs for the response details. Do not share secret keys or full
sensitive payment payloads.

**File upload is rejected** - Check the configured file-count,
file-size, and credit limits. - Confirm that the backend upload limit is
compatible with the frontend limit. - Inspect the API response and
server logs for validation errors.

## Future Enhancements

Potential improvements include:

-   Add automated tests for authentication, file operations, and payment
    flows.
-   Add upload progress indicators and clearer error messages.
-   Add file search, filtering, sorting, and pagination.
-   Add production deployment configuration and centralized logging.
-   Add rate limiting, malware scanning, and stronger file validation.
-   Document all API endpoints with OpenAPI/Swagger.

## Contributing

1.  Fork the repository or create a feature branch.
2.  Make your changes and add tests where appropriate.
3.  Verify the frontend and backend build successfully.
4.  Open a pull request describing the change.

## License

No license has been specified yet. Add a `LICENSE` file and update this
section before distributing the project publicly.
