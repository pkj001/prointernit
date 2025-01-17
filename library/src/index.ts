// Import dependencies
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

// Middleware
app.use(express.json());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/library", {
  // Removed deprecated options
});

// Schemas and Models
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["Reader", "Author"] },
  borrowedBooks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }], // Fixed ID type
  booksWritten: [{ type: mongoose.Schema.Types.ObjectId, ref: "Book" }],
});

const BookSchema = new mongoose.Schema({
  title: String,
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Fixed ID type
  genre: String,
  stock: Number,
  borrowedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Fixed ID type
});

const User = mongoose.model("User", UserSchema);
const Book = mongoose.model("Book", BookSchema);

// Authentication middleware
const authenticate = async (req: any, res: any, next: any) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access Denied");

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET || "secretKey"); // Use environment variable
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};

// Routes

// User Signup
app.post("/users/signup", async (req: any, res: any) => {
  const { name, email, password, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
    role,
    borrowedBooks: [],
    booksWritten: [],
  });

  try {
    await user.save();
    res.status(201).send("User registered successfully");
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

// User Login
app.post("/users/login", async (req: any, res: any) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).send("Email not found");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send("Invalid password");

  const token = jwt.sign({ _id: user._id, role: user.role }, process.env.JWT_SECRET || "secretKey", {
    expiresIn: "15d",
  });

  res.header("Authorization", token).send({ token });
});

// CRUD Operations for Books (Authors only)
app.post("/books/create", authenticate, async (req: any, res: any) => {
  if (req.user.role !== "Author")
    return res.status(403).send("Access Denied");

  const { title, genre, stock } = req.body;

  const book = new Book({
    title,
    author: req.user._id,
    genre,
    stock,
    borrowedBy: [],
  });

  try {
    await book.save();
    res.status(201).send("Book added successfully");
  } catch (err: any) {
    res.status(400).send(err.message);
  }
});

app.get("/books", async (req: any, res: any) => {
  const { title, author, genre } = req.query;

  const filters = {};
//   if (title) filters.title = { $regex: title, $options: "i" };
//   if (author) filters.author = { $regex: author, $options: "i" };
//   if (genre) filters.genre = genre;

  const books = await Book.find(filters).populate("author", "name");
  res.send(books);
});

// Borrow Book (Readers only)
app.post("/reader/books/borrow", authenticate, async (req: any, res: any) => {
  if (req.user.role !== "Reader")
    return res.status(403).send("Access Denied");

  const { bookId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(bookId))
    return res.status(400).send("Invalid book ID");

  const book = await Book.findById(bookId);

  if (!book || book.stock <= 0)
    return res.status(400).send("Book not available");

  const user = await User.findById(req.user._id);
  if (user.borrowedBooks.length >= 5)
    return res.status(400).send("Borrowing limit reached");

  book.stock -= 1;
  book.borrowedBy.push(user._id);
  user.borrowedBooks.push(book._id);

  await book.save();
  await user.save();

  res.send("Book borrowed successfully");
});

// Return Book
app.post("/reader/books/return", authenticate, async (req: any, res: any) => {
  if (req.user.role !== "Reader")
    return res.status(403).send("Access Denied");

  const { bookId } = req.body;
  if (!mongoose.Types.ObjectId.isValid(bookId))
    return res.status(400).send("Invalid book ID");

  const book = await Book.findById(bookId);

  if (!book) return res.status(400).send("Invalid book");

  const user = await User.findById(req.user._id);
  user.borrowedBooks = user.borrowedBooks.filter((id: any) => id.toString() !== bookId);
  book.stock += 1;
  book.borrowedBy = book.borrowedBy.filter((id: any) => id.toString() !== user._id.toString());

  await book.save();
  await user.save();

  res.send("Book returned successfully");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
