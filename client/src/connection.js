const express = require("express");
const server = express();
const bodyParser = require("body-parser");
const mysql = require('mysql2/promise');
const cors = require('cors');


// Connection to the MySQL database
const db = mysql.createPool({
    host: "containers-us-west-139.railway.app",
    user: "u506548348_root",
    password: "le4oWcTo4z2lEa1jzpST",
    database: "railway"
  });

server.listen(5824, function check(error){
  if (error) console.log("Error!!!")
  else console.log("Started!!!")
});
server.use(cors({ origin: 'http://localhost:3000' }));
server.use(bodyParser.json());

// API endpoint to get list of sectors
server.get('/api/sectors', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, sector_name, space_value FROM sectors');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching sector names:', error);
        res.status(500).json({ message: 'Error fetching sector names' });
    }
});

  //insert details into database and generate session token
  server.post("/details/add", (req, res) => {
      const userDetails = {
          name: req.body.name,
          sector_name: req.body.sector_name,
          agree_to_terms: req.body.agree_to_terms
      };
      
      let sql = "INSERT INTO form (name, sector_name, agree_to_terms) VALUES (?,?,?)";
      db.query(sql, [userDetails.name, userDetails.sector_name, userDetails.agree_to_terms], (error) => {
          if (error) {
              console.error('Error inserting details:', error);
              res.status(500).send({ status: false, message: "Details upload failed" });
          } else {
              res.send({ status: true, message: "Details uploaded successfully"});
          }
      });
  });

// API endpoint to get the latest user data
server.get('/api/latest-user-data', async (req, res) => {
  try {
      const [rows] = await db.query('SELECT name, sector_name, agree_to_terms, id FROM form ORDER BY id DESC LIMIT 1');
      if (rows.length === 0) {
          res.status(404).json({ message: 'User data not found' });
      } else {
          res.json(rows[0]);
      }
  } catch (error) {
      console.error('Error fetching latest user data:', error);
      res.status(500).json({ message: 'Error fetching latest user data' });
  }
});

server.put('/api/update-user-data/:id', async (req, res) => {
    const userId = req.params.id;

    try {
        const { name, sector_name, agree_to_terms } = req.body;
        console.log(name,sector_name, agree_to_terms)
        if (typeof name !== 'undefined' && typeof sector_name !== 'undefined' && typeof agree_to_terms !== 'undefined') {
            await db.query('UPDATE form SET name = ?, sector_name = ?, agree_to_terms = ? WHERE id = ?', [
                name, sector_name, agree_to_terms, userId
            ]);

            res.send({ status: true, message: "User data updated successfully" });
        } else {
            res.status(400).send({ status: false, message: "Missing or invalid data in the request body" });
        }
    } catch (error) {
        console.error('Error updating user data:', error);
        res.status(500).send({ status: false, message: "Error updating user data" });
    }
});
