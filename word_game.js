const letters = document.querySelectorAll(".input_letter");
const loadingDiv = document.querySelector(".info_bar");
const ANSWER_LENGTH = 5;
const ROUNDS = 6;

async function init(){

    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day");
    const {word} = await res.json();
    const wordParts = word.toUpperCase().split("");
    let done = false;
   setLoading(false);
    isLoading = false;


    function addLetter(letter){
        if(currentGuess.length < ANSWER_LENGTH){
            currentGuess += letter;
        }else{
            // this replaces the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length - 1) + letter;
        }

        letters[ANSWER_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit(){
      if (currentGuess.length != ANSWER_LENGTH) {
        // do nothing
        return;
      }

      // TODO validate the word
      isLoading = true;
      setLoading(true);
      const res = await fetch("https://words.dev-apis.com/validate-word", {
        method: "POST",
        body: JSON.stringify({word: currentGuess})
      });

      const resObj = await res.json();
      const {validWord} = resObj;
      isLoading = false;
      setLoading(false);

      if(!validWord){
        markInvalidWord();
        return;
      }


      //all the marking as "correct", "close" or "wrong"
      const guessParts = currentGuess.split("");
      const map = makeMap(wordParts);

      for (let i = 0; i < ANSWER_LENGTH; i++) {
        // mark as correct
        if (guessParts[i] === wordParts[i]) {
          letters[currentRow * ANSWER_LENGTH + i].classList.add("correct");
          map[guessParts[i]]--;
        }
      }

      for (let i = 0; i < ANSWER_LENGTH; i++) {
        if (guessParts[i] === wordParts[i]) {
          //do nothing
        } else if (
          wordParts.includes(guessParts[i]) &&
          map[guessParts[i]] > 0
        ) {
          // mark as close
          letters[currentRow * ANSWER_LENGTH + i].classList.add("close");
          map[guessParts[i]]--;
        } else {
          //mark as wrong
          letters[currentRow * ANSWER_LENGTH + i].classList.add("wrong");
        }
      }

      currentRow++;
      
      //when they win
      if (currentGuess === word.toUpperCase()) {
          alert("you win!");
          document.querySelector(".brand").classList.add("winner");
          done = true;
          return;
        } else if (currentRow === ROUNDS) {
            //   when they lose
            alert(`You lose, the word was ${word.toUpperCase()}`);
            done = true;
        }
        currentGuess = "";
  }

    function backspace(){
        currentGuess = currentGuess.substring(0, currentGuess.length - 1);
        letters[ANSWER_LENGTH * currentRow + currentGuess.length].innerText = ''
    }

    function markInvalidWord(){
        // alert("Not a valid word");

        for(let i = 0 ; i < ANSWER_LENGTH; i++){
          letters[currentRow * ANSWER_LENGTH + i].classList.remove("invalid");

          setTimeout(function(){
          letters[currentRow * ANSWER_LENGTH + i].classList.add("invalid");
          },10);
        }
    }
    




    document.addEventListener("keydown", function keyPressedDown(event){
        if(done || isLoading){
            return;
        }
        const action = event.key;
    
        if(action ==="Enter"){
            commit()
        }else if(action === "Backspace"){
            backspace();
        }else if(isLetter(action)){
            addLetter(action.toUpperCase())
        }else{
            // do nothing
        }
    })
}

function isLetter(letter) {
  return /^[a-zA-Z]$/.test(letter);
}

function setLoading(isLoading){
    loadingDiv.classList.toggle("show", isLoading)
}

function makeMap(array){
    let obj = {};
    for(let i = 0; i < array.length; i++){
        let letter = array[i];
        if(obj[letter]){
            obj[letter]++;
        }else{
            obj[letter] = 1;
        }
    }

    return obj;
}
init()