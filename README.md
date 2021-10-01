# Getting Started with the Every.io Engineering Challenge

Thanks for taking the time to complete the Every.io code challenge. Don't worry, it's not too hard, and please do not spend more than 3-4 hours. We know you have lots of these to do, and it can be very time consuming.

## What We're Evaluating

We're looking for senior engineers who can write production-ready code. While we want you to demonstrate your skills, please be mindful of the time constraint (3-4 hours). Here's what we'll be assessing:

### Key Areas
- **Code Quality & Readability**: Clean, maintainable code that's easy for other engineers to understand
- **Architecture & Design**: Well-organized structure with appropriate separation of concerns
- **Technical Implementation**: Solid error handling, validation, and consideration of edge cases
- **Security**: Proper authentication, authorization, and protection against common vulnerabilities
- **Testing**: Automated tests that cover critical functionality
- **Documentation**: Clear setup instructions and explanation of your approach

### What "Good" Looks Like
We value pragmatic engineering decisions over perfect solutions. Consider:
- Tradeoffs between simplicity and sophistication given the time constraint
- Production-readiness aspects (even if simplified for this challenge)
- Self-awareness about limitations and what you'd improve with more time

**Feel free to go beyond the requirements in ways that showcase your expertise!** We appreciate thoughtful extras that demonstrate senior-level thinking.

## Requirements

You will be creating an API for a task application.

1. This application will have tasks with four different states:
   - To do
   - In Progress
   - Done
   - Archived
2. Each task should contain: Title, Description, and what the current status is.
3. A task can be archived and moved between columns, or statuses.
4. Tasks belong to specific users, and your API should enforce that users can only view and modify their own tasks.

### Note on Authentication vs Authorization
To keep this challenge time-boxed, **you do not need to implement full authentication** (signup/login/password management/JWT tokens).

Instead, your API should accept a user identifier (e.g., via header, query parameter, or path parameter) and implement proper **authorization** - ensuring that users can only access and modify their own tasks. Feel free to use mock users or a simple user lookup approach.

We want to see that you understand authorization principles and data modeling, without spending time on authentication boilerplate.

## Ideal

- Typescript
- Tests
- Dockerized Application

## Extra credit

- Logging

## Technical Guidance

You have flexibility in your implementation choices:

- **Framework**: Use any Node.js framework you're comfortable with (Express, Fastify, NestJS, etc.)
- **Database**: Choose any database that fits your approach (PostgreSQL, SQLite, in-memory, etc.)
- **ORM/Query Builder**: Use your preferred data access layer (Prisma, TypeORM, Sequelize, ...we love Prisma)
- **API Design**: RESTful API with JSON responses expected

## Expected Deliverables

Please ensure your submission includes:

1. **Working API** with all core functionality
2. **Clear setup instructions** in your README (how to install dependencies, set up database, run the application)
3. **Automated tests** covering critical functionality
4. **Docker setup** (Dockerfile at minimum, docker-compose optional)

## Submission Instructions

Please submit your completed challenge via GitHub:

1. **Public Repository**: Push your solution to a public GitHub repository and share the link with us

2. **Private Repository**: If you prefer to keep your solution private, create a private GitHub repository and add the following collaborators:
   - @barrypeterson
   - @jmatusevich
   - @falecci
   - @danfsd

Please include clear setup and running instructions in your README.
