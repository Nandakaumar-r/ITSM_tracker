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

- PHP (>=7.4)
- MySQL or MariaDB
- Apache or Nginx
- Docker (Optional, for containerized deployment)
- Node.js & Yarn (for frontend features)

### Steps

1. **Clone the repository**
   ```sh
   git clone https://github.com/your-repo/itsm-tracker.git
   cd itsm-tracker
   ```
2. **Configure database**
   - Import `database/schema.sql` into your MySQL database.
   - Update database credentials in `config/database.php`.
3. **Install dependencies**
   ```sh
   composer install  # For PHP dependencies
   yarn install      # For frontend dependencies
   ```
4. **Run migrations**
   ```sh
   php artisan migrate
   ```
5. **Start the application**
   ```sh
   php -S localhost:8000 -t public
   ```
6. **Access the system**
   Open `http://localhost:8000` in your browser.

## Configuration

- SMTP settings can be configured in `config/mail.php`.
- AI Chatbot settings are available in `config/chatbot.php`.
- Admin users can be created in the `users` table.

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


