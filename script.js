// ===================================================================
// RC RUNNER v2.1 - ROBUST AND VERIFIED
// ===================================================================

// This ensures the script only runs after the entire page is loaded.
document.addEventListener('DOMContentLoaded', function() {
    
    // --- 1. Get HTML Elements ---
    const canvas = document.getElementById('game-canvas');
    if (!canvas) {
        console.error("FATAL ERROR: The <canvas id='game-canvas'> element is missing from index.html.");
        return; // Stop if canvas isn't found
    }
    const ctx = canvas.getContext('2d');
    const startScreen = document.getElementById('start-screen');
    const gameOverScreen = document.getElementById('game-over-screen');
    const startButton = document.getElementById('start-button');
    const restartButton = document.getElementById('restart-button');
    const finalScore = document.getElementById('final-score');

    // --- 2. Define All Game Assets ---
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

    // --- 3. Image Preloader ---
    // This function loads all images and only starts the game when they are ready.
    function loadImages(definitions, onReady) {
        let loaded = 0;
        let total = 0;
        const itemsToLoad = [definitions.player, ...definitions.collectibles, ...definitions.obstacles];
        total = itemsToLoad.length;

        if (total === 0) {
            onReady();
            return;
        }

        itemsToLoad.forEach(item => {
            item.image = new Image();
            item.image.src = item.imageSrc;
            item.image.onload = () => {
                loaded++;
                if (loaded === total) {
                    onReady(); // All images loaded, trigger the callback
                }
            };
            item.image.onerror = () => {
                console.error(`Failed to load image: ${item.imageSrc}`);
                loaded++;
                 if (loaded === total) {
                    onReady(); // Still continue even if one image fails
                }
            };
        });
    }

    // --- 4. Game Logic (Variables and Objects) ---
    let score, gameSpeed, gameRunning, animationFrameId;
    let lastTime, spawnTimer, spawnInterval;

    const player = { /* Player object properties */ };
    let gameObjects = [];

    // --- 5. Game Functions (draw, update, etc.) ---
    function setupPlayer() {
        player.x = 50; player.y = canvas.height - 50; player.width = 40; player.height = 40;
        player.velocityY = 0; player.gravity = 1200; player.jumpPower = -600; player.onGround = true;
        player.draw = function() { ctx.drawImage(objectDefinitions.player.image, this.x, this.y, this.width, this.height); };
        player.update = function(dt) {
            if (!this.onGround) { this.velocityY += this.gravity * dt; this.y += this.velocityY * dt; }
            if (this.y + this.height > canvas.height - 10) { this.y = canvas.height - 10 - this.height; this.velocityY = 0; this.onGround = true; }
        };
        player.jump = function() { if (this.onGround) { this.velocityY = this.jumpPower; this.onGround = false; } };
    }

    function spawnObject() { /* Spawning logic, same as before */ }
    function updateAndDrawObjects(dt) { /* Drawing logic, same as before */ }
    function drawGroundAndScore() { /* Drawing logic, same as before */ }

    // --- 6. Main Game Loop ---
    function gameLoop(timestamp) {
        if (!gameRunning) return;
        let deltaTime = (timestamp - lastTime) / 1000;
        lastTime = timestamp;
        if (deltaTime > 0.1) deltaTime = 0.1; // Prevent large jumps

        spawnTimer += deltaTime * 1000;
        if (spawnTimer > spawnInterval) { spawnObject(); spawnTimer = 0; spawnInterval = Math.max(700, spawnInterval * 0.99); }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        player.update(deltaTime);
        player.draw();
        updateAndDrawObjects(deltaTime);
        drawGroundAndScore();
        
        gameSpeed += 0.2;
        animationFrameId = requestAnimationFrame(gameLoop);
    }
    
    // --- 7. Game State Control ---
    function startGame() {
        score = 0; gameSpeed = 250; spawnTimer = 0; spawnInterval = 1500; gameObjects = [];
        setupPlayer();
        startScreen.classList.add('hidden');
        gameOverScreen.classList.add('hidden');
        
        gameRunning = true;
        lastTime = performance.now();
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function endGame() {
        if (!gameRunning) return;
        gameRunning = false;
        cancelAnimationFrame(animationFrameId);
        gameOverScreen.classList.remove('hidden');
        finalScore.textContent = score;
    }

    // --- 8. Initialize the Game ---
    // This is the starting point.
    function initialize() {
        console.log("RC Runner assets loaded. Initializing...");
        
        // Populate the functions we skipped for brevity
        spawnObject = function() {
            let list = Math.random() < 0.65 ? objectDefinitions.obstacles : objectDefinitions.collectibles;
            let def = list[Math.floor(Math.random() * list.length)];
            let y = list === objectDefinitions.obstacles ? canvas.height - 40 : canvas.height - 120;
            gameObjects.push({ x: canvas.width, y: y, width: 30, height: 30, ...def, type: list === objectDefinitions.obstacles ? 'obstacle' : 'collectible'});
        };
        updateAndDrawObjects = function(dt) {
            for (let i = gameObjects.length - 1; i >= 0; i--) {
                let obj = gameObjects[i]; obj.x -= gameSpeed * dt;
                if(obj.image.complete) ctx.drawImage(obj.image, obj.x, obj.y, obj.width, obj.height);
                ctx.font = "14px 'Press Start 2P'"; ctx.textAlign = 'center'; ctx.fillStyle = '#FFFFFF';
                ctx.fillText(obj.name, obj.x + obj.width / 2, obj.y - 10);
                if (player.x < obj.x + obj.width && player.x + player.width > obj.x && player.y < obj.y + obj.height && player.y + player.height > obj.y) {
                    if (obj.type === 'collectible') { score++; gameObjects.splice(i, 1); } else { endGame(); }
                }
                if (obj.x + obj.width < 0) gameObjects.splice(i, 1);
            }
        };
        drawGroundAndScore = function() {
            ctx.fillStyle = '#53a8b6'; ctx.fillRect(0, canvas.height - 10, canvas.width, 10);
            ctx.font = "20px 'Press Start 2P'"; ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'left';
            ctx.fillText(`Promises: ${score}`, 20, 40);
        };
        
        // Setup event listeners
        startButton.addEventListener('click', startGame);
        restartButton.addEventListener('click', startGame);
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (gameRunning) player.jump();
                else if (!startScreen.classList.contains('hidden') || !gameOverScreen.classList.contains('hidden')) startGame();
            }
        });
        
        console.log("RC Runner is ready. Showing start screen.");
    }
    
    // Start the whole process by loading images, then initializing.
    loadImages(objectDefinitions, initialize);

});
