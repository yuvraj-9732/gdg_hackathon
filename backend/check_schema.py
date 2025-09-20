import sqlite3

def check_schema():
    conn = sqlite3.connect('database.db')
    c = conn.cursor()
    
    # Get schema for complaints table
    c.execute("PRAGMA table_info(complaints)")
    columns = c.fetchall()
    
    print("Complaints table schema:")
    for column in columns:
        print(f"  {column[1]} ({column[2]})")
    
    conn.close()

if __name__ == "__main__":
    check_schema() 