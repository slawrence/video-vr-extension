#Add locally installed modules to PATH
PATH="./node_modules/.bin:$PATH"
rm -rf dist
mkdir -p dist/chrome/video-js/
uglifyjs libs/three.js libs/PointerLockControls.js libs/vr/vr.js libs/vr/OculusRiftControls.js libs/vr/OculusRiftEffect.js libs/make3d.js -o dist/chrome/bundle.js
rsync -aP ./src/chrome/* ./dist/chrome/
cp libs/vr/vr.js dist/chrome
cp -r libs/video-js-4.4.3/ dist/chrome/video-js/
