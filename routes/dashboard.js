const express = require("express");
const router = express.Router();
const db = require("../db");
const isAuthenticated = require("./isAuthenticated");

// Define a sample route to render an EJS page
router.get("/", isAuthenticated, (req, res) => {
  const userId = req.user.id; // Example userId
  
  const cateSql = "SELECT id, name, userId FROM categories WHERE userId = ?";
  const taskSql = `SELECT tasks.id AS id, tasks.title, tasks.description, tasks.due_date, tasks.status, categories.name AS category_name FROM tasks JOIN categories ON tasks.categoryId = categories.id WHERE tasks.userId = ?;`;

  // Query categories first 
  db.query(cateSql, [userId], (err, categories) => {
    if (err) {
      console.log("from the cat", err);
      return res.render("error", { error: err });
    }
    // Query tasks after categories have been fetched
    db.query(taskSql, [userId], (err, tasks) => {
      if (err) {
        console.log("from the task");
        return res.render("error", { error: err });
      }

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
        categories: categories.length > 0 ? categories : null, // If no categories, pass null
        tasks: tasks.length > 0 ? tasks : null, // If no tasks, pass null
        user: req.user,
      });
    });
  });
});

module.exports = router;
