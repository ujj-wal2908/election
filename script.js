// ===================================================================
// RC RUNNER v2.0 - VERIFIED WORKING CODE
// ===================================================================

document.addEventListener('DOMContentLoaded', function() {
    // Get all the HTML elements we need
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("Fatal Error: Canvas element not found!");
        return;
    }
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score-display');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const finalScore = document.getElementById('final-score');

    // --- Object Definitions with Names and Images ---
    const objectDefinitions = {
        player: { imageSrc: 'assets/ujjwal-sprite.png' },
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
    function loadImages(definitions, callback) {
        let loadedCount = 0;
        let totalImages = 0;
        for (const category in definitions) {
            if (Array.isArray(definitions[category])) {
                totalImages += definitions[category].length;
            } else {
                totalImages++;
            }
        }

        for (const category in definitions) {
            const items = Array.isArray(definitions[category]) ? definitions[category] : [definitions[category]];
            items.forEach(item => {
                item.image = new Image();
                item.image.src = item.imageSrc;
                item.image.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalImages) {
                        callback();
                    }
                };
                item.image.onerror = () => {
                    console.error(`Error loading image: ${item.imageSrc}`);
                    loadedCount++;
                     if (loadedCount === totalImages) {
                        callback();
                    }
                }
            });
        }
    }

    // --- Game Settings ---
    let score = 0, gameSpeed = 250, gameRunning = false, animationFrameId;
    let lastTime = 0, spawnTimer = 0, spawnInterval = 1500;

    const player = {
        x: 50, y: canvas.height - 50, width: 40, height: 40,
        velocityY: 0, gravity: 1200, jumpPower: -600, onGround: true,
        draw() { ctx.drawImage(objectDefinitions.player.image, this.x, this.y, this.width, this.height); },
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
        jump() { if (this.onGround) { this.velocityY = this.jumpPower; this.onGround = false; } }
    };

    let gameObjects = [];

    function spawnObject() {
        let objectList, yPos;
        if (Math.random() < 0.65) {
            objectList = objectDefinitions.obstacles; yPos = canvas.height - 40;
        } else {
            objectList = objectDefinitions.collectibles; yPos = canvas.height - 120;
        }
        const definition = objectList[Math.floor(Math.random() * objectList.length)];
        gameObjects.push({
            x: canvas.width, y: yPos, width: 30, height: 30,
            ...definition, type: (objectList === objectDefinitions.obstacles) ? 'obstacle' : 'collectible'
        });
    }

    function updateAndDrawObjects(deltaTime) {
        for (let i = gameObjects.length - 1; i >= 0; i--) {
            let obj = gameObjects[i];
            obj.x -= gameSpeed * deltaTime;
            if(obj.image.complete && obj.image.naturalHeight !== 0) ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
            ctx.font = "14px 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF';
            ctx.fillText(obj.name, obj.x + obj.width / 2, obj.y - 10);

            if (player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
                if (obj.type === 'collectible') {
                    score++; gameObjects.splice(i, 1);
                } else { endGame(); }
            }
            if (obj.x + obj.width < 0) gameObjects.splice(i, 1);
        }
    }

    function drawGroundAndScore() {
        ctx.fillStyle = '#53a8b6'; ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
        ctx.font = "20px 'Press Start 2P'"; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left';
        ctx.fillText(`Promises: ${score}`, 20, 40);
    }

    function gameLoop(timestamp) {
        if (!gameRunning) return;
        let deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        spawnTimer += deltaTime * 1000;
        if (spawnTimer > spawnInterval) { spawnObject(); spawnTimer = 0; spawnInterval = Math.max(700, spawnInterval * 0.99); }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.update(deltaTime); player.draw();
        updateAndDrawObjects(deltaTime);
        drawGroundAndScore();
        gameSpeed += 0.2;
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function startGame() {
        score = 0; gameSpeed = 250; spawnTimer = 0; spawnInterval = 1500; gameObjects = [];
        player.y = canvas.height - 50; player.velocityY = 0;
        startScreen.classList.add('hidden'); gameOverScreen.classList.add('hidden');
        if(scoreDisplay) scoreDisplay.style.display = 'none';
        gameRunning = true; lastTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        if (!gameRunning) return;
        gameRunning = false; cancelAnimationFrame(animationFrameId);
        gameOverScreen.classList.remove('hidden');
        finalScore.textContent = score;
    }

    function initializeGame() {
        // --- Event Listeners ---
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', startGame);
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameRunning) player.jump();
                else if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) startGame();
            }
        });
        console.log("RC Runner is ready to play!");
    }

    loadImages(objectDefinitions, initializeGame);
});
