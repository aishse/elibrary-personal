# eLibrary

## CS157A Team Project -> extended by Anishka Chauhan

### Overview
Reading is essential for acquiring knowledge and information. It has been statistically proven that reading improves overall quality of life. However, keeping track of progress in multiple books can be difficult, and finding quality books to read can be hard without feedback from other readers. 

Our application, eLibrary, is a virtual bookshelf similar to GoodReads, Google Books, and Storygraph. Users will be able to borrow and request books. They will also be able to bookmark their place in the current books they are reading and organize books into user-defined categories. Users can post reviews for books and comment on other users’ reviews. They can also interact with other users through book clubs. Additionally, users will be able to follow their friends on the eLibrary. Once following, they will be able to view their friends’ Activity Feeds. 

### **Features**  
- **User Account Management**  
  - Register and log in with a unique username and password.  
  - Authenticate users to secure access to personal accounts.  

- **Book Borrowing and Hold Requests**  
  - Borrow and return books.
  - Place hold requests and auto-borrow when the book becomes available.  

- **Bookmarking and Organization**  
  - Bookmark current reading progress.  
  - Organize books into user-customizable bookshelves (e.g., "Favorites," "To Be Read").  

- **Community Interaction**  
  - Post reviews and rate books (1-5 stars).  
  - Comment on other users’ reviews and engage in discussions.  
  - Create and join book clubs to connect with other readers.  

- **Social Features**  
  - Follow friends to view their review activity.  

- **Search and Discovery**  
  - Search for books by title and author

### Technology Stack
This project uses React, TypeScript, CSS, Next.js and MySQL (data). 

### Division of Work
This project was created as part of SJSU's CS157A Final Project. The students involved were: Anishka Chauhan, Kaitlyn Chiu, Chau Dang, Harsita Keerthikanth, Xiao Qi Lee. 
- **Harsita Keerthikanth**
  - Normalized schema to be in BCNF
  - Created SQL tables
  - Designed UI and implemented consistent styling across the app
  - Created login and user registration functionality
  - Created navigation bar and linked pages
  - Wrote final report
  - Wrote project README
  - Created + designed final project presentation slides
- **Anishka Chauhan**
  - Created project proposal overview
  - Created SQL Schema Main entities
  - Completed Normalization to BCNF
  - Wrote SQL queries and created API endpoints
  - Created application frontend (Browse Books, Review, Comments)
  - Wrote final report
- **Kaitlyn Chiu**
  - Created project proposal non-functionalities
  - Created ER Diagram
  - Updated SQL Schema to include relationships
  - Completed Normalization to BCNF
  - Wrote CREATE TABLE Statements
  - Wrote SQL queries and created API endpoints
  - Created application frontend (Account, My Books, Bookshelf, Book Clubs, Activity)
   - Wrote final report
- **Chau Dang**
  - Insert statements for Book, Author, and Genre, Book_Has_Genre, and Book_Has_Author
  - Completed Normalization to BCNF
  - Wrote CREATE TABLE Statements
  - Wrote final report
- **Xiao Qi Lee**
  - Created project proposal functionalities
  - ER diagram edits/review
  - Completed Normalization to BCNF
  - Updated SQL Schema to include types
  - Wrote CREATE TABLE Statements
  - Insert statements for Book, Author, and Genre, Book_Has_Genre, and Book_Has_Author
  - Created indexes for efficient querying
  - Wrote final report

## Project Setup

### Next.js Application
Clone the github code for the Next.js application. Ensure all required dependencies are installed:  
``` 
npm install
```

### Setting up MySQL 
Ensure that a MySQL server is running on port ```3306```, and the database is already created using ```createdb.sql```. Use ```inserts.sql``` to insert data into the database. Use ```dropdb.sql``` to drop the database. Remember your database username, password, and name.

### .env file configuration 
Make sure a .env file is created in the **root** directory of the Next.js application. 

```
ELibrary/
|---documents
|---public
|---src
|---[other files]
|---.env
...
```

This env file is for the MySQL database credentials. Copy and paste the template .env provided below, and replace any of the relevant credentials if necessary. 

```
DB_HOST=localhost
DB_USER=root
DB_NAME=test_database
DB_PASSWORD= 
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```
If the credentials for your MySQL server are the same as provided, then just copy paste. 

Upon running the next.js application, the e-library application should be functional. 

## Getting Started
First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
