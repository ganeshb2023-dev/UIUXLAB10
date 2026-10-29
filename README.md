# Plain Shop — Budget Aware Shopping App (Full Stack)

This project contains the complete full-stack implementation of the **Plain Shop** budget-aware shopping mobile web app based on the Figma design ("Lab 8").

## Features Included
- **User Authentication**: Secure Sign Up & Login with JWT and password hashing.
- **Budget Planner & Calculator**: Set spending limits ($25, $50, $75, $100), view remaining budget calculations in real-time.
- **Storefront & Catalog**: Browse curated items ("Canvas Tote", "Desk Tray", "Everyday Mug", "Pocket Notebook", "Wood Ruler") with search and category filtering.
- **Product Detail**: View high-resolution imagery, descriptions, ratings, and instant budget impact.
- **Saved Items ("For another day")**: Save favorite items without impacting your active budget plan.
- **Shopping Cart & Checkout**: Manage cart items, view real-time budget remaining after shipping and subtotal, and proceed to checkout.

## Running Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your system.

### Step 1: Start the Backend Server
Open your terminal in the `server` folder:
```bash
cd server
npm install
npm start
```
*(Runs on http://localhost:5000)*

### Step 2: Start the Client Application
Open another terminal in the `client` folder:
```bash
cd client
npm install
npm start
```
*(Runs on http://localhost:3000)*
