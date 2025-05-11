// Server Configuration
module.exports = {
    server: {
        port: 8000,
        debug: true,
        updateInterval: 1000/25  // 25 times per second
    },
    
    // Player Configuration
    player: {
        maxSpeed: 10,
        jumpSpeed: 13,
        maxHealth: 10,
        respawnX: 20,
        spawnY: -80,
        dimensions: {
            width: 80,
            height: 80
        },
        bulletDamage: 1,
        scorePerKill: 1,
        respawnHealthFactor: 1  // multiplier for hpMax on respawn
    },
    
    // Bullet Configuration
    bullet: {
        speed: 10,
        lifespan: 100,  // in update cycles
        damage: 1,
        dimensions: {
            width: 20,
            height: 20
        },
        hitRange: 32
    },
    
    // Slime Configuration
    slime: {
        maxHealth: 10,
        detectionRange: 250,
        attackCooldown: 4000,  // in milliseconds
        dimensions: {
            width: 50,
            height: 50
        },
        attackSpeed: 10,
        jumpSpeed: -10,
        gravityAcceleration: 1,
        damage: 1
    },
    
    // Display Configuration
    display: {
        nameOffsetY: -63,
        hpBarWidth: 60,
        hpBarHeight: 8,
        hpBarOffsetY: -54,
        playerDrawSize: 80
    },
    
    // Maps Configuration
    maps: {
        "test": {
            id: 2,
            obstacles: [
                {
                    img: 0,
                    x: -600,
                    y: 10,
                    dx: 2000,
                    dy: 600,
                    id: 2
                },
                {
                    img: 0,
                    x: 100,
                    y: -60,
                    dx: 20,
                    dy: 20,
                    id: 1
                },
                {
                    img: 0,
                    x: 120,
                    y: -260,
                    dx: 50,
                    dy: 50,
                    id: 3
                }
            ],
            defaultSlimes: [
                {
                    x: 900,
                    y: -200
                }
            ]
        },
        "Dev": {
            id: 5,
            obstacles: [],
            defaultSlimes: []
        }
    },
    
    // Special Player Settings
    specialPlayers: {
        "bob": "Dev"  // username: default map
    }
};
