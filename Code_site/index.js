// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************


app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.get('/register', (req, res) => {
    res.render('pages/register');
});

app.post('/register', async (req, res) => {
    try {
        // hash the password using bcrypt library
        const hash = await bcrypt.hash(req.body.password, 10);
        
        // Insert username and hashed password into the 'users' table
        // This is a hypothetical function and will depend on your database setup
        const result = await insertUser(req.body.username, hash);

        if (result) {
            // If the data has been inserted successfully, redirect to /login
            res.redirect('/login');
        } else {
            // If there's an error inserting data, redirect back to /register
            res.redirect('/register');
        }
    } catch (err) {
        console.error('Error registering user:', err);
        res.redirect('/register');
    }
});

// Hypothetical insertUser function
// This is a placeholder and you'd replace this with your actual database insertion code
async function insertUser(username, hashedPassword) {
    // This is where you'd insert the username and hashed password into your database
    // For example, if you're using MySQL: 
    await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    // And then return true upon successful insertion or false upon an error


    // For the purpose of this example, let's return true to indicate a successful insertion
    return true;
}



// Assuming you have a database connection set up and you can access your users table via some `UserModel`

// GET /login
app.get('/login', (req, res) => {
    res.render('pages/login');
});

// POST /login
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log("asd");
    

    try {
        // Find the user by the given username

        // If user not found
        const query = 'Select password from users where username = $1';
        const user = await db.any(query,req.body.username);
        // Check if password matches
        console.log(user);
        const match = await bcrypt.compare(req.body.password, user[0].password);
        console.log(match);
        if (!match) {
            // Password doesn't match
            res.locals.errorMessage = 'Incorrect password';  // You can pass additional variables to your EJS templates
           
            return res.render('pages/login'); // Render the login page with an error message
        }
        else{
            // If all checks pass, save user details in session and redirect to /discover
            console.log("inside");
            req.session.user = user;
            req.session.save();
            res.redirect('/discover');
        }

        

    } catch (error) {
        // If there's a database or other error
        res.locals.errorMessage = 'An error occurred during login. Please try again later.';
        res.render('pages/login');
    }
});

module.exports = app;

app.get('/discover', async (req, res) => {
  try {
      const response = await axios({
          url: 'https://app.ticketmaster.com/discovery/v2/events.json',
          method: 'GET',
          headers: {
              'Accept-Encoding': 'application/json',
          },
          params: {
              apikey: process.env.API_KEY,
              // keyword: 'artist', // you can change this
              size: 10 // fetch 10 events
          }
      });

      const events = response.data._embedded ? response.data._embedded.events : [];
      console.log(events);
      console.log(response.data);

      // Render the view with the fetched events
      res.render('pages/discover', { events });

  } catch (error) {
      console.error(error);
      res.render('pages/discover', { results: [], errorMessage: 'An error occurred.' });
  }
});

app.get('/logout', (req, res) => {
    req.session.destroy(err => {
      if (err) {
        return res.send('Error logging out');
      }
      res.redirect('/login');
    });
  });
  


// TODO - Include your API routes here

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');