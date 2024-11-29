const express = require("express");
const db = require("../db"); // Import the database connection
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const router = express.Router();
const passport = require("passport");
var LocalStrategy = require("passport-local");

router.get("/signUp", (req, res) => {
  res.render("register", { errors: {} });
});

//register the user and hash them with passport
router.post("/registerUser", (req, res) => {
  let { username, email, password, confirm } = req.body;
  console.log(req.body.confirm);

  // trimming the fields
  username = username.trim();
  email = email.trim();

  // Validation errors object
  const errors = {
    username: [],
    email: [],
    password: [],
    confirm: [],
  };

  let isValid = true;

  // Validate username
  if (!username) {
    isValid = false;
    errors.username.push("Please enter a username!");
  } else if (username.length < 3) {
    isValid = false;
    errors.username.push("username must be at least 3 characters long.");
  }

  // Validate email
  if (!email) {
    isValid = false;
    errors.email.push("Please enter a email!");
  } else if (email.length < 3) {
    isValid = false;
    errors.email.push("email must be at least 3 characters long.");
  }

  // Validate password
  if (!password) {
    isValid = false;
    errors.password.push("Please enter the password!");
  }

  // Validate confirm password
  if (!(password === confirm)) {
    isValid = false;
    errors.confirm.push("confirm password did not match with the password");
  }

  // If validation fails, re-render the form with errors
  if (!isValid) {
    return res.render("register", { errors });
  }

  // Check if the user already exists (based on username or email)
  db.query(
    "SELECT * FROM users WHERE email = ? OR username = ?",
    [email, username],
    (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Database error" });
      }

      if (results.length > 0) {
        isValid = false;
        if (results.some((user) => user.email === email))
          errors.email.push("Email already in use.");
        if (results.some((user) => user.username === username))
          errors.username.push("Username already taken.");
        return res.render("register", { errors });
      }

      console.log(username);

      //hash password
      bcrypt.hash(password, saltRounds, function (err, hash) {
        // Store hash in your password DB.
        if (err) {
          console.error("Error while hashing the password:", err);
          return res.render("error", { error: err });
        }
        console.log(hash);

        const query =
          "INSERT INTO users (username,email, password) VALUES (?, ?, ?)";

        db.query(query, [username, email, hash], (err, result) => {
          //error handling
          if (err) {
            console.error("Error inserting user:", err); // Log the error
            if (err) return res.render("error", { error: err });
            // Send error response
          }
          console.log("User registered with ID:", result.insertId);
          return res.redirect("login");
        });
      });
    }
  );
});

passport.use(
  //compare the username with the username provided
  new LocalStrategy(function verify(username, password, cb) {
    // trimming the fields
    username = username.trim();

    db.query(
      //this should be query
      "SELECT * FROM users WHERE username = ?",
      [username],
      function (err, users) {
        if (err) {
          console.error("Database error:", err);
          return cb(err);
        }

        // Check if users is undefined or the array is empty
        if (!users || users.length === 0) {
          console.log("user not found");
          return cb(null, false, {
            message: "Incorrect username or password.",
          });
        }

        const user = users[0];
        console.log(user); // this user is always an array make sure to use index

        // Load hash from your password DB.
        //password is the received password from the input
        //user.password is the password from the database
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            console.error("Error comparing passwords:", err);
            return cb(err); // Passes the error to Passport
          }
          if (!result) {
            // Incorrect password case
            console.log("incorrect password");
            return cb(null, false, {
              message: "Incorrect username or password.",
            });
          }
          console.log("authenticated successfully", user);
          return cb(null, user); // user is authenticated successfully
          //after this you are to use express-session middleware
        });
      }
    );
  })

  //compare the input password and the current password
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  console.log("Serializing user:", { id: user.id });
  done(null, user.id); // Store only the user ID in the session
});

//deserializeUser user
passport.deserializeUser(function (id, cb) {
  console.log("we are in deserializeUser");

  db.query("SELECT * FROM users WHERE id = ?", [id], function (err, user) {
    if (err) {
      console.error("Error deserializing user:", err);
      return cb(err); // Pass the error to Passport
    }

    console.log(user[0]);
    return cb(null, user[0]);
  });
});

// Login route
router.post(
  "/loginUser",
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/auth/login",
    failureFlash: true, // Enables flash messages
  })
);
// render login form
router.get("/login", (req, res) => {
  const error = req.flash("error")[0]; // Get the flash error message
  res.render("login", { error }); // Pass the error to the EJS template
});

// Logout route
router.get("/logout", (req, res) => {
  // Log the user out using Passport
  req.logout((err) => {
    if (err) {
      console.error("Error during logout:", err);
      return res.render("error", {
        error: "Error logging out, please try again.",
      });
    }
    // Successfully logged out, redirect to the login page
    return res.redirect("/login");
  });
});

module.exports = router;
