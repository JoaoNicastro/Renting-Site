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
const server = http.createServer(app); // Wrap the Express app
const io = new Server(server); // Attach socket.io to the server

app.use(express.static('views'));

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
        language, sleep_time, wake_up_time, smoking, drinking, relationship_status, hobbies,
        language_pref, gender_pref, sleep_time_pref, wake_up_time_pref, smoking_pref, drinking_pref, relationship_pref
      ]
      
    );
    // Calculate scores for the new user here...
    console.log("Fetching user preferences for:", username);
    await calculateScoresForNewUser(username); // Assume `username` is the newly registered user's username
    
    // Notify all connected clients that scores have been updated for this user
    io.emit('updateScores', { user: username });

    res.redirect('/login');
  } catch (err) {
    console.error('Error registering user:', err);
    res.redirect('/register');
  }
});

// ROOMATE ALGORITHM

async function calculateScoresForNewUser(newUsername) {
  console.log("Got into calculating:", newUsername);
  const newUserPreferences = await fetchUserPreferencesByUsername(newUsername);
  console.log("Worked newUserPreferences:", newUserPreferences);
  const existingUsers = await fetchUserPreferences();
  console.log("Worked fetchUserPreferences:", existingUsers);
    
  for (const user of existingUsers) {
    // Avoid calculating a score with oneself
    if (user.username === newUsername) continue;

    // Calculate the compatibility score between the new user and each existing user
    const score = calculateCompatibilityScore(newUserPreferences, user);
        
    // Insert or update the score in the database
    await updateCompatibilityScore(newUsername, user.username, score);
    await updateCompatibilityScore(user.username, newUsername, score); // If scores are asymmetric
  }
}

async function fetchUserPreferences() {
    const query = `
      SELECT 
        username, gender, budget, location, university, pets,
        language, sleep_time, wake_up_time, smoking, drinking, relationship_status, hobbies,
        language_pref, gender_pref, sleep_time_pref, wake_up_time_pref, smoking_pref, drinking_pref, relationship_pref
      FROM users;
    `;
    return await db.any(query);
}

async function fetchUserPreferencesByUsername(username) {
    const query = `
      SELECT 
        username, gender, budget, location, university, pets,
        language, sleep_time, wake_up_time, smoking, drinking, relationship_status, hobbies,
        language_pref, gender_pref, sleep_time_pref, wake_up_time_pref, smoking_pref, drinking_pref, relationship_pref
      FROM users
      WHERE username = $1;
    `;
    return await db.oneOrNone(query, [username]);
}


function calculateTimeDifference(time1, time2) {
  console.log(`Calculating time difference between ${time1} and ${time2}`);
  if (!time1 || !time2) {
    console.error('One of the time values is undefined:', time1, time2);
    return 0; // Return a default difference or handle as appropriate
  }
  
  time1 = time1.length > 5 ? time1.substring(0, 5) : time1;
  time2 = time2.length > 5 ? time2.substring(0, 5) : time2;
  const [hours1, minutes1] = time1.split(':').map(Number);
  const [hours2, minutes2] = time2.split(':').map(Number);
  const date1 = new Date();
  date1.setHours(hours1, minutes1, 0);
  const date2 = new Date();
  date2.setHours(hours2, minutes2, 0);
  const diff = Math.abs(date1 - date2);
  return Math.floor(diff / (1000 * 60)); // Return difference in minutes
}

function filterByDealbreakers(user, candidates) {
    return candidates.filter(candidate => {
        return !(candidate.gender_preference !== user.gender_preference ||
            Math.abs(candidate.budget - user.budget) > 100 ||
            candidate.location !== user.location ||
            candidate.pets !== user.pets ||
            candidate.language !== user.language);
    });
}

