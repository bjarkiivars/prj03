// Here we are using constants as this should not be updated
const API_URL = "http://localhost:3000/api/v1/";

const keyMap = {
  // white keys
  a: "c4",
  s: "d4",
  d: "e4",
  f: "f4",
  g: "g4",
  h: "a4",
  j: "b4",
  k: "c5",
  l: "d5",
  // let's also support en/us keyboards
  ";": "e5",
  æ: "e5",

  // black keys
  w: "c#4",
  e: "d#4",
  t: "f#4",
  y: "g#4",
  u: "bb4",
  o: "c#5",
  p: "d#5",
};

// Here we use let as these variables will be mutated throughout our code
let tunes = [];
let genres = [];
let recording = [];
let isRecording = false;
let startTime = 0;

// We use the async keyword so we can use await inside the function
const fetchAndPopulateTunes = async () => {
  //Perform a GET request to the url
  try {
    // When using axios GET is the default method used
    // axios(url) is the same as using axios.get(url)
    const response = await axios(API_URL + "tunes");
    //When successful, print the received data
    console.log("Success tunes: ", response.data);
    tunes = response.data;
    populateTuneSelector();
  } catch (error) {
    //When unsuccessful, print the error.
    console.log(error);
  }
  // This code is always executed, independent of whether the request succeeds or fails.
};

const fetchAndPopulateGenres = async () => {
  //Perform a GET request to the url
  try {
    // When using axios GET is the default method used
    // axios(url) is the same as using axios.get(url)
    const response = await axios(API_URL + "genres");
    //When successful, print the received data
    console.log("Success genres: ", response.data);
    genres = response.data;
    populateGenreSelector();
  } catch (error) {
    //When unsuccessful, print the error.
    console.log(error);
  }
  // This code is always executed, independent of whether the request succeeds or fails.
};

const createTune = async () => {
  const recordName = document.getElementById("recordName").value;
  const genreId = genres[document.getElementById("genresDrop").value].id;

  //Perform a POST request to the url
  try {
    const response = await axios.post(
      API_URL + "genres/" + genreId + "/tunes",
      {
        name: recordName,
        content: recording,
      }
    );
    //When successful, print the received data
    console.log("Successfully written: ", response.data);
    fetchAndPopulateTunes();
  } catch (error) {
    //When unsuccessful, print the error.
    console.log(error);
  }
  // This code is always executed, independent of whether the request succeeds or fails.
};

const populateTuneSelector = () => {
  const selector = document.getElementById("tunesDrop");
  selector.innerHTML = "";

  // Here we use forEach instead of map as we are not retuning anything from our loop
  tunes.forEach((tune, index) => {
    const currentOpt = document.createElement("option");
    currentOpt.value = index;
    currentOpt.textContent = tune.name;
    selector.appendChild(currentOpt);
  });
};

const populateGenreSelector = () => {
  const selector = document.getElementById("genresDrop");
  selector.innerHTML = "";

  // Here we use forEach instead of map as we are not retuning anything from our loop
  genres.forEach((genre, index) => {
    const currentOpt = document.createElement("option");
    currentOpt.value = index;
    currentOpt.textContent = genre.genreName;
    selector.appendChild(currentOpt);
  });
};

const synth = new Tone.Sampler({
  urls: {
    C4: "C4.mp3",
  },
  release: 1,
  baseUrl: "https://tonejs.github.io/audio/salamander/",
}).toDestination();

document.getElementById("tunebtn").addEventListener("click", async (e) => {
  const tune = tunes[document.getElementById("tunesDrop").value];

  try {
    const { data } = await axios.get(
      API_URL + "genres/" + tune.genreId + "/tunes/" + tune.id
    );

    const now = Tone.now();

    data.content.forEach((tune) => {
      // Here we use object destructuring to extract attributes from tune.
      // It is not neccessary, but can make for cleaner code.
      const { note, duration, timing } = tune;
      synth.triggerAttackRelease(note, duration, now + timing);
      // This is the same as using the line below, without desctructuring
      // synth.triggerAttackRelease(tune.note, tune.duration, now + tune.timing)
    });
  } catch (e) {
    console.error(e);
  }
});

document.getElementById("recordbtn").addEventListener("click", (e) => {
  const recordBtn = document.getElementById("recordbtn");
  const stopBtn = document.getElementById("stopbtn");
  recordBtn.disabled = true;
  stopBtn.disabled = false;
  document.activeElement.blur();

  recording = [];
  startTime = Date.now();
  isRecording = true;
});

document.getElementById("stopbtn").addEventListener("click", (e) => {
  const recordBtn = document.getElementById("recordbtn");
  const stopBtn = document.getElementById("stopbtn");
  recordBtn.disabled = false;
  stopBtn.disabled = true;

  startTime = 0;
  isRecording = false;

  if (recording.length > 0) {
    createTune();
  }
});

document.addEventListener("keydown", (e) => {
  // No more spam when keys are held down
  if (e.repeat) {
    return;
  }

  if (e.key in keyMap && document.activeElement.id !== "recordName") {
    const tone = keyMap[e.key];
    if (isRecording) {
      const seconds = Date.now() - startTime;
      recording.push({ note: tone, duration: "8n", timing: seconds / 1000 });
    }

    const pianoKey = document.getElementById(tone);
    pianoKey.style.backgroundColor = "gray";

    synth.triggerAttackRelease(tone, "8n");

    setTimeout(() => (pianoKey.style.backgroundColor = ""), 200);
  }
});

const pianoKeyClick = (note) => {
  synth.triggerAttackRelease(note, "8n");

  if (isRecording) {
    const seconds = Date.now() - startTime;
    // Here you can also use recording.push({ note: note, ...});
    // but since the key/value is the same you can use the shorthand version like so:
    recording.push({ note, duration: "8n", timing: seconds / 1000 });
  }
};

fetchAndPopulateTunes();
fetchAndPopulateGenres();
