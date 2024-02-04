const express = require('express');
const ejs = require('ejs');

const app = express();
const port = process.env.PORT || 3000;  // Use the provided port or default to 3000

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
