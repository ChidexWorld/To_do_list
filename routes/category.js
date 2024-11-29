const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/category", (req, res) => {
  res.render("category", { error: undefined });
});

// CREATE: Add a new category
router.post("/add", (req, res) => {
  const { name } = req.body;

  // Manual validation for 'name'
  if (!name || name.trim() === "") {
    return res.render("category", { error: "Category name is required!" });
  }

  if (name.length < 3) {
    return res.render("category", {
      error: "Category name must be at least 3 characters long.",
    });
  }

  const userId = req.user.id;

  const sql = "INSERT INTO categories (name, userId) VALUES (?, ?)";
  db.query(sql, [name, userId], (err) => {
    console.log(err);
    if (err) {
      return res.render("category", {
        error: "Failed to add category. Please try again later.",
        name,
      });
    }

    return res.redirect("/");
  });
});

// Show the edit form with the existing category name
router.get("/edit/:id", (req, res) => {
  const categoryId = req.params.id;
  const userId = req.user.id;

  const sql = "SELECT * FROM categories WHERE id = ? AND userId = ?";
  db.query(sql, [categoryId, userId], (err, results) => {
    if (err) return res.sendStatus(500);
    if (results.length > 0) {
      res.render("editCategory", { category: results[0], error: undefined }); // Pass category data to the form
    } else {
      return res.render("error", { error: "Category not found" });
      // res.send("Category not found");
    }
  });
});

// UPDATE: Edit a category
router.post("/edit/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  // Manual validation for 'name'
  if (!name || name.trim() === "") {
    return res.render("category", {
      error: "Category name is required!",
    });
  }

  if (name.length < 3) {
    return res.render("category", {
      error: "Category name must be at least 3 characters long.",
    });
  }

  const sql = "UPDATE categories SET name = ? WHERE id = ?";
  db.query(sql, [name, id], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

// Show warning b4 deleting
router.get("/delete/:id", (req, res) => {
 
   const categoryId = req.params.id;
   const userId = req.user.id;

   const sql = "SELECT * FROM categories WHERE id = ? AND userId = ?";
   db.query(sql, [categoryId, userId], (err, results) => {
     if (err) return res.sendStatus(500);
     if (results.length > 0) {
       res.render("deleteCategory", { category: results[0] }); // Pass category data to the form
     } else {
       res.send("Category not found");
     }
   });
});

// DELETE: Remove a category
router.post("/delete", (req, res) => {
  const { id } = req.body;

  const sql = "DELETE FROM categories WHERE id = ?";
  db.query(sql, [id], (err) => {
    if (err) throw err;
    res.redirect("/");
  });
});

module.exports = router;
