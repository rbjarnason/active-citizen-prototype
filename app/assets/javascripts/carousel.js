// From http://www.mingoland.co.uk/webgl/carousel/

/* -- Carousel -- */
var Carousel = function (rad, images, w, h) {
    THREE.Object3D.call(this);
    this.images = images;
    this.rad = rad;
    this.howMany = 0;
    this.reflectionOpacity = 0.1;
    this.reflectionHeightPer = 0.5;
    this.imgs = [];
    this.page_urls = [];
    var thiss = this;
    this.w = w;
    this.h = h;
    for (var i = 0; i < this.images.length; i++) {
        this.imgs[i] = new Image();
        this.page_urls[i] = this.images[i].page_url;
        this.imgs[i].onload = function () {
            thiss.buildCarousel(thiss);
        };
        this.imgs[i].src = this.images[i].url;
    }
    this.anglePer = 2 * Math.PI / this.images.length;
}

// Carousel is subclass of Object3D
Carousel.prototype = new THREE.Object3D;
Carousel.prototype.constructor = Carousel;
Carousel.prototype.buildCarousel = function (scope) {
    scope.howMany++;
    if (scope.howMany == scope.images.length) {
        for (var i = 0; i < scope.images.length; i++) {
            // image plane
            var texture = new THREE.Texture(scope.imgs[i]);
            var plane = new THREE.Mesh(new THREE.PlaneGeometry(scope.w, scope.h, 3, 3), new THREE.MeshBasicMaterial({ map: texture, overdraw: true }));
            var aa = i * scope.anglePer;
            plane.rotation.y = -aa - Math.PI / 2;
            plane.position = new THREE.Vector3(scope.rad * Math.cos(aa), 0, scope.rad * Math.sin(aa));
            plane.doubleSided = true;
            plane.carouselAngle = aa;//plane.rotation.y;
            plane.scale.x = -1;

            plane["page_url"] = scope.images[i].page_url;
            this.add(plane);
            //this.add(reflectionplane);

            if (i == 0) {
                plane.rotation.y = 0;
                plane.position = new THREE.Vector3(1, 1324, 1);
                plane.doubleSided = true;
                plane.carouselAngle = 0;//plane.rotation.y;
                plane.scale.x = 3;
                plane.scale.y = 3;

                main_idea_plane = plane;
            }
        }
    }
};


// Bg gradient
var canvas = document.createElement('canvas');
canvas.width = 32;
canvas.height = window.innerHeight;
var context = canvas.getContext('2d');
var gradient = context.createLinearGradient(0, 0, 0, canvas.height);
gradient.addColorStop(0, "#FFFFFF");
gradient.addColorStop(0.5, "#FFFFFF");
gradient.addColorStop(0.82, "#DDDDDD");
gradient.addColorStop(1, "#AAAAAA");
context.fillStyle = gradient;
context.fillRect(0, 0, canvas.width, canvas.height);
document.body.style.background = 'url(' + canvas.toDataURL('image/png') + ')';

var container;
var camera, scene, renderer, projector;
var updatecamera = false, carouselupdate = true;
var carousel;
/*var images = [
 {url: 'img/d1.jpg', width: 150, height: 100},
 {url: 'img/d2.jpg', width: 150, height: 100},
 {url: 'img/d3.png', width: 150, height: 100},
 {url: 'img/d4.jpg', width: 150, height: 100},
 {url: 'img/d5.jpg', width: 150, height: 100},
 {url: 'img/d6.png', width: 150, height: 100},
 {url: 'img/d7.png', width: 150, height: 100},
 {url: 'img/d8.png', width: 150, height: 100},
 {url: 'img/d9.jpg', width: 150, height: 100},
 {url: 'img/d10.jpg', width: 150, height: 100}
 ];*/
var targetRotationY = 0;
var targetRotationOnMouseDownY = 0;
var targetRotationX = 0;
var targetRotationOnMouseDownX = 0;

