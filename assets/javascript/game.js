'use strict';

// CONSTANTS

// NB: WORD_BANK words should be all caps, though there is a later safety toUpperCase() call
// At this point..
//   Hyphens will be removed from the words by the code. They are left in this array incase of future versions & options
//   Diacritics have been removed from this array, and would need editing to restore them. 
const WORD_BANK = [
    "FELLOWSHIP", "MORDOR", "HOBBIT", "DWARF", "WIZARD", "ELVES", "WRAITHS", "RIDERS", "TROLL", "BALROGS", "SAURON", "BOROMIR", "SARUMAN", "ISENGARD", "ARAGORN", "LEGOLAS", "GIMLI", "ROHAN", "GANDALF", "TREEBEARD", "MERRY", "PIPPIN", "FRODO", "BAGGINS", "SAMWISE", "GOLLUM", "ELROND", "RIVENDELL", "ARWEN", "LOTHLORIEN", "PEREGRIN", "GLAMDRING", "STING", "GONDOLIN", "MORIA", "DWARROWDELF", "MIRKWOOD", "GONDOR", "SHIRE", "NAZGUL ", "RADAGAST", "ANDUIN", "GOBLIN", "SPIDER", "ORCRIST", "EOWYN", "FARAMIR", "GALADRIEL", "FOE-HAMMER", "KHAZAD-DUM",
];

// const KEY_TO_START = "Enter";
// const KEY_NEW_GAME = "Enter";
const HIDE_CHAR = '_';

const MAX_GUESSES = 14;
const GAME_RESET = {
    guessesRemaining: MAX_GUESSES,

    // lettersGuessed_Str: "",
    lettersGuessed_Obj: {
        A: false, B: false, C: false, D: false,
        E: false, F: false, G: false, H: false,
        I: false, J: false, K: false, L: false,
        M: false, N: false, O: false, P: false,
        Q: false, R: false, S: false, T: false,
        U: false, V: false, W: false, X: false,
        Y: false, Z: false
    },

    wordAnswer  : "",
    wordProgress: "",

    endOfGame: false,
}

// GLOBALS
let gameVars = {
    wins: 0,
    sessionStarted: false,
};

// Global - Store DOM elements that get regularly altered
// !! Important that object's keys are the same name as the HTML id=".."
let DOM_IDs = {
    word       : { el: null, gVar: "wordProgress"       },
    guessCount : { el: null, gVar: "guessesRemaining"   },
    letters    : { el: null, }, //gVar: "lettersGuessed_Str" },
    wins       : { el: null, gVar: "wins"               },
    // help      : { el: null },
    instr      : { el: null },
    wordAlert  : { el: null },
    letterAlertWrong: { el: null },
    letterAlertRepeat: { el: null },
};

// FUNCTIONS
window.onload = function () {
    console.log("--- ON LOAD ---");

    // One-off DOM elements
    document.getElementById("maxGuesses").textContent = MAX_GUESSES;
    
    // Link up the variables to their DOM elements 
    Object.entries(DOM_IDs).forEach( ([k,v]) => {
        v.el = document.getElementById(k);
    });

    showInstr("Press " 
        + ((typeof KEY_TO_START === "string") ?
            "[" + KEY_TO_START + "]"
            : "any")
        + " key to get started!");
    
    startGameSession();
    console.log(gameVars.wordAnswer);
    DOM_IDs.wordAlert.el.textContent = gameVars.wordAnswer;
};

let updateElements = (...args) => {
    args.forEach( (id) => {
        id.el.textContent = gameVars[id.gVar];
    });
};

function startNewGame() {
    console.log("--- STARTING NEW GAME ---");

    //// Set Game Variables
    // deep copy the reset object, but keep our own 'live' variables (eg wins)
    gameVars = Object.assign(gameVars, JSON.parse(JSON.stringify(GAME_RESET))); 

    // New random word
    gameVars.wordAnswer = WORD_BANK[
        Math.floor(Math.random() * WORD_BANK.length)
    ].replace('-','') // removing hyphens, 
    .toUpperCase(); // word bank should already be ALL-CAPS, but just in case
    gameVars.wordAnswer = "FOEHAMMER";

    console.log("cheat: " + gameVars.wordAnswer);
        
    // display word as "hidden" string
    gameVars.wordProgress = HIDE_CHAR.repeat(gameVars.wordAnswer.length);

    // showHelp(); // hides 
    showInstr("Press letter keys to guess the word.");
    ////

    updateElements(
        DOM_IDs.word      , 
        DOM_IDs.guessCount, 
        DOM_IDs.letters   ,
    );
}

