'use strict';

// CONSTANTS
// NB: WORD_BANK words should be all caps, though there is a safety toUpperCase() call
const WORD_BANK = [
    "RANDOMA",
    "RANDOMB",
    "RANDOMC",
    "RANDOMD",
    "RANDOME",
    "RANDOMF"
];

const KEY_TO_START = "Enter";
const HIDE_CHAR = '_';

const MAX_GUESSES = 8;
const GAME_RESET = {
    guessesRemaining  : MAX_GUESSES,

    lettersGuessed_Str: "",
    lettersGuessed_Obj: {
        A: false, B: false, C: false, D: false,
        E: false, F: false, G: false, H: false,
        I: false, J: false, K: false, L: false,
        M: false, N: false, O: false, P: false,
        Q: false, R: false, S: false, T: false,
        U: false, V: false, W: false, X: false,
        Y: false, Z: false
    },

    wordAnswer  : ""   ,
    wordProgress: ""   ,

    endOfGame   : false,
}

// GLOBALS
let gameVars = {
    wins: 0,
};

// Global - Store DOM elements
// !! Important that property keys are the same name as the HTML id=".."
let DOM_IDs = {
    word      : { el: null, gVar: "wordProgress"       },
    guessCount: { el: null, gVar: "guessesRemaining"   },
    letters   : { el: null, gVar: "lettersGuessed_Str" },
    wins      : { el: null, gVar: "wins"               },
    help      : { el: null                             },
};


// FUNCTIONS
window.onload = function () {
    console.log("--- ON LOAD ---");

    // One-off DOM elements
    document.getElementById("instr").textContent = "Press " +
        ((typeof KEY_TO_START === "string") ?
            "[" + KEY_TO_START + "]"
            : "any")
        + " key to get started!";

    document.getElementById("maxGuesses").textContent = MAX_GUESSES;
    
    // Link up the variables to their DOM elements 
    Object.entries(DOM_IDs).forEach( ([k,v]) => {
        v.el = document.getElementById(k);
    });
};

function updateElements(...args) {
    args.forEach( (id) => {
        id.el.textContent = gameVars[id.gVar];
    });
}

function startNewGame() {
    console.log("--- STARTING NEW GAME ---");

    //// Set Game Variables
    // deep copy the reset object, but keep our own 'live' variables (eg wins)
    gameVars = Object.assign(gameVars, JSON.parse(JSON.stringify(GAME_RESET))); 

    // New random word
    gameVars.wordAnswer = WORD_BANK[
        Math.floor(Math.random() * WORD_BANK.length)
    ].toUpperCase(); // word bank should already be ALL-CAPS, but just in case
        
    console.log("cheat: " + gameVars.wordAnswer);
        
    // display word as "hidden" string
    gameVars.wordProgress = HIDE_CHAR.repeat(gameVars.wordAnswer.length);

    showHelp("");
    ////

    updateElements(
        DOM_IDs.word      , 
        DOM_IDs.guessCount, 
        DOM_IDs.letters   ,);
}

function showHelp(msg) {
    DOM_IDs.help.el.textContent = msg;
}

function scoreWin() {
    ++gameVars.wins;
    updateElements(DOM_IDs.wins);
}

function checkLetter(letter) {
    ((g) => { 
        if (g.wordAnswer .indexOf(letter) < 0) {
            let msg = letter + " is NOT in the word.";
            // trigger css
            if (g.guessesRemaining === 0) {
                msg += " You have run out of guesses =[";
                g.endOfGame = true;
            }
            showHelp(msg);
        } else { // letter is in the word 
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
            if (g.wordProgress === g.wordAnswer ) {
                showHelp("You guessed the word!");
                scoreWin();
                g.endOfGame = true;
            }
        }
    })(gameVars);
}

const once = function(f) {
    return () => {
        if (!f) { return; }
        f();
        f = null;
    };
}

function startGameSession() {
    console.log("--- STARTING SESSION ---");

    document.getElementById("instr" ).style.visibility = "hidden";
    document.getElementById("gameUI").style.visibility = "visible";

    startNewGame();
    updateElements(DOM_IDs.wins); 
}

let eventsByKey = {
    Enter  : once(startGameSession),
    Escape : startNewGame          ,
};

document.onkeyup = function (event) {
    let key = event.key;
    console.log(key);

    if (eventsByKey.hasOwnProperty(key)) {
        eventsByKey[key]();
    }

    if (!gameVars.endOfGame) {
        key = key.toUpperCase();

        if (key.length === 1 && key >= 'A' && key <= 'Z') {
            if (gameVars.lettersGuessed_Obj[key]) {
                showHelp("Letter " + key + " has already been guessed!");
                /// TODO: css highlight 
            }
            else { // New letter guessed
                gameVars.guessesRemaining--;
                gameVars.lettersGuessed_Obj[key] = true;
                gameVars.lettersGuessed_Str += key;

                checkLetter(key);
            }
            updateElements(DOM_IDs.guessCount, DOM_IDs.letters, DOM_IDs.word);
        }
    }
};