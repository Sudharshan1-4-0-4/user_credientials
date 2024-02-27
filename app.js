const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const bcrypt = require("bcrypt");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "user_information.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(process.env.PORT || 3008, () => {
      console.log("Server Running at http://localhost:3008/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/users/", async (request, response) => {
  const getUsersQuery = `
  SELECT
    *
  FROM
    user
  ORDER BY
    id;`;
  const usersArray = await db.all(getUsersQuery);
  response.send(usersArray);
});

//Registe_API!!!

app.post("/register/", async (request, response) => {
  const { name, phone, email, password } = request.body;
  const hashedPassword = await bcrypt.hash(request.body.password, 10);
  const selectUserQuery = `SELECT * FROM user WHERE name = '${name}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    const createUserQuery = `
      INSERT INTO 
        user (name, phone, email, password) 
      VALUES 
        (
          '${name}', 
          '${phone}',
          '${email}', 
          '${hashedPassword}'
          
        )`;
    const dbResponse = await db.run(createUserQuery);
    const newUserId = dbResponse.lastID;
    response.send(`Created new user with ${newUserId}`);
  } else {
    response.status = 400;
    response.send("User already exists");
  }
});

//Login_API!!!!

app.post("/login", async (request, response) => {
  const { name, password } = request.body;
  const selectUserQuery = `SELECT * FROM user WHERE name = '${name}'`;
  const dbUser = await db.get(selectUserQuery);
  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid User");
  } else {
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);
    if (isPasswordMatched === true) {
      response.send("Login Success!");
    } else {
      response.status(400);
      response.send("Invalid Password");
    }
  }
});

app.get("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const userdetailsquery = `SELECT * FROM user WHERE id = ${userId};`;
  const res1 = await db.get(userdetailsquery);
  response.send(res1);
});

//API-5 delete method
app.delete("/users/:userId/", async (request, response) => {
  const { userId } = request.params;
  const deletequery = `DELETE FROM user WHERE id = ${userId};`;
  const res4 = await db.run(deletequery);
  response.send("Todo Deleted");
});

module.exports = app;
