var camera, renderer, bird, floor, rail; //objects
var container, info; //div

const HEIGHT = 550;
const WIDTH = 300;

const DEBUG = false;
var pause = false;
var stop = false;

var gravity = 0.12;
var scrollSpeed = 0.1;
var gap = 6;
var score = 0;
var scoreBest = 0;
var jumpHeight = 2.1;

var scoreSound = new Audio();
scoreSound.src = "sounds/score.mp3";

var scene = new THREE.Scene();
var pipeGroup = new THREE.Group();

document.addEventListener('keydown', function(event) {
    const key = event.keyCode;
    switch (key) {
        case 32:
            moveUp();
            break;
        case 80:
            pauseGame();
            break;
        case 82:
            gameRestart();
            // location.reload();
            break;
        case 90:
            scrollSpeed += 0.1;
            console.log(scrollSpeed);
            break;
    }
    
});

function pauseGame() {
    if(!stop) {
        pause = !pause;
        info.innerHTML =  "Press p to resume";
        pauseCssScroll();
        if (!pause) {
            resumeCssScroll();
            main();
        } 
    }
}

function incScore() {
    score++;
    scoreSound.play();
}

function pauseCssScroll() {
    document.getElementById("bag").classList.add('pause');
}

function resumeCssScroll() {
    document.getElementById("bag").classList.remove('pause');
}

function gameRestart() {
    if(score > scoreBest) {
        scoreBest = score;
    } 
    let scoreInfo = "</br> Best score: " + scoreBest;

    document.getElementById("info").classList.remove('play');
    document.getElementById("info").classList.add('stop');
    pauseCssScroll();

    info.innerHTML =  "Game Over!</br>Score: " + score + scoreInfo +"</br></br></br></br> Press r to restart game </br>";
    stop = !stop;
    if(!stop) {
        document.getElementById("info").classList.remove('stop');
        document.getElementById("info").classList.add('play');
        bird.position.set(1, -7, 0);
        pipeGroup.position.set(18.1, 12, 0);
        score = 0;
        scrollSpeed = 0.1;
        gravity = 0.12;
        jumpHeight = 2;
        resumeCssScroll();
        main();
    }
}

function moveUp() {
    bird.position.y += jumpHeight;
}

function getPositiveNegativeRandom() {
    var num = Math.floor(Math.random() * 9) + 1;
    num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    if(DEBUG) console.log('Gap position: ' + num);
    
    return num;
}

