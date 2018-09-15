'use strict';

const KEY_TO_START = "Escape";
const MAX_GUESSES = 14;
const RESET_GUESSES = {
    a: false, b: false, c: false, d: false,
    e: false, f: false, g: false, h: false,
    i: false, j: false, k: false, l: false,
    m: false, n: false, o: false, p: false,
    q: false, r: false, s: false, t: false,
    u: false, v: false, w: false, x: false,
    y: false, z: false
};

const WORD_BANK = [
    "randomA",
    "randomB",
    "randomC",
    "randomD",
    "randomE",
    "randomF"
];

let wins = 0;
let guessesRemaining = MAX_GUESSES;
let lettersGuessed   = Object.assign({}, RESET_GUESSES); // "shallow" copy
let lettersGuessed_Str = "";
let word_answer = "";
let word_progress = "";
let betweenGames = false;


// Store DOM elements
let ID_word;
let ID_Guesses;
let ID_Letters;
let ID_Help;
let ID_Wins;

// let myDOM_EL = {
//     ID_Word: { id: "word" },
//     ID_Guesses: { id: "guesses" },
//     ID_Letters: { id: "letters" },
//     ID_Help: { id: "help" },
//     ID_Wins: { id: "wins" },
// };

window.onload = function () {
    document.getElementById("keyToStart").textContent =
        (typeof KEY_TO_START === "string") ?
            "[" + KEY_TO_START + "]"
            : "any";

    // link DOM elements
    // myDOM_EL.forEach(el => {
    // el.element = document.getElementById(el.id);
    // });
    // console.log(myDOM_EL);
    ID_word    = document.getElementById("word"   );
    ID_Guesses = document.getElementById("guesses");
    ID_Letters = document.getElementById("letters");
    ID_Help    = document.getElementById("help"   );
    ID_Wins    = document.getElementById("wins"   );

    makeNewWord();
};

function updateElements() {
       ID_word.textContent = word_progress     ;
    ID_Letters.textContent = lettersGuessed_Str;
    ID_Guesses.textContent = guessesRemaining  ;
}

function makeNewWord() {
    console.log("--- MAKING NEW WORD ---");
    var rnd = Math.floor(Math.random()*WORD_BANK.length);
    console.log("rnd: " + rnd);
    word_answer = WORD_BANK[rnd];
    console.log("cheat: " + word_answer);

    word_progress = '-'.repeat(word_answer.length);

    // Reset values
    guessesRemaining =   MAX_GUESSES;
    lettersGuessed   = Object.assign({},RESET_GUESSES);  // copy the 
    console.log(lettersGuessed);
    lettersGuessed_Str = "";
    ID_Help.textContent = "";
    betweenGames = false;

    updateElements();
}

function clearWord() {
    console.log("--- CLEARING WORDS ---");
    ID_word.textContent    = "(cleared)";
    ID_Letters.textContent = "(cleared)";
    ID_Guesses.textContent = "(cleared)";
    // updateElements();
}

function scoreWin() {
    ID_Wins.textContent = ++wins;
}

let eventsByKey = {
  Escape: makeNewWord,
  Backspace: clearWord,
};


document.onkeyup = function (event) {
    let key = event.key;
    console.log(key);

    if (eventsByKey.hasOwnProperty(key)) {
        eventsByKey[key]();
    }

    if (!betweenGames) {
        key = key.toLowerCase();  // allow captial lettes / capslock on

        if (key.length === 1 && key >= 'a' && key <= 'z') {
            if (lettersGuessed[key]) {
                ID_Help.textContent = "Letter " + key + " has already been guessed!";
                /// TODO: css highlight 
            }
            else {
                lettersGuessed[key] = true;
                lettersGuessed_Str += key;
                guessesRemaining--;

                if (word_answer.toLowerCase().indexOf(key) < 0) {
                    ID_Help.textContent = key + " is NOT in the word. ";
                    // trigger css
                    if (guessesRemaining === 0){
                        ID_Help.textContent += " You have run out of guesses =[. ";
                        betweenGames = true;
                    }
                } else { // letter is in the word
                    for (let i = 0; i < word_answer.length; ++i) {
                        if (word_answer[i].toLowerCase() === key) {
                            word_progress = word_progress.substring(0, i) + key + word_progress.substring(i + 1, word_answer.length);
                            // console.log(i,key,word_progress)
                        }
                    }

                    // Check if completed
                    if (word_progress === word_answer.toLowerCase()) {
                        ID_Help.textContent = "You guessed the word!";
                        scoreWin();
                        betweenGames = true;
                    }
                }
            }
            updateElements();
        }
    }
};