function calculateCompatibilityScore(user1, user2) {
    const weights = {
        university: 4, sleep_weight: 4, wakeup_weight: 4, smoking: 4, drinking: 4, cleanliness: 3, relationship: 2, hobbies: 1
    };
    let score = 0;

    console.log('Type of user1.sleep_time_pref:', typeof user1.sleep_time_pref);
    console.log('Type of user2.sleep_time:', typeof user2.sleep_time);
    console.log('Type of user1.wake_up_time_pref:', typeof user1.wake_up_time_pref);
    console.log('Type of user2.wake_up_time:', typeof user2.wake_up_time);

    console.log('user1.sleep_time_pref:', user1.sleep_time_pref);
    console.log('user2.sleep_time:', user2.sleep_time);
    console.log('user1.wake_up_time_pref:', user1.wake_up_time_pref);
    console.log('user2.wake_up_time:', user2.wake_up_time);

    const sleepTimeDiff = calculateTimeDifference(user1.sleep_time_pref, user2.sleep_time);
    const wakeTimeDiff = calculateTimeDifference(user1.wake_up_time_pref, user2.wake__up_time);

    score += sleepTimeDiff * weights.sleep_weight;
    score += wakeTimeDiff * weights.wakeup_weight;

    if (user1.smoking_pref !== user2.smoking) score += weights.smoking;
    if (user1.drinking_pref !== user2.drinking) score += weights.drinking;
    if (user1.relationship_pref !== user2.relationship_status) score += weights.relationship;
    if (user1.university !== user2.university) score += weights.university;

    console.log("Type of user1.hobbies:", typeof user1.hobbies);
    console.log("Value of user1.hobbies:", user1.hobbies);

    convertHobbiesToArray(user1);
    convertHobbiesToArray(user2);
    
    let sharedHobbies = [];

    if (Array.isArray(user1.hobbies)) {
      sharedHobbies = user1.hobbies.filter(hobby => user2.hobbies.includes(hobby));
    } else {
      console.error('user1.hobbies is not an array:', user1.hobbies);
    } 

    if (sharedHobbies.length > 0) score -= weights.hobbies; // Reduce score for shared hobby

    return score;
}

function convertHobbiesToArray(user) {
  if (typeof user.hobbies === 'string') {
      user.hobbies = user.hobbies.split(',');
  } else if (!user.hobbies) {
      // Handle null, undefined, or other falsy values
      user.hobbies = [];
  }
  // Assuming there could be a case where it's already correctly an array
  // If it's neither a string nor falsy, assume it's already an array (or log an error if unexpected)
}

async function insertCompatibilityScore(user_id_a, user_id_b, score) {
    try {
        const insertQuery = `
            INSERT INTO compatibility_scores (user_id_a, user_id_b, score)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const insertedScore = await db.one(insertQuery, [user_id_a, user_id_b, score]);
        console.log('Inserted score:', insertedScore);
        return insertedScore;
    } catch (err) {
        console.error('Error inserting compatibility score:', err);
        throw err; // Or handle it as needed
    }
}

async function updateCompatibilityScore(user_id_a, user_id_b, newScore) {
    try {
        const updateQuery = `
            UPDATE compatibility_scores
            SET score = $3
            WHERE user_id_a = $1 AND user_id_b = $2
            RETURNING *;
        `;
        const updatedScore = await db.oneOrNone(updateQuery, [user_id_a, user_id_b, newScore]);
        if (updatedScore) {
            console.log('Updated score:', updatedScore);
            return updatedScore;
        } else {
            console.log('No existing score found to update, inserting new score.');
            return insertCompatibilityScore(user_id_a, user_id_b, newScore);
        }
    } catch (err) {
        console.error('Error updating compatibility score:', err);
        throw err; // Or handle it as needed
    }
}

app.get('/matches', async (req, res) => {
  // Check if the user is logged in and has a username
  if (!req.session.user || !req.session.user.username) {
      return res.redirect('/login'); // Redirect to login if not
  }

  const username = req.session.user.username; // Use the logged-in user's username

  try {
      const query = `
          SELECT user_id_b as match, score
          FROM compatibility_scores
          WHERE user_id_a = $1
          ORDER BY score DESC
          LIMIT 10; 
      `;
      const matches = await db.any(query, [username]);
      res.render('pages/matches', { user: req.session.user, matches });
  } catch (err) {
      console.error('Error fetching matches:', err);
      res.status(500).send('Internal server error');
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