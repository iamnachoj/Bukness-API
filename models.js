const mongoose = require("mongoose"); // require mongoose
const bcrypt = require("bcrypt");

let bookSchema = mongoose.Schema({
  Title: { type: String, required: true },
  Description: { type: String, required: true },
  Genre: {
    Name: String,
    Description: String,
  },
  Author: {
    Name: String,
    Bio: String,
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean,
});

let userSchema = mongoose.Schema({
  Name: { type: String, required: true },
  Password: { type: String, required: true },
  Email: { type: String, required: true },
  Birthday: { type: Date, required: true },
  FavouriteBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10);
}; //what does the actual hashing of submitted passwords.
userSchema.methods.validatePassword = function (password) {
  return bcrypt.compareSync(password, this.Password);
}; //what compares submitted hashed passwords with the hashed passwords stored in your database.

let Book = mongoose.model("Book", bookSchema);
let User = mongoose.model("User", userSchema);

module.exports.Book = Book;
module.exports.User = User;