var mouse = {x: 0, y: 0}, prevmouse = {x: 0, y: 0};
var mouseX = 0;
var mouseXOnMouseDown = 0;
var mouseY = 0;
var mouseYOnMouseDown = 0;
var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;


/****** INIT *****/

container = document.getElementById('container');
var w, h;
//			var	w=2640, h=1440-4;
w = window.innerWidth;
h = window.innerHeight;
container.style.width = w + "px";
container.style.height = h + "px";
container.style.marginTop = 0.5 * (window.innerHeight - h) + 'px';

scene = new THREE.Scene();

camera = new THREE.PerspectiveCamera(70, w / h, 1, 50000);
camera.position.x = 0;
camera.position.y = 1150;
camera.position.z = 1900;


scene.add(camera);

var main_idea_plane;

// Carousel
carousel = new Carousel(2570, images, 1366, 768);
scene.add(carousel);

projector = new THREE.Projector();
renderer = new THREE.CanvasRenderer();
renderer.setSize(w, h);
container.appendChild(renderer.domElement);

container.addEventListener('dblclick', ondblClick, false);
container.addEventListener('mousedown', onDocumentMouseDown, false);
container.addEventListener('touchstart', onDocumentTouchStart, false);
container.addEventListener('touchmove', onDocumentTouchMove, false);


var start_position = { x: 0, y: 1150, z: 1900 };
var target_position = { x: 0, y: -120, z: 3520 };
var camera_tween = new TWEEN.Tween(start_position).to(target_position, 900);

camera_tween.onUpdate(function () {
    camera.position.set(start_position.x, start_position.y, start_position.z);
});

camera_tween.delay(1200);
camera_tween.start();

var start_rotation = { x: 0, y: 0.0, z: 0.0 };
var target_rotation = { x: 0, y: 6.30, z: 0.0 };
var main_idea_tween = new TWEEN.Tween(start_rotation).to(target_rotation, 270000);

main_idea_tween.onUpdate(function () {
    main_idea_plane.rotation.y = start_rotation.y;
});

main_idea_tween.delay(1200);
main_idea_tween.start();

var keyboard = new THREEx.KeyboardState();
var current_id = 0;

/****** INIT *****/

animate();


function rotateCarousel(item, easing) {
    carouselupdate = false;
    var angle = (item.carouselAngle - Math.PI / 2) % (2 * Math.PI);
    var b = carousel.rotation.y % (2 * Math.PI);
    var ang;
    if (b > 0) b = -2 * Math.PI + b;
    carousel.rotation.y = b;
    if (angle < b) angle += 2 * Math.PI;
    if ((angle - b) > 2 * Math.PI - (angle - b)) {
        ang = b + (-(2 * Math.PI - (angle - b)));
    }
    else {
        ang = b + (angle - b);
    }

    if (easing) {
        new TWEEN.Tween(carousel.rotation).to({y: ang}, 800).easing(TWEEN.Easing.Exponential.EaseInOut).onComplete(function () {
            carouselupdate = true;
            targetRotationY = carousel.rotation.y;
        }).start();
    } else {
        new TWEEN.Tween(carousel.rotation).to({y: ang}, 100).easing(TWEEN.Easing.Exponential.EaseInOut).onComplete(function () {
            carouselupdate = true;
            targetRotationY = carousel.rotation.y;
        }).start();
    }
}

function ondblClick(event) {
    event.preventDefault();
    dblclick = true;

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    var vector = new THREE.Vector3(mouse.x, mouse.y, 1);
    projector.unprojectVector(vector, camera);

    var ray = new THREE.Ray(camera.position, vector.subSelf(camera.position).normalize());

    var intersects = ray.intersectObjects(carousel.children);

    if (intersects.length > 0) {
        if (current_page(intersects[0].object)) {
            //alert(carousel.children[current_id].page_url);
            //window.open(carousel.children[current_id].page_url, '_blank');
            $.colorbox({href: carousel.children[current_id].page_url, iframe: true, opacity: 1.0, open: true, innerHeight: "85%", innerWidth: "85%" });

        } else {
            rotateCarousel(intersects[0].object, true);
            setCurrentetChildId(intersects[0].object);
        }
    }
}

