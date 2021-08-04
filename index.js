const morgan = require("morgan"); // require Morgan
const bodyParser = require("body-parser"); // require body-parser
const express = require("express"); // require Express
const uuid = require("uuid"); // require uuid
const mongoose = require("mongoose"); // require mongoose
const Models = require("./models.js"); // require defined file for models
const passport = require("passport");
const { check, validationResult } = require("express-validator");
require("./passport");

const app = express();
const books = Models.Book; // here we create a variable that stores the models for both books and users
const Users = Models.User;

// middleware
app.use(bodyParser.json()); // will parse JSON

//Local DB
mongoose.connect("mongodb://localhost:27017/buknessDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Atlas DB
// mongoose.connect(process.env.CONNECTION_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

app.use(morgan("common")); // just to log info on console about http requests
app.use(express.static("public")); // this allows files to fetch statically, within the public folder
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
}); // deals with error

//Cross-origin resource sharing
const cors = require("cors");
app.use(cors()); //end of CORS

let auth = require("./auth")(app); // it is placed here because it needs to be AFTER body parser is called.

// GET homepage
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html"); // dirname allows node to start by the current directory
});

// GET documentation
app.get("/documentation", (req, res) => {
  res.sendFile(__dirname + "/public/documentation.html");
});

// GET all books
app.get(
  "/API/books",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    books.find()
      .then((books) => res.json(books))
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// GET books by title
app.get(
  "/API/books/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    books.find({ Title: req.params.title })
      .then((book) => res.json(book))
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// Get all users
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// GET a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ Name: req.params.Username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// POST register a new user
app.post(
  "/users",
  [
    check("Name", "Username longer than 5 characters is required").isLength({
      min: 5,
    }),
    check(
      "Name",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric("en-US", { ignore: " " }),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ $or: [{ Name: req.body.Name }, { Email: req.body.Email }] })
      .then((user) => {
        if (user) {
          return res
            .status(400)
            .send(
              "'" +
                req.body.Name +
                "'" +
                " username already exists, or the introduced email is already been used. Please try again."
            );
        } else {
          Users.create({
            Name: req.body.Name,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// POST a book to a user's list of favorites
app.post("/users/:Username/Books/:BookID", (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    {
      $addToSet: { FavouriteBooks: req.params.BookID },
    },
    { new: true } // This line makes sure that the updated document is returned
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});
// DELETE a book to a user's list of favorites
app.delete("/users/:Username/Books/:BookID", (req, res) => {
  Users.findOneAndUpdate(
    { Name: req.params.Username },
    {
      $pull: { FavouriteBooks: req.params.BookID },
    },
    { new: true } // This line makes sure that the updated document is returned
  )
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// PUT to update a user's info, by username
app.put(
  "/users/:Name",
  [
    check("Name", "Username longer than 5 characters is required").isLength({
      min: 5,
    }),
    check(
      "Name",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric("en-US", { ignore: " " }),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { Name: req.params.Name },
      {
        $set: {
          Name: req.body.Name,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true } // This line makes sure that the updated document is returned
    )
      .then((updatedUser) => {
        res.status(201).json(updatedUser);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

// DELETE a user by username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Name: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

//redirects wrong urlendpoints to homepage
app.all("*", function (req, res) {
  res.redirect("/");
});

// listen for requests
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port: " + port);
});
