// ===================================================VARS=======================================================

let hero = window.document.querySelector('#hero')
let heroBlock = window.document.querySelector('#hero_block')
let canvas = window.document.querySelector('#canvas')
let fsbtn = window.document.querySelector('#fsbtn')
// let abtn = window.document.querySelector('#attack_btn')
// let jbtn = window.document.querySelector('#jump_btn')
let heroPosition = 0
let blockPosition = 0
let attackPosition = 0
let jump = false
let falling = false
let attack = false
let dead = false
let direction = 1
let move = false
let heroX = Math.floor(Number.parseInt(heroBlock.style.left) / 64)
let heroY = Math.floor(Number.parseInt(heroBlock.style.bottom) / 64)
let high = 0
let maxHigh = 320
let timer = null

let tileArray = []
let maxLives = 5
let curLives = 3
let heartsArr = []
let hearts = []

let ring = new Audio('audio/key.wav')
let sound = new Audio('audio/haunted.mp3');
sound.play()
let attackSound = new Audio('audio/attack.mp3');
let swordSound = new Audio('audio/sword.mp3');
let footsSound = new Audio('audio/foots.wav');
footsSound.volume = 0.2

//=================================================ANIMATIONS=======================================================

const setSprite = (imgWidth, imgSrc, maxPose, moveX, moveY, xDistance, yDistance) => {
    hero.style.left = '0px'
    hero.style.width = imgWidth
    hero.src = imgSrc
    hero.style.transform = `scale(${direction},1)`
    if (blockPosition > window.screen.width) {
        blockPosition = window.screen.width
    }
    if (blockPosition < 0) {
        blockPosition = 0
    }
    if (heroPosition >= maxPose) {
        if (dead) {
            switch (direction) {
                case 1:
                    hero.style.left = '-800px'
                    break;
                case -1:
                    hero.style.left = '0px'
                    break;
                default:
                    break;
            }
            return
        }
        else {
            heroPosition = 0
            if (attack === true) {
                attack = false
            }
        }
    }
    else {
        heroPosition = heroPosition + 1
    }
    if (moveX) {
        blockPosition = blockPosition - (xDistance * direction)
        heroBlock.style.left = `${blockPosition}px`
    }
    if (moveY) {
        if (jump) {
            if (high > maxHigh) {
                jump = false
                high = 0
            }
            else {
                high += yDistance
                heroBlock.style.bottom = (Number.parseInt(heroBlock.style.bottom) + yDistance).toString() + 'px'
            }
        }
        else {
            heroBlock.style.bottom = (Number.parseInt(heroBlock.style.bottom) + yDistance).toString() + 'px'
        }

    }
    checkTile()
    hero.style.left = (heroPosition * -200).toString() + 'px'
}
const heroAnim = (move) => {
    switch (move) {
        case 'walk':
            setSprite('1400px', 'knight-walk.png', 6, true, false, -32, 0)
            footsSound.play()
            break
        case 'idle':
            setSprite('800px', 'knight-idle.png', 3)
            break
        case 'jump':
            setSprite('1200px', 'jump-knight.png', 4, true, true, -32, 96)
            break
        case 'fall':
            setSprite('600px', 'knight-fall.png', 2, true, true, -32, -64)
            break
        case 'attack':
            setSprite('1200px', 'knight-attack.png', 4)
            swordSound.play()
            break
        case 'death':
            setSprite('1000px', 'knight-dying.png', 4)
            break
        default: break
    }
}

// ================================================COORDINATES=====================================================

const updateXY = () => {
    heroX = Math.floor(Number.parseInt(heroBlock.style.left) / 64)
    heroY = Math.floor(Number.parseInt(heroBlock.style.bottom) / 64)
}
const checkTile = () => {
    updateXY()
    let tile = tileArray.find(e => e[0] - 1 === heroX && e[1] + 1 === heroY)
    if (tile === undefined) {
        falling = true
    }
    else { falling = false }
}

//========================================================BUTTONS===================================================

// moveStart = (e) => {
//     if (falling === false && jump === false) {
//         if (e.screenX > 1000) {
//             direction = 1
//             move = true
//         }
//         else if (e.screenX < 500) {
//             direction = -1
//             move = true
//         }
//     }
// }
// moveEnd = (e) => {
//     move = false
// }
// jbtn.onclick = () => {
//     jump = true
// }
// abtn.onclick = () => {
//     attack = true
// }
// window.onmousedown = moveStart
// window.onmouseup = moveEnd
window.addEventListener('keydown', (e) => {
    if (e.code === 'KeyD') {
        direction = 1
        move = true
    }
    else if (e.code === 'KeyA') {
        direction = -1
        move = true
    }
    else if (falling === false && jump === false) {
        if (e.code === 'KeyW') {
            jump = true
        }
        else if (e.code === 'KeyF') {
            attack = true
        }
    }
}
)

window.addEventListener('keyup', (e) => {
    move = false
})
fsbtn.onclick = () => {
    if (window.document.fullscreenElement) {
        window.document.exitFullscreen()
        return
    }
    canvas.requestFullscreen()
}

