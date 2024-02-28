const API_URL = "http://localhost:3000/api/v1/tunes"
// Which keys play which tones
const keyTones = {
    "a": "c4",
    "w": "c#4",
    "s": "d4",
    "e": "d#4",
    "d": "e4",
    "f": "f4",
    "t": "f#4",
    "g": "g4",
    "y": "g#4",
    "h": "a4",
    "u": "bb4",
    "j": "b4",
    "k": "c5",
    "o": "c#5",
    "l": "d5",
    "p": "d#5",
    "æ": "e5",
    ";": "e5"
}

function main() {
    let isPressed = false
    //create a synth and connect it to the main output (your speakers)
    const synth = new Tone.Synth().toDestination();
    const allKeys = document.querySelectorAll("#keyboardDiv button") 
    const playButton = document.getElementById("tunebtn")
    const selectDropdown = document.getElementById("tunesDrop")
    let songs = []
    const recordButton = document.getElementById("recordbtn")
    let notes = []
    let isRecording = false
    const stopButton = document.getElementById("stopbtn")

    allKeys.forEach((key) => {
        key.addEventListener("click", () => {
            synth.triggerAttackRelease(key.id, "8n")
            // if the user is recording the functions add the key, duration and timing of the note to be able to record the song
            if (isRecording) {
                notes.push({note: key.id, duration: "8n", timing: notes.length / 2})
            }
        })
    })
    
    document.addEventListener("keydown", (event) => {
        const tone = keyTones[event.key]
        // if the user presses a key the function plays the tone for the key
        if(tone && !isPressed) {
            isPressed = true // so it does not play the same key over and over again
            synth.triggerAttackRelease(tone, "8n")
            document.getElementById(tone).classList.add("active")
            // if the user is recording the functions add the key, duration and timing of the note to be able to record the song
            if (isRecording) {
                notes.push({note: tone, duration: "8n", timing: notes.length / 2})
            }
        }
    })
    document.addEventListener("keyup", (event) => {
        // when the user stops pressing the key the button is not gray anymore and is not active anymore
        isPressed = false
        const tone = keyTones[event.key]
        if(tone) {
            document.getElementById(tone).classList.remove("active")
        }
    })

    playButton.addEventListener("click", () => {
        const selectedSongId = selectDropdown.value.toString() // here we get ID of a selected song
        // find the song the user want´s to play on the backend
        const foundSong = songs.find((song) => {
            return song.id === selectedSongId
        })
        console.log(foundSong, selectedSongId);

        // if the song is on the backend it plays the song
        if(foundSong) {
            foundSong.tune.forEach((tune) => {
                const now = Tone.now()
                synth.triggerAttackRelease(tune.note, tune.duration, now + tune.timing)
            })
        }

    })

    // So the keys are not playing when the user is typing the name of a song
    document.getElementById("recordName").addEventListener("keydown", (event) => {
        event.stopPropagation()
    })

    // Start to record a song
    recordButton.addEventListener("click", () => {
        isRecording = true
        recordButton.setAttribute("disabled", "")
        stopButton.removeAttribute("disabled")
    })

    // Stops recording a song
    stopButton.addEventListener("click", () => {
        isRecording = false
        stopButton.setAttribute("disabled", "")
        recordButton.removeAttribute("disabled")

        let name = document.getElementById("recordName").value

        // If the user does not type a name of a song the name becomes "No-name Tune"
        if (name === "") {
            name = "No-name Tune"
        }

        const data = {name, tune: notes}

        // puts the song in the backend with the name, id and list of keys
        axios.post(API_URL, data)
            .then((response) => {
                const optionTag = document.createElement("option") // <option></option>
                optionTag.innerText = response.data.name // <option>Fur elise</option>
                optionTag.value = response.data.id // <option value="0">Fur elise</option>
                selectDropdown.appendChild(optionTag)
                songs.push(response.data)

                document.getElementById("recordName").value = ""
            })
    })

    /// Gets the songs from the backend to be played by the user
    const fetchTunes = () => {
        axios.get(API_URL)
            .then((response) => {
                songs = response.data
                songs.forEach((song) => {
                    const optionTag = document.createElement("option") // <option></option>
                    optionTag.innerText = song.name // <option>Fur elise</option>
                    optionTag.value = song.id // <option value="0">Fur elise</option>
                    selectDropdown.appendChild(optionTag)
                })
            })
            .catch((error) => {
                console.log(error)
            })

    }

    fetchTunes()
}

addEventListener("DOMContentLoaded", main);