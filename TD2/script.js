const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const START_BALANCE = 1000;

// Éléments de la page
const balanceP = document.querySelector('#balance');
const betInput = document.querySelector('#bet');
const betButton = document.querySelector('#bet-button');
const dealerDiv = document.querySelector('#dealer-hand');
const dealerTotalP = document.querySelector('#dealer-total');
const playerDiv = document.querySelector('#player-hand');
const playerTotalP = document.querySelector('#player-total');
const messageP = document.querySelector('#message');
const drawButton = document.querySelector('#draw');
const stopButton = document.querySelector('#stop');
const replayButton = document.querySelector('#replay');

// État du jeu
let deck = [];
let playerHand = [];
let dealerHand = [];
let dealerHidden = true;
let balance = START_BALANCE;
let currentBet = 0;

// Paquet et cartes
function createDeck() {
  const cards = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      cards.push({ value: value, suit: suit });
    }
  }
  return cards;
}

// Retire une carte au hasard du paquet et elle ne peut donc plus être tirée
function drawCard() {
  const index = Math.floor(Math.random() * deck.length);
  return deck.splice(index, 1)[0];
}

// Calcul des points

function cardPoints(card) {
  if (card.value === 'A') {
    return 11;
  }
  if (card.value === 'J' || card.value === 'Q' || card.value === 'K') {
    return 10;
  }
  return Number(card.value);
}

function handTotal(cards) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += cardPoints(card);
    if (card.value === 'A') {
      aces++;
    }
  }
  // Un As compté 11 devient 1 si on dépasse 21
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  return total;
}

// ---------- Affichage ----------

// A, J, Q, K : grand texte au centre. Les autres : petit texte.
function isFigure(card) {
  return ['A', 'J', 'Q', 'K'].includes(card.value);
}

function centerText(card) {
  if (card.value === 'A') {
    return card.suit;
  }
  if (isFigure(card)) {
    return card.value;
  }
  return card.value + card.suit;
}

function createCardElement(card) {
  const color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
  const size = isFigure(card) ? 'figure' : 'number';

  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'card-front', color);

  const top = document.createElement('div');
  top.classList.add('top');
  top.textContent = card.value + ' ' + card.suit;

  const center = document.createElement('div');
  center.classList.add('center', size);
  center.textContent = centerText(card);

  const bottom = document.createElement('div');
  bottom.classList.add('bottom');
  bottom.textContent = card.value + ' ' + card.suit;

  cardDiv.append(top, center, bottom);
  return cardDiv;
}

function createBackElement() {
  const cardDiv = document.createElement('div');
  cardDiv.classList.add('card', 'card-back');
  return cardDiv;
}

// Affiche une main dans un conteneur. hideSecond cache la 2e carte.
function showHand(container, cards, hideSecond) {
  container.innerHTML = '';
  for (let i = 0; i < cards.length; i++) {
    if (hideSecond && i === 1) {
      container.append(createBackElement());
    } else {
      container.append(createCardElement(cards[i]));
    }
  }
}

function showTable() {
  showHand(playerDiv, playerHand, false);
  showHand(dealerDiv, dealerHand, dealerHidden);
  playerTotalP.textContent = 'Total : ' + handTotal(playerHand);
  if (dealerHidden) {
    dealerTotalP.textContent = 'Total : ?';
  } else {
    dealerTotalP.textContent = 'Total : ' + handTotal(dealerHand);
  }
}

function showBalance() {
  balanceP.textContent = 'Solde actuel : ' + balance + ' unités';
}

// ---------- Mises ----------

// Une mise est valide si c'est un entier > 0 et <= au solde
function isValidBet(bet) {
  return Number.isInteger(bet) && bet > 0 && bet <= balance;
}

function updateBalance(result) {
  if (result === 'win') {
    balance += currentBet;
  } else if (result === 'lose') {
    balance -= currentBet;
  }
  // égalité : le solde ne change pas
  showBalance();
}

function onBet() {
  const bet = Number(betInput.value);
  if (!isValidBet(bet)) {
    messageP.textContent = 'Mise invalide : entrez un nombre entier entre 1 et ' + balance + '.';
    return;
  }
  currentBet = bet;
  betInput.disabled = true;
  betButton.disabled = true;
  startGame();
}

// ---------- Déroulement du jeu ----------

// result vaut 'win', 'lose' ou 'draw'
function endGame(result, message) {
  updateBalance(result);
  if (balance === 0) {
    message += ' Vous n\'avez plus d\'argent : la partie est terminée.';
  }
  messageP.textContent = message;
  drawButton.disabled = true;
  stopButton.disabled = true;
  replayButton.disabled = false;
}

// Le croupier tire tant que sa main est inférieure à 17
function dealerPlay() {
  while (handTotal(dealerHand) < 17) {
    dealerHand.push(drawCard());
  }
}

function getResult() {
  const player = handTotal(playerHand);
  const dealer = handTotal(dealerHand);
  if (dealer > 21 || player > dealer) {
    return 'win';
  }
  if (player < dealer) {
    return 'lose';
  }
  return 'draw';
}

function onStop() {
  dealerHidden = false;
  dealerPlay();
  showTable();

  const result = getResult();
  if (result === 'win') {
    endGame(result, 'Vous avez gagné !');
  } else if (result === 'lose') {
    endGame(result, 'Vous avez perdu.');
  } else {
    endGame(result, 'Égalité : la mise est remboursée.');
  }
}

function checkPlayer() {
  const total = handTotal(playerHand);
  if (total > 21) {
    endGame('lose', 'Désolé, vous avez dépassé 21. Vous avez perdu.');
  } else if (total === 21) {
    onStop();
  }
}

function onDraw() {
  playerHand.push(drawCard());
  showTable();
  checkPlayer();
}

// Distribue les cartes (appelée une fois la mise acceptée)
function startGame() {
  deck = createDeck();
  playerHand = [drawCard(), drawCard()];
  dealerHand = [drawCard(), drawCard()];
  dealerHidden = true;

  messageP.textContent = '';
  drawButton.disabled = false;
  stopButton.disabled = false;
  replayButton.disabled = true;

  showTable();
  checkPlayer();
}

// Prépare une nouvelle manche : table vide, en attente d'une mise
function newRound() {
  playerHand = [];
  dealerHand = [];
  playerDiv.innerHTML = '';
  dealerDiv.innerHTML = '';
  playerTotalP.textContent = '';
  dealerTotalP.textContent = '';
  messageP.textContent = 'Placez votre mise pour commencer.';

  betInput.disabled = false;
  betButton.disabled = false;
  drawButton.disabled = true;
  stopButton.disabled = true;
  replayButton.disabled = true;
  showBalance();
}

function onReplay() {
  if (balance === 0) {
    const again = confirm('Vous n\'avez plus d\'argent. Recommencer avec ' + START_BALANCE + ' unités ?');
    if (!again) {
      return;
    }
    balance = START_BALANCE;
  }
  newRound();
}

betButton.addEventListener('click', onBet);
drawButton.addEventListener('click', onDraw);
stopButton.addEventListener('click', onStop);
replayButton.addEventListener('click', onReplay);
newRound();
