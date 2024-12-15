# Library Management System

## Overview
This project is a backend system for a Library Management System. The system allows users to manage accounts (Readers and Authors), perform CRUD operations on books, and handle book borrowing and returning processes.

---

## Features
### 1. User Account Management
- Readers and Authors can create accounts.
- Store user information such as:
  - **Readers:** Name, email, password, and borrowed books list.
  - **Authors:** Name, email, password, and books written list.
- Endpoints for updating or deleting user accounts.
- "Remember Me" functionality ensures session validity for 15 days.

### 2. CRUD Operations for Books
- **Authors** can:
  - Add new books (title, author, genre, and stock).
  - View their uploaded books and currently borrowed books.
  - Update or delete book information.
- **Readers** can:
  - View all books or search by title, author, or genre.
  - Update their profiles or delete their accounts.

### 3. Borrowing and Returning Books
- Readers can borrow books if they are in stock (up to 5 books at a time).
- Stock is adjusted when books are borrowed or returned.
- Borrowed books are tracked in the Reader’s profile.

---

## Technologies Used
- **Programming Language:** TypeScript , Javascript
- **Framework:** Express.js (Node.js)
- **Database:** MongoDB

---

## API Endpoints

### User Management
| Endpoint                   | Method | Description                                      |
|----------------------------|--------|--------------------------------------------------|
| `/users/signup`            | POST   | Register a new user account (Reader/Author).     |
| `/users/login`             | POST   | Authenticate user credentials and return a session token. |
| `/users/update/:id`        | PUT    | Update user details like name or password.       |
| `/users/delete/:id`        | DELETE | Delete a user account.                          |
| `/users/session/validate`  | GET    | Validate the current session token.             |

### Book Management
| Endpoint                   | Method | Description                                      |
|----------------------------|--------|--------------------------------------------------|
| `/books/create`            | POST   | Add a new book (Authors only).                  |
| `/books`                   | GET    | Retrieve all books or search by title/author/genre. |
| `/books/author/:id`        | GET    | Retrieve books created by an author and borrowed book list. |
| `/books/update/:id`        | PUT    | Update book details (Authors only).             |
| `/books/delete/:id`        | DELETE | Delete a book from the system (Authors only).   |

### Borrowing and Returning Books
| Endpoint                   | Method | Description                                      |
|----------------------------|--------|--------------------------------------------------|
| `/reader/profile`          | POST   | Create or manage a Reader’s profile.            |
| `/reader/books/borrow`     | POST   | Borrow a book (Readers only).                   |
| `/reader/books/return`     | POST   | Return a borrowed book (Readers only).          |
| `/reader/books/:id`        | GET    | View all books borrowed by a specific Reader.   |

---


