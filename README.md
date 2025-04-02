# ITSM Tracker

## Overview
ITSM Tracker is a help desk and IT service management (ITSM) system designed to streamline ticket management, approvals, asset tracking, and change management within an organization. This tool provides a structured workflow for handling IT requests and incidents efficiently.

## Features
- **Ticket Management**: Submit, track, and resolve IT tickets.
- **Approval Workflow**: Admins can review and approve requests.
- **Category-based Requests**: Dynamic dropdowns for categories, subcategories, and issues.
- **Change Management**: Track changes and approvals with audit logs.
- **Asset Integration**: Fetch asset details from Snipe-IT.
- **Email Notifications**: Notify users and approvers via email.
- **Dashboard with Charts**: Visualize ticket statuses using graphs.
- **AI Chatbot Integration**: Assist users with queries and support requests.

## Installation
### Prerequisites
Ensure the following dependencies are installed:
- Node.js (>=14.x)
- MongoDB (or another NoSQL database)
- Docker (Optional, for containerized deployment)
- Yarn (for package management)

### Steps
1. **Clone the repository**
   ```sh
   git clone https://github.com/your-repo/itsm-tracker.git
   cd itsm-tracker
   ```
2. **Install dependencies**
   ```sh
   yarn install
   ```
3. **Configure environment variables**
   - Copy `.env.example` to `.env`
   - Update database and SMTP credentials in `.env`
4. **Start MongoDB (if not running)**
   ```sh
   mongod --dbpath /path/to/data
   ```
5. **Run migrations (if applicable)**
   ```sh
   node scripts/migrate.js
   ```
6. **Start the application**
   ```sh
   yarn start
   ```
7. **Access the system**
   Open `http://localhost:3000` in your browser.

## Configuration
- SMTP settings can be configured in `.env`.
- AI Chatbot settings are available in `config/chatbot.js`.
- Admin users can be created in the `users` collection in MongoDB.

## Usage
1. **Submit a Ticket**: Users can create tickets based on categories.
2. **Approval Workflow**: Admins review and approve pending requests.
3. **Monitor Dashboard**: View ticket status breakdown via charts.
4. **Manage Assets**: Fetch and link assets with tickets.

## Contributing
1. Fork the repository.
2. Create a new branch.
3. Commit changes and push.
4. Create a pull request.

## License
MIT License. See `LICENSE` for details.

## Contact
For support, reach out to `itsm-support@yourdomain.com`. Happy tracking!