function onDocumentMouseDown(event) {

    event.preventDefault();

    container.addEventListener('mousemove', onDocumentMouseMove, false);
    container.addEventListener('mouseup', onDocumentMouseUp, false);
    container.addEventListener('mouseout', onDocumentMouseOut, false);

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
    prevmouse = {x: mouse.x, y: mouse.y};
    mouseXOnMouseDown = event.clientX - windowHalfX;
    mouseYOnMouseDown = event.clientY - windowHalfY;
    targetRotationOnMouseDownY = targetRotationY;
    targetRotationOnMouseDownX = targetRotationX;
}

function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;
    mouseY = event.clientY - windowHalfY;
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;

    targetRotationY = targetRotationOnMouseDownY + ( mouseX - mouseXOnMouseDown ) * 0.002;
    targetRotationX = targetRotationOnMouseDownX + ( mouseY - mouseYOnMouseDown ) * 0.002;

    if (camera.position.z < 430) {
        //  camera.position.z = 430
    }
    if (camera.position.z > 600) {
        //  camera.position.z = 600
    }
    updatecamera = true;
}

function onDocumentMouseUp(event) {

    container.removeEventListener('mousemove', onDocumentMouseMove, false);
    container.removeEventListener('mouseup', onDocumentMouseUp, false);
    container.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut(event) {

    container.removeEventListener('mousemove', onDocumentMouseMove, false);
    container.removeEventListener('mouseup', onDocumentMouseUp, false);
    container.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentTouchStart(event) {

    if (event.touches.length == 1) {

        event.preventDefault();

        mouse.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
        prevmouse = {x: mouse.x, y: mouse.y};
        mouseXOnMouseDown = event.clientX - windowHalfX;
        mouseYOnMouseDown = event.clientY - windowHalfY;
        targetRotationOnMouseDownY = targetRotationY;
        targetRotationOnMouseDownX = targetRotationX;

    }
}

function onDocumentTouchMove(event) {

    if (event.touches.length == 1) {

        event.preventDefault();

        mouse.x = ( event.touches[ 0 ].pageX / window.innerWidth ) * 2 - 1;
        mouse.y = -( event.touches[ 0 ].pageY / window.innerHeight ) * 2 + 1;
        prevmouse = {x: mouse.x, y: mouse.y};
        mouseXOnMouseDown = event.clientX - windowHalfX;
        mouseYOnMouseDown = event.clientY - windowHalfY;
        targetRotationOnMouseDownY = targetRotationY;
        targetRotationOnMouseDownX = targetRotationX;
//				updatecamera=true;
    }
}

//

function animate() {
    requestAnimationFrame(animate);
    render();
}

function setCurrentetChildId(object) {
    for (i = 0; i < carousel.children.length; i++) {
        if (carousel.children[i] == object) {
            current_id = i;
        }
    }
}

function current_page(object) {
    found = false;
    if (carousel.children[current_id] == object) {
        found = true;
    }
    return found;
}


function render() {
    if (carouselupdate)
        carousel.rotation.y += ( targetRotationY - carousel.rotation.y ) * 0.05;
    if (updatecamera && Math.abs(mouse.y - prevmouse.y) > Math.abs(mouse.x - prevmouse.x))
        camera.position.z += (mouse.y - prevmouse.y) * 20;


    renderer.render(scene, camera);
    updatecamera = true;
//				carouselupdate=true;
    if (keyboard.pressed("enter")) {
        if (current_id > carousel.children.length - 1) {
            current_id = 0;
        }
        rotateCarousel(carousel.children[current_id += 1], false);
    }
    TWEEN.update();
}
