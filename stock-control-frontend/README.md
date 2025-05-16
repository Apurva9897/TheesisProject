## 📦 Universal Computer Stock Control System
Description
This project is a full-stack inventory and warehouse management system built using Flask Python and Angular 19 (standalone architecture). It includes functionality for:

Admin and client registration/login

Admin approval workflow with email

Product management and ordering

Supplier stock control

Predictive sales analytics (90 days forecast)

Email receipts and OTP verification

Reporting dashboards

## Prerequisites
Python 3.9 or higher

Node.js and npm

Angular CLI (npm install -g @angular/cli@19)

MySQL 8.0+

VS Code (recommended)

Gmail App password (for testing email)

## Setup Instructions
Step 1: Clone the Repository
Ensure your project files are organized as below:

STOCK-CONTROL-SYSTEM-PYTHON/
├── stock_control_system/       # Flask backend
├── stock-control-frontend/     # Angular frontend
├── requirements.txt
Step 2: Set Up the MySQL Database
Open MySQL Workbench

## Create a new schema:

sql

CREATE DATABASE stock_control;
Open each .sql file from:
stock_control_system/db/
and execute them in order to create tables and insert seed data.

## Make sure to run:

stock_control_users.sql (includes apu1098avk@gmail.com as predefined admin)

stock_control_admins.sql

Followed by other schema files (products, orders, inventory, etc.)

Step 3: Run the Backend (Flask)
Open terminal:


cd stock_control_system
pip install -r ../requirements.txt
python app.py
The Flask app will run at:


http://127.0.0.1:5000
Step 4: Run the Frontend (Angular)
Open a new terminal:


cd stock-control-frontend
npm install
ng serve --o
The Angular app will run at:

http://localhost:4200

Predefined Users for Login
Role	Email	  Password

Admin	apu1098avk@gmail.com	Ujwala25

Client	vivek@gmail.com	vivek

## 🔐 Admin Registration and Approval Flow
New admin registrations require email approval.

Approval requests are sent to:
apu1098avk@gmail.com (Head Admin)

Once the admin clicks "Approve" in the email, the new admin account is activated.

If email sending doesn't work during testing:

Open MySQL

Set the user’s is_approved column to 1 manually in the users table.

## ✉️ Email Functionality
Email OTP and order receipts are sent using Gmail SMTP.

Make sure:

Your device has internet

Less secure apps access is allowed or an App Password is set

Sender email: apu1098avk@gmail.com

## Features Summary
Admin and client login

Email OTP for secure registration

Email approval workflow for new admins

Admin dashboard for:

Orders, supplier requests, predictions, discounts

Client dashboard for:

Browsing products, placing orders, viewing order history

Linear Regression-based product-wise future sales prediction (90 days)

Warehouse shelf management and supplier ordering

Automatic low stock alerts and report downloads



# Backend
cd stock_control_system
python app.py

# Frontend
cd stock-control-frontend
npm install
ng serve --o
Flask: http://127.0.0.1:5000

Angular: http://localhost:4200

## ❓ Examiner Notes
Ensure MySQL is running

Import .sql files from /db/ in correct order

Use predefined admin email: apu1098avk@gmail.com (Password: Ujwala25)

To test OTP and receipt: register as a client (vivek@gmail.com / vivek) enter a valid email address verify otp while registration and on click of payNow event on customer dashboard validated email address will receive a receipt of purchase

To test admin approval: register a new admin account (approval goes to apu1098avk@gmail.com)

Author
Apurva Kulkarni
Email: apu1098avk@gmail.com

Thank you for reviewing the Stock Control System!