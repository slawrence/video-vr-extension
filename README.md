video-vr-extension
============================

Watch HTML5 videos on Youtube with the Oculus Rift (requires vr.js plugin for Rift support).

See [Video](https://www.youtube.com/watch?v=hTtwGu25hE4&feature=youtu.be)

QuickStart
---------------------------

1. Install [vr.js](http://github.com/benvanik/vr.js) plugin
2. Install the extension:
    * [Chrome](https://chrome.google.com/webstore/detail/video-vr-extension/epianonacnaknehmhdlfbdlfobejoica)
    * [Firefox](https://addons.mozilla.org/en-US/firefox/addon/vr-video-extension/) - very alpha, and still pending Mozilla approval
3. Let youtube know your HTML5 preference: https://www.youtube.com/html5

Contributing
----------------------------------

Generally, try to maintain existing coding style and add unit tests with new features.

Development
------------------------------------

This project contains source for both the Chrome and Firefox extensions. At some point this may change but for the time being it works.

### Dependencies ###

The project requires [gulp.js](http://gulpjs.com) which is a node module, so you will need to install [Node](http://nodejs.org/). Install gulp.js by running `npm install -g gulp`

To package both Chrome and Firefox run `make`. Packaged products are located in `dist/packaged`

### Running Chrome ###

After building the project, you'll want to load the extension as an "unpacked" extension:

* Open Chrome to `chrome://extensions`
* Check 'Developer mode' and click 'Load unpacked extension'
* Select the `dist/chrome` folder

After making changes, run `make dev-chrome` then refresh the extension to see changes.

### Running Firefox ###

Firefox is a little more difficult because it requires the setup of the add-on SDK. To begin, install and activate the Add-on SDK: https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation and place it in your home folder, i.e. `~/addon-sdk-1.16`.

Additionally, install the [autoinstaller](https://addons.mozilla.org/en-US/firefox/addon/autoinstaller/) Firefox extension for easier running and debugging.

After making changes, run `make dev-firefox` to see changes.


### General ###

Additionally gulp.js will be used for other common tasks, like testing.

`gulp lint`
`gulp test`

TODO
---------------------------------

* Better logo
* Not just Youtube
* Support for oculus bridge, webrift, etc.
* Linting!
* Tests!
