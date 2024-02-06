const inputEl = document.querySelector(".input");
const bodyEl = document.querySelector("body");
const gridContainer = document.querySelector(".grid-container");
let cards = [];
let firstCard, secondCard;
let lockBoard = false;
let score = 0;
let timer;
let timerExpired = false;

document.querySelector(".score").textContent = score;

inputEl.checked = JSON.parse(localStorage.getItem("mode"));

updateBody();

function updateBody() {
  if (inputEl.checked) {
    bodyEl.style.background = "#1c1c1c";
    bodyEl.style.color = "white";
  } else {
    bodyEl.style.background = "#dbdbdb";
    bodyEl.style.color = "black"
  }
}

inputEl.addEventListener("change", () => {
  updateBody();
  updateLocalStorage();
});

function updateLocalStorage() {
  localStorage.setItem("mode", JSON.stringify(inputEl.checked));
}

fetch("./data/cards.json")
  .then((res) => res.json())
  .then((data) => {
    cards = [...data, ...data];
    shuffleCards();
    generateCards();
  });

function shuffleCards() {
  let currentIndex = cards.length,
    randomIndex,
    temporaryValue;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }
}

function generateCards() {
  for (let card of cards) {
    const cardElement = document.createElement("div");
    cardElement.classList.add("card");
    cardElement.setAttribute("data-name", card.name);

    cardElement.innerHTML = `
        <div class="front">
            <img class="front-image" src=${card.image} />
        </div>
        <div class="back"></div>
        `;
    gridContainer.appendChild(cardElement);
    cardElement.addEventListener("click", flipCard);
  }
}
function startTimer() {
  let timeRemaining = 45;
  document.querySelector(".timer").textContent = formatTime(timeRemaining);

  timer = setInterval(() => {
    timeRemaining--;
    document.querySelector(".timer").textContent = formatTime(timeRemaining);

    if (timeRemaining <= 0) {
      alert(`Time's up! Your score is ${score}.`);
      timerExpired = true;
      checkGameCompletion();
      clearInterval(timer);
    }
  }, 1000);
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
}

function flipCard() {
  if (lockBoard || timerExpired) return;
  if (this === firstCard) return;

  this.classList.add("flipped");

  if (!firstCard) {
    firstCard = this;
    if (!timer) {
      startTimer();
    }
    return;
  }

  secondCard = this;

  if (checkForMatch()) {
    score++;
    document.querySelector(".score").textContent = score;
    if (score < cards.length / 2) {
        lockBoard = false;
    }
} else {
    lockBoard = true;
}

  checkForMatch();
}

function checkForMatch() {
  let isMatch = firstCard.dataset.name === secondCard.dataset.name;

  isMatch ? disableCards() : unflipCards();

  return isMatch;
}

function checkGameCompletion() {
  const allCards = document.querySelectorAll('.card');
  const flippedCards = document.querySelectorAll('.flipped');

  if(flippedCards.length === allCards.length) {
    clearInterval(timer);
    lockBoard = true;
    setTimeout(() => {

    alert(`Congratulations! You matched all pairs! Your score is ${score} points.`);
  }, 1000);
  }
}

function disableCards() {
  firstCard.removeEventListener("click", flipCard);
  secondCard.removeEventListener("click", flipCard);

  checkGameCompletion();

  resetBoard();
}

function unflipCards() {
  setTimeout(() => {
    firstCard.classList.remove("flipped");
    secondCard.classList.remove("flipped");
    resetBoard();
    lockBoard = false;

    if (!timer) {
      startTimerOnce();
    }
  }, 500);
}

function resetBoard() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

function restart() {
  clearInterval(timer);
  timerExpired = false;
  timer = null;

  score = 0;
  document.querySelector(".score").textContent = score;
  gridContainer.innerHTML = "";
  generateCards();

  lockBoard = false;

  document.addEventListener("click", startTimerOnce);
}

function startTimerOnce(event) {
  if (event.target.classList.contains("card")) {
    document.removeEventListener("click", startTimerOnce);

    let timeRemaining = 60;
    document.querySelector(".timer").textContent = formatTime(timeRemaining);

    timer = setInterval(() => {
      timeRemaining--;
      document.querySelector(".timer").textContent = formatTime(timeRemaining);

      if (timeRemaining <= 0) {
        alert("Time's up!");
        timerExpired = true;
        checkGameCompletion();
        clearInterval(timer);
      }
    }, 1000);
  }
}