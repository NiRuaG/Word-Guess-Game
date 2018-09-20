'use strict';

// CONSTANTS
// NB: WORD_BANK words should be ALL CAPS, though there is a later safety toUpperCase() call
// At this point..
//   Hyphens will be removed from the words by the code. They are left in this array incase of future versions & options
//   Diacritics have been removed from this array, and would need editing to restore them. 
const WORD_BANK = [
    "FELLOWSHIP", "MORDOR", "HOBBIT", "DWARF", "WIZARD", "ELVES", "WRAITHS", "RIDERS", "TROLL", "BALROGS", "SAURON", "BOROMIR", "SARUMAN", "ISENGARD", "ARAGORN", "LEGOLAS", "GIMLI", "ROHAN", "GANDALF", "TREEBEARD", "MERRY", "PIPPIN", "FRODO", "BAGGINS", "SAMWISE", "GOLLUM", "ELROND", "RIVENDELL", "ARWEN", "LOTHLORIEN", "PEREGRIN", "GLAMDRING", "STING", "GONDOLIN", "MORIA", "DWARROWDELF", "MIRKWOOD", "GONDOR", "SHIRE", "NAZGUL ", "RADAGAST", "ANDUIN", "GOBLIN", "SPIDER", "ORCRIST", "EOWYN", "FARAMIR", "GALADRIEL", "FOE-HAMMER", "KHAZAD-DUM",
];

const HIDE_CHAR = '_';  // character to display for the hidden letters display

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
    cheating: false,
};

// Globals - Place to Store DOM elements that get regularly altered
// !! Important that object's keys are the same name as the HTML id=".."
// some also link to game variables, and their strings need to match the gameVar/GAME_RESET keys
let DOM_IDs = {
    word                 : { el: null, gVar: "wordProgress"       },
    guessCount           : { el: null, gVar: "guessesRemaining"   },
    letters              : { el: null, },
    wins                 : { el: null, gVar: "wins"               },
    instr                : { el: null, },
    winAlert             : { el: null, },
    wordAlert            : { el: null, },
    wordAlertAnswer      : { el: null, },
    letterAlertWrong     : { el: null, },
    letterAlertWrongChar : { el: null, },
    letterAlertRepeat    : { el: null, },
    letterAlertRepeatChar: { el: null, },
    maxGuesses           : { el: null, },
    guessesAlert         : { el: null, },
};

let Alerts = {
    win          : { dom: DOM_IDs.winAlert         ,                                      },
    word         : { dom: DOM_IDs.wordAlert        , extra: DOM_IDs.wordAlertAnswer       },
    letterWrong  : { dom: DOM_IDs.letterAlertWrong , extra: DOM_IDs.letterAlertWrongChar  },
    letterRepeat : { dom: DOM_IDs.letterAlertRepeat, extra: DOM_IDs.letterAlertRepeatChar },
    guesses      : { dom: DOM_IDs.guessesAlert     ,                                      },
};

// FUNCTIONS
window.onload = function () {
    // console.log("--- ON LOAD ---");
    console.log(
        "For testing purposes, to toggle showing the word answer, ",
        "\nPress Shift + _  (underscore) while in a game on the document page ",
        "\nor run toggleCheat() here in the console.");
    
    // Link up the variables to their DOM elements 
    Object.entries(DOM_IDs).forEach( ([k,v]) => {
        v.el = document.getElementById(k);
    });

    // One-off 'static' DOM elements
    DOM_IDs.maxGuesses.el.textContent = MAX_GUESSES;

    showInstr("Press " 
        + ((typeof KEY_TO_START === "string") ?
            "[" + KEY_TO_START + "]"
            : "any")
        + " key to get started!");    
};

let updateElements = (...args) => {
    args.forEach( (id) => {
        id.el.textContent = gameVars[id.gVar];
    });
};

function startNewGame() {
    // console.log("--- STARTING NEW GAME ---");

    //// Set Game Variables
    // deep copy the reset object, but keep our own 'live' variables (eg wins)
    gameVars = Object.assign(gameVars, JSON.parse(JSON.stringify(GAME_RESET))); 

    // New random word
    gameVars.wordAnswer = WORD_BANK[
        Math.floor(Math.random() * WORD_BANK.length)
    ].replace('-','') // removing hyphens, 
    .toUpperCase(); // word bank should already be ALL-CAPS, but just in case

    if (gameVars.cheating) { showAnswer(); }

    // display word as "hidden" string
    gameVars.wordProgress = HIDE_CHAR.repeat(gameVars.wordAnswer.length);

    hideAlerts();
    showInstr("Press letter keys to guess the word.");
    ////

    updateElements(
        DOM_IDs.word      , 
        DOM_IDs.guessCount, 
        DOM_IDs.letters   ,
    );
}

