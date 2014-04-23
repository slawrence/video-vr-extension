#Location of your add-on sdk folder
# See https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation
SDKHOME=~/addon-sdk-1.16

all: package

package: pkg-chrome pkg-firefox

pkg-chrome: cpy-chrome
	mkdir -p dist/packaged
	cd dist/chrome; zip -r ../packaged/video-vr-chrome.zip *

pkg-firefox: cpy-firefox
	mkdir -p dist/packaged
	cd $(SDKHOME); source bin/activate; cd -
	cd dist/firefox; cfx xpi
	mv dist/firefox/vr-video.xpi dist/packaged

cpy-chrome: bundle-chrome
	mkdir -p dist/chrome/video-js/
	cp -r libs/video-js-4.4.3/ dist/chrome/video-js/
	rsync -aP ./src/chrome/* ./dist/chrome/
	cp dist/assets/bundle-chrome.min.js dist/chrome/bundle.js

cpy-firefox: bundle-firefox
	mkdir -p dist/firefox
	rsync -aP ./src/firefox/* ./dist/firefox/
	cp dist/assets/bundle-firefox.min.js dist/firefox/data/bundle.js

bundle-chrome:
	gulp bundle-chrome

bundle-firefox:
	gulp bundle-firefox

#The following targets are convenient for dev purposes
#Requires autoinstall firefox extension
# See https://addons.mozilla.org/en-US/firefox/addon/autoinstaller/
dev-firefox: pkg-firefox
	wget --post-file=dist/packaged/vr-video.xpi http://localhost:8888/

dev-chrome: pkg-chrome

clean:
	rm -r dist
