[comment]: # (You may find the following markdown cheat sheet useful: https://www.markdownguide.org/cheat-sheet/. You may also consider using an online Markdown editor such as StackEdit or makeareadme.) 

## Project title: Stock Control System

### Student name: Apurva Vivek Kulkarni

### Student email: avk7@student.le.ac.uk

### Project description: 

The Stock Control System is a web-based application designed to manage and monitor stock levels of computer components in a computer warehouse. It ensures real-time inventory tracking, optimizes the stock assembly process, and enhances operational efficiency by providing accurate reporting and invoicing features. The system helps warehouse managers prevent stock shortages, reduce excess inventory, and improve overall productivity.
A key feature of this system is location tracking, which allows precise identification of where each item is stored or moved during stock assembly. Additionally, the system integrates computer services, including computer maintenance, system design, software development, software installation, and disaster recovery services, making it a comprehensive solution for IT asset management.
The application supports user roles and access control, ensuring secure handling of stock information. With automated alerts, reporting tools, and invoicing capabilities, the system helps businesses maintain financial records and optimize inventory operations. It also provides graphical insights into stock trends, supports multi-user access, and enables cloud-based deployment for scalability.
By implementing the Stock Control System, businesses can streamline inventory processes, enhance stock visibility, and ensure accurate record-keeping, ultimately improving warehouse efficiency and reducing operational risks.


### List of requirements (objectives): 

[comment]: # (You can add as many additional bullet points as necessary by adding an additional hyphon symbol '-' at the end of each list) 

Essential:
1.	Centralized Inventory Management System: The system allows businesses to track stock levels of computer components in real-time, ensuring accurate stock records. It helps prevent overstocking or stock shortages by dynamically updating inventory as items are added, removed, or relocated.

2.	Real-time Stock Movement and Location Tracking: Each item’s exact location within the warehouse is recorded and updated during the stock assembly process. This ensures efficient stock retrieval and prevents misplacement of inventory. Automated low-stock alerts and notifications.

3.	Automated Low-stock Alerts and Notifications: The system sends alerts when inventory levels reach predefined thresholds, enabling warehouse managers to reorder components before they run out. This minimizes downtime and prevents disruptions in operations.

4.	Role-based User Authentication and Access Control: Different user roles, such as admin, warehouse staff, and finance team, have specific permissions to ensure secure handling of stock data and transactions. Unauthorized access is restricted to maintain system security. Reporting and data visualization tools for inventory analysis.

5.	Reporting and Data Visualization Tools: Users can generate real-time inventory reports, track stock trends, and analyze stock movement history. Reports can be exported in formats like PDF, CSV, or Excel for business insights and audits. Secure database storage and backup solutions.

6. Role-based User Authentication and Access Control: Different user roles, such as admin, warehouse staff, and finance team, have specific permissions to ensure secure handling of stock data and transactions. Unauthorized access is restricted to maintain system security.

7. Reporting and Data Visualization Tools: Users can generate real-time inventory reports, track stock trends, and analyze stock movement history. Reports can be exported in formats like PDF, CSV, or Excel for business insights and audits.

8. Invoicing System for Sales and Purchases: The system generates invoices for stock transactions, maintains records of purchases and sales, and supports different payment methods and tax calculations.

9. Secure Database Storage and Backup Solutions: The system ensures data integrity with encrypted storage and automated backups, preventing data loss and ensuring quick recovery in case of failures.

10. Integration of Computer Services: The system supports additional computer services, including maintenance, system design, software development, software installation, and disaster recovery solutions, making it a comprehensive IT asset management tool.


Desirable:
- Desirable requirement 1
1.Barcode/QR code scanning for easier stock tracking.
- Desirable requirement 2
2.AI-based demand forecasting for stock replenishment
- Desirable requirement 3
3.Warehouse mapping and visualization tools.
- Desirable requirement 4
4.Integration with third-party accounting and ERP systems.

Optional:
- Optional requirement 1
1.AI-powered chatbot assistance for customer support
- Optional requirement 2
2.Voice-command stock retrieval system.
- Optional requirement 3
3.Mobile application for stock management on the go.
- Optional requirement 4
4.Multi-language support for international usability.


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

To test OTP and receipt: register as a client (vivek@gmail.com / vivek) 

To test admin approval: register a new admin account (approval goes to apu1098avk@gmail.com)

Author
Apurva Kulkarni
Email: apu1098avk@gmail.com

Thank you for reviewing the Stock Control System!