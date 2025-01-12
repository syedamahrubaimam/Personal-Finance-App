from flask import Flask, request, jsonify
import sqlite3
from database import create_connection
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from database import fetch_income_data, fetch_expense_data
import requests

app = Flask(__name__)

# Enable CORS for all routes
CORS(app, resources={r"/*": {"origins": "*"}})

# Utility function to check if category exists
def check_category_exists(category, table):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(f'SELECT id FROM {table} WHERE name = ?', (category,))
        category_exists = cursor.fetchone()
        conn.close()
        return category_exists is not None
    except sqlite3.Error as e:
        print(f"Error checking category existence: {e}")
        return False

# Utility function to get category ID
def get_category_id(category, table):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(f'SELECT id FROM {table} WHERE name = ?', (category,))
        category_id = cursor.fetchone()
        conn.close()
        return category_id[0] if category_id else None
    except sqlite3.Error as e:
        print(f"Error fetching category ID: {e}")
        return None

# Utility function to check if user exists
def check_user_exists(username, email):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT id FROM users WHERE username = ? OR email = ?', (username, email))
        user_exists = cursor.fetchone()
        conn.close()
        return user_exists is not None
    except sqlite3.Error as e:
        print(f"Error checking user existence: {e}")
        return False

# Verify user credentials
def verify_user_credentials(username, password):
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT password FROM users WHERE username = ?', (username,))
        stored_password = cursor.fetchone()
        conn.close()
        return stored_password and check_password_hash(stored_password[0], password)
    except sqlite3.Error as e:
        print(f"Error verifying user credentials: {e}")
        return False

# Home route to serve the default page
@app.route('/')
def home():
    return jsonify({'message': 'Welcome to the Personal Finance Tracker API!'}), 200

