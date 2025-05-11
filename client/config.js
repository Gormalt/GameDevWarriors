// Client-side configuration (subset of the server config)
window.config = {
    server: {
        port: 8000,
        fps: 25
    },
    
    player: {
        defaultHp: 10,
        maxSpeed: 10,
        jumpSpeed: 13,
        width: 80,
        height: 80,
        spawnPosition: {
            x: 20,
            y: -80
        },
        respawnRange: 500
    },
    
    bullet: {
        speed: 10,
        width: 20,
        height: 20,
        lifetime: 100,
        damage: 1,
        collisionRadius: 32
    },
    
    slime: {
        maxHp: 10,
        width: 50,
        height: 50,
        range: 250,
        cooldown: 60,
        attackCooldown: 4000,
        speed: 10,
        jumpSpeed: 10,
        damage: 1,
        defaultSpawn: {
            x: 900,
            y: -200
        }
    },
    
    canvas: {
        width: 1200,
        height: 500
    },
    
    ui: {
        chatbox: {
            width: 500,
            height: 100,
            position: {
                x: 680,
                y: 20
            }
        },
        playerName: {
            offsetY: -63
        },
        healthBar: {
            width: 60,
            height: 8,
            offsetY: -54
        },
        score: {
            position: {
                x: 0,
                y: 30
            }
        }
    },
    
    assets: {
        images: {
            player: '/client/img/White Block.png',
            bullet: '/client/img/Bullet.png',
            block: '/client/img/White Block.png'
        }
    },
    
    keyCodes: {
        right: 68,  // D
        left: 65,   // A
        up: 87,     // W
        down: 83    // S
    },
    
    chat: {
        commandPrefix: '/'
    }
};
