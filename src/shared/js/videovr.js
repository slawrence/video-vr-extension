/**
 * Dependencies:
 *  - vr.js -> vr
 *  - video.js -> videojs
 *  - three.js -> THREE
 *  - OculusRiftControls -> THREE.OculusRiftControls
 *  - PointerLockControls -> THREE.PointerLockControls
 *
 * Examples:
 *
 * var projections = VIDEO_VR.getAvailableProjections()
 *  -> ["Sphere", "Plane", ... ];
 *
 * var videovr = new VIDEO_VR.Scene(videoEl);
 *  or
 * var videovr = new VIDEO_VR.Scene('id', {projection: "Sphere"})
 *
 * var vid = videovr.Scene.getVideoElement();
 * vid.pause();
 *
 * videovr.changeProjection("Cube");
 *
 *
 */
var VIDEO_VR = (function (my, vr, videojs, THREE) {

    var defaultProjection = "Plane",
        projections = {
            "Sphere": {
                startPosition: {x: 0, y: 0, z: 0},
                geometry: function (w, h) {
                    return new THREE.SphereGeometry(256, 32, 32);
                }
            },
            "Cylinder": {
                startPosition: {x: 0, y: 0, z: 0},
                geometry: function (w, h) {
                    return new THREE.CylinderGeometry(256, 256, 400, 50, 1, true);
                }
            },
            "Cube": {
                startPosition: {x: 0, y: 0, z: 0},
                geometry: function (w, h) {
                    return new THREE.CubeGeometry(256, 256, 256);
                }
            },
            "Plane": {
                startPosition: {x: 0, y: 0, z: -256},
                geometry: function (w, h) {
                    return new THREE.PlaneGeometry(h * (w/h), h, 4, 4);
                }
            }

        },
        projectionsArray = (function () {
            //this isn't guaranteed to be in order every time, but whatever
            var prop,
                projs = [];
            for (prop in projections) {
                if (projections.hasOwnProperty(prop)) {
                    projs = projs.concat(prop);
                }
            }
            return projs;
        }());


    if (!vr || !videojs) {
        console.error("vr or videojs globals not found");
        return;
    }

    function getAvailableProjections() {
        return projectionsArray.slice();
    }

    /**
     * Attempt to find the width and height dimensions of an element.
     * Doesn't necessarily have to be used on a video element.
     * Returns an object with 'w' and 'h' numbers as properties.
     */
    function getDim(vidEl) {
        var style = vidEl.style || {};
        if (vidEl.videoWidth && vidEl.videoHeight) {
            return {w: vidEl.videoWidth, h: vidEl.videoHeight };
        }
        if (vidEl.offsetWidth && vidEl.offsetHeight) {
            return {w: vidEl.offsetWidth, h: vidEl.offsetHeight};
        }
        if (style.width && style.height) {
            return {w: parseInt(style.width.replace(/\D+/, "")), h: parseInt(style.height.replace(/\D+/, ""))};
        }
        return {w: 640, h: 360};
    }

    /**
     * Given an object with w and h properties, calculate the aspect ratio
     */
    function getAspectRatio (obj) {
        if (!obj.h) {
            console.error("divide by 0 when calculating aspect ratio!");
        }
        return obj.w / obj.h;
    }

    /**
     * Return element given either the element or a id string
     */
    function getElement(idOrEl) {
        if (toString.call(idOrEl) == '[object String]') {
            return document.getElementById(idOrEl);
        }
        return idOrEl;
    }

    function initTexture(el) {
        var texture = new THREE.Texture(el);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }

    function initSceneControls(vrEnabled, camera) {
        if (vrEnabled) {
            return new THREE.OculusRiftControls(camera);
        }
        return new THREE.PointerLockControls(camera);
    }

    function initCamera(aspectRatio) {
        var camera = new THREE.PerspectiveCamera(75, aspectRatio, 1, 1000);
        camera.position.set(0,0,0);
        return camera;
    }

    function initMovieMaterial(texture) {
        return new THREE.MeshBasicMaterial({
            map: texture,
            overdraw: true,
            side:THREE.DoubleSide
        });
    }

    function setStyle100(element) {
        element.style.width = "100%";
        element.style.height = "100%";
        return element;
    }

    var Scene = function(id, options) {
        var vidEl = getElement(id);

        if (!vidEl) {
            console.error("Id or element not provided!");
            return;
        }

        //init vr
        my.vr.init();

        this.vidEl = vidEl;
        this.currentProjection = options.projection || defaultProjection;

        //videojsify!
        this.player = videojs(vidEl);
        this.container = this.player.el();
        this._initializeScene();
        this._initEvents();
        this._pointerLock();

        my.menu.init(this);
    };

    Scene.prototype._initializeScene = function () {
        var time = Date.now(),
            videoTexture = initTexture(this.vidEl),
            viewportAspectRatio = getAspectRatio(getDim(this.container)),
            vrstate = my.vr.enabled ? new vr.State() : null,
            _this = this,
            renderer;

        this.camera = initCamera(viewportAspectRatio);
        this.scene = new THREE.Scene();
        this.controls3d = initSceneControls(my.vr.enabled, this.camera);
        this.scene.add(this.controls3d.getObject());
        this.movieMaterial = initMovieMaterial(videoTexture);

        this.changeProjection(this.currentProjection);

        renderer = new THREE.WebGLRenderer({
            devicePixelRatio: 1,
            alpha: false,
            clearColor: 0xffffff,
            antialias: true
        });
        //TODO: what should these values be?
        renderer.setSize(1024, 768);

        if (my.vr.enabled) {
            this.effect = new THREE.OculusRiftEffect(renderer);
        }

        this.renderedCanvas = setStyle100(renderer.domElement);
        this.container.insertBefore(this.renderedCanvas, this.container.firstChild);

        this.container = setStyle100(this.container);
        this.vidEl.style.display = "none";
        this.vidEl.addEventListener("loadstart", function (evt) {
            //sometimes page doesn't reload, but video changes
            //here we need to recalculate aspect ratio
            _this.changeProjection();
        });

        function animate() {
            if (this.vidEl.readyState === this.vidEl.HAVE_ENOUGH_DATA) {
                if (videoTexture) {
                    videoTexture.needsUpdate = true;
                }
            }

            if (my.vr.enabled) {
                vr.requestAnimationFrame(animate.bind(this));
                var polled = vr.pollState(vrstate);
                this.controls3d.update(Date.now() - time, polled ? vrstate : null);
                this.effect.render(this.scene, this.camera, polled ? vrstate : null);
            } else {
                window.requestAnimationFrame(animate.bind(this));
                this.controls3d.update(Date.now() - time);
                renderer.render(this.scene, this.camera);
            }

            time = Date.now();
        }
        animate.bind(this)();
    };

    Scene.prototype._pointerLock = function () {
        var _this = this;
        if (!my.vr.enabled) {
            my.pointerLock(function () {
                _this.controls3d.enabled = true;
            }, function () {
                _this.controls3d.enabled = false;
            }, _this.renderedCanvas);
        }
    };

    Scene.prototype._initEvents = function () {
        var effect = this.effect,
            _this = this;

        function keyPressed (evt) {
            switch (evt.keyCode) {
                case 78: // n = flip through projections
                    var cur = projectionsArray.indexOf(_this.currentProjection);
                    if (cur === -1) {
                        cur = 0;
                    }
                    cur = (cur < projectionsArray.length - 1) ? (cur + 1) : 0;
                    _this.changeProjection(projectionsArray[cur]);
                    break;
            }
            if (my.vr.enabled) {
                switch (event.keyCode) {
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
        document.addEventListener('keydown', keyPressed, false);
    };

    Scene.prototype.resetControls = function () {
        controls = this.controls3d;
        controls.getObject().position.set(0, 0, 0);
        controls.getObject().rotation.y = 0;
        controls.getObject().children[0].rotation.x = 0;
    };

    Scene.prototype.reset = function () {
        var pos = projections[this.currentProjection].startPosition;
        this.resetControls();
        this.movieScreen.position.set(pos.x, pos.y, pos.z);
    };

    Scene.prototype.changeProjection = function (projection) {
        var scene = this.scene,
            movieGeometry = this.movieGeometry,
            movieMaterial = this.movieMaterial,
            dim = getDim(this.vidEl),
            proj = this.currentProjection = projection || this.currentProjection;

        if (scene && this.movieScreen) {
            scene.remove(this.movieScreen);
        }
        movieGeometry = projections[proj].geometry(dim.w, dim.h);
        this.movieScreen = new THREE.Mesh(movieGeometry, movieMaterial);

        this.reset();
        scene.add(this.movieScreen);
    };

    Scene.prototype.getAvailableProjections = getAvailableProjections;

    /**
     * Add module's public properties
     */
    my.Scene = Scene;

    my.getAvailableProjections = getAvailableProjections;

    return my;

}(VIDEO_VR || {}, vr, videojs, THREE));
