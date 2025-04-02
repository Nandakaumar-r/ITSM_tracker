ITSM Tracker

Overview

ITSM Tracker is a help desk and IT service management (ITSM) system designed to streamline ticket management, approvals, asset tracking, and change management within an organization. This tool provides a structured workflow for handling IT requests and incidents efficiently.

Features

Ticket Management: Submit, track, and resolve IT tickets.

Approval Workflow: Admins can review and approve requests.

Category-based Requests: Dynamic dropdowns for categories, subcategories, and issues.

Change Management: Track changes and approvals with audit logs.

Asset Integration: Fetch asset details from Snipe-IT.

Email Notifications: Notify users and approvers via email.

Dashboard with Charts: Visualize ticket statuses using graphs.

AI Chatbot Integration: Assist users with queries and support requests.

Installation

Prerequisites

Ensure the following dependencies are installed:

Node.js (>=14.x)

MongoDB (or another NoSQL database)

Docker (Optional, for containerized deployment)

Yarn (for package management)

Steps

Clone the repository

git clone https://github.com/your-repo/itsm-tracker.git
cd itsm-tracker

Install dependencies

yarn install

Configure environment variables

Copy .env.example to .env

Update database and SMTP credentials in .env

Start MongoDB (if not running)

mongod --dbpath /path/to/data

Run migrations (if applicable)

node scripts/migrate.js

Start the application

yarn start

Access the system
Open http://localhost:3000 in your browser.

Configuration

SMTP settings can be configured in .env.

AI Chatbot settings are available in config/chatbot.js.

Admin users can be created in the users collection in MongoDB.

Usage

Submit a Ticket: Users can create tickets based on categories.

Approval Workflow: Admins review and approve pending requests.

Monitor Dashboard: View ticket status breakdown via charts.

Manage Assets: Fetch and link assets with tickets.

Contributing

Fork the repository.

Create a new branch.

Commit changes and push.

Create a pull request.

License

MIT License. See LICENSE for details.
