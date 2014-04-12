#assumes already activated the FF SDK
# see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation
cd ../../
#Add locally installed modules to PATH
PATH="./node_modules/.bin:$PATH"

#why is the temp file necessary for FF???!!!
# bundle libs and copy to data folder
echo "console.log(\"begin bundle.js\")" > temp.js
uglifyjs temp.js libs/three.js libs/PointerLockControls.js libs/vr/vr.js libs/vr/OculusRiftControls.js libs/vr/OculusRiftEffect.js libs/make3d.js src/firefox/data/content.js -o src/firefox/data/bundle.js

#make unminifiied for debug purposes
cat temp.js libs/three.js libs/PointerLockControls.js libs/vr/vr.js libs/vr/OculusRiftControls.js libs/vr/OculusRiftEffect.js libs/make3d.js src/firefox/data/content.js >> src/firefox/data/unmini-bundle.js
rm temp.js

cd -
cfx run
