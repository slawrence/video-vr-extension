#Add locally installed modules to PATH
PATH="./node_modules/.bin:$PATH"
mkdir -p dist/video-js/
uglifyjs libs/three.min.js libs/vr/vr.js libs/vr/OculusRiftControls.js libs/vr/OculusRiftEffect.js libs/videojs.vr.js -o dist/bundle.js
rsync -aP ./src/* ./dist/
cp -r libs/video-js-4.4.3/ dist/video-js/