# Get Total Income API
@app.route('/api/income/total', methods=['GET'])
def get_total_income():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT SUM(i.amount) FROM income i')
        total_income = cursor.fetchone()[0] or 0
        conn.close()
        return jsonify(total_income=total_income)
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Get Total Expense API
@app.route('/api/expense/total', methods=['GET'])
def get_total_expense():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT SUM(e.amount) FROM expenses e')
        total_expense = cursor.fetchone()[0] or 0
        conn.close()
        return jsonify(total_expense=total_expense)
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Fetch Total Income and Expense API
@app.route('/api/incomeexpense/total', methods=['GET'])
def get_total_income_expense():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Get total income
        cursor.execute('SELECT SUM(i.amount) FROM income i')
        total_income = cursor.fetchone()[0] or 0

        # Get total income details by source
        cursor.execute(''' 
            SELECT c.name, SUM(i.amount) 
            FROM income i
            JOIN income_categories c ON i.category_id = c.id
            GROUP BY c.name
        ''')
        income_details = cursor.fetchall()

        # Get total expense
        cursor.execute('SELECT SUM(e.amount) FROM expenses e')
        total_expense = cursor.fetchone()[0] or 0

        # Get total expense details by category
        cursor.execute(''' 
            SELECT c.name, SUM(e.amount) 
            FROM expenses e
            JOIN expense_categories c ON e.category_id = c.id
            GROUP BY c.name
        ''')
        expense_details = cursor.fetchall()

        conn.close()

        return jsonify({
            "totalIncome": total_income,
            "incomeDetails": [{"source": item[0], "amount": item[1]} for item in income_details],
            "totalExpense": total_expense,
            "expenseDetails": [{"category": item[0], "amount": item[1]} for item in expense_details]
        })
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Fetch Monthly Income API
@app.route('/api/income/monthly', methods=['GET'])
def get_monthly_income():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT strftime("%Y-%m", date) AS month, SUM(amount) FROM income WHERE date IS NOT NULL GROUP BY month')
        monthly_income = cursor.fetchall()
        conn.close()
        return jsonify([{'month': inc[0], 'total_amount': inc[1]} for inc in monthly_income])
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Fetch Monthly Expenses API
@app.route('/api/expenses/monthly', methods=['GET'])
def get_monthly_expenses():
    try:
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT strftime("%Y-%m", date) AS month, SUM(amount) FROM expenses WHERE date IS NOT NULL GROUP BY month')
        monthly_expenses = cursor.fetchall()
        conn.close()
        return jsonify([{'month': exp[0], 'total_amount': exp[1]} for exp in monthly_expenses])
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Route for fetching income records
@app.route('/api/income', methods=['GET'])
def get_income():
    try:
        # Fetch your income data from the database here
        income_data = fetch_income_data()  # Replace with your actual function to fetch data
        return jsonify(income_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Route for fetching expense records
@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    try:
        # Fetch your expense data from the database here
        expense_data = fetch_expense_data()  # Replace with your actual function to fetch data
        return jsonify(expense_data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add Expense API
@app.route('/api/expenses', methods=['POST'])
def add_expense():
    try:
        data = request.get_json()
        category = data.get('category')
        amount = data.get('amount')
        description = data.get('description', '')

        if not category or not amount:
            return jsonify({'error': 'Category and amount are required'}), 400

        category_id = get_category_id(category, 'expense_categories')

        if not category_id:
            return jsonify({'error': f'Category "{category}" does not exist'}), 400

        current_date = datetime.now().strftime('%Y-%m-%d')

        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO expenses (category_id, amount, description, date) VALUES (?, ?, ?, ?)', 
                       (category_id, amount, description, current_date))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Expense added successfully'}), 201
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Add Income API
@app.route('/api/income', methods=['POST'])
def add_income():
    try:
        data = request.get_json()
        category = data.get('category')
        amount = data.get('amount')
        description = data.get('description', '')

        if not category or not amount:
            return jsonify({'error': 'Category and amount are required'}), 400

        category_id = get_category_id(category, 'income_categories')

        if not category_id:
            return jsonify({'error': f'Category "{category}" does not exist'}), 400

        current_date = datetime.now().strftime('%Y-%m-%d')

        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO income (category_id, amount, description, date) VALUES (?, ?, ?, ?)', 
                       (category_id, amount, description, current_date))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Income added successfully'}), 201
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"message": "No data received"}), 400

    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"message": "Missing username or password"}), 400

    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Fetch the stored hashed password for the user
        cursor.execute("SELECT password FROM users WHERE username = ?", (username,))
        stored_password = cursor.fetchone()

        if not stored_password:
            return jsonify({"message": "User not found"}), 404

        # Check the provided password against the hashed password
        if not check_password_hash(stored_password[0], password):
            return jsonify({"message": "Invalid username or password"}), 401

        conn.close()
        return jsonify({"message": "Login successful", "username": username}), 200

    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500

# Register API
@app.route('/api/register', methods=['POST'])
def register_user():
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        first_name = data.get('first_name', '')
        last_name = data.get('last_name', '')

        if not username or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        if check_user_exists(username, email):
            return jsonify({'error': 'Username or email already exists'}), 400

        hashed_password = generate_password_hash(password)
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute('INSERT INTO users (username, email, password, first_name, last_name) VALUES (?, ?, ?, ?, ?)', 
                       (username, email, hashed_password, first_name, last_name))
        conn.commit()
        conn.close()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Get Categories API (Income/Expense)
