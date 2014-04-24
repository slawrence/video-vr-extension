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
        if (vidEl.videoWidth && vidEl.videoHeight) {
            return {w: vidEl.videoWidth, h: vidEl.videoHeight };
        }
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
            current_proj = options.projection || "Plane",
            projections = ['Plane', 'Sphere', 'Cube', 'Cylinder'],
            currentProjection,
            movieMaterial,
            movieGeometry,
            movieScreen,
            controls3d,
            renderedCanvas,
            scene,
            player = global.videojs(videoEl),
            container = player.el();

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
                camera,
                viewportAspectRatio = (container.offsetWidth && container.offsetHeight) ? (container.offsetWidth / container.offsetHeight) : (4/3);

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

        /**
         * Add the menu options
         */
        function initMenu() {
            var vjs = global.videojs;
            vjs.ProjectionSelector = vjs.MenuButton.extend({
                init : function(player, options) {
                    player.availableProjections = options.availableProjections || [];
                    vjs.MenuButton.call(this, player, options);
                }
            });

            //Top Item - not selectable
            vjs.ProjectionTitleMenuItem = vjs.MenuItem.extend({
                init : function(player, options) {
                    vjs.MenuItem.call(this, player, options);
                    this.off('click'); //no click handler
                }
            });

            //Menu Item
            vjs.ProjectionMenuItem = vjs.MenuItem.extend({
                init : function(player, options){
                    options.label = options.res;
                    options.selected = (options.res.toString() === player.getCurrentRes().toString());
                    vjs.MenuItem.call(this, player, options);
                    this.resolution = options.res;
                    this.on('click', this.onClick);
                    player.on('changeProjection', vjs.bind(this, function() {
                        if (this.resolution === player.getCurrentRes()) {
                            this.selected(true);
                        } else {
                            this.selected(false);
                        }
                    }));
                }
            });

            // Handle clicks on the menu items
            vjs.ProjectionMenuItem.prototype.onClick = function() {
                var player = this.player(),
                button_nodes = player.controlBar.projectionSelection.el().firstChild.children,
                button_node_count = button_nodes.length;

                // Save the newly selected resolution in our player options property
                changeProjection(this.resolution);

                // Update the button text
                while ( button_node_count > 0 ) {
                    button_node_count--;
                    if ( 'vjs-current-res' === button_nodes[button_node_count].className ) {
                        button_nodes[button_node_count].innerHTML = this.resolution;
                        break;
                    }
                }
            };

            // Create a menu item for each available projection
            vjs.ProjectionSelector.prototype.createItems = function() {
                var player = this.player(),
                items = [];

                // Add the menu title item
                items.push( new vjs.ProjectionTitleMenuItem( player, {
                    el : vjs.Component.prototype.createEl( 'li', {
                        className : 'vjs-menu-title vjs-res-menu-title',
                        innerHTML : 'Projections'
                    })
                }));

                // Add an item for each available resolution
                player.availableProjections.forEach(function (proj) {
                    items.push( new vjs.ProjectionMenuItem( player, {
                        res : proj
                    }));
                });

                return items;
            };


        }

        function addMenu(cb) {
            var vjs = global.videojs;
            player.getCurrentRes = function() {
                return player.current_proj || '';
            };

            // Add the resolution selector button
            var projectionSelection = new vjs.ProjectionSelector( player, {
                el : vjs.Component.prototype.createEl( null, {
                    className : 'vjs-res-button vjs-menu-button vjs-control',
                    innerHTML : '<div class="vjs-control-content"><span class="vjs-current-res">' + ( current_proj || 'Projections' ) + '</span></div>',
                    role    : 'button',
                    'aria-live' : 'polite', // let the screen reader user know that the text of the button may change
                    tabIndex  : 0
                }),
                availableProjections : projections
            });

            // Add the button to the control bar object and the DOM
            cb.projectionSelection = cb.addChild( projectionSelection );
        }

        function initVRControls () {
            var vjs = global.videojs;
            var controlEl = container.getElementsByClassName('vjs-control-bar')[0];
            var left = vjs.Component.prototype.createEl( null, {
                className : 'videojs-vr-controls',
                innerHTML : '<div></div>',
                tabIndex  : 0
            });
            var right = vjs.Component.prototype.createEl( null, {
                className : 'videojs-vr-controls',
                innerHTML : '<div></div>',
                tabIndex  : 0
            });

            function addStyle(theEl) {
                theEl.style.position = "absolute";
                theEl.style.top = "50%";
                theEl.style.height = "50px";
                theEl.style.width = "30%";
                theEl.style.margin = "-25px 0 0 -20%";
                return theEl;
            }
            left = addStyle(left);
            left.style.left = "35%";
            right = addStyle(right);
            right.style.left = "75%";

            //copy controlEl
            var controlElRight = new vjs.ControlBar(player, {name: 'controlBar'});
            addMenu(controlElRight);

            //insert nodes into left and right
            left.insertBefore(controlEl, left.firstChild);
            right.insertBefore(controlElRight.el(), right.firstChild);

            //insert left and right nodes into DOM
            container.insertBefore(left, container.firstChild);
            container.insertBefore(right, container.firstChild);
        }

        //videojs stuff
        if (player) {
            initMenu();
            addMenu(player.controlBar);
            if (vrEnabled) {
                initVRControls();
            }
            
        }

        return {
            changeProjection: changeProjection
        };
    };
    
    return {
        init: init
    };

}(window));