// function showHelp(alertType, msgs) {
//     if (!alertType) {
//         DOM_IDs.help.el.style.visibility = 'hidden';
//     }
//     else {
//         let alertEl = document.createElement("div");
//         alertEl.className = "w-100 alert " + alertType;
//         // console.log(alertEl);

//         msgs.forEach( (msg) => {
//             let msgP = document.createElement("p");
//             msgP.className = "m-0";
//             msgP.textContent = msg;
//             alertEl.appendChild(msgP);
//         });
//         console.log(alertEl);
//         DOM_IDs.help.el.replaceChild(alertEl, DOM_IDs.help.el.firstChild);
//         DOM_IDs.help.el.style.visibility = 'visible';
//         console.log(msgs);
//     }
// }

function showInstr(msg) {
    DOM_IDs.instr.el.textContent = msg;
}

function scoreWin() {
    ++gameVars.wins;
    updateElements(DOM_IDs.wins);
}

function checkLetter(letter) {
    ((g) => { 
        let alertType = "";
        let msgs = [];
        let correct = false;

        if (g.wordAnswer .indexOf(letter) < 0) {
            msgs.push(letter + " is not in the word.");
            alertType = "alert-info";
        } else { // letter is in the word 
            correct = true;
            // Update the word display on screen
            for (let i = 0; i < g .wordAnswer .length; ++i) {
                if (g.wordAnswer [i] === letter) {
                    g.wordProgress =
                        g.wordProgress.substring(0, i)
                        + letter
                        + g.wordProgress.substring(i + 1, g.wordProgress.length);
                    // console.log(i,letter,g.wordProgress)
                }
            }

            // Check if completed 
            if (g.wordProgress === g.wordAnswer) {
                alertType = "alert-success";
                msgs.push("You guessed the word!");
                scoreWin();
                g.endOfGame = true;
            }
        }

        // Add letter to guessed list
        let colorLetter = document.createElement("li");
        colorLetter.textContent = letter;
        colorLetter.className = (correct ? "right-letter": "wrong-letter")
        DOM_IDs.letters.el.appendChild(colorLetter);

        if (!g.endOfGame && g.guessesRemaining === 0) {
            msgs.push("You have run out of guesses =[.");
            msgs.push("The word was " + g.wordAnswer);
            alertType = "alert-danger";
            g.endOfGame = true;
        }

        // showHelp(alertType, msgs);

        if (g.endOfGame) {
            showInstr("Press " 
                + ((typeof KEY_NEW_GAME === "string") ?
                    "[" + KEY_NEW_GAME + "]"
                    : "any")
                + " key to start a new game!")
        }
    })(gameVars);
}

// const once = function(f) {
//     return () => {
//         if (!f) { return; }
//         f();
//         f = null;
//     };
// }

function startGameSession() {
    console.log("--- STARTING SESSION ---");

    gameVars.sessionStarted = true;
    // document.getElementById("instr" ).style.visibility = "hidden";
    document.getElementById("gameUI").style.visibility = "visible";
    
    startNewGame();
    updateElements(DOM_IDs.wins); 
}

// let eventsByKey = {
//     // KEY_TO_START: once(startGameSession),
//     // KEY_NEW_GAME: startNewGame          ,
// };

document.onkeyup = function (event) {
    let key = event.key;
    console.log(key);

    if (!gameVars.sessionStarted) {
        // once(startGameSession);
        startGameSession();
    }
    else if (gameVars.endOfGame) {
        startNewGame();
    }
    else {
        // if (eventsByKey.hasOwnProperty(key)) {
        //     eventsByKey[key]();
        // } else 
        if (!gameVars.endOfGame) {
            key = key.toUpperCase();

            if (key.length === 1 && key >= 'A' && key <= 'Z') {
                if (gameVars.lettersGuessed_Obj[key]) {
                    showHelp("alert-warning", ["Letter " + key + " has already been guessed!"]);
                    /// TODO: css highlight 
                }
                else { // New letter guessed
                    gameVars.guessesRemaining--;
                    gameVars.lettersGuessed_Obj[key] = true;
                    // gameVars.lettersGuessed_Str += key;                    

                    checkLetter(key);
                }
                updateElements(DOM_IDs.guessCount, DOM_IDs.word); //, DOM_IDs.letters, ;
            }
        }
    }
};