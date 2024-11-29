const express = require("express");
const router = express.Router();
const db = require("../db");
const isAuthenticated = require("./isAuthenticated");

// Show the form to create a task
router.get("/newTask", isAuthenticated, (req, res) => {
  const userId = req.user.id;

  const sql = "SELECT * FROM categories WHERE userId = ?"; // Assuming you have a categories table
  db.query(sql, [userId], (err, categories) => {
    if (err) return res.render("error", { error: err });
    res.render("task", { categories, errors: undefined });
  });
});

//insert new task
router.post("/newTasks", isAuthenticated, (req, res) => {
  const { title, description, due_date, categoryId } = req.body;

  const errors = {
    title: [],
    description: [],
    due_date: [],
    categoryId: [],
  };

  let isValid = true;

  // Validation for title
  if (!title) {
    isValid = false;
    errors.title.push("please enter a title!");
  } else if (title.length < 3) {
    isValid = false;
    errors.title.push("task title must be at least 3 characters long.");
  }

  // Validation for description
  if (!description) {
    isValid = false;
    errors.description.push("please enter the description!");
  } else if (description.length < 3) {
    isValid = false;
    errors.description.push(
      "task description must be at least 3 characters long."
    );
  }

  // Validation for due_date
  if (!due_date) {
    isValid = false;
    errors.due_date.push("Please enter the due date!");
  }

  // Validation for categoryId
  if (!req.body.categoryId) {
    isValid = false;
    errors.categoryId.push("categoryId not found");
  }

  // If validation fails, fetch categories and render form with errors
  if (!isValid) {
    const sql = "SELECT * FROM categories";
    return db.query(sql, (err, categories) => {
      if (err) {
        console.error("Error fetching categories:", err);
        return res.render("error", { error: err });
      }
      res.render("task", { categories, errors });
    });
  }
  const userId = req.user.id;
  const sql =
    "INSERT INTO tasks (title, description, due_date, categoryId, userId) VALUES (?, ?, ?, ?,?)";
  db.query(sql, [title, description, due_date, categoryId, userId], (err) => {
    if (err) {
      console.log("error in insert", err);
      return res.render("error", { error: err });
    }
    res.redirect("/"); // Redirect to the list of tasks
  });
});

// Show the edit form for a specific task
router.get("/edit/:id", isAuthenticated, (req, res) => {
  const userId = req.user.id;
  const taskId = req.params.id;

  // Fetch task details and categories
  const taskSql = "SELECT * FROM tasks WHERE id = ? AND userId = ?";
  const categorySql = "SELECT * FROM categories WHERE userId = ?";

  // Fetch the task to ensure it belongs to the logged-in user
  db.query(taskSql, [taskId, userId], (err, taskResults) => {
    if (err) {
      console.error("Error fetching task:", err);
      return res.status(500).send("Server error");
    }

    const task = taskResults[0]; // Task details

    // Fetch categories to display in a dropdown
    db.query(categorySql, [userId], (err, categories) => {
      if (err) {
        console.error("Error fetching categories:", err);
        return res.status(500).send("Server error");
      }

      res.render("editTask", { task, categories, errors: {} });
    });
  });
});

/// Update task details
router.post("/edit/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;
  const { title, description, due_date, categoryId } = req.body;

  // Validation errors object
  const errors = {
    title: [],
    description: [],
    due_date: [],
    categoryId: [],
  };

  let isValid = true;

  // Validate title
  if (!title) {
    isValid = false;
    errors.title.push("Please enter a title!");
  } else if (title.length < 3) {
    isValid = false;
    errors.title.push("Title must be at least 3 characters long.");
  }

  // Validate description
  if (!description) {
    isValid = false;
    errors.description.push("Please enter a description!");
  } else if (description.length < 3) {
    isValid = false;
    errors.description.push("Description must be at least 3 characters long.");
  }

  // Validate due_date
  if (!due_date) {
    isValid = false;
    errors.due_date.push("Please enter the due date!");
  }

  // Validate categoryId
  if (!categoryId) {
    isValid = false;
    errors.categoryId.push("Please select a category.");
  }

  // If validation fails, re-render the form with errors
  if (!isValid) {
    const categorySql = "SELECT * FROM categories";
    return db.query(categorySql, (err, categories) => {
      if (err) {
        console.error("Error fetching categories:", err);
        return res.status(500).send("Server error");
      }
      res.render("editTask", {
        task: { id, title, description, due_date, categoryId },
        categories,
        errors,
      });
    });
  }

  // Update the task if validation passed
  const sql =
    "UPDATE tasks SET title = ?, description = ?, due_date = ?, categoryId = ? WHERE id = ?";
  db.query(sql, [title, description, due_date, categoryId, id], (err) => {
    if (err) {
      console.error("Error updating task:", err);
      return res.status(500).send("Server error");
    }
    res.redirect("/"); // Redirect to the tasks list
  });
});

router.post("/updateTaskStatus", isAuthenticated, (req, res) => {
  const { taskId, status } = req.body;
  const updateSql = "UPDATE tasks SET status = ? WHERE id = ?";

  db.query(updateSql, [status, taskId], (err, result) => {
    if (err) {
      console.error("Error updating task status:", err);
      return res.status(500).send("Failed to update task status");
    }
    res.redirect("/"); // Redirect back to the home page to show the updated status
  });
});

// Show warning b4 deleting
router.get("/delete/:id", isAuthenticated, (req, res) => {
  const { id } = req.params;

  // Manual validation: Check if the id is a number
  if (isNaN(id)) {
    return res.status(400).send("Invalid category ID.");
  }

  const sql = "SELECT * FROM tasks WHERE id = ?";
  db.query(sql, [id], (err, results) => {
    if (err) return res.sendStatus(500);
    if (results.length > 0) {
      res.render("deleteTask", { task: results[0] }); // Pass task data to the form
    } else {
      res.send("Category not found");
    }
  });
});

// DELETE: Remove a task
router.post("/delete", isAuthenticated, (req, res) => {
  const { id } = req.body;

  const sql = "DELETE FROM tasks WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) return res.sendStatus(500);
    res.redirect("/");
  });
});

module.exports = router;
  