// =================================================OBJECTS========================================================

const createTile = (x, y = 0) => {
    let tile = window.document.createElement('img')
    tile.src = 'img/1 Tiles/Tile_21.png'
    tile.style.position = 'absolute'
    tile.style.left = (x * 64).toString() + 'px'
    tile.style.bottom = (y * 64).toString() + 'px'
    tile.style.width = '64px'
    tile.style.height = '64px'
    canvas.appendChild(tile)
    tileArray.push([x, y])
}
const createTilesPlatform = (startX, startY, length) => {
    for (let i = 0; i < length; i++) {
        createTile(startX + i, startY)
    }
}
const addTiles = (i) => {
    createTile(i)
}

// ===================================================ENEMIES======================================================

class Enemy {
    posX;
    posY;
    state;
    animateWasChange;
    startX;
    direction;
    img;
    block;
    blockSize;
    spritePos;
    spriteMaxPos;
    timer;
    stop;
    lives;
    death
    dist
    constructor(x, y, dist) {
        this.dist = dist
        this.posX = x
        this.startX = this.posX
        this.posY = y
        this.direction = 1
        this.blockSize = 200
        this.spritePos = 0
        this.state = 'idle'
        this.animateWasChange = false
        this.stop = false
        this.changeAnim('idle')
        this.createImg()
        this.lifeCycle()
        this.lives = 3;

    }
    createImg() {
        this.block = window.document.createElement('div')
        this.block.style.position = 'absolute'
        this.block.style.left = (this.posX * 64).toString() + 'px'
        this.block.style.bottom = (this.posY * 64).toString() + 'px'
        this.block.style.width = `${this.blockSize}px`
        this.block.style.height = `${this.blockSize}px`
        this.block.style.overflow = 'hidden'
        this.block.style.transition = '0.5s'

        this.img = window.document.createElement('img')
        this.img.src = 'knight-idle.png'
        this.img.style.position = 'absolute'
        this.img.style.left = '0px'
        this.img.style.bottom = '0px'
        this.img.style.width = `${this.blockSize * 4}px`
        this.img.style.height = `128px`
        this.img.className += "enemy"

        this.block.appendChild(this.img)
        canvas.appendChild(this.block)
    }
    lifeCycle() {
        // clearInterval(this.timer)
        this.timer = setInterval(() => {
            if (this.animateWasChange) {
                this.animateWasChange = false
                switch (this.state) {
                    case 'idle':
                        this.setIdle()
                        break;
                    case 'attack':
                        this.setAttack()
                        break;
                    case 'walk':
                        this.setWalk()
                        break;
                    case 'hurt':
                        this.setHurt()
                        break;
                    case 'death':
                        this.setDeath()
                        break;
                    default:
                        break;
                }
            }
            this.spritePos++
            if (this.state === 'death') {
                switch (this.direction) {
                    case 1:
                        this.img.style.left = '-800px'
                        break;
                    case -1:
                        this.img.style.left = '0px'
                        break;
                    default:
                        break;
                }
                return
            }
            this.checkCol();
            if (this.stop != true) {
                this.changeAnim('walk')
                this.move()
            }
            else {
                if (this.state != 'hurt') {
                    this.changeAnim('attack')
                }
            }
            this.animate()
        }, 100)
    }
    animate(maxPose) {
        if (this.spritePos > this.spriteMaxPos) {
            this.spritePos = 0
            if (this.state === 'attack') {
                curLives -= 1
                attackSound.play()
                updateHearts()
                if (curLives <= 0) {
                    dead = true
                }
            }
            if (this.state === 'hurt') {
                if (this.lives > 0) {
                    this.lives--
                    this.changeAnim('attack')
                }
                else {
                    this.changeAnim('death')
                }
            }
        }
        this.img.style.left = -(this.spritePos * this.blockSize).toString() + 'px'
    }
    changeAnim(state) {
        this.animateWasChange = true
        this.state = state
    }
    setAttack() {
        this.img.src = 'knight-attack.png'
        this.spriteMaxPos = 5
        this.img.style.width = `${this.blockSize * 6}px`

    }
    setDeath() {
        this.img.src = 'knight-dying.png'
        this.spriteMaxPos = 4
        this.img.style.width = `${this.blockSize * 5}px`
    }
    setHurt() {
        this.img.src = 'knight-hurt.png'
        this.spriteMaxPos = 3
        this.img.style.width = `${this.blockSize * 4}px`
        attackSound.play()
    }
    setIdle() {
        this.img.src = 'knight-idle.png'
        this.spriteMaxPos = 3
        this.img.style.width = `${this.blockSize * 4}px`
    }
    setWalk() {
        this.img.src = 'knight-walk.png'
        this.spriteMaxPos = 6
        this.img.style.width = `${this.blockSize * 7}px`
    }
    move() {
        if (this.posX > (this.startX + this.dist) || this.posX < this.startX) {
            this.direction *= -1
        }
        this.posX += this.direction / 2
        this.img.style.transform = `scale(${this.direction},1)`
        this.block.style.left = (this.posX * 64).toString() + 'px'
    }
    checkCol() {
        if (!dead) {
            if (this.posY === heroY && (this.posX + (this.direction)) === heroX) {
                this.stop = true
                if (attack === true) {
                    this.changeAnim('hurt')
                }
            }
            else if (this.posY === heroY && (this.posX - this.direction) === heroX) {
                this.stop = true
                if (attack === true) {
                    this.changeAnim('hurt')
                }
                this.img.style.transform = `scale(${this.direction *= -1},1)`
            }
            else { this.stop = false }
        }
        else { this.stop = false }
    }
}