@app.route('/api/categories/<type>', methods=['GET'])
def get_categories(type):
    try:
        table = f'{type}_categories'
        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(f'SELECT name FROM {table}')
        categories = cursor.fetchall()
        conn.close()
        return jsonify([category[0] for category in categories])
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Add Category API (Income/Expense)
@app.route('/api/categories/<type>', methods=['POST'])
def add_category(type):
    try:
        table = f'{type}_categories'
        data = request.get_json()
        category_name = data.get('name')

        if not category_name:
            return jsonify({'error': 'Category name is required'}), 400

        if check_category_exists(category_name, table):
            return jsonify({'error': 'Category already exists'}), 400

        conn = create_connection()
        cursor = conn.cursor()
        cursor.execute(f'INSERT INTO {table} (name) VALUES (?)', (category_name,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Category added successfully'}), 201
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Get Expenses Summary API
@app.route('/api/expenses/summary', methods=['GET'])
def get_expenses_summary():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Get total expense
        cursor.execute('SELECT SUM(amount) FROM expenses')
        total_expense = cursor.fetchone()[0] or 0

        # Get expense details by category
        cursor.execute(''' 
            SELECT c.name, SUM(e.amount) 
            FROM expenses e
            JOIN expense_categories c ON e.category_id = c.id
            GROUP BY c.name
        ''')
        expense_details = cursor.fetchall()

        conn.close()

        return jsonify({
            "totalExpense": total_expense,
            "expenseDetails": [{"category": item[0], "amount": item[1]} for item in expense_details]
        })
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Income Summary API
@app.route('/api/income/summary', methods=['GET'])
def income_summary():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        cursor.execute('SELECT SUM(amount) FROM income')
        total_income = cursor.fetchone()[0] or 0

        cursor.execute(''' 
            SELECT c.name, SUM(i.amount) 
            FROM income i
            JOIN income_categories c ON i.category_id = c.id
            GROUP BY c.name
        ''')
        income_details = cursor.fetchall()

        conn.close()

        return jsonify({
            "totalIncome": total_income,
            "incomeDetails": [{"source": item[0], "amount": item[1]} for item in income_details]
        })
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
    
    # Route to get Total Income data for chart (by category)
@app.route('/api/income/chart', methods=['GET'])
def get_income_chart_data():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Get income details by category
        cursor.execute(''' 
            SELECT c.name, SUM(i.amount) 
            FROM income i
            JOIN income_categories c ON i.category_id = c.id
            GROUP BY c.name
        ''')
        income_details = cursor.fetchall()

        conn.close()

        # Prepare data for chart
        categories = [item[0] for item in income_details]
        amounts = [item[1] for item in income_details]

        return jsonify({
            "categories": categories,
            "amounts": amounts
        })
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500
        
# Sample user data (you'll typically retrieve this from a database)
users = {
    "user1": {
        "password": "hashedpassword123",  # Store hashed passwords, not plain text
    }
}

# Example user data (replace this with your actual data store, like a database)
users = {
    "syeda": {
        "username": "syeda",
        "password": "hashedpasswordimam"  # Hash your passwords, don't store plain text passwords
    }
}

# Route to get Total Expense data for chart (by category)
@app.route('/api/expense/chart', methods=['GET'])
def get_expense_chart_data():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Get expense details by category
        cursor.execute(''' 
            SELECT c.name, SUM(e.amount) 
            FROM expenses e
            JOIN expense_categories c ON e.category_id = c.id
            GROUP BY c.name
        ''')
        expense_details = cursor.fetchall()

        conn.close()

        # Prepare data for chart
        categories = [item[0] for item in expense_details]
        amounts = [item[1] for item in expense_details]

        return jsonify({
            "categories": categories,
            "amounts": amounts
        })
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500

# Route to get Income vs Expense chart data (by month)
@app.route('/api/incomeexpense/chart', methods=['GET'])
def get_income_expense_chart_data():
    try:
        conn = create_connection()
        cursor = conn.cursor()

        # Get monthly income and expense
        cursor.execute(''' 
            SELECT strftime("%Y-%m", date) AS month, SUM(i.amount) 
            FROM income i
            GROUP BY month
        ''')
        monthly_income = cursor.fetchall()

        cursor.execute(''' 
            SELECT strftime("%Y-%m", date) AS month, SUM(e.amount) 
            FROM expenses e
            GROUP BY month
        ''')
        monthly_expenses = cursor.fetchall()

        conn.close()

        # Prepare data for chart
        months = [item[0] for item in monthly_income]
        income_amounts = [item[1] for item in monthly_income]
        expense_amounts = [item[1] for item in monthly_expenses]

        return jsonify({
            "months": months,
            "income": income_amounts,
            "expenses": expense_amounts
        })
    except sqlite3.Error as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
