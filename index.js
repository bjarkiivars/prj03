//Sample for Assignment 3
const express = require("express");

//Import a body parser module to be able to access the request body as json
const bodyParser = require("body-parser");

//Use cors to avoid issues with testing on localhost
const cors = require("cors");

const app = express();

const port = 3000;

//Defining our own API
const api = '/api';

//Declaring which version we are using 
const version = '/v1/';

const myApi = api + version // /api/v1/

//Tell express to use the body parser module
app.use(bodyParser.json());

//Tell express to use cors -- enables CORS for this backend
app.use(cors());

//Set Cors-related headers to prevent blocking of local requests
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//The following is an example of an array of two tunes.The content has been shortened to make it readable
const tunes = [
  {
    id: "0",
    name: "Für Elise",
    genreId: "1",
    content: [
      { note: "E5", duration: "8n", timing: 0 },
      { note: "D#5", duration: "8n", timing: 0.25 },
      { note: "E5", duration: "8n", timing: 0.5 },
      { note: "D#5", duration: "8n", timing: 0.75 },
      { note: "E5", duration: "8n", timing: 1 },
      { note: "B4", duration: "8n", timing: 1.25 },
      { note: "D5", duration: "8n", timing: 1.5 },
      { note: "C5", duration: "8n", timing: 1.75 },
      { note: "A4", duration: "4n", timing: 2 },
    ],
  },
  {
    id: "1",
    name: "Seven Nation Army",
    genreId: "0",
    content: [
      { note: "E5", duration: "4n", timing: 0 },
      { note: "E5", duration: "8n", timing: 0.5 },
      { note: "G5", duration: "4n", timing: 0.75 },
      { note: "E5", duration: "8n", timing: 1.25 },
      { note: "E5", duration: "8n", timing: 1.75 },
      { note: "G5", duration: "4n", timing: 1.75 },
      { note: "F#5", duration: "4n", timing: 2.25 },
    ],
  },
];

const genres = [
  { id: "0", genreName: "Rock" },
  { id: "1", genreName: "Classic" },
];

//Your endpoints go here

/*
Read all tunes
Returns an array of all tunes. For each tune, only the id, the name, and the genreId are
included in the response. Additionally, providing the filter query parameter returns only
the tunes that are in the genre with the provided name. If no tune is in the provided
genre, or no genre with the provided name exists, an empty array is returned. Returning
an empty array is important so the frontend can expect an array, no matter the result
*/

//Read all tunes, returns all tunes
app.get(myApi + 'read' + '/tunes', (req, res) => {
  let temp_arr = [];
  tunes.forEach((object) => {
    temp_arr.push({
      id: object.id,
      name: object.name,
      genreId: object.genreId
    });
  });
  res.status(200).json(temp_arr);
});

/*
const items = [
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
];

app.get('/items/:id', (req, res) => {
  const id = req.params.id;
  const filteredItems = items.filter(item => item.id === id);
  if (filteredItems.length === 0) {
    res.status(404).send('Item not found');
  } else {
    res.send(filteredItems[0]);
  }
});
*/

app.get(myApi + 'read' + '/tunes/:genreName', (req, res) => {
  const genreNameParam = req.params.genreName;
  const filteredGenre = genres.filter(obj => obj.genreName === genreNameParam);
  if (filteredGenre.length === 0) {
    res.status(200).json([]);
  } else {
    res.send(filteredGenre[0].id);
  }
});


//return tunes array
app.get(myApi + 'tunes', (req, res) => {
  res.status(200).json(tunes);
});

// Serve static files in root directory
app.use(express.static(__dirname + '/'));

// Serve public folder for images
app.use('/public', express.static(__dirname + '/public'));

// Define index.html route
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

//Blocking all endpoints that are not defined
app.all('*', (req, res) => {
  res.status(404).json({
    error: 'This resource is not found'
  });
});

//Start the server
app.listen(port, () => {
  console.log("Tune app listening on port: " + port);
});