class Heart {
    img;
    x;
    constructor(x, src) {
        this.x = x;
        this.img = window.document.createElement('img')
        this.img.src = src;
        this.img.style.position = 'absolute';
        this.img.style.left = (this.x * 64).toString() + 'px'
        this.img.style.bottom = (window.screen.height + 30).toString() + 'px'
        this.img.style.width = '64px'
        this.img.style.height = '64px'

        canvas.appendChild(this.img)
    }
}
class DmgHeart extends Heart {
    constructor(x) {
        super(x, 'img/Icons/Dmg_heart.png');
    }
}
class FullHeart extends Heart {
    constructor(x) {
        super(x, 'img/Icons/Full_heart.png');
    }
}
class Items {
    name;
    posX;
    posY;
    startY;
    direction;
    img;
    block;
    blockSize;
    timer;
    useble;
    constructor(x, y) {
        this.posX = x
        this.posY = y
        this.startY = y
        this.direction = 1
        this.blockSize = 128
        this.useble = true
        this.createImg()
        this.lifeCycle()
    }
    createImg() {
        console.log('ssds')
        this.block = window.document.createElement('div')
        this.block.style.position = 'absolute'
        this.block.style.left = (this.posX * 64).toString() + 'px'
        this.block.style.bottom = (this.posY * 64).toString() + 'px'
        this.block.style.width = `${this.blockSize}px`
        this.block.style.height = `${this.blockSize}px`
        this.block.style.overflow = 'hidden'
        this.block.style.transition = '0.5s'

        this.img = window.document.createElement('img')
        this.img.src = 'img/Icons/Full_heart.png'
        this.img.style.position = 'absolute'
        this.img.style.left = '0px'
        this.img.style.bottom = '0px'
        this.img.style.width = `48px`
        this.img.style.height = `48px`

        this.block.appendChild(this.img)
        canvas.appendChild(this.block)
    }
    lifeCycle() {
        // clearInterval(this.timer)
        this.timer = setInterval(() => {
            if (this.posY > (this.startY + 3) || this.posY < this.startY) {
                this.direction *= -1
            }
            this.posY += this.direction / 2
            this.block.style.bottom = (this.posY * 64).toString() + 'px'
            this.checkCol()
        }, 200)
    }
    checkCol() {
        if (this.posY >= heroY && this.posY < heroY + 2) {
            if (heroX + 1 > this.posX - 2 && heroX + 1 < this.posX + 2) {
                if (this.useble === true && maxLives > curLives && curLives > 0) {
                    ring.play();
                    curLives++
                    updateHearts()
                    this.useble = false
                    clearInterval(this.timer)
                    this.img.style.display = 'none'
                    let index = hearts.findIndex(e => e.posX === this.posX)
                    hearts.splice(index, 1)
                }
            }
        }
    }
}
//======================================================START=FUNCTIONS===========================================

const startHero = () => {

    timer = setInterval(() => {
        if (dead === true) {
            heroAnim('death')
        }
        else if (attack === true) {
            heroAnim('attack')
        }
        else if (jump === true) {
            heroAnim('jump')
        }
        else if (falling === true) {
            heroAnim('fall')
        }
        else if (move) {
            heroAnim('walk')
        }
        else {
            heroAnim('idle')
        }
    }, 100)
}
const addHearts = () => {
    for (let i = 1; i < maxLives + 1; i++) {
        let dmgHeart = new DmgHeart(i)
        let fullHeart = new FullHeart(i)
        heartsArr.push(fullHeart)
    }
}
const updateHearts = () => {
    for (let i = 0; i < curLives; i++) {
        heartsArr[i].img.style.display = 'block'
    }
    for (let i = curLives; i < maxLives; i++) {
        heartsArr[i].img.style.display = 'none'
    }
}
const appStart = () => {
    tileArray = []
    for (let i = 0; i < 32; i++) {
        // if (i > 7 && i < 12) {
        //     continue
        // }
        addTiles(i)
    }
    createTilesPlatform(5, 5, 10)
    createTilesPlatform(15, 8, 5)
    addHearts()
    updateHearts()
    enemies = [
        new Enemy(8, 1, 12),
        new Enemy(12, 1, 10),
        new Enemy(4, 6, 9),
        new Enemy(14, 9, 4)
    ]
    hearts = [
        new Items(3, 1),
        new Items(6, 6),
        new Items(15, 9)
    ]
}

// ======================================================APP=START==================================================

startHero()
appStart()
