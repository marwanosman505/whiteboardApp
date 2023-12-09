const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://wobowizard2:WhiteBoard123@whiteboard.jdudd1i.mongodb.net/";
const client = new MongoClient(uri);
const database = client.db("Whiteboard");
const Canvases = database.collection("Canvases");

const express = require('express');
const app = express();
const path = require('path');
const bodyParser = require('body-parser');
const zlib = require('zlib');
const port = 8080;


// Serve static files from the 'public' directory
app.use(bodyParser.json({ limit: "3000mb" }));
app.use(bodyParser.urlencoded({ limit: "3000mb", extended: true, parameterLimit: 500000 }));


//read from mongodb
app.get('/WhiteBoard', async (req, res) => {
  try {
    // Retrieve the latest document from the collection
    const latestDrawing = await Canvases.find().sort({ _id: -1 }).limit(1).toArray();

    if (latestDrawing.length > 0) {

      console.log("1");
      // Decompress data using zlib
      const decompressedData = zlib.inflateSync(latestDrawing[0].data.toString());
      console.log(decompressedData);
      //const dataArray = Array.from(new Uint8Array(decompressedData));
      //const data = JSON.stringify(dataArray);
      
      // Create a new object with the parsed data
      const response = {
        type: latestDrawing[0].type,
        data: decompressedData.toString(),
      };

      res.json(response);
    } else {
      res.status(404).send('No drawings found');
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


app.use(express.static(__dirname));
app.get(['/', '/WhiteBoard'], (req, res) => {
  res.sendFile(path.join(__dirname, 'WhiteBoard.html'));
});


//write to mongoDB
app.post('/WhiteBoard', async (req, res) => {
  const { type, data } = req.body;
  try {

    //compress canvas data
    const compressedData = zlib.deflateSync(data.toString());
    console.log(compressedData);
  

    // Create a document to insert
    const doc = {
      type: type,
      data: compressedData.toString(),
    };

    // Insert the defined document into the "Canvases" collection
    const result = await Canvases.insertOne(doc);
    console.log(`New data inserted`);

    // Send a response to the client
    res.status(204).end();

  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');

  } 

});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

