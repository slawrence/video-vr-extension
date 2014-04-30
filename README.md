# Video VR Extension

[![Build Status](https://travis-ci.org/slawrence/video-vr-extension.svg?branch=master)](https://travis-ci.org/slawrence/video-vr-extension)

Watch HTML5 videos on Youtube with the Oculus Rift (requires vr.js plugin for
Rift support).

See [Demo Video](https://www.youtube.com/watch?v=hTtwGu25hE4&feature=youtu.be)

QuickStart
---------------------------

1. Install [vr.js](http://github.com/benvanik/vr.js) plugin
2. Install the extension:
    * [Chrome](https://chrome.google.com/webstore/detail/video-vr-extension/epianonacnaknehmhdlfbdlfobejoica)
    * [Firefox](https://addons.mozilla.org/en-US/firefox/addon/vr-video-extension/) - very alpha, and still pending Mozilla approval
3. Let youtube know your HTML5 preference: https://www.youtube.com/html5

Contributing
----------------------------------

Generally, try to maintain existing coding style and add unit tests with new
features.

Development
------------------------------------

This project contains source for both the Chrome and Firefox extensions. At some
point this may change but for the time being it works.

### Dependencies ###

The project requires [gulp.js](http://gulpjs.com) which is a node module, so you
will need to install [Node.js](http://nodejs.org/).

Then run:

        git clone https://github.com/slawrence/video-vr-extension
        cd video-vr-extension
        npm install -g gulp
        npm install

For Firefox, you must install the [Add-on
SDK](https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation)
into your home directory (i.e. `~/addon-sdk-1.16)

Additionally, install the
[autoinstaller](https://addons.mozilla.org/en-US/firefox/addon/autoinstaller/)
Firefox extension for easier running and debugging.

At this point you have everything needed to build and package the extensions. To
package both Chrome and Firefox run `make`. Packaged products are located in
`dist/packaged`

### Running Chrome ###

After building the project, you'll want to load the extension as an "unpacked"
extension:

* Open Chrome to `chrome://extensions`
* Check 'Developer mode' and click 'Load unpacked extension'
* Select the `dist/chrome` folder

After making changes, run `make dev-chrome` then refresh the extension to see
changes.

### Running Firefox ###

Provided you have the Addon SDK and autoinstaller extension (see dependencies),
run `make dev-firefox` to see changes.

`make run-firefox` can also be used to execute `cfx run`, but doesn't do a
build/package.

### General ###

[Gulp.js](http://gulpjs.com) is used for tasks like linting and testing. See the
`gulpfile.js` for list of tasks.

Packaging the app with `make` will lint, test, and package the Chrome and
Firefox extensions. To package with unminified code (when debugging) pass in
an extra argument: `make DEV=true`

### Credits ###

This project is a conglomeration of a few amazing open source libraries. Without
these libraries this extension would not have been so easily assembled.

* [VideoJS](http://www.videojs.com)
* [VR.js](https://github.com/benvanik/vr.js)
* [Three.js](http://threejs.org)

TODO
---------------------------------

* Better logo
* Not just Youtube
* Support for oculus bridge, webrift, etc.
* More tests!
