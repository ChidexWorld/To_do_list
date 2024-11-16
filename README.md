To-Do List Application

This is a web-based To-Do List Application built with Node.js, Express.js, EJS, and SQL. It allows users to create, read, update, and delete tasks (CRUD operations), as well as organize tasks into different categories for better management.
Features

    Add new tasks with an assigned category.
    View all tasks grouped by category.
    Update task details, including their category.
    Delete completed or unwanted tasks.
    Add, edit, and delete categories.

Technologies Used
Backend

    Node.js: Server-side runtime environment.
    Express.js: Backend framework for handling routes and logic.
    SQL (MySQL): Database for storing tasks and categories.
    MySQL2: To connect and interact with the database.

Frontend

    EJS (Embedded JavaScript Templates): To dynamically render content.
    CSS: For styling the application.

Installation
Prerequisites

    Node.js and npm installed on your system.
    MySQL server running.

Steps

    Clone the repository:

git clone https://github.com/ChidexWorld/To_do_list.git  

Navigate to the project directory:

cd todo-list  

Install dependencies:

npm install  

Set up the MySQL database:

    Create a database (e.g., todo_db).
    Import the provided SQL file (schema.sql or similar) to create the required tables (tasks and categories).

Configure the database connection:

    Open the .env file (or config.js if used) and add your MySQL connection details:

    DB_HOST=localhost  
    DB_USER=root  
    DB_PASSWORD=your_password  
    DB_NAME=todo_db  

Start the application:

npm start  

Open your browser and navigate to:

    http://localhost:3000  

Folder Structure

todo-list/  
│  
├── public/             # Static files (CSS, images, JS)  
├── views/              # EJS templates  
├── routes/             # Application routes  
├── controllers/        # Business logic  
├── models/             # Database queries and schema  
├── .env                # Environment variables  
├── package.json        # Node.js dependencies  
└── server.js           # Main entry point  

How It Works
Tasks

    Users can add tasks by specifying a title, description, and category.
    Tasks are displayed on the homepage, grouped by their categories.

Categories

    Users can create new categories to organize tasks.
    Categories can be edited or deleted.
    Deleting a category will not delete associated tasks but will unassign them from the category.

Database Structure
Tables

    Tasks: Stores information about each task, including its category ID.
    Categories: Stores category names and their unique IDs.

License

This project is licensed under the MIT License.
Contributions

Feel free to fork this repository, create a feature branch, and submit a pull request!
Author

Developed by Chidex Stanley.
