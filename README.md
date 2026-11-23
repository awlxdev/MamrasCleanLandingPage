# Mamras Clean

A modern cleaning service platform built with React, Vite, Laravel, and MySQL/MariaDB.

Mamras Clean provides an online platform where customers can explore cleaning services, view galleries and advertisements, submit contact messages, create accounts, and manage their service orders.

## Features

### Public Website
- Responsive landing page
- Cleaning service catalog
- Service gallery
- Advertisement section
- Contact form
- Customer registration and login

### Customer
- Customer dashboard
- Profile management
- Create service orders
- View order history

### Admin Dashboard
- Dashboard overview
- User management
- Service management
- Order management
- Gallery management
- Advertisement management
- Contact message management
- Website content and settings management

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS

### Backend
- PHP
- Laravel
- Laravel Sanctum
- REST API
- MySQL / MariaDB

## Project Structure

```text
MamrasCleanLandingPage/
├── backend/                  # Laravel REST API
│   ├── app/
│   ├── database/
│   ├── routes/
│   ├── storage/
│   └── tests/
├── public/                   # Frontend public assets
├── src/                      # React application
│   ├── components/
│   ├── pages/
│   └── utils/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
└── LICENSE
```

## Requirements

- Node.js and npm
- PHP
- Composer
- MySQL or MariaDB
- Git

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/awlxdev/MamrasCleanLandingPage.git
cd MamrasCleanLandingPage
```

### 2. Install Frontend Dependencies

```bash
npm install
```

### 3. Configure Backend

```bash
cd backend
composer install
```

Copy the environment example:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env
```

**Linux / macOS:**

```bash
cp .env.example .env
```

Configure your database and other environment variables in `backend/.env`.

Generate the application key:

```bash
php artisan key:generate
```

Run database migrations and seeders:

```bash
php artisan migrate --seed
```

Create the public storage link:

```bash
php artisan storage:link
```

Start the Laravel development server:

```bash
php artisan serve
```

Backend URL:

```text
http://127.0.0.1:8000
```

### 4. Start Frontend

Open another terminal in the project root:

```bash
npm run dev
```

Vite will display the local development URL in the terminal.

## Environment Configuration

Never upload real environment files, credentials, API keys, or database passwords to GitHub.

Use `.env.example` as a template and configure your own local environment.

## Repository

[GitHub - Mamras Clean](https://github.com/awlxdev/MamrasCleanLandingPage)

## Developer

**AWLXDEV**

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

Third-party dependencies and external assets may be subject to their own licenses and usage terms.
