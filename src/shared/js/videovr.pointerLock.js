/**
 * Defines the pointer lock function.
 */
;var VIDEO_VR = (function (my) {
    my.pointerLock = function (success, error, el) {
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
    };

    return my;

}(VIDEO_VR || {}))
