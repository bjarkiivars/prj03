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



// **** Functions go here ****

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



//A function that validates the content property of a tunes array
const validateContent = (content) => {
  //To ensure we get the correct return value,
  //ForEach does not return out of the function, so I'm changing the value of the return_bool if we find something wrong
  let return_bool = true;

  //If the content has no properties
  if(content.length === 0) {
    return_bool = false;
    return return_bool;
  };

  //Iterate the notes to check if any of the properties are missing
  //We will also check if the timing is ascending
  let prior_timing = 0

  content.forEach((note) => {
    if(!note.note || !note.duration || isNaN(note.timing)) {
      return_bool = false;
      return return_bool;
    }
    //Checking if the timing property is in ascending order
    if(note.timing > 0) {
      
      if(prior_timing > note.timing) {
        return_bool = false;
        return return_bool;
      };
    };
    prior_timing = note.timing
  });
  //If all checks pass, we return true
  return return_bool;
};


//**** Your endpoints go here ****

// **** TUNES ****

//*** read all tunes ***
app.get(myApi + "tunes", (req, res) => {

  const filter = req.query.filter;

  //If filter is not provided, return all tunes
  if (!filter) {
    //Map id, name and genreId to a new array allTunes for return
    const allTunes = tunes.map((tune) => ({ id: tune.id, name: tune.name, genreId: tune.genreId }));
    return res.status(200).json(allTunes);
  }

  //If filter is provided, find the genre with the provided id
  let genre = genres.find((genreObj) => genreObj.id === filter);

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
      return { id: tunesObj.id, name: tunesObj.name, genreId: tunesObj.genreId };
    })
  );
});



//*** Read an individual tune ***
app.get(myApi + 'genres/:genreId/tunes/:tuneId', (req, res) => {
  //Retrieve the id parameter from the URL
  const tuneId = req.params.tuneId;
  const genreId = req.params.genreId;
  //If the id is not a number or is < 0, we return with a 400 request 'bad request'
  if(isNaN(tuneId) || tuneId < 0 || isNaN(genreId) || genreId < 0) {
    return res.status(400).send('The ID must be a number and not < 0.');
  }
  
  //Else, we find a specific tune and return it
  let tune = tunes.find((tune) => tune.id === tuneId && tune.genreId === genreId);

  //if no tune is found, we return with a 404 not found
  if(!tune) {
    return res.status(404).send('The ID selected was not found.');
  }

  //If we found a tune, we return it.
  return res.status(200).json(tune);
});



// *** Create a new tune ***
app.post(myApi + 'genres/:genreId/tunes', (req, res) => {
  
  //Check if all required input is being sent
  if(!req.body.name || !req.params.genreId || !req.body.content) {
    return res.status(400).send('A tune must contain a name, genreId and content.');
  }

  //Check if the genreId is a number
  else if (isNaN(req.params.genreId)  ) {
    return res.status(400).send('genreId must be a number');
  }

  //Run a validation check in the content property
  const valid = validateContent(req.body.content);

  //If any of the checks fail, we return 400
  if(valid == false) {
    return res.status(400).send('The content property must have note, duration and timing(which has to be a number) and in ascending order.');
  }

  //Check if the genreId exists in genres
  const genreId = genres.find((genre) => genre.id === req.params.genreId);

  if (!genreId) {
    return res.status(404).send('A genre with this id does not exist.');
  }

  //If all checks are successful, we create an object with these properties
  const newId = nextId(tunes);

  const newTune = {
    id: newId,
    name: req.body.name,
    genreId: req.params.genreId,
    content: req.body.content
  }

  //Push the new tune to our tunes array
  tunes.push(newTune);
  //Return the new tune
  res.status(201).json(newTune);

});



