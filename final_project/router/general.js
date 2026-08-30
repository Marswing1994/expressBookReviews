const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Unable to register user. Username and password are required."});
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(404).json({message: "User already exists!"});
  }

  users.push({username, password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 10: Get the book list available in the shop, using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:8800/');
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    return res.status(500).json({message: "Error retrieving book list", error: error.message});
  }
});

// Task 11: Get book details based on ISBN, using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get('http://localhost:8800/isbn/' + isbn);
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({message: "Error retrieving book for ISBN " + isbn, error: error.message});
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book, null, 4));
  } else {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }
 });
  
// Task 12: Get book details based on author, using async-await with Axios
public_users.get('/async/author/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get('http://localhost:8800/author/' + encodeURIComponent(author));
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({message: "Error retrieving books for author " + author, error: error.message});
  }
});

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const isbns = Object.keys(books);

  let matches = {};
  isbns.forEach((isbn) => {
    if (books[isbn].author === author) {
      matches[isbn] = books[isbn];
    }
  });

  if (Object.keys(matches).length > 0) {
    return res.status(200).send(JSON.stringify(matches, null, 4));
  } else {
    return res.status(404).json({message: "No books found for author " + author});
  }
});

// Task 13: Get all books based on title, using async-await with Axios
public_users.get('/async/title/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get('http://localhost:8800/title/' + encodeURIComponent(title));
    return res.status(200).send(JSON.stringify(response.data, null, 4));
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({message: "Error retrieving books for title " + title, error: error.message});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const isbns = Object.keys(books);

  let matches = {};
  isbns.forEach((isbn) => {
    if (books[isbn].title === title) {
      matches[isbn] = books[isbn];
    }
  });

  if (Object.keys(matches).length > 0) {
    return res.status(200).send(JSON.stringify(matches, null, 4));
  } else {
    return res.status(404).json({message: "No books found for title " + title});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).send(JSON.stringify(book.reviews, null, 4));
  } else {
    return res.status(404).json({message: "Book not found for ISBN " + isbn});
  }
});

module.exports.general = public_users;
