import helper from './helpers.js';
import generate from './bag.js';
import obj from './objective.js';
import { KEY, KEY_BIND, KEY_EVENTS, pressedKeys } from './events.js'
'use strict'

//DOM stuff
//main canvas
const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

//tetrominoes canvas 
const holdCanvas = document.getElementById('hold-piece');
const nextCanvas = document.getElementById('next-canvas1');
const nextCanvas2 = document.getElementById('next-canvas2');
const nextCanvas3 = document.getElementById('next-canvas3');
const nextCanvas4 = document.getElementById('next-canvas4');
const holdContext = holdCanvas.getContext('2d');
const nextContext = nextCanvas.getContext('2d');
const nextContext2 = nextCanvas2.getContext('2d');
const nextContext3 = nextCanvas3.getContext('2d');
const nextContext4 = nextCanvas4.getContext('2d');

//level and scores
const levelEl = document.querySelector('#modifiableVars > #level');
const scoreEl = document.querySelector('#modifiableVars > #score');

//DOM instances for high scores
const highScoreEl = document.querySelector('#high-scores > #high-score1');
const highScoreEl2 = document.querySelector('#high-scores > #high-score2');
const highScoreEl3 = document.querySelector('#high-scores > #high-score3');
const highScoreEl4 = document.querySelector('#high-scores > #high-score4');
const highScoreEl5 = document.querySelector('#high-scores > #high-score5');

const displayC = document.getElementById("displayController");
const startInstruct = document.getElementById("howToStart");

//board properties
const BOX = 30;
const TOTALROW = 20;
const TOTALCOL = 10;

//"rgba(24,36,36, 0.9)" - old filler color
const FILLER = "rgb(24,36,36)"; //unoccupied space 
const T_BOX = 45;

//highscores
let high = 0;
let high2 = 0;
let high3 = 0;
let high4 = 0;
let high5 = 0;

let gameOver = false;

//assigning the event function to a variable to be removed later
let tetrisKeydownEvent = tetrisKeyOnce;

//get the high scores if it exists
if (localStorage.getItem("savedHigh") !== null) {
    high = localStorage.getItem("savedHigh");
    highScoreEl.textContent = `1: ${high}`;
}
if (localStorage.getItem("savedHigh2") !== null) {
    high2 = localStorage.getItem("savedHigh2");
    highScoreEl2.textContent = `2: ${high2}`;
}

if (localStorage.getItem("savedHigh3") !== null) {
    high3 = localStorage.getItem("savedHigh3");
    highScoreEl3.textContent = `3: ${high3}`;
}

if (localStorage.getItem("savedHigh4") !== null) {
    high4 = localStorage.getItem("savedHigh4");
    highScoreEl4.textContent = `4: ${high4}`;
}

if (localStorage.getItem("savedHigh5") !== null) {
    high5 = localStorage.getItem("savedHigh5");
    highScoreEl5.textContent = `5: ${high5}`;
}

//display game over modal
function displayGameOver() {
    const canvasModal = document.getElementById('canvasContainer');
    const modalBox = helper.createElement('', 'game-over-box', 'modal-box', 'div');
    const gameOverText = helper.createElement("Game Over", 'game-over-text', 'modal-text', 'p');
    const tryAgainBtn = helper.createElement('Try Again', 'play-again-btn', 'modal-btn', 'button');

    helper.modifyAttr(canvas, 'style', `opacity: 0.4;`);
    modalBox.append(gameOverText, tryAgainBtn);
    canvasModal.append(modalBox);
}

//create the board object
let board = [];
for (let r = 0; r < TOTALROW; r++) {
    board[r] = [];
    for (let c = 0; c < TOTALCOL; c++) {
        board[r][c] = FILLER;
    }
}

//visual board
function drawBoard() {
    for (let r = 0; r < TOTALROW; r++) {
        for (let c = 0; c < TOTALCOL; c++) {
            drawSquare(context, c, r, board[r][c], BOX);
        }
    }
}

function drawSquare(ctx, x, y, color, size) {
    ctx.fillStyle = color;
    ctx.fillRect(x * size, y * size, size, size);
    ctx.strokeStyle = "rgba(24,32,32,0.8)";
    ctx.strokeRect(x * size, y * size, size, size);
}

