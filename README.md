# AeroResume

AeroResume is a full-stack resume builder and resume export application. It combines a Next.js frontend with a Spring Boot backend to let users sign up, log in, manage resumes, select templates, and compile polished PDF exports from LaTeX content.

## Features

- User authentication and authorization using Spring Security and JWT
- Resume creation and storage with MySQL persistence
- Template catalog support for different resume styles
- LaTeX-based resume compilation to PDF
- Final export handling for downloadable resume files
- Responsive web app built with Next.js and React

## Tech Stack

Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

Backend
- Java 21
- Spring Boot 4
- Spring Security
- JPA / Hibernate
- MySQL
- JWT authentication

## Project Structure

```text
AeroResume/
├── backend/
│   ├── src/main/java/com/aeroresume/backend
│   ├── src/main/resources
│   ├── pom.xml
│   └── mvnw
├── frontend/
│   ├── app/
│   ├── lib/
│   ├── public/
│   ├── package.json
│   └── next.config.ts
├── .gitignore
├── README.md
└── .github/
```

## Prerequisites

Before running the app locally, make sure you have:

- Java 21+
- Maven or the provided Maven wrapper
- Node.js 20+
- npm
- MySQL running locally

## Database Setup

Create a MySQL database named `aerodb` (or update the configuration to match your setup).

The backend datasource is configured in:

- `backend/src/main/resources/application.properties`

Update the database URL, username, and password as needed for your environment.

## Running the Backend

From the repo root:

```bash
cd backend
./mvnw spring-boot:run
```

The backend will start on the default Spring Boot port unless overridden in the application configuration.

## Running the Frontend

From the repo root:

```bash
cd frontend
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Key API Endpoints

### Authentication
- `POST /api/auth/signup`
- `POST /api/auth/login`

### Resume management
- `POST /api/resume/compile`

### Templates
- `GET /api/template/`

## Security Notes

- JWT-based authentication is used for API access.
- Passwords are handled via Spring Security and BCrypt-style password encoding in the backend flow.
- Keep credentials and environment-specific values out of source control.

## License

This project is currently distributed without a formal license declaration in the repository metadata.

## Contributing

Contributions are welcome. Please create a branch for your work and open a pull request with a clear summary of the changes.