//*** Partially update a tune ***
app.patch(myApi + 'genres/tunes/patch/:genreId?', (req, res) => {

  //Use id as an identifier to find the specific tune
  const tuneIndex = tunes.findIndex((tune) => tune.id === req.body.id);
  if(tuneIndex < 0) {
    return res.status(404).send('No tune was found with this id')
  }
  const tuneToChange = tunes[tuneIndex];

  //NAME
  //If the name is given, we change it in our tuneToChange obj
  if(req.body.name) {
    if(typeof req.body.name != "string") {
      return res.status(400).send('The name must be a string');
    }
    //if the name is a string reassign the name.
    tuneToChange.name = req.body.name;
  };

  //GENRE ID
  //If the genreId is given from the URL and we have a genreId in the request body.
  if(req.params.genreId && req.body.genreId) {
    
    //Check if the genreId parameters are numbers, force the req.body to a number, if it's unable to convert, it's NaN.
    if(isNaN(req.params.genreId) || isNaN(+(req.body.genreId))) {
      return res.status(400).send('The genreId has to be a number.');
    } 
    //Variables for readability
    const oldGenreId = req.params.genreId;
    const tuneGenreId = tuneToChange.genreId;
    const newGenreId = req.body.genreId;

    //Check if the URL parameter corresponds to the tune's genreID that we are changing
    if(tuneGenreId != oldGenreId) {
      return res.status(400).send('The genreId given in the URL does not correspond to the genreId in the tune we want to change.');
    };
    const findGenreId = genres.find((genre) => genre.id === newGenreId);
    
    if(!findGenreId) {
      return res.status(400).send('The genreId does not exist.');
    }
    //If the genre exists and everything is ok, reassign the genreId
    tuneToChange.genreId = newGenreId;
  };

  //CONTENT
  if (req.body.content) {
    const newContent = req.body.content;
    //Run our content from body through a validation function
    const valid = validateContent(newContent);
    
    //If the content is valid, change the change in our found Object, otherwise 400.
    if(!valid) {
      return res.status(400).send('The content property must have note, duration and timing(which has to be a number) and in ascending order.');
    }
    tuneToChange.content = newContent;
  };

  //Replace the old object with the new:
  tunes[tuneIndex] = tuneToChange;
  return res.status(200).json(tunes[tuneIndex]);
});


// **** GENRES ****

// Read all genres
app.get(myApi + 'genres', (req, res) => {
  return res.status(200).json(genres);
});



// Create a new genre
app.post(myApi + 'genres' + '/new', (req, res) => {
  //Check if we are getting a request name, and if the request name is a string
  if(!req.body.genreName || typeof req.body.genreName != "string") {
    console.log(req.body.genreName);
    return res.status(400).send('New genres require a name, and it needs to be a string.');
  };

  const name = req.body.genreName;
  const findGenre = genres.find((genre) => genre.genreName === name);

  //Check if the genre exists
  if(findGenre) {
    return res.status(400).send('A genre with this name already exists');
  };
  
  const newId = nextId(genres);
  const newGenre = { id: newId, genreName: name};
  genres.push(newGenre);
  return res.status(201).json(newGenre);

});



// Delete a genre
app.delete(myApi + 'genres' + '/delete', (req, res) => {
  if(!req.body.id || isNaN(+req.body.id)) {
    return res.status(400).send('Request needs an ID and needs to be a number.');
  }
  //Try to find the genre with the request ID, return the index  
  const genreIndex = genres.findIndex((genre) => genre.id === req.body.id);

  if(genreIndex < 0) {
    return res.status(404).send('No genre with this id exists.');
  }

  //Check if any tune with this genre exists
  const findTune = tunes.find((tune) => tune.genreId === req.body.id);

  if(findTune) {
    return res.status(400).send('Could not delete, tune exists with this genre.');
  }

  //If everything is okay, we splice
  const deletedObj = genres.splice(genreIndex, 1);
  //Return the deleted Object
  return res.status(200).json(deletedObj);

});

// **** File routes ****

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
  res.status(405).json({
    error: 'This resource is not found'
  });
});

//Start the server
app.listen(port, () => {
  console.log("Tune app listening on port: " + port);
});
