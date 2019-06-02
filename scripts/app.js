var camera, scene, renderer, bird, floor;
const HEIGHT = 550;
const WIDTH = 300;
const DEBUG = false;
const gravity = 0.1;
const scrollSpeed = 0.1;
var gap = 6;
var pause = false;
var score = 0;

var container;

document.addEventListener('keydown', function(event) {
    const key = event.keyCode;
    if(key == 32) moveUp();
});

function incScore() {
    score++;
}

function restartScore() {
    score = 0;
}

function moveUp() {
    bird.position.y += 2;
}

scene = new THREE.Scene();

var pipeGroup = new THREE.Group();

function getPositiveNegativeRandom() {
    var num = Math.floor(Math.random() * 9) + 1;
    num *= Math.floor(Math.random() * 2) == 1 ? 1 : -1;
    if(DEBUG) console.log('Gap position: ' + num);
    
    return num;
}

function init() {
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

    // // ---------- Pipe 1 ----------
    // var northPipeGeometry = new THREE.BoxGeometry( 3, 24, 1 );
    // var northPipeMaterial = new THREE.MeshBasicMaterial( {color: 0x0000ff} );
    // northPipe = new THREE.Mesh( northPipeGeometry, northPipeMaterial );
    // northPipe.position.set(19.1, -11, 0); //x: 16 cały obiekt przy granicy, 19.1 poza, y: -11 przy granicy, -15 max
    // scene.add( northPipe );

    let pipeLength = 24;
    var northPipe = new THREE.Mesh( new THREE.BoxGeometry( 3, pipeLength, 1 ), new THREE.MeshBasicMaterial( {color: 0x0000ff} ) );
    pipeGroup.add(northPipe);

    var southPipe = new THREE.Mesh( new THREE.BoxGeometry( 3, pipeLength, 1 ), new THREE.MeshBasicMaterial( {color: 0x0000ff} ) );
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
    var floorGeometry = new THREE.BoxGeometry( 19, 6, 1 );
    var floorMaterial = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
    floor = new THREE.Mesh( floorGeometry, floorMaterial );
    floor.position.set(8, -30, 0);
    scene.add( floor );

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
    bird.position.y -= gravity;
    pipeGroup.position.x -= scrollSpeed;

    //if bird coords y is bigger or smaller than gap
    if(bird.position.y > (pipeGroup.position.y - 13) || bird.position.y < (pipeGroup.position.y - (13 + gap)) ) {
        if(pipeGroup.position.x <= 2 && pipeGroup.position.x > 0) {
            restartScore();
            console.log('Score po loosie: ' + score);
        }
    }
    //score once
    if(pipeGroup.position.x <= 0.1 && pipeGroup.position.x > 0) {
        incScore();
        // console.log('chuj');
        console.log('Score: ' + score);
    }
    
    //Move pipe to start with different gap position
    if(pipeGroup.position.x <= -4)  { 
        pipeGroup.position.set(20, getPositiveNegativeRandom(), 0);
        // console.log('Pipe position: ' + pipeGroup.position.y);
    }

    //Game over if bird touch the floor
    if(bird.position.y < -26) {
        restartScore();
        // console.log('You loose. Score: ' + score);
    }
    renderer.render(scene, camera);
    requestAnimationFrame(main);  
}