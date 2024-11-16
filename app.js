const express = require("express");
const app = express();
const PORT = 3000;
const db = require("./db");

//import
const task = require("./routes/task");
const category = require("./routes/category");

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the public folder for serving static files
app.use(express.static("public"));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Use the router
app.use("/task", task);
app.use("/category", category);

// Define a sample route to render an EJS page
app.get("/", (req, res) => {
  const cateSql = "SELECT * FROM categories";
  const taskSql = `  SELECT tasks.*, categories.name AS category_name FROM tasks LEFT JOIN categories ON tasks.category_id = categories.id
`;

  // Query categories first
  db.query(cateSql, (err, categories) => {
    if (err) return res.status(500).send("server error", err);

    // Query tasks after categories have been fetched
    db.query(taskSql, (err, tasks) => {
      if (err) return res.status(500).send({ "server error": err });

      // Format the due_date to display as "Wed Nov 13 2024"
      tasks = tasks.map((task) => ({
        ...task,
        due_date: new Date(task.due_date).toLocaleDateString("en-US", {
          weekday: "short", // "Wed"
          month: "short", // "Nov"
          day: "numeric", // "13"
          year: "numeric", // "2024"
        }),
      }));

      // Render the page after both queries have finished
      res.render("index", {
        title: "Home Page",
        categories: categories,
        tasks: tasks,
      });
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
