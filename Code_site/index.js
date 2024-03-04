// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************
const http = require('http');
const { Server } = require("socket.io");
const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.
const { log } = require('console');
const server = http.createServer(app); // Wrap the Express app
const io = new Server(server); // Attach socket.io to the server

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


app.get('/chat', (req, res) => {
  res.render('chat');
});

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('chat message', (msg) => {
    io.emit('chat message', msg); // This should broadcast to all users
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

app.get('/', (req, res) => {
    res.redirect('/discover');
});


app.post('/register', async (req, res) => {
  // Capture all form data
  const {
    username, first_name, last_name, phone, email, password, city, university_name, location_preference,
    price_min, price_max, min_area, max_area, furnished, bedrooms, gender, budget, location, university, pets,
    language, sleep_time, wake_up_time, smoking, drinking, relationship_status, hobbies,
    language_pref, gender_pref, sleep_time_pref, wake_up_time_pref, smoking_pref, drinking_pref, relationship_pref
  } = req.body;
  const hobbiesArrayLiteral = `{${hobbies}}`;
  const hash = await bcrypt.hash(password, 10); // Hash the password

  try {
    // Insert the user data into the database
    await db.none(
      `INSERT INTO users (
        username, first_name, last_name, phone, email, password, city, university_name, location_preference,
        price_min, price_max, min_area, max_area, furnished, bedrooms, gender, budget, location, university, pets,
        language, sleep_time, wake_up_time, smoking, drinking, relationship_status, hobbies,
        language_pref, gender_pref, sleep_time_pref, wake_up_time_pref, smoking_pref, drinking_pref, relationship_pref
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34
      )`, 
      [
        username, first_name, last_name, phone, email, hash, city, university_name, location_preference,
        price_min, price_max, min_area, max_area, furnished, bedrooms, gender, budget, location, university, pets,
        language, sleep_time, wake_up_time, smoking, drinking, relationship_status, hobbiesArrayLiteral,
        language_pref, gender_pref, sleep_time_pref, wake_up_time_pref, smoking_pref, drinking_pref, relationship_pref
      ]
      
    );
    console.log('information added:', price_max,sleep_time, language_pref )
    res.redirect('/login');
  } catch (err) {
    console.error('Error registering user:', err);
    res.redirect('/register');
  }
});


// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
      // Query the user by the provided email
      const query = 'SELECT * FROM users WHERE email = $1';
      const user = await db.oneOrNone(query, email);

      // If user not found
      if (!user) {
          res.locals.errorMessage = 'User with this email does not exist.';
          return res.render('pages/login');
      }

      // Check if password matches
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
          // Password doesn't match
          res.locals.errorMessage = 'Incorrect password';
          return res.render('pages/login');
      }

      // If all checks pass, save user details in session and redirect to /discover
      req.session.user = user;
      req.session.save();
      res.redirect('/discover');
  } catch (error) {
      // If there's a database or other error
      res.locals.errorMessage = 'An error occurred during login. Please try again later.';
      res.render('pages/login');
  }
});

// POST /logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
      if (err) {
          return res.send('Error logging out');
      }
      res.redirect('/register'); // Redirect to the register page after logout
  });
});




// Hypothetical insertUser function
// This is a placeholder and you'd replace this with your actual database insertion code
async function insertUser(username, firstName, lastName, phone, email, hashedPassword) {
    // This is where you'd insert the user details into your database
    await db.query('INSERT INTO users (username, first_name, last_name, phone, email, password) VALUES ($1, $2, $3, $4, $5, $6)', [username, firstName, lastName, phone, email, hashedPassword]);
    // And then return true upon successful insertion or false upon an error

    // For the purpose of this example, let's return true to indicate a successful insertion
    return true;
}

// Other routes remain unchanged...

module.exports = app;

// Other routes remain unchanged...


// GET /login
app.get('/login', (req, res) => {
  res.render('pages/login', { user: null }); // Pass user as null
});


// GET /register
app.get('/register', (req, res) => {
  res.render('pages/register', { user: req.session.user });
});

// GET /discover
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

      // Render the view with the fetched events and user information
      res.render('pages/discover', { events, user: req.session.user });

  } catch (error) {
      console.error(error);
      res.render('pages/discover', { results: [], errorMessage: 'An error occurred.', user: req.session.user });
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
  
  // GET /profile
app.get('/profile', async (req, res) => {
  if (!req.session.user) {
    // If user is not logged in, redirect to login page
    return res.redirect('/login');
  }

  // Assuming req.session.user contains the user information
  // Fetch additional user details from the database if needed

  try {
    // Render the profile page with user information
    res.render('pages/profile', { user: req.session.user });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).send('Internal Server Error');
  }
});



// TODO - Include your API routes here

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
server.listen(3000, () => {
  console.log('Server listening on *:3000');
});

console.log('Server is listening on port 3000');