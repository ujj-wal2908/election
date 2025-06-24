// Get all the HTML elements we need
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const finalScore = document.getElementById('final-score');

// --- Image Loading ---
// This section preloads all our game graphics.
// IMPORTANT: Make sure the file paths match your 'assets' folder exactly.
const playerSprite = new Image();
playerSprite.src = 'assets/ujjwal-sprite.png';

const iconCode = new Image();
iconCode.src = 'assets/icon-code.png';

const iconSupport = new Image();
iconSupport.src = 'assets/icon-support.png';

const iconCommunity = new Image();
iconCommunity.src = 'assets/icon-community.png';

const obstacleBug = new Image();
obstacleBug.src = 'assets/obstacle-bug.png';

const obstacleDeadline = new Image();
obstacleDeadline.src = 'assets/obstacle-deadline.png';

const obstacleStress = new Image();
obstacleStress.src = 'assets/obstacle-stress.png';

// Arrays of images to pick from randomly during the game
const collectibleImages = [iconCode, iconSupport, iconCommunity];
const obstacleImages = [obstacleBug, obstacleDeadline, obstacleStress];


// --- Game Settings ---
let score = 0;
let gameSpeed = 2;
let gameRunning = false;
let animationFrameId;

// Player settings
const player = {
    x: 50,
    y: canvas.height - 50,
    width: 90,
    height: 90,
    velocityY: 0,
    gravity: 0.5,
    jumpPower: -12,
    onGround: true,
    draw() {
        // Draw the player's image instead of a colored block
        ctx.drawImage(playerSprite, this.x, this.y, this.width, this.height);
    },
    update() {
        this.velocityY += this.gravity;
        this.y += this.velocityY;

        // Keep player on the ground
        if (this.y + this.height > canvas.height - 10) {
            this.y = canvas.height - 10 - this.height;
            this.velocityY = 0;
            this.onGround = true;
        }
    },
    jump() {
        if (this.onGround) {
            this.velocityY = this.jumpPower;
            this.onGround = false;
        }
    }
};

// Arrays to hold our obstacles and collectibles
let obstacles = [];
let collectibles = [];
let frameCount = 0;

// --- Game Logic ---

// This function now randomly picks an image for each new object.
function spawnObject() {
    if (frameCount > 90 && frameCount % 90 === 0) { // Approx every 1.5 seconds
        if (Math.random() < 0.65) { // 65% chance for an obstacle
            obstacles.push({
                x: canvas.width,
                y: canvas.height - 40,
                width: 50,
                height: 50,
                image: obstacleImages[Math.floor(Math.random() * obstacleImages.length)]
            });
        } else { // 35% chance for a collectible
            collectibles.push({
                x: canvas.width,
                y: canvas.height - 120,
                width: 30,
                height: 30,
                image: collectibleImages[Math.floor(Math.random() * collectibleImages.length)]
            });
        }
    }
}

// This function now draws the images for each object.
function updateObjects() {
    // Move and draw obstacles
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.x -= gameSpeed;
        ctx.drawImage(o.image, o.x, o.y, o.width, o.height);

        if (player.x < o.x + o.width && player.x + player.width > o.x && player.y < o.y + o.height && player.y + player.height > o.y) {
            endGame();
        }

        if (o.x + o.width < 0) {
            obstacles.splice(i, 1);
        }
    }

    // Move and draw collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
        let c = collectibles[i];
        c.x -= gameSpeed;
        ctx.drawImage(c.image, c.x, c.y, c.width, c.height);

        if (player.x < c.x + c.width && player.x + player.width > c.x && player.y < c.y + c.height && player.y + player.height > c.y) {
            score++;
            scoreDisplay.textContent = `Promises: ${score}`;
            collectibles.splice(i, 1);
        }

        if (c.x + c.width < 0) {
            collectibles.splice(i, 1);
        }
    }
}

function drawGround() {
    ctx.fillStyle = '#53a8b6';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
}

// --- Main Game Loop ---
function gameLoop() {
    if (!gameRunning) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGround();
    player.update();
    player.draw();
    spawnObject();
    updateObjects();
    
    frameCount++;
    gameSpeed += 0.003;

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Game State Functions ---
function startGame() {
    score = 0;
    gameSpeed = 5;
    frameCount = 0;
    obstacles = [];
    collectibles = [];
    player.y = canvas.height - 50;
    player.velocityY = 0;
    scoreDisplay.textContent = `Promises: ${score}`;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    scoreDisplay.style.display = 'block';

    gameRunning = true;
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    
    scoreDisplay.style.display = 'none';
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = score;
}

// --- Event Listeners ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameRunning) {
            player.jump();
        } else if (startScreen.checkVisibility()){
            startGame();
        }
    }
});