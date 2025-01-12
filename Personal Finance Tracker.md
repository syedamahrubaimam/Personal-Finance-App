Personal Finance Tracker
A web application designed to help users manage their personal finances by tracking income and expenses. The app allows users to log their income and expenses, view financial reports, and analyze their spending habits with charts and graphs. It also provides an AI-powered chatbot to assist with financial insights.

Features
User Authentication: Users can log in and register for personalized experience.
Income and Expense Logging: Track income and expenses, with categorization.
Total Income and Expense Overview: View an overview of total income and expenses.
Chart Visualization: Interactive graphs and pie charts to visualize income vs. expenses, income by category, and expense breakdown.
Date Range Selector: View financial data for a specific date range.
AI-Powered Chatbot: A chatbot to help answer questions and provide insights into your finances.
Technologies Used
Frontend:

React.js (for building the UI)
Tailwind CSS (for styling)
Chart.js (for charts)
BotPress (for chatbot integration)
Backend:

Python (Flask) for API endpoints
SQLite for database storage
Other Tools:

Git (version control)
GitHub (repository hosting)
Node.js (for running frontend tools)
NPM (for managing packages)
Installation
Prerequisites
Node.js
npm (or yarn)
Python 3.x
SQLite
Git
Steps to Run the Project Locally
1. Clone the repository:
bash
Copy code
git clone https://github.com/syedamahrubaimam/Personal-Finance-App.git
2. Set up the Frontend (Client App)
Navigate to the client-app folder:

bash
Copy code
cd client-app
Install the required dependencies:

bash
Copy code
npm install
To run the frontend app:

bash
Copy code
npm start
This will start the React development server and you can view the app in your browser at http://localhost:3000.

3. Set up the Backend (Server)
Navigate to the Server folder:

bash
Copy code
cd Server
Install the required Python dependencies:

bash
Copy code
pip install -r requirements.txt
To run the backend server:

bash
Copy code
python app.py
The backend server will start on http://localhost:5000, which is where the frontend communicates with the backend API.

4. Database Configuration
The app uses an SQLite database to store user data, including income, expenses, and categories. The database files are located in the Server folder. You can customize the database if needed.

5. Chatbot Integration
The app uses BotPress for the chatbot functionality. Make sure you have BotPress set up and configured for the chatbot to work.

Usage
Sign up / Log in: Create an account or log in to access the personal finance tracking features.
Add Income and Expenses: Log your income and expenses by selecting the appropriate category and entering the amount.
View Total Income and Expense: View the total income and expenses, and see a breakdown of where the money is coming from and going.
Generate Reports: View interactive charts that display your financial data over time.
Ask the Chatbot: Use the integrated chatbot to ask questions about your finances.
Screenshots
Include screenshots here to showcase the UI and features of the app.

Contribution
Fork the repository.
Create a new branch (git checkout -b feature-branch).
Make your changes.
Commit your changes (git commit -m "Added new feature").
Push to the branch (git push origin feature-branch).
Create a new Pull Request.
License
This project is licensed under the MIT License - see the LICENSE file for details.
