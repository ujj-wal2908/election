// ===================================================================
// RC RUNNER v2.0 - SMOOTH & INFORMATIVE
// ===================================================================

// Get all the HTML elements we need
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score-display');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');
const finalScore = document.getElementById('final-score');

// --- Object Definitions with Names and Images ---
// This new structure holds all the info for our game objects.
const objectDefinitions = {
    collectibles: [
        { name: 'CodeConnect', imageSrc: 'assets/icon-code.png' },
        { name: 'Academic Support', imageSrc: 'assets/icon-support.png' },
        { name: 'Community Meetup', imageSrc: 'assets/icon-community.png' }
    ],
    obstacles: [
        { name: 'A Bug!', imageSrc: 'assets/obstacle-bug.png' },
        { name: 'Missed Deadline', imageSrc: 'assets/obstacle-deadline.png' },
        { name: 'Exam Stress', imageSrc: 'assets/obstacle-stress.png' }
    ]
};

// --- Image Loading ---
// Load all images defined above.
function loadImages(definitions) {
    for (const category in definitions) {
        definitions[category].forEach(item => {
            item.image = new Image();
            item.image.src = item.imageSrc;
        });
    }
}
loadImages(objectDefinitions);

// --- Game Settings ---
let score = 0;
let gameSpeed = 250; // Now in pixels per second
let gameRunning = false;
let animationFrameId;

// --- Performance & Timing (The "Smoothness" Fix) ---
let lastTime = 0;
let spawnTimer = 0;
let spawnInterval = 1500; // Spawn a new object every 1.5 seconds

// Player settings
const player = {
    x: 50, y: canvas.height - 50, width: 40, height: 40,
    velocityY: 0, gravity: 1200, jumpPower: -600, onGround: true,
    draw() {
        ctx.drawImage(objectDefinitions.collectibles[0].image, this.x, this.y, this.width, this.height);
    },
    update(deltaTime) {
        if (!this.onGround) {
            this.velocityY += this.gravity * deltaTime;
            this.y += this.velocityY * deltaTime;
        }
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

// Arrays to hold our on-screen objects
let gameObjects = [];

// --- Game Logic ---
function spawnObject() {
    let objectList, yPos;
    if (Math.random() < 0.65) { // 65% chance for an obstacle
        objectList = objectDefinitions.obstacles;
        yPos = canvas.height - 40;
    } else { // 35% chance for a collectible
        objectList = objectDefinitions.collectibles;
        yPos = canvas.height - 120;
    }
    const definition = objectList[Math.floor(Math.random() * objectList.length)];
    gameObjects.push({
        x: canvas.width, y: yPos, width: 30, height: 30,
        ...definition, // Copy name, image, etc.
        type: (objectList === objectDefinitions.obstacles) ? 'obstacle' : 'collectible'
    });
}

function updateAndDrawObjects(deltaTime) {
    for (let i = gameObjects.length - 1; i >= 0; i--) {
        let obj = gameObjects[i];
        obj.x -= gameSpeed * deltaTime;

        // Draw the object's image
        ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
        
        // --- Draw the Name Text (New Feature) ---
        ctx.font = "14px 'Press Start 2P'";
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(obj.name, obj.x + obj.width / 2, obj.y - 10);

        // Collision detection
        if (player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
            if (obj.type === 'collectible') {
                score++;
                gameObjects.splice(i, 1); // Remove collected item
            } else {
                endGame();
            }
        }
        
        if (obj.x + obj.width < 0) {
            gameObjects.splice(i, 1);
        }
    }
}

function drawGroundAndScore() {
    // Ground
    ctx.fillStyle = '#53a8b6';
    ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
    // Score on canvas (better performance than updating DOM)
    ctx.font = "20px 'Press Start 2P'";
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'left';
    ctx.fillText(`Promises: ${score}`, 20, 40);
}

// --- Main Game Loop (Now with Delta Time) ---
function gameLoop(timestamp) {
    if (!gameRunning) return;

    let deltaTime = (timestamp - lastTime) / 1000; // Delta time in seconds
    lastTime = timestamp;

    spawnTimer += deltaTime * 1000;
    if (spawnTimer > spawnInterval) {
        spawnObject();
        spawnTimer = 0;
        // Make game harder over time
        spawnInterval = Math.max(700, spawnInterval * 0.99); 
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    player.update(deltaTime);
    player.draw();
    
    updateAndDrawObjects(deltaTime);
    drawGroundAndScore();
    
    gameSpeed += 0.2; // Increase speed slightly over time

    animationFrameId = requestAnimationFrame(gameLoop);
}

// --- Game State Functions ---
function startGame() {
    score = 0;
    gameSpeed = 250;
    spawnTimer = 0;
    spawnInterval = 1500;
    gameObjects = [];
    player.y = canvas.height - 50;
    player.velocityY = 0;

    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    scoreDisplay.style.display = 'none'; // We draw score on canvas now

    gameRunning = true;
    lastTime = performance.now();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function endGame() {
    if (!gameRunning) return; // Prevent multiple calls
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    
    gameOverScreen.classList.remove('hidden');
    finalScore.textContent = score;
}

// --- Event Listeners ---
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', startGame);
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        e.preventDefault(); // Prevent page from scrolling
        if (gameRunning) {
            player.jump();
        } else if (startScreen.checkVisibility() || gameOverScreen.checkVisibility()){
            startGame();
        }
    }
});