function init() {
    info = document.getElementById("info");
    container = document.getElementById("canvas");

    // ---------- Camera ----------
    camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 10000);
    camera.position.set(8, -16, 30);
    // camera.lookAt(new THREE.Vector3(2, -25, 0));

    // ---------- Light ----------
    var light = new THREE.PointLight( 0xffffff, 16, 25 ); //PointLight(0xffffff, 0, 100);
    light.position.set(0, -10, -6); //(2, -12, -3);
    light.castShadow = true;
    light.shadow.camera.near = 0.5;       
    light.shadow.camera.far = 50;  
    scene.add(light);

    // point light helper
    if(DEBUG) {
        var sphereSize = 1;
        var pointLightHelper = new THREE.PointLightHelper( light, sphereSize );
        scene.add( pointLightHelper );
    }

    // ambient light
    var ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // ---------- Bird ----------
    var birdGeometry = new THREE.BoxGeometry( 3, 2, 0.01 );
    var textureBird = new THREE.TextureLoader().load( '../images/bird.png' );
        textureBird.minFilter = THREE.LinearFilter;
    var birdMaterial = new THREE.MeshBasicMaterial( { map: textureBird } );
        birdMaterial.side = THREE.DoubleSide;
    bird = new THREE.Mesh( birdGeometry, birdMaterial );
    bird.position.set(1, -7, 0);
    scene.add( bird );
    

    // // ---------- Pipe Group ----------
    //x: 16 fully visible right border pipe, 19.1 just after border
    
    // Pipe north
    let pipeLength = 24;
    
    var textureNorth = new THREE.TextureLoader().load( '../images/pipeNorth.jpg' );
    var northPipe = new THREE.Mesh( new THREE.CylinderGeometry( 1.5, 1.5, pipeLength, 128 ), new THREE.MeshPhongMaterial( { map: textureNorth, color: 0x00ff00 } ) );
    northPipe.receiveShadow = true;
    northPipe.castShadow = true;
    pipeGroup.add(northPipe);

    // Pipe south
    var textureSouth = new THREE.TextureLoader().load( '../images/pipeSouth.jpg' );
    var southPipe = new THREE.Mesh( new THREE.CylinderGeometry( 1.5, 1.5, pipeLength, 128 ), new THREE.MeshPhongMaterial( { map: textureSouth, color: 0x00ff00 } ) );
    southPipe.position.y = -(pipeLength + gap);
    southPipe.receiveShadow = true;
    southPipe.castShadow = true;
    pipeGroup.add(southPipe);

    // Gap box
    if(DEBUG) {
        var gapPosition = new THREE.Mesh( new THREE.BoxGeometry( 3, 2, 1 ), new THREE.MeshBasicMaterial( {color: 0xff0000} ) );
        gapPosition.position.y = -13.5;
        pipeGroup.add(gapPosition);
    }
    pipeGroup.receiveShadow = true;
    pipeGroup.castShadow = true;
    scene.add( pipeGroup );
    pipeGroup.position.set(18.1, 12, 0); //y: -9 to 12 (now set -9 to 9)

    // ---------- Floor ----------
    var floorGeometry = new THREE.BoxGeometry( 50, 6.01, 20 );
    var floorMaterial = new THREE.MeshPhongMaterial( { color: 0xDBDA96 } );
    floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.position.set(8, -30, 5);
    floor.receiveShadow = true;
    scene.add( floor );

    // ---------- Rail ----------
    var railGeometry = new THREE.BoxGeometry( 50, 1, 0.5 );
    var railMaterial = new THREE.MeshBasicMaterial( { color: 0xc0bf8c } ); //a3a259
    rail = new THREE.Mesh( railGeometry, railMaterial );
    rail.receiveShadow = true;
    rail.position.set(8, -27.49, 0);
    scene.add( rail );

    // ---------- Orientation point 1 ----------
    if(DEBUG) {
        var geometryBox = new THREE.BoxGeometry( 1, 1, 1 );
        var materialBox = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        var cube = new THREE.Mesh( geometryBox, materialBox );
        scene.add( cube );
    }

    // ---------- Orientation point 2 ----------
    if(DEBUG) {
        var geometryBox1 = new THREE.BoxGeometry( 1, 1, 1 );
        var materialBox1 = new THREE.MeshBasicMaterial( {color: 0xff0000} );
        var cube1 = new THREE.Mesh( geometryBox1, materialBox1 );
        scene.add( cube1 );
        cube1.position.y -= 26;
    }

    // ---------- Render ----------
    if(DEBUG) renderer = new THREE.WebGLRenderer();
    else renderer = new THREE.WebGLRenderer({ alpha: true });

    // Shadows
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    renderer.setClearColor(0x007f7f, 0);
    renderer.setPixelRatio(WIDTH / HEIGHT);
    renderer.setSize(WIDTH, HEIGHT);

    console.log(container);
    container.appendChild( renderer.domElement );
    // document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
}

function main() {
    if (stop) return;
    if (pause) return;

    bird.position.y -= gravity;
    pipeGroup.position.x -= scrollSpeed;

    // If bird coords y is bigger or smaller than gap
    if((bird.position.y > (pipeGroup.position.y - 13) || bird.position.y < (pipeGroup.position.y - (11 + gap))) && (pipeGroup.position.x <= 3.3 && pipeGroup.position.x > -2) ) {
        gameRestart();
    }
    // Score once
    if(pipeGroup.position.x <= 0.1 && pipeGroup.position.x > 0) {
        incScore();
        console.log('Score: ' + score);
        if(score < 50 && score % 5 == 0) {
            gravity += 0.01;
            jumpHeight += 0.02;
        }
        console.log('gravity: ' + gravity + ', jump:' + jumpHeight);
    }
    
    // Move pipe to start with different gap position
    if(pipeGroup.position.x <= -4)  { 
        pipeGroup.position.set(20, getPositiveNegativeRandom(), 0);
    }

    // Game over if bird touch the floor
    if(bird.position.y < -26) {
        gameRestart();
    }

    if (!stop) info.innerHTML =  "Score: " + score;

    renderer.render(scene, camera);
    requestAnimationFrame(main);  
}