//clear the canvas
function clearCanvas(ctx) {
    ctx.clearRect(0, 0, 280, 140);
}
drawBoard();

//Increases level
function levelForward(r) {
    obj.lineClear();
    obj.scoreAdd(obj.oneDropCombo(r));
    obj.spdUp();
    levelEl.textContent = `Level: ${obj.getLevel()}`;
}

//generate a bag of tetrominoes
generate.tetrotetro(generate.getBag());
generate.tetrotetro(generate.getRefillBag());

//initialized variable of both bags
let bag = generate.getBag();
let refiller = generate.getRefillBag();

//generate random order pieces until it resets to generate again when it's empty
function generatePiece() {
    if (refiller.length === 0) {
        generate.newBag();
        generate.tetrotetro(generate.getRefillBag());
        refiller = generate.getRefillBag();
    }
    let r = getPiece();
    displayNextPieces(); //display the next pieces after the current piece
    passPiece(); //pass the next piece to the initial bag
    return new Piece(TETROMINOES[r][0], TETROMINOES[r][1]);
}

//get the current piece from the generator function
function getPiece() {
    let r = generate.getPiece(0);
    generate.current = bag.shift();
    return r;
}

//pass the next piece from the 2nd bag
//statically refilling the initial bag
function passPiece() {
    let pass = refiller.shift();
    bag.push(pass);
}

//display the upcoming pieces
function displayNextPieces() {
    let r1 = generate.getPiece(0);
    let r2 = generate.getPiece(1);
    let r3 = generate.getPiece(2);
    let r4 = generate.getPiece(3);
    displayTetrominoes(TETROMINOES[r1][0], TETROMINOES[r1][1], nextContext);
    displayTetrominoes(TETROMINOES[r2][0], TETROMINOES[r2][1], nextContext2);
    displayTetrominoes(TETROMINOES[r3][0], TETROMINOES[r3][1], nextContext3);
    displayTetrominoes(TETROMINOES[r4][0], TETROMINOES[r4][1], nextContext4);
}

//assigned random tetromino as a current piece
let piece = generatePiece();

//class consisting of initial pos, current active and properties
function Piece(tetromino, color) {
    this.color = color;
    this.tetromino = tetromino;

    //initial piece pattern
    this.tetrominoN = 0;
    this.tetrominoFirst = this.tetromino[0];

    //set the next piece to active state
    this.activeTetromino = this.tetromino[this.tetrominoN];

    /*forcing the tetronimoes to the initial pos
    when the piece is generated*/
    this.x = 3;
    this.y = -1;
}

//its functionality is lock the pieces in appropriate position
Piece.prototype.lock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {

            // unoccupied spaces are ignored
            if (!this.activeTetromino[r][c]) {
                continue;
            }

            // game over once a tetromino sqr reached the forbidden index
            if (this.y + r < 0) {
                gameOver = true;
                break;
            }

            // lock the piece
            board[this.y + r][this.x + c] = this.color;
        }
    }

    //toggle hold functionality
    if (enableHold === false) { enableHold = true; }

    // remove full rows
    for (let r = 0; r < TOTALROW; r++) {
        let isRowFull = true;

        for (let c = 0; c < TOTALCOL; c++) {
            isRowFull = isRowFull && (board[r][c] != FILLER);
        }
        if (isRowFull) {
            //filled rows are cleared
            for (let y = r; y > 1; y--) {
                for (let c = 0; c < TOTALCOL; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }

            levelForward(r);

            /*adding new unoccupied lines above the board after line clear */
            for (let c = 0; c < TOTALCOL; c++) {
                board[0][c] = FILLER;
            }
        }
    }
    // update the board
    drawBoard();

    // update the score
    scoreEl.textContent = `Score: ${obj.getScore()}`;
}

Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {

            // the new coordinates after position change
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            // skip the empty line from the piece
            if (!piece[r][c]) {
                continue;
            }

            // conditions to implement collision system 
            if (newX < 0 || newX >= TOTALCOL || newY >= TOTALROW) {
                return true;
            }

            // check existing locked pieces
            if (board[newY][newX] != FILLER) {
                return true;
            }
        }
    }
    return false;
}

Piece.prototype.instantDrop = function () {
    this.unDraw();
    this.y + 20;
    this.draw();
}

