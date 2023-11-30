const express = require('express');
const mysql = require('mysql');
const app = express();
const path = require('path');
const bodyParser = require('body-parser'); // Add this line
const port = 8080;

// Create a MySQL connection pool
const db = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: 'root',
  password: 'Leicester69lol',
  database: 'WhiteBoard',
});
db.getConnection((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database successfully');
});


// Serve static files from the 'public' directory
app.use(express.static(__dirname));

app.use(bodyParser.json({limit: "100mb"}));
app.use(bodyParser.urlencoded({limit: "100mb", extended: true, parameterLimit:50000}));

app.get(['/', '/WhiteBoard'], (req, res) => {
  res.sendFile(path.join(__dirname, 'WhiteBoard.html'));
});


// Endpoint to get the latest drawing from the database
/*
app.get('/WhiteBoard', (req, res) => {
  db.query('SELECT * FROM canvas_state ORDER BY id DESC LIMIT 1', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results[0]);
    }
  });
});
*/


app.get('/WhiteBoard', (req, res) => {
  // Set the content type to JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Your existing query and response logic
  db.query('SELECT * FROM canvas_state ORDER BY id DESC LIMIT 1', (error, results) => {
    if (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    } else {
      res.json(results[0]);
    }
  });
});


app.post('/WhiteBoard', (req, res) => {
  const { type, data } = req.body;

  // Check if there is an existing row
  db.query('SELECT COUNT(*) as count FROM canvas_state', (selectError, selectResults) => {
    if (selectError) {
      console.error(selectError);
      res.status(500).send('Internal Server Error');
    } else {
      const rowCount = selectResults[0].count;

      if (rowCount === 0) {
        // If no rows exist, use INSERT
        db.query('INSERT INTO canvas_state (type, data) VALUES (?, ?)', [type, JSON.stringify(data)], (insertError) => {
          if (insertError) {
            console.error(insertError);
            res.status(500).send('Internal Server Error');
          } else {
            res.status(204).end();
          }
        });

      } else {
        // If rows exist, use UPDATE
        db.query('UPDATE canvas_state SET type = ?, data = ? WHERE id = 1', [type, JSON.stringify(data)], (updateError) => {
          if (updateError) {
            console.error(updateError);
            res.status(500).send('Internal Server Error');
          } else {
            res.status(204).end();
          }
        });
        
      }
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
