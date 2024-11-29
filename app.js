const express = require("express");
const app = express();
const PORT = 3000;
const db = require("./db");

const crypto = require("crypto");

const flash = require("express-flash");
const passport = require("passport");
const session = require("express-session");


//import routes
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const task = require("./routes/task");
const category = require("./routes/category");
const { error } = require("console");

// Set the view engine to EJS
app.set("view engine", "ejs");

// Set the public folder for serving static files
app.use(express.static("public"));

// Middleware to parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Session setup
app.use(
  session({
    secret: crypto.randomBytes(30).toString("hex"), // Generates a 64-byte hex string,
    resave: false, // Only saves session if it’s modified, improving efficiency
    saveUninitialized: false, // Only creates session if data is added, reducing empty sessions for false else // Saves a session even if it hasn’t been modified for true
    cookie: {
      maxAge: 1000 * 60 * 30, // Sets the cookie expiration time in milliseconds (e.g., 5 minute here)
      secure: false, // Ensures cookies are sent over HTTPS only
      httpOnly: false, // Ensures cookies are only accessible by the web server, not client-side JavaScript
    },
  })
);

// Initialize Passport
app.use(passport.initialize()); //Passport wouldn’t be able to process authentication requests, which means user authentication would fail
app.use(passport.session()); //This middleware enables session management for authenticated users in your application.

app.use(flash());

// Use the router
app.use("/auth",authRoutes);
app.use("/task", task);
app.use("/category", category);
app.use(dashboardRoutes);

app.get("*", (req,res)=>{
return res.render("error",{error: "error 404: request not found"})
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
