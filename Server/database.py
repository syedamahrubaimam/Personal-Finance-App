import sqlite3
import os

# Function to create a connection to the database
def create_connection():
    """Create a connection to the SQLite database."""
    try:
        conn = sqlite3.connect('finance_tracker.db' , uri=True)
        print("Database connection established.")
        return conn
    except sqlite3.Error as e:
        print(f"Error creating connection to database: {e}")
        return None

# Function to create tables
def create_tables():
    """Create tables for expenses, income, and categories."""
    conn = create_connection()
    if conn is None:
        print("Failed to create connection. Aborting table creation.")
        return

    try:
        cursor = conn.cursor()

        # Create table for expense categories
        cursor.execute(''' 
            CREATE TABLE IF NOT EXISTS expense_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')

        # Create table for income categories
        cursor.execute(''' 
            CREATE TABLE IF NOT EXISTS income_categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL UNIQUE
            )
        ''')

        # Create table for expenses
        cursor.execute(''' 
            CREATE TABLE IF NOT EXISTS expenses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                category_id INTEGER NOT NULL,
                description TEXT,
                date TEXT NOT NULL,
                FOREIGN KEY (category_id) REFERENCES expense_categories(id)
            )
        ''')

        # Create table for income
        cursor.execute(''' 
            CREATE TABLE IF NOT EXISTS income (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                amount REAL NOT NULL,
                source TEXT NOT NULL,
                date TEXT NOT NULL,
                category_id INTEGER,
                FOREIGN KEY (category_id) REFERENCES income_categories(id)
            )
        ''')

        conn.commit()  # Commit the changes
        print("Tables created successfully!")

    except sqlite3.Error as e:
        print(f"Error while creating tables: {e}")
    finally:
        conn.close()

# Function to clear the journal file
def clear_journal_file():
    """Ensure the journal file is removed after database transactions."""
    journal_file = 'finance_tracker.db-journal'
    if os.path.exists(journal_file):
        os.remove(journal_file)
        print(f"Journal file '{journal_file}' removed.")
    else:
        print(f"No journal file found to remove.")

# Function to delete an income log by ID
def delete_income_log(entry_id):
    """Delete a specific income log by its ID."""
    conn = create_connection()
    if conn is None:
        print("Error connecting to the database.")
        return

    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM income WHERE id = ?', (entry_id,))
        conn.commit()

        if cursor.rowcount > 0:
            print(f"Income log with ID {entry_id} deleted successfully.")
        else:
            print(f"No income log found with ID {entry_id}.")

    except sqlite3.Error as e:
        print(f"Error deleting income log: {e}")
    finally:
        conn.close()

# Function to delete an expense log by ID
def delete_expense_log(entry_id):
    """Delete a specific expense log by its ID."""
    conn = create_connection()
    if conn is None:
        print("Error connecting to the database.")
        return

    try:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM expenses WHERE id = ?', (entry_id,))
        conn.commit()

        if cursor.rowcount > 0:
            print(f"Expense log with ID {entry_id} deleted successfully.")
        else:
            print(f"No expense log found with ID {entry_id}.")

    except sqlite3.Error as e:
        print(f"Error deleting expense log: {e}")
    finally:
        conn.close()

# Function to fetch all income records
def fetch_income_data():
    conn = create_connection()
    if conn is None:
        print("Error connecting to the database.")
        return []

    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM income')
        rows = cursor.fetchall()
        return rows
    except sqlite3.Error as e:
        print(f"Error fetching income data: {e}")
        return []
    finally:
        conn.close()

# Function to fetch all expense records
def fetch_expense_data():
    conn = create_connection()
    if conn is None:
        print("Error connecting to the database.")
        return []

    try:
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM expenses')
        rows = cursor.fetchall()
        return rows
    except sqlite3.Error as e:
        print(f"Error fetching expense data: {e}")
        return []
    finally:
        conn.close()

# Function to fetch income summary with optional date range
def fetch_income_summary(start_date=None, end_date=None):
    conn = create_connection()
    if conn is None:
        print("Error connecting to the database.")
        return {"totalIncome": 0, "incomeDetails": []}

    try:
        cursor = conn.cursor()

        total_income_query = 'SELECT SUM(amount) FROM income'
        details_query = '''
            SELECT c.name, SUM(i.amount) 
            FROM income i
            JOIN income_categories c ON i.category_id = c.id
        '''

        if start_date and end_date:
            total_income_query += ' WHERE date BETWEEN ? AND ?'
            details_query += ' WHERE i.date BETWEEN ? AND ? GROUP BY c.name'

            cursor.execute(total_income_query, (start_date, end_date))
            total_income = cursor.fetchone()[0] or 0

            cursor.execute(details_query, (start_date, end_date))
            income_details = cursor.fetchall()
        else:
            cursor.execute(total_income_query)
            total_income = cursor.fetchone()[0] or 0

            cursor.execute(details_query + ' GROUP BY c.name')
            income_details = cursor.fetchall()

        return {
            "totalIncome": total_income,
            "incomeDetails": [{"source": item[0], "amount": item[1]} for item in income_details]
        }

    except sqlite3.Error as e:
        print(f"Error fetching income summary: {e}")
        return {"totalIncome": 0, "incomeDetails": []}
    finally:
        conn.close()

# Function to fetch expense summary with optional date range
def fetch_expense_summary(start_date=None, end_date=None):
    conn = create_connection()
    if conn is None:
        print("Error connecting to the database.")
        return {"totalExpense": 0, "expenseDetails": []}

    try:
        cursor = conn.cursor()

        total_expense_query = 'SELECT SUM(amount) FROM expenses'
        details_query = '''
            SELECT c.name, SUM(e.amount) 
            FROM expenses e
            JOIN expense_categories c ON e.category_id = c.id
        '''

        if start_date and end_date:
            total_expense_query += ' WHERE date BETWEEN ? AND ?'
            details_query += ' WHERE e.date BETWEEN ? AND ? GROUP BY c.name'

            cursor.execute(total_expense_query, (start_date, end_date))
            total_expense = cursor.fetchone()[0] or 0

            cursor.execute(details_query, (start_date, end_date))
            expense_details = cursor.fetchall()
        else:
            cursor.execute(total_expense_query)
            total_expense = cursor.fetchone()[0] or 0

            cursor.execute(details_query + ' GROUP BY c.name')
            expense_details = cursor.fetchall()

        return {
            "totalExpense": total_expense,
            "expenseDetails": [{"category": item[0], "amount": item[1]} for item in expense_details]
        }

    except sqlite3.Error as e:
        print(f"Error fetching expense summary: {e}")
        return {"totalExpense": 0, "expenseDetails": []}
    finally:
        conn.close()

if __name__ == '__main__':
    create_tables()
    clear_journal_file()
