window.onload = function() {
    console.log("Irys Runner script loaded!");

    // === КОНСТАНТЫ ===
    const CANVAS_W = 1200;
    const CANVAS_H = 600;
    const GROUND_Y = 540; 
    const PLAYER_W = 90;
    const PLAYER_H = 60;

    const canvas = document.getElementById('game');
    const ctx = canvas.getContext('2d');

    // === ФОН ===
    const bgImg = new Image();
    bgImg.src = 'background.png';
    bgImg.onload = () => console.log("background loaded");

    // === ИГРОК ===
    const player = { x: 80, y: GROUND_Y - PLAYER_H, w: PLAYER_W, h: PLAYER_H, vy: 0, onGround: true };
    const gravity = 0.3;
    let score = 0;
    let gameOver = false;
    let gameStarted = true;
    let speed = 4;
    let frame = 0;
    let lastTypes = [];

    // === ПРЕПЯТСТВИЯ И ТОКЕНЫ ===
    const obstacles = [];
    const tokens = [];

    // === КАРТИНКИ ===
    const playerImg = new Image();
    playerImg.src = 'sprite.png';
    playerImg.onload = () => console.log("sprite loaded");

    const tokenImg = new Image();
    tokenImg.src = 'token.png';
    tokenImg.onload = () => console.log("token loaded");

    const logoImg = new Image();
    logoImg.src = 'Logo.png';
    logoImg.onload = () => console.log("logo loaded");

    // === ПРОПОРЦИИ ЛОГО ===
    const logoOriginalW = 295;
    const logoOriginalH = 62;
    const logoDrawW = 180;
    const logoDrawH = logoDrawW * (logoOriginalH / logoOriginalW);

    // === СПАВН ПРЕПЯТСТВИЙ ===
    let nextObstacleFrame = 70 + Math.floor(Math.random() * 50);

    function spawnObstacleAndToken() {
        // 0 — блок снизу, 1 — летающее препятствие (лого)
        let type;
        do {
            type = Math.random() < 0.7 ? 0 : 1;
        } while (lastTypes.length >= 2 && lastTypes[lastTypes.length - 1] === type && lastTypes[lastTypes.length - 2] === type);
    
        lastTypes.push(type);
        if (lastTypes.length > 2) lastTypes.shift();
    
        if (type === 0) {
            // Блок снизу
            obstacles.push({ x: CANVAS_W, y: GROUND_Y - 60, w: 50, h: 60, type: 'ground' });
    
            const tokenType = Math.random() < 0.5 ? 0 : 1;
            if (tokenType === 0) {
                // токен левее блока и сверху (для прыжка)
                tokens.push({ x: CANVAS_W - 80, y: GROUND_Y - 160, w: 40, h: 40 });
            } else {
                // токен дальше за блоком на земле
                tokens.push({ x: CANVAS_W + 120, y: GROUND_Y - 40, w: 40, h: 40 });
            }
        } else {
            obstacles.push({ x: CANVAS_W, y: GROUND_Y - 160, w: logoDrawW, h: logoDrawH, type: 'flying' });
            tokens.push({ x: CANVAS_W - 80, y: GROUND_Y - 40, w: 40, h: 40 });
        }
        // Следующий спавн
        nextObstacleFrame = frame + 70 + Math.floor(Math.random() * 50);
        console.log("Spawned obstacle, next at frame:", nextObstacleFrame);
    }
    
    function resetGame() {
        player.x = 80; player.y = GROUND_Y - PLAYER_H; player.vy = 0; player.onGround = true;
        score = 0; gameOver = false; frame = 0; speed = 4;
        obstacles.length = 0; tokens.length = 0;
        document.getElementById('score').textContent = score;
        nextObstacleFrame = 70 + Math.floor(Math.random() * 50);
        console.log("Game reset");
    }

    function update() {
        if (!gameStarted || gameOver) return;

        // Ускорение
        if (frame % (60 * 20) === 0 && frame > 0) {
            speed += 0.4;
            console.log("Speed up! Now:", speed);
        }

        // Прыжок
        if (!player.onGround) {
            player.vy += gravity;
            player.y += player.vy;
            if (player.y >= GROUND_Y - player.h) {
                player.y = GROUND_Y - player.h;
                player.vy = 0;
                player.onGround = true;
            }
        }

        // Движение препятствий и токенов
        for (let o of obstacles) o.x -= speed;
        for (let t of tokens) t.x -= speed;

        // Удаляем ушедшие за экран
        while (obstacles.length && obstacles[0].x + obstacles[0].w < 0) obstacles.shift();
        while (tokens.length && tokens[0].x + tokens[0].w < 0) tokens.shift();

        // Коллизии с препятствиями
        for (let o of obstacles) {
            if (player.x < o.x + o.w && player.x + player.w > o.x &&
                player.y < o.y + o.h && player.y + player.h > o.y) {
                gameOver = true;
                setTimeout(showWinScreen, 300);
                console.log("Game over! Score:", score);
            }
        }

        // Коллизии с токенами
        for (let i = tokens.length - 1; i >= 0; i--) {
            let t = tokens[i];
            if (player.x < t.x + t.w && player.x + player.w > t.x &&
                player.y < t.y + t.h && player.y + player.h > t.y) {
                score++;
                tokens.splice(i, 1);
                document.getElementById('score').textContent = score;
                console.log("Token collected! Score:", score);
            }
        }

        if (frame === nextObstacleFrame) {
            spawnObstacleAndToken();
        }

        frame++;
    }

    function draw() {
        // Фон с затемнением
        ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
        ctx.fillStyle = "rgba(24,24,40,0.40)";
        ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

        // Препятствия
        for (let o of obstacles) {
            if (o.type === 'ground') {
                ctx.fillStyle = "#00FFD0";
                ctx.fillRect(o.x, o.y, o.w, o.h);
            } else if (o.type === 'flying') {
                ctx.drawImage(logoImg, o.x, o.y, logoDrawW, logoDrawH);
            }
        }

        // Токены
        for (let t of tokens) ctx.drawImage(tokenImg, t.x, t.y, t.w, t.h);

        // Игрок
        ctx.drawImage(playerImg, player.x, player.y, player.w, player.h);
    }

    function loop() {
        update();
        draw();
        if (!gameOver && gameStarted) requestAnimationFrame(loop);
    }

    function showWinScreen() {
        document.getElementById('win-screen').style.display = 'flex';
        document.getElementById('final-score').textContent = score;
    }

    document.getElementById('play-again').onclick = function() {
        document.getElementById('win-screen').style.display = 'none';
        resetGame();
        gameStarted = true;
        loop();
    };

    // Управление
    document.addEventListener('keydown', e => {
        if (!gameStarted || gameOver) return;
        if ((e.code === 'Space' || e.key === 'w' || e.key === 'W') && player.onGround) {
            player.vy = -10;
            player.onGround = false;
            console.log("Jump!");
        }
    });

    resetGame();
    gameStarted = true;
    bgImg.onload = () => {
        playerImg.onload = () => {
            tokenImg.onload = () => {
                logoImg.onload = () => {
                    console.log("All images loaded, starting loop");
                    loop();
                }
            }
        }
    };
    loop();
};