var MAKE3D = (function (global) {
    /**
     * Lock the Pointer logic
     * http://www.html5rocks.com/en/tutorials/pointerlock/intro/
     */
    var pointerLock = function (success, error, el) {
        var d = document,
            havePointerLock = 'pointerLockElement' in d || 'mozPointerLockElement' in d || 'webkitPointerLockElement' in d,
            e = d.body;

        if (havePointerLock) {
            var pointerlockchange = function () {
                if ( d.pointerLockElement === e || d.mozPointerLockElement === e || d.webkitPointerLockElement === e ) {
                    success();
                } else {
                    error();
                }
            };

            var pointerlockerror = function () {
                error();
            };

            // Hook pointer lock state change events
            d.addEventListener('pointerlockchange', pointerlockchange, false);
            d.addEventListener('mozpointerlockchange', pointerlockchange, false);
            d.addEventListener('webkitpointerlockchange', pointerlockchange, false);

            d.addEventListener('pointerlockerror', pointerlockerror, false);
            d.addEventListener('mozpointerlockerror', pointerlockerror, false);
            d.addEventListener('webkitpointerlockerror', pointerlockerror, false);

            (el).addEventListener( 'click', function () {
                // Ask the browser to lock the pointer
                e.requestPointerLock = e.requestPointerLock || e.mozRequestPointerLock || e.webkitRequestPointerLock;

                if ( /Firefox/i.test( navigator.userAgent ) ) {
                    var fullscreenchange = function () {
                        if ( d.fullscreenElement === e || d.mozFullscreenElement === e || d.mozFullScreenElement === e ) {
                            d.removeEventListener( 'fullscreenchange', fullscreenchange );
                            d.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                            e.requestPointerLock();
                        }
                    };

                    d.addEventListener( 'fullscreenchange', fullscreenchange, false );
                    d.addEventListener( 'mozfullscreenchange', fullscreenchange, false );

                    e.requestFullscreen = e.requestFullscreen || e.mozRequestFullscreen || e.mozRequestFullScreen || e.webkitRequestFullscreen;
                    e.requestFullscreen();
                } else {
                    e.requestPointerLock();
                }
            }, false);

        } else {
            error('Your browser doesn\'t seem to support Pointer Lock API');
        }
    },

    initVR = function() {
        var vrEnabled = false;
        if (typeof global.vr !== "undefined") {
            vrEnabled = true;
            if (!global.vr.isInstalled()) {
                console.error('NPVR plugin not installed!');
                vrEnabled = false;
            }
            global.vr.load(function(error) {
                if (error) {
                    console.error('Plugin load failed: ' + error.toString());
                    vrEnabled = false;
                }
            });
        }
        return vrEnabled;
    },

    getDim = function (vidEl) {
        var style = vidEl.style || {};
        if (vidEl.offsetWidth && vidEl.offsetHeight) {
            return {w: vidEl.offsetWidth, h: vidEl.offsetHeight};
        }
        if (style.width && style.height) {
            return {w: parseInt(style.width.replace(/\D+/, "")), h: parseInt(style.height.replace(/\D+/, ""))};
        }
        return {w: 640, h: 360};
    },

    init = function (id, options) {
        //vars global (via closure) to the plugin
        var vrEnabled = initVR(),
            videoEl = (function () {
                return (typeof id === "String") ? document.getElementById(id) : id;
            }()),
            vidAspectRatio = getAspectRatio(videoEl),
            container = options.container || document.body,
            current_proj = options.projection || "Plane",
            viewportAspectRatio = options.aspectRatio || (4/3),
            projections = ['Plane', 'Sphere', 'Cube', 'Cylinder'],
            currentProjection,
            movieMaterial,
            movieGeometry,
            movieScreen,
            controls3d,
            renderedCanvas,
            scene;

        function getAspectRatio (el) {
            var dim = getDim(el);
            return (dim.w / dim.h);
        };

        function resetControls() {
            controls3d.getObject().position.set(0, 0, 0);
            controls3d.getObject().rotation.y = 0;
            controls3d.getObject().children[0].rotation.x = 0;
        }

        function changeProjection(projection) {
            var position = {x:0, y:0, z:0 },
                height = 256,
                i;

            currentProjection = projection || currentProjection;
            if (scene) {
                scene.remove(movieScreen);
            }
            if (currentProjection  === "Sphere") {
                movieGeometry = new THREE.SphereGeometry( 256, 32, 32 );
            } else if (currentProjection  === "Cylinder") {
                movieGeometry = new THREE.CylinderGeometry( 256, 256, 400, 50, 1, true );
            } else if (currentProjection  === "Cube") {
                movieGeometry = new THREE.CubeGeometry( 256, 256, 256 );
            } else if (currentProjection  === "Dome") {
                movieGeometry = new THREE.PlaneGeometry( height * vidAspectRatio, height, 1, 40 );
                for (i = 0; i < movieGeometry.vertices.length; i +=1) {
                    movieGeometry.vertices[i].z = -(i*2) - Math.pow(i, 2);
                }
                position.z = -256;
            } else if (currentProjection  === "Plane") {
                movieGeometry = new THREE.PlaneGeometry( height * vidAspectRatio, height, 4, 4 );
                position.z = -256;
            }
            movieScreen = new THREE.Mesh( movieGeometry, movieMaterial );
            movieScreen.position.set(position.x, position.y, position.z);
            resetControls();
            scene.add(movieScreen);
        }

        function initScene() {
            var time = Date.now(),
                effect,
                videoTexture,
                vrstate = vrEnabled ? new vr.State() : null,
                requestId,
                renderer,
                camera;

            camera = new THREE.PerspectiveCamera( 75, viewportAspectRatio, 1, 1000 );
            scene = new THREE.Scene();

            controls3d = vrEnabled ? new THREE.OculusRiftControls(camera) : new THREE.PointerLockControls(camera);
            scene.add(controls3d.getObject());

            videoTexture = new THREE.Texture( videoEl );
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.magFilter = THREE.LinearFilter;

            movieMaterial = new THREE.MeshBasicMaterial( { map: videoTexture, overdraw: true, side:THREE.DoubleSide } );
            changeProjection(current_proj);
            camera.position.set(0,0,0);

            renderer = new THREE.WebGLRenderer({
                devicePixelRatio: 1,
                alpha: false,
                clearColor: 0xffffff,
                antialias: true
            });
            //TODO: what should these values be?
            renderer.setSize(1024, 768);

            if (vrEnabled) {
                effect = new THREE.OculusRiftEffect(renderer);
            }
            renderedCanvas = renderer.domElement;
            renderedCanvas.style.width = "100%";
            renderedCanvas.style.height = "100%";

            container.insertBefore(renderedCanvas, container.firstChild);
            videoEl.style.display = "none";
            videoEl.addEventListener("loadstart", function (evt) {
                vidAspectRatio = getAspectRatio(videoEl);
                changeProjection();
            });

            function animate() {
                if ( videoEl.readyState === videoEl.HAVE_ENOUGH_DATA ) {
                    if (videoTexture) {
                        videoTexture.needsUpdate = true;
                    }
                }

                if (vrEnabled) {
                    //TODO: requestId in dispose
                    requestId = vr.requestAnimationFrame(newAnimate);
                    var polled = vr.pollState(vrstate);
                    controls3d.update( Date.now() - time, polled ? vrstate : null );
                    effect.render( scene, camera, polled ? vrstate : null );
                } else {
                    requestId = window.requestAnimationFrame(newAnimate);
                    controls3d.update( Date.now() - time );
                    renderer.render( scene, camera );
                }

                time = Date.now();
            }
            var newAnimate = animate.bind(this);
            newAnimate();
        }
        initScene();
        if (!vrEnabled) {
            pointerLock(function () {
                controls3d.enabled = true;
            }, function () {
                controls3d.enabled = false;
            }, renderedCanvas);
        }

        function keyPressed (event) {
            switch ( event.keyCode ) {
                case 78: // n = flip through projections
                    var currentIndex = projections.indexOf(currentProjection);
                    if (currentIndex === -1) {
                        currentIndex = 0;
                    }
                    currentIndex = (currentIndex < projections.length - 1) ? (currentIndex + 1) : 0;
                    changeProjection(projections[currentIndex]);
                    break;
            }
            if (vrEnabled) {
                switch ( event.keyCode ) {
                    case 79: // o
                        effect.setInterpupillaryDistance(
                                effect.getInterpupillaryDistance() - 0.001);
                                effect.getInterpupillaryDistance().toFixed(3);
                        break;
                    case 80: // p
                        effect.setInterpupillaryDistance(
                                effect.getInterpupillaryDistance() + 0.001);
                                effect.getInterpupillaryDistance().toFixed(3);
                        break;
                    case 67: // c
                        vr.resetHmdOrientation();
                        event.preventDefault();
                        break;
                }
            }
        }
        document.addEventListener( 'keydown', keyPressed, false );
        return {
            changeProjection: changeProjection
        };
    };
    return {
        init: init
    }

}(window));