//add filler or refill the board with tetromino pieces
Piece.prototype.fill = function (ctx, color) {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(ctx, this.x + c, this.y + r, color, BOX);
            }
        }
    }
}

//display the initial pattern of the current piece in either hold/next canvas
function displayTetrominoes(currentTetromino, currentColor, ctx) {
    clearCanvas(ctx);
    for (let r = 0; r < currentTetromino[0].length; r++) {
        for (let c = 0; c < currentTetromino[0].length; c++) {
            if (currentTetromino[0][r][c] && (currentColor !== "yellow" && currentColor !== "cyan")) {
                drawSquare(ctx, c + 1.5, r, currentColor, T_BOX);
            } else if (currentTetromino[0][r][c]) {
                drawSquare(ctx, c + 1, r - 1, currentColor, T_BOX);
            }
        }
    }
}

//draw the current tetromino
Piece.prototype.draw = function (ctx) {
    this.fill(ctx, this.color);
}

//undraw the current tetromino
Piece.prototype.unDraw = function (ctx) {
    this.fill(ctx, FILLER);
}

//functionality when pressing keys
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw(context);
        this.y++;
        this.draw(context);
        obj.scoreAdd(1);
    } else {
        piece = generatePiece();
        this.lock();
    }
}

Piece.prototype.instantDrop = function () {
    while (!this.collision(0, 1, this.activeTetromino)) {
        this.y++;
    }
    //this.draw(context);
    this.lock();
    piece = generatePiece();
}

Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw(context);
        this.x--;
        this.draw(context);
    }
}

Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw(context);
        this.x++;
        this.draw(context);
    }
}

Piece.prototype.rotate = function () {
    //assigned the next pattern to check if it collides to a wall
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let shift = 0;

    //do the wall kick rule
    if (this.collision(0, 0, nextPattern)) {
        this.x > TOTALCOL / 2 ? shift = -1 : shift = 1;
    }

    //check collision during rotate frame
    if (!this.collision(0, 0, nextPattern)) {
        this.unDraw(context);
        this.x += 0;

        //switch to next pattern
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw(context);
    }
}

Piece.prototype.reverseRotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + this.tetromino.length - 1) % this.tetromino.length];
    let shift = 0;

    //do the wall kick
    if (this.collision(0, 0, nextPattern)) {
        this.x > TOTALCOL / 2 ? shift = -1 : shift = 1;
    }

    //check collision during rotate frame
    if (!this.collision(0, 0, nextPattern)) {
        this.unDraw(context);
        this.x += 0;

        //switch to next pattern
        this.tetrominoN = (this.tetrominoN + this.tetromino.length - 1) % this.tetromino.length;
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw(context);
    }
}

//hold the current piece
//it disables after using once until the piece drops
let enableHold = true;

Piece.prototype.hold = function () {
    let c = generate.current;
    //assigning the current piece as a hold piece
    generate.hold = generate.current;

    //undraw the now-hold piece and draw the current
    this.unDraw(context);

    //generate the swapped piece
    piece = generatePiece();

    enableHold = false; //toggle hold to false

    //display hold tetromino in the hold canvas
    displayTetrominoes(TETROMINOES[c][0], TETROMINOES[c][1], holdContext)

    //score reduction
    let scoreReduction = (Math.round(obj.getScore() * 0.04));
    obj.scoreMinus(scoreReduction);

    // update the score
    scoreEl.textContent = `Score: ${obj.getScore()}`;

}

function holdPiece() {
    if (generate.hold.length === 0 && enableHold === true) {
        piece.hold();
    }
    else if (enableHold === true && generate.hold.length !== 0) {
        //swap the position of the hold and current piece
        generate.holdToCurrent(generate.hold);
        piece.hold();
    }
}

//high score system
function manageHighScores() {
    let score = obj.getScore();
    let temp = 0; //temporary var for all high scores
    if (score > parseInt(high)) {
        temp = localStorage.getItem("savedHigh");
        localStorage.setItem("savedHigh", score);
        score = temp;
    }
    if (score > parseInt(high2)) {
        temp = localStorage.getItem("savedHigh2");
        localStorage.setItem("savedHigh2", score);
        score = temp;
    }
    if (score > parseInt(high3)) {
        temp = localStorage.getItem("savedHigh3");
        localStorage.setItem("savedHigh3", score);
        score = temp;
    }
    if (score > parseInt(high4)) {
        temp = localStorage.getItem("savedHigh4");
        localStorage.setItem("savedHigh4", score);
        score = temp;
    }
    if (score > parseInt(high5)) {
        temp = localStorage.getItem("savedHigh5");
        localStorage.setItem("savedHigh5", score);
    }
    score = obj.getScore();
    displayGameOver();
    document.removeEventListener("keydown", tetrisKeydownEvent);
    document.getElementById('play-again-btn').onclick = () => location.reload();
}

