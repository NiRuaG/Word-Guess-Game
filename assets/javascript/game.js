'use strict';

const KEY_TO_START = "Enter";
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

let wins = 0;
let guessesRemaining =   MAX_GUESSES;
let lettersGuessed   = RESET_GUESSES;
let lettersGuessed_Str = "";
let word_answer = "random";
let word_progress = "";

// Store DOM elements
let ID_word;
let ID_guesses;
let ID_letters;
let ID_help;
let ID_wins;

// let ele_IDs = [
    // "word",
    // "guesses",
    // "letters"
// ];

window.onload = function() {
  document.getElementById("keyToStart").textContent = 
    (typeof KEY_TO_START === "string") ? 
        "[" + KEY_TO_START + "]"
        : "any";
    
    // link DOM elements
  ID_word    = document.getElementById("word"   );
  ID_guesses = document.getElementById("guesses");
  ID_letters = document.getElementById("letters");
  ID_help    = document.getElementById("help"   );
  ID_wins    = document.getElementById("wins"   );

  makeNewWord();
};

function updateElements() {
       ID_word.textContent = word_progress     ;
    ID_letters.textContent = lettersGuessed_Str;
    ID_guesses.textContent = guessesRemaining  ;
}

function makeNewWord() {
    console.log("--- MAKING NEW WORD ---");
    word_answer = "bananana";
    word_progress = '-'.repeat(word_answer.length);

    // Reset values
    guessesRemaining =   MAX_GUESSES;
    lettersGuessed   = RESET_GUESSES;

    updateElements();
}

function clearWord() {
    ID_word.textContent    = "(cleared)";
    ID_letters.textContent = "(cleared)";
    ID_guesses.textContent = "(cleared)";
    // updateElements();
}

function scoreWin() {
    ID_wins.textContent = ++wins;
}

let eventsByKey = {
  F1: makeNewWord,
  Backspace: clearWord,
};


document.onkeyup = function (event) {
    let key = event.key.toLowerCase();  // allow captial lettes / capslock on

    if (eventsByKey.hasOwnProperty(key)) {
        eventsByKey[key]();
    }

    else if (key.length === 1 && key >= 'a' && key <= 'z') {
        if (lettersGuessed[key]) {
            ID_help.textContent = "Letter " + key + " has already been guessed!";
            /// TODO: css highlight 
        }
        else {
            lettersGuessed[key] = true;
            lettersGuessed_Str += key;
            if (word_answer.indexOf(key) < 0) {
                ID_help.textContent = key + " is NOT in the word.";
            }
            else {
                for (let i = 0; i < word_answer.length; ++i) {
                    if (word_answer[i] === key) {
                        word_progress = word_progress.substring(0,i) + key + word_progress.substring(i+1, word_answer.length);
                        // console.log(i,key,word_progress)
                    }
                }
                if (word_progress === word_answer){
                    ID_help.textContent = "You guessed the word!";
                    scoreWin();
                }
            }
        }
    }

    updateElements();
    // console.log(key);
};
