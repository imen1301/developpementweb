# notebook
# 📓 Noteflow

A full-stack web application for creating and managing personal notes and blog posts.

Built with Laravel (backend) and React + Vite (frontend) as a university project.

 ✨ Features

 User authentication (Register / Login)
 Create, edit, and delete notes/posts
 Browse all posts
 REST API between frontend and backend

 Tech Stack

| Layer      | Technology   |
|-------     |-----------   |
| Frontend   | React, Vite  |
| Backend    | PHP, Laravel |
| Templating | Blade        |
| API.       | REST.        |

Getting Started

Prerequisites

- PHP >= 8.1
- Composer
- Node.js >= 18
- npm

 1. Clone the repository

bash
git clone https://github.com/imen1301/developpementweb.git
cd developpementweb

2. Backend setup

bash
cd back/blogs/noteflow-backend

Install PHP dependencies
composer install

 Copy environment file
cp .env.example .env

Generate app key
php artisan key:generate

 Run migrations
php artisan migrate

Start the server
php artisan serve


 Backend runs on: `http://localhost:8000`


 3. Frontend setup

bash
cd front/blogs

Install dependencies
npm install

 Start dev server
npm run dev


Frontend runs on: `http://localhost:5173`



Run both (from root)

bash
 Start frontend
npm run front

Start backend (in another terminal)
npm run back


Project Structure
developpementweb/
├── back/
│   └── blogs/
│       └── noteflow-backend/
├── front/
│   └── blogs/     
├── package.json
└── README.md
 Author

imen1301— University project
