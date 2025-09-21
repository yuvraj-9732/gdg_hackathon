import os
import sqlite3
import json
from datetime import datetime
import google.generativeai as genai
from presidio_analyzer import AnalyzerEngine
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from presidio_anonymizer import AnonymizerEngine
from flask import Flask, request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask
app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

# Configuration for file uploads
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Configure Gemini Pro
genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-2.0-flash')

# Initialize Presidio
analyzer = AnalyzerEngine()
anonymizer = AnonymizerEngine()

# Database connection helper
def get_db_connection():
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn

# Database initialization
def init_db():
    # Define the database path
    db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'database.db')
    
    # Check if database exists, if not create it
    if not os.path.exists(db_path):
        print("Database not found. Creating new database...")
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # Create users table
        c.execute('''CREATE TABLE users
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      email TEXT UNIQUE,
                      password TEXT,
                      aadhar TEXT UNIQUE,
                      role TEXT,
                      name TEXT)''')
        
        # Create complaints table with user_id column
        c.execute('''CREATE TABLE complaints
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      type TEXT,
                      description TEXT,
                      status TEXT,
                      created_at TIMESTAMP,
                      updated_at TIMESTAMP,
                      user_id INTEGER,
                      latitude REAL,
                      longitude REAL,
                      assigned_official_id INTEGER,
                      department TEXT,
                      satisfaction_rating INTEGER,
                      FOREIGN KEY(user_id) REFERENCES users(id),
                      FOREIGN KEY(assigned_official_id) REFERENCES users(id))''')
        
        # Create rewards table
        c.execute('''CREATE TABLE rewards
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      complaint_id INTEGER,
                      amount INTEGER,
                      status TEXT,
                      FOREIGN KEY(complaint_id) REFERENCES complaints(id))''')
        
        # Create comments table
        c.execute('''CREATE TABLE comments
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      complaint_id INTEGER,
                      user_id INTEGER,
                      comment TEXT,
                      timestamp TIMESTAMP,
                      FOREIGN KEY(complaint_id) REFERENCES complaints(id),
                      FOREIGN KEY(user_id) REFERENCES users(id))''')
        
        # Create most wanted criminals table
        c.execute('''CREATE TABLE most_wanted
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      name TEXT,
                      crime TEXT,
                      description TEXT,
                      last_seen TEXT,
                      reward_amount INTEGER,
                      status TEXT,
                      image_url TEXT)''')
        
        # Create officials table for accountability
        c.execute('''CREATE TABLE officials
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      name TEXT,
                      department TEXT,
                      position TEXT,
                      performance_score REAL)''')
        
        # Create community reports table
        c.execute('''CREATE TABLE community_reports
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      location TEXT,
                      issue TEXT,
                      severity TEXT,
                      description TEXT,
                      status TEXT,
                      created_at TIMESTAMP)''')
        
        # Create feedback table
        c.execute('''CREATE TABLE feedback
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      service_name TEXT,
                      rating INTEGER,
                      comments TEXT,
                      anonymous INTEGER,
                      created_at TIMESTAMP)''')
        
        # Create evidence table to store file paths
        c.execute('''CREATE TABLE evidence
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      complaint_id INTEGER,
                      file_path TEXT,
                      FOREIGN KEY(complaint_id) REFERENCES complaints(id))''')

        # Create user_tags table for flagging officials
        c.execute('''CREATE TABLE user_tags
                     (id INTEGER PRIMARY KEY AUTOINCREMENT,
                      user_id INTEGER,
                      tag_type TEXT,
                      complaint_id INTEGER,
                      created_at TIMESTAMP,
                      FOREIGN KEY(user_id) REFERENCES users(id),
                      FOREIGN KEY(complaint_id) REFERENCES complaints(id))''')

        os.makedirs(UPLOAD_FOLDER, exist_ok=True)

        # Insert dummy users
        c.execute("INSERT INTO users (email, password, aadhar, role, name) VALUES (?, ?, ?, ?, ?)",
                  ("citizen@example.com", "password123", "123456789012", "citizen", "Rajesh Kumar"))
                  
        c.execute("INSERT INTO users (email, password, aadhar, role, name) VALUES (?, ?, ?, ?, ?)",
                  ("police@example.com", "password123", "123456789013", "police", "Inspector Sharma"))
                  
        c.execute("INSERT INTO users (email, password, aadhar, role, name) VALUES (?, ?, ?, ?, ?)",
                  ("official@example.com", "password123", "123456789014", "official", "Officer Singh"))
        
        # Insert mock complaints
        c.execute("INSERT INTO complaints (type, description, status, created_at, updated_at, user_id, latitude, longitude, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  ("bribery", "Officer asked for ₹5000 to approve license", "Resolved", datetime.now(), datetime.now(), 1, 19.0760, 72.8777, "Police"))
        
        c.execute("INSERT INTO complaints (type, description, status, created_at, updated_at, user_id, latitude, longitude, department) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                  ("delay", "Passport application pending for 3 months", "In Progress", datetime.now(), datetime.now(), 1, 28.6139, 77.2090, "Passport Office"))
        
        # Insert mock reward
        c.execute("INSERT INTO rewards (complaint_id, amount, status) VALUES (?, ?, ?)",
                  (1, 5000, "Distributed"))
        
        # Insert most wanted criminals
        c.execute("INSERT INTO most_wanted (name, crime, description, last_seen, reward_amount, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  ("Vijay Mallya", "Financial Fraud", "Wanted for bank fraud and money laundering", "London, UK", 5000000, "Active", "https://example.com/mallya.jpg"))
        
        c.execute("INSERT INTO most_wanted (name, crime, description, last_seen, reward_amount, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  ("Nirav Modi", "Punjab National Bank Scam", "Wanted for $1.8 billion bank fraud", "Unknown", 5000000, "Active", "https://example.com/nirav.jpg"))
        
        c.execute("INSERT INTO most_wanted (name, crime, description, last_seen, reward_amount, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                  ("Mehul Choksi", "Punjab National Bank Scam", "Wanted for bank fraud", "Antigua", 5000000, "Active", "https://example.com/mehul.jpg"))
        
        # Insert officials
        c.execute("INSERT INTO officials (name, department, position, performance_score) VALUES (?, ?, ?, ?)",
                  ("Rakesh Asthana", "Police", "Special Director", 85.5))
        
        c.execute("INSERT INTO officials (name, department, position, performance_score) VALUES (?, ?, ?, ?)",
                  ("Alok Verma", "Passport Office", "Director", 78.2))
        
        # Insert community reports
        c.execute("INSERT INTO community_reports (location, issue, severity, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                  ("Mumbai", "Bribe at RTO office", "High", "Officials asking for bribes to issue driving licenses", "Pending", datetime.now()))
        
        c.execute("INSERT INTO community_reports (location, issue, severity, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                  ("Delhi", "Harassment", "Medium", "Citizens being harassed by police for no reason", "Investigating", datetime.now()))
        
        # Insert feedback
        c.execute("INSERT INTO feedback (service_name, rating, comments, anonymous, created_at) VALUES (?, ?, ?, ?, ?)",
                  ("Passport Office", 2, "Very slow service, staff not helpful", 0, datetime.now()))
        
        c.execute("INSERT INTO feedback (service_name, rating, comments, anonymous, created_at) VALUES (?, ?, ?, ?, ?)",
                  ("RTO", 4, "Process was smooth, but took longer than expected", 1, datetime.now()))
        
        conn.commit()
        conn.close()
        print("Database created successfully!")
    else:
        # Check if the database has the correct schema
        conn = sqlite3.connect(db_path)
        c = conn.cursor()
        
        # Check if new tables exist
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='most_wanted'")
        if not c.fetchone():
            print("most_wanted table missing. Creating it...")
            c.execute('''CREATE TABLE most_wanted
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          name TEXT,
                          crime TEXT,
                          description TEXT,
                          last_seen TEXT,
                          reward_amount INTEGER,
                          status TEXT,
                          image_url TEXT)''')
            
            # Insert most wanted criminals
            c.execute("INSERT INTO most_wanted (name, crime, description, last_seen, reward_amount, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      ("Vijay Mallya", "Financial Fraud", "Wanted for bank fraud and money laundering", "London, UK", 5000000, "Active", "https://example.com/mallya.jpg"))
            
            c.execute("INSERT INTO most_wanted (name, crime, description, last_seen, reward_amount, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      ("Nirav Modi", "Punjab National Bank Scam", "Wanted for $1.8 billion bank fraud", "Unknown", 5000000, "Active", "https://example.com/nirav.jpg"))
            
            c.execute("INSERT INTO most_wanted (name, crime, description, last_seen, reward_amount, status, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                      ("Mehul Choksi", "Punjab National Bank Scam", "Wanted for bank fraud", "Antigua", 5000000, "Active", "https://example.com/mehul.jpg"))
            
            conn.commit()
            print("most_wanted table created successfully!")
        
        # Check if officials table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='officials'")
        if not c.fetchone():
            print("officials table missing. Creating it...")
            c.execute('''CREATE TABLE officials
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          name TEXT,
                          department TEXT,
                          position TEXT,
                          performance_score REAL)''')
            
            # Insert officials
            c.execute("INSERT INTO officials (name, department, position, performance_score) VALUES (?, ?, ?, ?)",
                      ("Rakesh Asthana", "CBI", "Special Director", 85.5))
            
            c.execute("INSERT INTO officials (name, department, position, performance_score) VALUES (?, ?, ?, ?)",
                      ("Alok Verma", "CBI", "Director", 78.2))
            
            conn.commit()
            print("officials table created successfully!")

        # Check if community_reports table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='community_reports'")
        if not c.fetchone():
            print("community_reports table missing. Creating it...")
            c.execute('''CREATE TABLE community_reports
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          location TEXT,
                          issue TEXT,
                          severity TEXT,
                          description TEXT,
                          status TEXT,
                          created_at TIMESTAMP)''')
            # Insert community reports
            c.execute("INSERT INTO community_reports (location, issue, severity, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                      ("Mumbai", "Bribe at RTO office", "High", "Officials asking for bribes to issue driving licenses", "Pending", datetime.now()))
            c.execute("INSERT INTO community_reports (location, issue, severity, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
                      ("Delhi", "Harassment", "Medium", "Citizens being harassed by police for no reason", "Investigating", datetime.now()))
            conn.commit()
            print("community_reports table created successfully!")

        # Check if feedback table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'")
        if not c.fetchone():
            print("feedback table missing. Creating it...")
            c.execute('''CREATE TABLE feedback
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          service_name TEXT,
                          rating INTEGER,
                          comments TEXT,
                          anonymous INTEGER,
                          created_at TIMESTAMP)''')
            conn.commit()
            print("feedback table created successfully!")

        # Check if evidence table exists
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='evidence'")
        if not c.fetchone():
            print("evidence table missing. Creating it...")
            c.execute('''CREATE TABLE evidence
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          complaint_id INTEGER,
                          file_path TEXT,
                          FOREIGN KEY(complaint_id) REFERENCES complaints(id))''')
            conn.commit()
            print("evidence table created successfully!")
        
        # Check if user_id column exists in complaints table
        c.execute("PRAGMA table_info(complaints)")
        # columns = [column<source_id data="1" title="N/A" /> for column in c.fetchall()]
        columns = [column[1] for column in c.fetchall()]
        
        if 'department' not in columns:
            print("Older schema detected. Upgrading database with new columns...")
            if 'user_id' not in columns:
                c.execute("ALTER TABLE complaints ADD COLUMN user_id INTEGER")
                c.execute("ALTER TABLE complaints ADD COLUMN latitude REAL")
                c.execute("ALTER TABLE complaints ADD COLUMN longitude REAL")
            c.execute("ALTER TABLE complaints ADD COLUMN assigned_official_id INTEGER REFERENCES users(id)")
            c.execute("ALTER TABLE complaints ADD COLUMN department TEXT")
            c.execute("ALTER TABLE complaints ADD COLUMN satisfaction_rating INTEGER")
            c.execute("UPDATE complaints SET department = 'Police' WHERE type = 'bribery'")
            c.execute("UPDATE complaints SET department = 'Passport Office' WHERE type = 'delay'")
            c.execute("UPDATE complaints SET department = 'Municipal Corporation' WHERE type = 'nepotism'")
            c.execute("UPDATE complaints SET user_id = 1 WHERE user_id IS NULL")
            conn.commit()
            print("Database schema upgraded successfully!")

        # Migration for user_tags table
        c.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='user_tags'")
        if not c.fetchone():
            print("user_tags table missing. Creating it...")
            c.execute('''CREATE TABLE user_tags
                         (id INTEGER PRIMARY KEY AUTOINCREMENT,
                          user_id INTEGER,
                          tag_type TEXT,
                          complaint_id INTEGER,
                          created_at TIMESTAMP,
                          FOREIGN KEY(user_id) REFERENCES users(id),
                          FOREIGN KEY(complaint_id) REFERENCES complaints(id))''')
            conn.commit()
            print("user_tags table created successfully!")

        
        conn.close()
        
# PII Redaction function
def redact_pii(text):
    results = analyzer.analyze(text=text, language='en')
    anonymized_text = anonymizer.anonymize(text=text, analyzer_results=results)
    return anonymized_text.text

def send_email(to_address, subject, body):
    """Sends an email using SMTP (configured for Gmail)."""
    from_address = os.environ.get("EMAIL_USER")
    password = os.environ.get("EMAIL_PASSWORD")

    if not from_address or not password:
        print("WARNING: EMAIL_USER or EMAIL_PASSWORD not set in .env file. Skipping email.")
        return

    msg = MIMEMultipart()
    msg['From'] = from_address
    msg['To'] = to_address
    msg['Subject'] = subject

    msg.attach(MIMEText(body, 'plain'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(from_address, password)
        text = msg.as_string()
        server.sendmail(from_address, to_address, text)
        server.quit()
        print(f"Confirmation email sent successfully to {to_address}")
    except Exception as e:
        print(f"ERROR: Failed to send email. {e}")

# Gemini Pro analysis function
def analyze_with_gemini(text):
    try:
        prompt = f"""
        Analyze the following corruption complaint and provide:
        1. Intent (e.g., bribery request, service delay, harassment)
        2. Severity (low, medium, high)
        3. Suggested action (e.g., file FIR, RTI, departmental complaint)
        
        Complaint: {text}
        """
        
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error analyzing with Gemini: {str(e)}"

def analyze_systemic_flaws(complaints_json):
    try:
        prompt = f"""
        As a Systemic Flaw Analyst AI, your task is to identify root causes and process vulnerabilities from a list of corruption complaints.
        Analyze the following JSON data of all complaints. Look for clusters of similar issues (e.g., same complaint type, same location, recurring keywords).
        Based on these clusters, identify 1-3 potential systemic flaws.
        For each flaw, provide:
        1.  **Flaw Description:** A brief summary of the recurring problem.
        2.  **Evidence:** Mention the complaint types or keywords that point to this flaw.
        3.  **Policy Recommendation:** Suggest a concrete, actionable policy change to fix the vulnerability.

        Complaints Data: {complaints_json}
        """
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        return f"Error analyzing for systemic flaws with Gemini: {str(e)}"

# Routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM users WHERE email = ? AND password = ?', (email, password))
    user = c.fetchone()
    conn.close()
    
    if user:
        return jsonify({
            'id': user['id'],
            'email': user['email'],
            'aadhar': user['aadhar'],
            'role': user['role'],
            'name': user['name']
        })
    return jsonify({'error': 'Invalid credentials'}), 401

@app.route('/api/user/complaints', methods=['GET'])
def get_user_complaints():
    user_id = request.args.get('user_id')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM complaints WHERE user_id = ?', (user_id,))
    complaints = c.fetchall()
    conn.close()
    
    return jsonify([dict(complaint) for complaint in complaints])

@app.route('/api/police/complaints', methods=['GET'])
def get_police_complaints():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT c.*, u.name as user_name FROM complaints c JOIN users u ON c.user_id = u.id')
    complaints = c.fetchall()
    conn.close()
    
    return jsonify([dict(complaint) for complaint in complaints])

@app.route('/api/police/complaints/<int:complaint_id>/comment', methods=['POST'])
def add_comment(complaint_id):
    # Handle multipart form data to allow file uploads with comments
    user_id = request.form.get('user_id')
    comment_text = request.form.get('comment')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO comments (complaint_id, user_id, comment, timestamp)
                 VALUES (?, ?, ?, ?)''',
              (complaint_id, user_id, comment_text, datetime.now()))
    
    # On first official comment, assign the official and their department to the complaint
    c.execute('SELECT assigned_official_id FROM complaints WHERE id = ?', (complaint_id,))
    if c.fetchone()['assigned_official_id'] is None:
        # This is a simplification. In a real app, you'd look up the user's department.
        # For now, we'll derive it from the complaint type as a fallback.
        c.execute('SELECT type FROM complaints WHERE id = ?', (complaint_id,))
        complaint_type = c.fetchone()['type']
        department_map = {'bribery': 'Police', 'harassment': 'Police', 'delay': 'Passport Office', 'nepotism': 'Municipal Corporation', 'embezzlement': 'Finance Ministry'}
        department = department_map.get(complaint_type, 'General Administration')

        # **Corruption Tagging Logic**
        # If the complaint is about bribery, tag the assigned officer.
        if complaint_type == 'bribery':
            c.execute("INSERT INTO user_tags (user_id, tag_type, complaint_id, created_at) VALUES (?, ?, ?, ?)",
                      (user_id, 'bribery_complaint', complaint_id, datetime.now()))

        c.execute('UPDATE complaints SET assigned_official_id = ?, department = ? WHERE id = ?', (user_id, department, complaint_id))
    
    # Update complaint status to "In Progress"
    c.execute('UPDATE complaints SET status = ? WHERE id = ?', ('In Progress', complaint_id))
    
    # Handle file uploads for evidence
    files = request.files.getlist('evidence')
    for file in files:
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            # Store just the filename in the evidence table
            c.execute("INSERT INTO evidence (complaint_id, file_path) VALUES (?, ?)", (complaint_id, filename))

    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/police/complaints/<int:complaint_id>/close', methods=['POST'])
def close_complaint(complaint_id):
    # Handle multipart form data to allow file uploads with the closing statement
    user_id = request.form.get('user_id')
    resolution = request.form.get('resolution')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    # Add resolution as a comment
    c.execute('''INSERT INTO comments (complaint_id, user_id, comment, timestamp)
                 VALUES (?, ?, ?, ?)''',
              (complaint_id, user_id, f"RESOLUTION: {resolution}", datetime.now()))
    
    # Update complaint status to "Resolved"
    c.execute('UPDATE complaints SET status = ? WHERE id = ?', ('Resolved', complaint_id))
    
    # Handle final evidence file uploads
    files = request.files.getlist('evidence')
    for file in files:
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            # Store just the filename in the evidence table
            c.execute("INSERT INTO evidence (complaint_id, file_path) VALUES (?, ?)", (complaint_id, filename))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True})

@app.route('/api/complaints/<int:complaint_id>/comments', methods=['GET'])
def get_comments(complaint_id):
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT c.*, u.name, u.role FROM comments c 
                 JOIN users u ON c.user_id = u.id 
                 WHERE c.complaint_id = ?
                 ORDER BY c.timestamp''', (complaint_id,))
    comments = c.fetchall()
    conn.close()
    
    return jsonify([dict(comment) for comment in comments])

@app.route('/api/complaints/<int:complaint_id>/evidence', methods=['GET'])
def get_evidence(complaint_id):
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM evidence WHERE complaint_id = ?', (complaint_id,))
    evidence_files = c.fetchall()
    conn.close()
    
    return jsonify([dict(file) for file in evidence_files])

@app.route('/api/users/<int:user_id>/tags', methods=['GET'])
def get_user_tags(user_id):
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT tag_type, COUNT(*) as count FROM user_tags WHERE user_id = ? GROUP BY tag_type', (user_id,))
    tags = c.fetchall()
    conn.close()
    return jsonify([dict(tag) for tag in tags])

@app.route('/api/complaints/<int:complaint_id>/rate', methods=['POST'])
def rate_complaint(complaint_id):
    data = request.json
    rating = data.get('rating')
    user_id = data.get('user_id') # In a real app, verify this user filed the complaint

    if not (1 <= rating <= 5):
        return jsonify({'error': 'Rating must be between 1 and 5'}), 400

    conn = get_db_connection()
    c = conn.cursor()
    c.execute('UPDATE complaints SET satisfaction_rating = ? WHERE id = ? AND status = "Resolved"', (rating, complaint_id))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# Route to serve uploaded files
@app.route('/uploads/<filename>')
def uploaded_file(filename):
    # Ensure that the path is safe
    if '..' in filename or filename.startswith('/'):
        return "Invalid path", 400
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/complaints', methods=['POST'])
def submit_complaint():
    # Handle multipart form data
    complaint_type = request.form.get('type')
    description = request.form.get('description')
    user_id = request.form.get('user_id')
    latitude = request.form.get('latitude')
    longitude = request.form.get('longitude')
    
    # Redact PII
    redacted_description = redact_pii(description)
    
    # Analyze with Gemini Pro
    analysis = analyze_with_gemini(redacted_description)
    
    # Generate mock FIR draft
    fir_draft = f"""
    FIR DRAFT
    
    Complaint Type: {complaint_type}
    Description: {redacted_description}
    
    Analysis: {analysis}
    
    This is an auto-generated FIR draft based on the complaint submitted.
    """
    
    # Store in database
    conn = get_db_connection()
    c = conn.cursor()
    # Assign a default department based on type
    department_map = {'bribery': 'Police', 'harassment': 'Police', 'delay': 'Passport Office', 'nepotism': 'Municipal Corporation', 'embezzlement': 'Finance Ministry'}
    department = department_map.get(complaint_type, 'General Administration')
    c.execute('''INSERT INTO complaints (type, description, status, created_at, updated_at, user_id, latitude, longitude, department)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
              (complaint_type, redacted_description, 'Submitted', datetime.now(), datetime.now(), user_id, latitude, longitude, department))
    complaint_id = c.lastrowid

    # Handle file uploads
    files = request.files.getlist('evidence')
    for file in files:
        if file:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
            # Store just the filename in the new evidence table
            c.execute("INSERT INTO evidence (complaint_id, file_path) VALUES (?, ?)", (complaint_id, filename))

    # Fetch user's email to send confirmation
    c.execute('SELECT email FROM users WHERE id = ?', (user_id,))
    user_record = c.fetchone()
    if user_record:
        user_email = user_record['email']
        email_subject = f"Complaint Registered Successfully (ID: {complaint_id})"
        email_body = f"""
Dear Citizen,

Thank you for submitting your complaint. It has been registered with the ID: {complaint_id}.

Please find a copy of the auto-generated preliminary FIR draft below for your records.
--------------------------------------------------
{fir_draft}
--------------------------------------------------

We will keep you updated on the progress.

Regards,
Bhrashtachar Mukt Team
"""
        send_email(user_email, email_subject, email_body)

    conn.commit()
    conn.close()
    
    return jsonify({
        'id': complaint_id,
        'status': 'Submitted',
        'analysis': analysis,
        'fir_draft': fir_draft
    }), 201
    
@app.route('/api/complaints/<int:complaint_id>', methods=['GET'])
def get_complaint(complaint_id):
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT * FROM complaints WHERE id = ?', (complaint_id,))
    complaint = c.fetchone()
    conn.close()
    
    if complaint:
        return jsonify({
            'id': complaint['id'],
            'type': complaint['type'],
            'description': complaint['description'],
            'status': complaint['status'],
            'created_at': complaint['created_at'],
            'updated_at': complaint['updated_at']
        })
    return jsonify({'error': 'Complaint not found'}), 404

@app.route('/api/dashboard', methods=['GET'])
def get_dashboard():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get statistics
    c.execute('SELECT COUNT(*) FROM complaints')
    total_complaints = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Resolved'")
    resolved_complaints = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM complaints WHERE status = 'In Progress'")
    in_progress_complaints = c.fetchone()[0]
    
    c.execute("SELECT COUNT(*) FROM complaints WHERE status = 'Submitted'")
    submitted_complaints = c.fetchone()[0]
    
    c.execute('SELECT SUM(amount) FROM rewards WHERE status = "Distributed"')
    rewards_distributed = c.fetchone()[0] or 0
    
    # Get most wanted count
    c.execute('SELECT COUNT(*) FROM most_wanted WHERE status = "Active"')
    most_wanted_count = c.fetchone()[0]
    
    # Get community reports count
    c.execute('SELECT COUNT(*) FROM community_reports WHERE status = "Pending"')
    pending_reports = c.fetchone()[0]
    
    # Get average feedback rating
    c.execute('SELECT AVG(rating) FROM feedback')
    avg_rating = c.fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'total_complaints': total_complaints,
        'resolved_complaints': resolved_complaints,
        'in_progress_complaints': in_progress_complaints,
        'submitted_complaints': submitted_complaints,
        'rewards_distributed': rewards_distributed,
        'most_wanted_count': most_wanted_count,
        'pending_reports': pending_reports,
        'avg_rating': round(avg_rating, 1)
    })

@app.route('/api/integrity-index', methods=['GET'])
def get_integrity_index():
    conn = get_db_connection()
    c = conn.cursor()

    # Calculate scores per department
    c.execute('''
        SELECT
            department,
            COUNT(*) as total_complaints,
            SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_complaints,
            AVG(satisfaction_rating) as avg_satisfaction
        FROM complaints
        WHERE department IS NOT NULL
        GROUP BY department
    ''')
    
    index_data = []
    for row in c.fetchall():
        department_stats = dict(row)
        total = department_stats['total_complaints']
        resolved = department_stats['resolved_complaints']
        satisfaction = department_stats['avg_satisfaction'] or 0 # Default to 0 if no ratings

        # Weighted score: 50% resolution rate, 50% satisfaction
        resolution_score = (resolved / total * 100) if total > 0 else 0
        satisfaction_score = (satisfaction / 5 * 100) # Scale 1-5 rating to 0-100

        integrity_score = (resolution_score * 0.5) + (satisfaction_score * 0.5)
        
        department_stats['integrity_score'] = round(integrity_score, 1)
        index_data.append(department_stats)

    conn.close()
    # Sort by highest score
    sorted_index = sorted(index_data, key=lambda x: x['integrity_score'], reverse=True)
    return jsonify(sorted_index)

@app.route('/api/rewards', methods=['POST'])
def create_reward():
    data = request.json
    complaint_id = data.get('complaint_id')
    amount = data.get('amount')
    
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('''INSERT INTO rewards (complaint_id, amount, status)
                 VALUES (?, ?, ?)''',
              (complaint_id, amount, 'Pending'))
    reward_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': reward_id,
        'complaint_id': complaint_id,
        'amount': amount,
        'status': 'Pending'
    }), 201
    
# 1. Advanced AI-Powered Features

@app.route('/api/risk-analysis', methods=['GET'])
def get_risk_analysis():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Calculate risk scores by department/type
    c.execute('''SELECT type, 
                 COUNT(*) as total,
                 SUM(CASE WHEN status = "Resolved" THEN 1 ELSE 0 END) as resolved
                 FROM complaints 
                 GROUP BY type''')
    
    risk_data = []
    for row in c.fetchall():
        type_name, total, resolved = row
        risk_score = 100 - (resolved / total * 100) if total > 0 else 0
        risk_data.append({
            'type': type_name,
            'total': total,
            'resolved': resolved,
            'risk_score': round(risk_score, 2)
        })
    
    conn.close()
    return jsonify(risk_data)

@app.route('/api/anomalies', methods=['GET'])
def detect_anomalies():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Detect unusual patterns (e.g., sudden spike in complaints)
    c.execute('''SELECT DATE(created_at) as date, COUNT(*) as count 
                 FROM complaints 
                 WHERE created_at >= date('now', '-30 days')
                 GROUP BY DATE(created_at)
                 ORDER BY date''')
    
    daily_counts = c.fetchall()
    
    # Calculate average and standard deviation
    counts = [count for _, count in daily_counts]
    avg_count = sum(counts) / len(counts) if counts else 0
    
    # Flag days with unusually high complaints
    anomalies = []
    for date, count in daily_counts:
        if count > avg_count * 1.5:  # 50% above average
            anomalies.append({
                'date': date,
                'count': count,
                'severity': 'High' if count > avg_count * 2 else 'Medium'
            })
    
    conn.close()
    return jsonify(anomalies)

@app.route('/api/systemic-flaw-analysis', methods=['GET'])
def get_systemic_flaw_analysis():
    conn = get_db_connection()
    c = conn.cursor()
    c.execute('SELECT type, description, status, department FROM complaints')
    complaints = [dict(row) for row in c.fetchall()]
    conn.close()

    complaints_json = json.dumps(complaints, indent=2)
    analysis = analyze_systemic_flaws(complaints_json)
    return jsonify({'analysis': analysis})

# 2. Enhanced Reporting and Analytics

@app.route('/api/complaints-by-type', methods=['GET'])
def get_complaints_by_type():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT type, COUNT(*) as count 
                 FROM complaints 
                 GROUP BY type
                 ORDER BY count DESC''')
    
    data = {
        'labels': [row[0] for row in c.fetchall()],
        'data': [row[1] for row in c.fetchall()]
    }
    
    conn.close()
    return jsonify(data)

@app.route('/api/trend-data', methods=['GET'])
def get_trend_data():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT DATE(created_at) as date, COUNT(*) as count 
                 FROM complaints 
                 WHERE created_at >= date('now', '-30 days')
                 GROUP BY DATE(created_at)
                 ORDER BY date''')
    
    data = {
        'labels': [row[0] for row in c.fetchall()],
        'data': [row[1] for row in c.fetchall()]
    }
    
    conn.close()
    return jsonify(data)

@app.route('/api/resolution-time', methods=['GET'])
def get_resolution_time():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''SELECT type, 
                 AVG(JULIANDAY(updated_at) - JULIANDAY(created_at)) as avg_days
                 FROM complaints 
                 WHERE status = "Resolved"
                 GROUP BY type''')
    
    data = {
        'labels': [row[0] for row in c.fetchall()],
        'data': [round(row[1], 1) for row in c.fetchall()]
    }
    
    conn.close()
    return jsonify(data)

@app.route('/api/complaints-with-location', methods=['GET'])
def get_complaints_with_location():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM complaints WHERE latitude IS NOT NULL AND longitude IS NOT NULL')
    complaints = c.fetchall()
    
    conn.close()
    return jsonify([dict(complaint) for complaint in complaints])

# 3. Citizen Empowerment Tools

@app.route('/api/legal-guidance', methods=['POST'])
def get_legal_guidance():
    data = request.json
    complaint_type = data.get('type')
    
    # Provide legal guidance based on complaint type
    guidance = {
        'bribery': {
            'sections': ['IPC Section 171B', 'Prevention of Corruption Act'],
            'steps': [
                'Collect evidence of demand',
                'File complaint with ACB',
                'Apply for witness protection'
            ],
            'timeframe': 'Investigation typically completes within 90 days'
        },
        'harassment': {
            'sections': ['IPC Section 354', 'Sexual Harassment Act'],
            'steps': [
                'Document all incidents',
                'File FIR with local police',
                'Contact Internal Complaints Committee'
            ],
            'timeframe': 'Action must be taken within 3 months'
        },
        'delay': {
            'sections': ['Citizen Charter', 'Right to Service Act'],
            'steps': [
                'Submit written complaint to department head',
                'File RTI application for status update',
                'Approach Centralized Public Grievance Redress System'
            ],
            'timeframe': 'Service must be provided within stipulated time'
        }
    }
    
    # Get guidance for the type, or a default structure if not found
    result = guidance.get(complaint_type, {
        'sections': [],
        'steps': [],
        'timeframe': 'No specific guidance available for this complaint type.'
    })
    return jsonify(result)

@app.route('/api/protection-assessment', methods=['POST'])
def get_protection_assessment():
    data = request.json
    anonymity_level = data.get('anonymityLevel')
    complaint_type = data.get('complaintType') or ''
    
    # Calculate protection measures based on inputs
    measures = []
    
    if anonymity_level == 'full':
        measures.append("Complete identity protection throughout the process")
        measures.append("Use of anonymous reporting channels")
        measures.append("Legal representation by government-appointed lawyer")
    else:
        measures.append("Partial identity protection")
        measures.append("Identity revealed only to investigating officer")
    
    if complaint_type == 'bribery':
        measures.append("Protection from retaliation by accused official")
        measures.append("Witness protection program if threat level is high")
    elif complaint_type == 'harassment':
        measures.append("Immediate police protection")
        measures.append("Relocation assistance if necessary")
    
    return jsonify({
        'measures': measures,
        'risk_level': 'High' if complaint_type in ['bribery', 'harassment'] else 'Medium'
    })

# 4. Government Accountability Tools

@app.route('/api/official-performance', methods=['GET'])
def get_official_performance():
    conn = get_db_connection()
    c = conn.cursor()
    
    # Calculate performance metrics for officials
    c.execute('''SELECT o.id, o.name, o.department,
                 COUNT(c.id) as assigned_complaints,
                 SUM(CASE WHEN c.status = "Resolved" THEN 1 ELSE 0 END) as resolved,
                 AVG(JULIANDAY(c.updated_at) - JULIANDAY(c.created_at)) as avg_resolution_time
                 FROM officials o
                 LEFT JOIN complaints c ON o.id = c.assigned_official
                 GROUP BY o.id''')
    
    officials = []
    for row in c.fetchall():
        officials.append({
            'id': row[0],
            'name': row[1],
            'department': row[2],
            'assigned_complaints': row[3] or 0,
            'resolved': row[4] or 0,
            'resolution_rate': round((row[4] or 0) / row[3] * 100, 2) if row[3] and row[3] > 0 else 0,
            'avg_resolution_time': round(row[5], 1) if row[5] else 0
        })
    
    conn.close()
    return jsonify(officials)

@app.route('/api/departments', methods=['GET'])
def get_departments():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute("SELECT DISTINCT department FROM officials")
    departments = [row[0] for row in c.fetchall()]
    
    conn.close()
    return jsonify(departments)

@app.route('/api/department-performance/<department>', methods=['GET'])
def get_department_performance(department):
    conn = get_db_connection()
    c = conn.cursor()
    
    # Get department performance metrics
    c.execute('''SELECT 
                 COUNT(c.id) as total_complaints,
                 SUM(CASE WHEN c.status = "Resolved" THEN 1 ELSE 0 END) as resolved,
                 AVG(JULIANDAY(c.updated_at) - JULIANDAY(c.created_at)) as avg_resolution_time,
                 AVG(f.rating) as avg_satisfaction
                 FROM complaints c
                 LEFT JOIN feedback f ON c.type = f.service_name
                 WHERE c.department = ?
                 GROUP BY c.department''', (department,))
    
    row = c.fetchone()
    
    if row:
        total_complaints, resolved, avg_resolution_time, avg_satisfaction = row
        performance = {
            'department': department,
            'total_complaints': total_complaints,
            'resolved': resolved,
            'resolution_rate': round(resolved / total_complaints * 100, 2) if total_complaints > 0 else 0,
            'avg_resolution_time': round(avg_resolution_time, 1),
            'satisfaction': round(avg_satisfaction, 1) if avg_satisfaction else 0
        }
    else:
        performance = {
            'department': department,
            'total_complaints': 0,
            'resolved': 0,
            'resolution_rate': 0,
            'avg_resolution_time': 0,
            'satisfaction': 0
        }
    
    conn.close()
    return jsonify(performance)

# 5. Community Engagement Features

@app.route('/api/community-reports', methods=['GET'])
def get_community_reports():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM community_reports ORDER BY created_at DESC')
    reports = c.fetchall()
    
    conn.close()
    return jsonify([dict(report) for report in reports])

@app.route('/api/community-reports', methods=['POST'])
def submit_community_report():
    data = request.json
    location = data.get('location')
    issue = data.get('issue')
    severity = data.get('severity')
    description = data.get('description')
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO community_reports (location, issue, severity, description, status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?)''',
              (location, issue, severity, description, 'Pending', datetime.now()))
    
    report_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': report_id,
        'status': 'submitted'
    }), 201

@app.route('/api/services', methods=['GET'])
def get_services():
    # List of government services for feedback
    services = [
        {'id': 1, 'name': 'Passport Office'},
        {'id': 2, 'name': 'RTO'},
        {'id': 3, 'name': 'Municipal Corporation'},
        {'id': 4, 'name': 'Electricity Department'},
        {'id': 5, 'name': 'Water Supply Department'}
    ]
    
    return jsonify(services)

@app.route('/api/feedback', methods=['POST'])
def submit_feedback():
    data = request.json
    service_name = data.get('service')
    rating = data.get('rating')
    comments = data.get('comments')
    anonymous = data.get('anonymous', False)
    
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('''INSERT INTO feedback (service_name, rating, comments, anonymous, created_at)
                 VALUES (?, ?, ?, ?, ?)''',
              (service_name, rating, comments, 1 if anonymous else 0, datetime.now()))
    
    feedback_id = c.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'id': feedback_id,
        'status': 'submitted'
    }), 201

# 6. Most Wanted Criminals
@app.route('/api/most-wanted', methods=['GET'])
def get_most_wanted():
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM most_wanted WHERE status = "Active" ORDER BY reward_amount DESC')
    criminals = c.fetchall()
    
    conn.close()
    return jsonify([dict(criminal) for criminal in criminals])

@app.route('/api/most-wanted/<int:criminal_id>', methods=['GET'])
def get_most_wanted_details(criminal_id):
    conn = get_db_connection()
    c = conn.cursor()
    
    c.execute('SELECT * FROM most_wanted WHERE id = ?', (criminal_id,))
    criminal = c.fetchone()
    conn.close()
    
    if criminal:
        return jsonify(dict(criminal))
    return jsonify({'error': 'Criminal not found'}), 404

# Route to serve static map marker images
@app.route('/<path:filename>')
def serve_static_files(filename):
    # This route is now less specific and might conflict. The /uploads/<filename> is better.
    static_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'images')
    return send_from_directory(static_dir, filename)


if __name__ == '__main__':
    # Initialize database on startup, before running the app
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)