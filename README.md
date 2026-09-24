# SmartBon 

SmartBon is a modern mobile application designed to automate and simplify personal finance management. Its core innovation is AI-driven receipt scanning, which eliminates the tedious manual entry of transactions by extracting key data (total, date, and items) directly from photos.

Developed as a diploma project, this application features a robust backend architecture and a responsive cross-platform frontend, offering both Free and Premium tiers.

## Key Features

### Core Functionality (Free Plan)

* **AI Receipt Scanning:** Snap a photo of a receipt, and the AI automatically extracts the transaction details (limited to 5 scans/month).

* **Expense Tracking:** Easily add, edit, and categorize your daily expenses.

* **Budgeting:** Set global monthly limits to keep your spending in check.

* **Savings Goals:** Track progress towards your financial targets (up to 2 active goals).

* **Basic Analytics:** Visualize your spending habits with intuitive charts.

* **Multi-language Support:** Available in multiple languages for better accessibility.

### Advanced Tools (Premium Plan)

* **Unlimited AI Scanning:** Digitize all your receipts without restrictions.

* **Recurring Expenses:** Fully automate your subscriptions (e.g., Netflix, Rent).

* **Advanced Budgeting:** Set specific budgets for individual categories (e.g., "Groceries" or "Restaurants").

* **Deep Analytics:** Access detailed pie charts, line graphs, and bar charts to spot spending trends.

* **CSV Data Export/Import:** Easily back up your data or move it to a spreadsheet.

* **Automated Email Reports:** Receive detailed financial summaries in your inbox every month.

## Tech Stack

### Mobile Frontend

* **Framework:** React Native with Expo

* **Language:** TypeScript

* **Routing:** Expo Router (file-based navigation)

* **State Management:** Zustand

* **UI/Charts:** `react-native-chart-kit`, `react-native-svg`

### Backend API

* **Framework:** ASP.NET Core (C#)

* **Architecture:** N-Tier (Clean Architecture)

* **Database:** Microsoft SQL Server with Entity Framework Core

* **AI Integration:** OpenAI SDK (GPT-4o Vision model)

* **Validation & Mapping:** FluentValidation, AutoMapper

* **Background Jobs:** Hosted Services for recurring expenses and automated emails.

## Architecture Overview

* **Client-Server Model:** The mobile app communicates securely with the backend via RESTful APIs using JWT authentication.

* **AI Pipeline:** Images are sent from the mobile device to the backend, where a strictly prompted OpenAI Vision model processes the Cyrillic text and returns structured JSON data.

* **Database:** A highly relational schema tracking Users, Expenses, Categories, Budgets, Goals, and Recurring tasks.

## Author

**Martin Atanasov Kostadinov**
*Diploma Project - High School of Mathematics "Academician Kiril Popov", Plovdiv*
