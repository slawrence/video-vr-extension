#Add locally installed modules to PATH
PATH="./node_modules/.bin:$PATH"
rm -rf dist
mkdir -p dist/video-js/
uglifyjs libs/three.min.js libs/PointerLockControls.js libs/vr/vr.js libs/vr/OculusRiftControls.js libs/vr/OculusRiftEffect.js libs/make3d.js -o dist/bundle.js
rsync -aP ./src/* ./dist/
cp -r libs/video-js-4.4.3/ dist/video-js/
