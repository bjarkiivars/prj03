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

//Functions go here

//Function that takes an array, and finds the current highest id, returns the id which is next
const nextId = (arr) => {
  
  let maxId = 0;

  //If we are empty, next id is 0, if not we find what the next one is
  if (arr.length > 0) {
    //Iterate searching for the highest id
    arr.forEach((obj) => {
      if (obj.id > maxId) maxId = obj.id; 
    });

    //Return the highest id + 1, to get the next id
    //turn it to an integer to add 1, turn it back to a string for the return
    return ((+maxId) + 1).toString();
  }
  //if the array is empty, our next id must be 0
  return 0;
};

//A function that validates the content property of a tunes array, throws an error if unsuccessful
const validateContent = (content) => {
  
  if(!Array.isArray(content)) {
    content = [content];
  }

  //If the content has no properties
  if(content.length === 0) {
    throw new Error('The content must contain at least one note.');
  };

  //Iterate the notes to check if any of the properties are missing
  content.forEach((note) => {
    if(!note.note || !note.duration || !note.timing) {
      throw new Error('Each note in the content array must have a note, duration and timing.');
    }
  });
};

//Your endpoints go here

//*** Get all tunes ***
//For postman tests: http://localhost:3000/read/tunes?filter=Rock
app.get(myApi + "read/tunes", (req, res) => {

  const filter = req.query.filter;

  //If filter is not provided, return all tunes
  if (!filter) {
    //Map id, name and genreId to a new array allTunes for return
    const allTunes = tunes.map((tune) => ({
      id: tune.id,
      name: tune.name,
      genreId: tune.genreId,
    }));
    return res.status(200).json(allTunes);
  }

  //If filter is provided, find the genre with the provided name
  let genre = genres.find((genreObj) => genreObj.genreName === filter);

  //If no genre is found, return an empty array
  if (!genre) {
    return res.status(200).json([]);
  }

  //Filter the tunes based on the genreId
  let filteredTunes = tunes.filter((tunesObj) => tunesObj.genreId === genre.id);

  res.status(200).json(
    //Return an array of objects with only the id, name, and genreId properties
    //Use the map method to map our filteredTunes array to a return array
    filteredTunes.map((tunesObj) => {
      return {
        id: tunesObj.id,
        name: tunesObj.name,
        genreId: tunesObj.genreId,
      };
    })
  );
});

//*** Read an individual tune ***
app.get(myApi + 'tunes/:id', (req, res) => {
  
  //Retrieve the id parameter from the URL
  const paramId = req.params.id;

  //If no id is given or selected, return all tunes
  if(!paramId) { // <!-- ATTENTION, THIS IS NOT FINISHED BORK, also remove.. ffs-->
    return res.status(200).json(tunes);
  }

  //If the id is not a number or is < 0, we return with a 400 request 'bad request'
  if(isNaN(paramId) || paramId < 0) {
    return res.status(400).send('The ID must be a number and not < 0.');
  }
  
  //Else, we find a specific tune and return it
  let tune = tunes.find((tune) => tune.id === paramId);

  //if no tune is found, we return with a 404 not found
  if(!tune) {
    return res.status(404).send('The ID selected was not found.');
  }

  //If we found a tune, we return it.
  return res.status(200).json(tune);
});

/* 
Create a new tune
Creates a new tune. The endpoint expects the name and content of the tune. Duplicate
names are allowed. The genreId is provided through the URL. The content attribute
must be a non-empty array of objects, each of which has the note, timing, and duration
attributes. The id shall be auto generated (i.e., not provided in the request body). The
request shall fail if a genre with the given id does not exist. The request, if successful,
shall return the new resource (all attributes, including id and the full content array).
*/

/*
//Test data:
{
  "name": "TestName",
  "content" :[
    { "note": "E5", "duration": "8n", "timing": 0 }
  ]
}

//Result: RAW
// {"id":2,"name":"TestName","genreId":"1","content":[{"note":"E5","duration":"8n","timing":0}]} 
/*
//Pretty:
{
    "id": 2,
    "name": "TestName",
    "genreId": "1",
    "content": [
        {
            "note": "E5",
            "duration": "8n",
            "timing": 0
        }
    ]
}
*/

app.post(myApi + 'testing', (req, res) => {
  req.body.content.forEach((tune) => {
    console.log('Im iterating the tune: ' + tune);
  });
  return res.status(201).send(typeof req.body.content)
});

// *** Create a new tune ***
app.post(myApi + 'tunes/new/:genreId', (req, res) => {
  //Check if all required input is being sent
  if(!req.body.name || !req.params.genreId || !req.body.content) {
    return res.status(400).send('A tune must contain a name, genreId and content.');
  }

  //Check if the genreId is a number
  else if (isNaN(req.params.genreId)  ) {
    return res.status(400).send('genreId must be a number');
  }

  //Run a validation check in the content property
  /*
  try {
    validateContent(req.body.content);
  } catch (error) {
    return res.status(400).send(error.message);
  };
  */

  req.body.content.forEach((note) => {
    if(!note.note || !note.duration || !note.timing) {
      return res.status(400).send('Each note in the content array must have a note, duration and timing.');
    }
  });

  //Check if the genreId exists in genres
  const genreId = genres.find((genre) => genre.id === req.params.genreId);

  if (!genreId) {
    return res.status(400).send('A genre with this id does not exist.');
  }

  //If all checks are successful, we create an object with these properties
  const newId = nextId(tunes);

  const newTune = {
    id: newId,
    name: req.body.name,
    genreId: req.params.genreId,
    content: req.body.content
  }

  tunes.push(newTune);
  res.status(201).json(newTune);
});

//This endpoint returns the whole object
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
