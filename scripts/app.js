var camera, renderer, bird, floor, obj; //objects
var container, info; //div
const HEIGHT = 550;
const WIDTH = 300;
const DEBUG = false;
const gravity = 0.12;
const scrollSpeed = 0.1;
var gap = 6;
var score = 0;
var pause = false;

var scene = new THREE.Scene();
var pipeGroup = new THREE.Group();

document.addEventListener('keydown', function(event) {
    const key = event.keyCode;
    if(key == 32) moveUp();
    if(key == 80) pauseGame();
    if(key == 82) {
        // location.reload();
        gameOver();
    } 
});

function pauseGame() {
    pause = !pause;
    info.innerHTML =  "Press p to resume";
    if (!pause) main();
}

function incScore() {
    score++;
}

function restartScore() {
    score = 0;
}

function gameOver() {
    score = 0;
    bird.position.set(1, -7, 0);
    pipeGroup.position.set(18.1, 12, 0);
}

function moveUp() {
    bird.position.y += 2;
}

function getPositiveNegativeRandom() {
    var num = Math.floor(Math.random() * 9) + 1;
    num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    if(DEBUG) console.log('Gap position: ' + num);
    
    return num;
}

function loadBird() {
    var loader = new THREE.STLLoader();
    loader.load( '../models/flappy_bird.stl', function ( geom ) {
        var mat;
        if (geom.hasColors) {
            mat = new THREE.MeshPhongMaterial({ opacity: geom.alpha, vertexColors: THREE.VertexColors });
        } else { 
            mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
        }
        obj = new THREE.Mesh( geom,  mat );
        obj.scale.x = 0.023;
        obj.scale.y = 0.023;
        obj.scale.z = 0.023;
        obj.position.set(1, -10, 0);
        scene.add( obj );
    });
}

function init() {
    info = document.getElementById("info");
    container = document.getElementById("canvas");

    // ---------- Camera ----------
    camera = new THREE.PerspectiveCamera(60, WIDTH / HEIGHT, 1, 10000);
    camera.position.x = 8;
    camera.position.y = -16;
    camera.position.z = 30;

    // ---------- Bird ----------
    var birdGeometry = new THREE.BoxGeometry( 2, 2, 1 );
    var birdMaterial = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    bird = new THREE.Mesh( birdGeometry, birdMaterial );
    bird.position.set(1, -7, 0);
    scene.add( bird );

    // ------model--------
    // var manager = new THREE.LoadingManager();
    // var loader = new THREE.STLLoader();
    // loader.load( '../models/flappy_bird.stl', function ( geom ) {
    //     var mat;
    //     if (geom.hasColors) {
    //         mat = new THREE.MeshPhongMaterial({ opacity: geom.alpha, vertexColors: THREE.VertexColors });
    //     } else { 
    //         mat = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    //     }
    //     obj = new THREE.Mesh( geom,  mat );
    //     obj.scale.x = 0.023;
    //     obj.scale.y = 0.023;
    //     obj.scale.z = 0.023;
    //     obj.position.set(1, -25, 0);
    //     scene.add( obj );
    // });
    
    // // ---------- Pipe Group ----------
    //x: 16 fully visible right border pipe, 19.1 just after border

    // Pipe north
    let pipeLength = 24;
    
    var textureNorth = new THREE.TextureLoader().load( '../images/pipeSouth1.jpg' );
    var northPipe = new THREE.Mesh( new THREE.CylinderGeometry( 1.5, 1.5, pipeLength, 128 ), new THREE.MeshBasicMaterial( { map: textureNorth, color: 0x00ff00 } ) );
    pipeGroup.add(northPipe);

    // Pipe south
    var textureSouth = new THREE.TextureLoader().load( '../images/pipeNorth1.jpg' );
    var southPipe = new THREE.Mesh( new THREE.CylinderGeometry( 1.5, 1.5, pipeLength, 128 ), new THREE.MeshBasicMaterial( { map: textureSouth, color: 0x00ff00 } ) );
    southPipe.position.y = -(pipeLength + gap);
    pipeGroup.add(southPipe);

    if(DEBUG) {
        var gapPosition = new THREE.Mesh( new THREE.BoxGeometry( 3, 2, 1 ), new THREE.MeshBasicMaterial( {color: 0xff0000} ) );
        gapPosition.position.y = -13.5;
        pipeGroup.add(gapPosition);
    }
    
    scene.add( pipeGroup );
    pipeGroup.position.set(18.1, 12, 0); //y: -9 to 12 (now set -9 to 9)

    // ---------- Floor ----------
    var floorGeometry = new THREE.BoxGeometry( 50, 6.01, 20 );
    var floorMaterial = new THREE.MeshBasicMaterial( { color: 0xDBDA96 } );
    floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.position.set(8, -30, 5);
    scene.add( floor );

    // ---------- Rail ----------
    var railGeometry = new THREE.BoxGeometry( 50, 1, 2.5 );
    var railMaterial = new THREE.MeshBasicMaterial( { color: 0xa3a259 } );
    rail = new THREE.Mesh( railGeometry, railMaterial );
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

    // ---------- Light ----------
    var light = new THREE.DirectionalLight(0xffffff);
    light.position.set(10, 10, 50);
    scene.add(light);

    // ---------- Render ----------
    if(DEBUG) renderer = new THREE.WebGLRenderer();
    else renderer = new THREE.WebGLRenderer({ alpha: true });
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
    // console.log(obj.position.x);

    // here
    // obj.position.y -= 0.15;

    if (pause) return;
    bird.position.y -= gravity;
    pipeGroup.position.x -= scrollSpeed;

    //if bird coords y is bigger or smaller than gap
    if((bird.position.y > (pipeGroup.position.y - 13) || bird.position.y < (pipeGroup.position.y - (11 + gap))) && (pipeGroup.position.x <= 3.5 && pipeGroup.position.x > -2) ) {
            // restartScore();
            gameOver();
    }
    //score once
    if(pipeGroup.position.x <= 0.1 && pipeGroup.position.x > 0) {
        incScore();
        console.log('Score: ' + score);
    }
    
    //Move pipe to start with different gap position
    if(pipeGroup.position.x <= -4)  { 
        pipeGroup.position.set(20, getPositiveNegativeRandom(), 0);
    }

    //Game over if bird touch the floor
    if(bird.position.y < -26) {
        // restartScore();
        gameOver();
        // pauseGame();
        // console.log('Game over: floor touched');
    }

    // console.log('xPipe: ' + pipeGroup.position.x + ', score: ' + score);

    info.innerHTML =  "Score: " + score;
    renderer.render(scene, camera);

    requestAnimationFrame(main);  
}