let start = Date.now();

//automatic tetromino fall in a relative speed
function drop() {
    let now = Date.now();
    let sec = now - start;
    let spdMultiplier = obj.getCurrentSpdMultiplier();
    if (sec > obj.defaultSpd * spdMultiplier) {

        piece.moveDown();
        start = Date.now(); //reset to now
    }
    //infinitely invokes the function until the game is over
    //when the game is over it updates the highscores if score is in top5
    !gameOver ? requestAnimationFrame(drop) : manageHighScores();
}

//Keys that can be repetitively called when pressed
/* Note: The purpose of this chunk of code was to separate the repetitive keys and
other keys to manually code the "once keys successfully" until I discovered the e.repeat
property */
/*Although it is a good practice doing this method when the coder desire complex movements
using key events especially in games like this.*/
function tetrisKeyRepetitive() {
    //allow the piece to move sidewards and downwards simultaneously
    if (pressedKeys[KEY.LEFT] || pressedKeys[KEY.RIGHT]) {
        if (pressedKeys[KEY.LEFT] && pressedKeys[KEY.DOWN]) {
            piece.moveLeft();
            piece.moveDown();
            scoreEl.textContent = `Score: ${obj.getScore()}`;
        } else if (pressedKeys[KEY.RIGHT] && pressedKeys[KEY.DOWN]) {
            piece.moveRight();
            piece.moveDown();
            scoreEl.textContent = `Score: ${obj.getScore()}`;
        } else if (pressedKeys[KEY.LEFT]) {
            piece.moveLeft();
        } else if (pressedKeys[KEY.RIGHT]) {
            piece.moveRight();
        }
    } else if (pressedKeys[KEY.DOWN]) {
        piece.moveDown();
        scoreEl.textContent = `Score: ${obj.getScore()}`;
    }
}

//key controls without endlessly firing when being hold
function tetrisKeyOnce(e) {
    if (e.repeat) { return; }
    if (e.key === 'ArrowUp') {
        piece.rotate();
    } else if (e.key === 'Z' || e.key === 'z') {
        piece.reverseRotate();
    } else if (e.key === 'C' || e.key === 'c') {
        holdPiece();
    } else if (e.key === ' ') {
        piece.instantDrop();
    }
}

//enable in-game functionality -- can only be invoked once until it's over
document.addEventListener("dblclick", function () {
    startGame();
}, { once: true });

//Functionalities that are only required to be called once
function startGame() {
    drop();
    if (displayC.contains(startInstruct)) {
        displayC.removeChild(startInstruct);
    }

    //pressed keys are appended within the used key holder
    document.addEventListener("keydown", function (e) {
        const currentKey = KEY_BIND[e.key];

        //disallow the events to have a default behavior 
        if (KEY_EVENTS.includes(currentKey)) {
            e.preventDefault();
        }
        //disallow unmatched key controls
        if (currentKey === undefined || pressedKeys[currentKey]) { return; }

        //Moves to the left in default when left && right pressed together
        if (currentKey === KEY.LEFT && pressedKeys[KEY.RIGHT]) {
            pressedKeys[KEY.LEFT] = false;
        } else if (currentKey === KEY.RIGHT && pressedKeys[KEY.LEFT]) {
            pressedKeys[KEY.LEFT] = false;
        }

        pressedKeys[currentKey] = true;
    });

    document.addEventListener("keydown", tetrisKeyOnce);
    document.addEventListener("keyup", function (e) {
        const currentKey = KEY_BIND[e.key];
        // only handle game control keys
        if (currentKey === undefined) { return; }
        // assigned the pressed key to false
        pressedKeys[currentKey] = false;
    });
    document.addEventListener("keydown", tetrisKeyRepetitive);
}
