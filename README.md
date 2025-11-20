# OpenChessClub

**OpenChessClub** is an open-source chess club management platform built with Node.js, Express, MongoDB, and Handlebars. It helps local and online chess clubs manage players, track games, and organize events.

---

## Deploy OpenChessClub Instantly

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

## Features

- Manage players with profiles and stats  
- Record and track games, results, and ELO changes  
- View leaderboards and recent activity  
- Search and filter players dynamically  
- Simple admin interface for managing users and clubs  

---

## Tech Stack

- **Backend:** Node.js, Express  
- **Database:** MongoDB with Mongoose  
- **Frontend:** Handlebars, Tailwind CSS, Vanilla JavaScript  
- **Session Management:** express-session  

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/openchessclub/openchessclub.git
cd openchessclub
```

---

### 2. Install the dependencies

```bash
npm i
```

### 3. Set your environment variables

At the root of this project, you'll find `.env.example`. Rename it to `.env`, and set your variables accordingly.

## MongoDB setup

If you don’t already have a MongoDB connection string, you can create a free cluster with MongoDB Atlas.

1. Go to https://www.mongodb.com/cloud/atlas 
2. Create a free account and a new project
3. Deploy a Free Tier Cluster (M0) 
4. Under Database Access, add a new user and password
5. Under Network Access, allow your IP (or 0.0.0.0/0 for development)
6. Click Connect -> Drivers -> Node.js and copy your connection string (ex. mongodb+srv://<username>:<password>@cluster0.mongodb.net/openchessclub)

## Generating a secure session secret 

OpenSSL is pre-installed on most systems, so to get a `SESSION_SECRET` variable, simply run `openssl rand -base64 32`