let hideAlerts = () => {
    Object.values(Alerts).forEach( (v) => {
        v.dom.el.style.visibility = "hidden"
    });
};

let showAlert = (alertID, extra) => {
    alertID.dom.el.style.visibility = "visible";
    if (extra)
        alertID.extra.el.textContent = extra;
};

let showInstr = (msg) => {
    DOM_IDs.instr.el.textContent = msg;
};

let scoreWin = () => {
    ++gameVars.wins;
    updateElements(DOM_IDs.wins);
};

function checkLetter(letter) {
    // console.log("--- CHECKING LETTER ---");
    ((g) => { 
        // correct: is letter in word?
        let correct = (g.wordAnswer.indexOf(letter) >= 0);

        if (!correct) { 
            showAlert(Alerts.letterWrong, letter);
        } else { // letter IS in the word 
            // Update the word progress on screen
            for (let i = 0; i < g .wordAnswer .length; ++i) {
                if (g.wordAnswer [i] === letter) {
                    g.wordProgress =
                        g.wordProgress.substring(0, i)
                        + letter
                        + g.wordProgress.substring(i + 1, g.wordProgress.length);
                    // console.log(i,letter,g.wordProgress)
                }
            }
        }

        // correct (green) or not (red), add guessed letter to list
        let colorLetter = document.createElement("li");
        colorLetter.textContent = letter;
        colorLetter.className = (correct ? "right-letter": "wrong-letter")
        DOM_IDs.letters.el.appendChild(colorLetter);

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
    // console.log("--- STARTING SESSION ---");

    gameVars.sessionStarted = true;
    document.getElementById("gameUI").style.visibility = "visible";
    
    startNewGame();
    updateElements(DOM_IDs.wins); 
}

function endRound() {
    // console.log("--- ENDING ROUND ---");
    showAlert(Alerts.word, gameVars.wordAnswer);

    // show new game instructions
    showInstr("Press " 
                + ((typeof KEY_NEW_GAME === "string") ?
                    "[" + KEY_NEW_GAME + "]"
                    : "any")
                + " key to start a new game!")
    gameVars.endOfGame = true;
}

let showAnswer = () => {
    console.log("Cheat: " + gameVars.wordAnswer);
};

let toggleCheat = () => {
    gameVars.cheating = !gameVars.cheating;
    console.log("Cheating " + (gameVars.cheating ? "on." : "off."));
    if (gameVars.cheating) { showAnswer(); }
};

let eventsByKey = {
    Escape: endRound,
    _     : toggleCheat,
};

document.onkeyup = function (event) {
    // console.log("--- KEY EVENT ---");
    let key = event.key;
    // console.log(key);

    // any key to start game session
    if (!gameVars.sessionStarted) {
        // once(startGameSession);
        startGameSession();
    }
    // otherwise if at end of game, any key to start new game
    else if (gameVars.endOfGame) {
        startNewGame();
    }
    // otherwise special 'event' keys
    else if (eventsByKey.hasOwnProperty(key)) {
        eventsByKey[key]();
    } else {
        key = key.toUpperCase();

        // Check if a letter key has been pressed
        if (key.length === 1 && key >= "A" && key <= "Z") {
            hideAlerts();

            if (gameVars.lettersGuessed_Obj[key]) {
                // repeat letter, already guessed
                showAlert(Alerts.letterRepeat, key);
            } else {
                // New letter guessed
                gameVars.guessesRemaining--;
                updateElements(DOM_IDs.guessCount);
                gameVars.lettersGuessed_Obj[key] = true;

                checkLetter(key);
                updateElements(DOM_IDs.word);

                // Check if word is now completed (WIN)
                if (gameVars.wordProgress === gameVars.wordAnswer) {
                    showAlert(Alerts.win);
                    scoreWin();
                    gameVars.endOfGame = true;
                }
                // otherwise check if now out of guesses (LOSS)
                else if (gameVars.guessesRemaining === 0) {
                    showAlert(Alerts.guesses);
                    showAlert(Alerts.word, gameVars.wordAnswer);
                    gameVars.endOfGame = true;
                }

                // if at end of game for either reason (WIN/LOSS), show instructions for new game
                if (gameVars.endOfGame) {
                    showInstr(
                        "Press " +
                        (typeof KEY_NEW_GAME === "string"
                            ? "[" + KEY_NEW_GAME + "]"
                            : "any") +
                        " key to start a new game!"
                    );
                }
            }
        }
    }
};