#assumes already activated the FF SDK
# see https://developer.mozilla.org/en-US/Add-ons/SDK/Tutorials/Installation
cd ../..
./build.sh

#make unminifiied for debug purposes
echo "console.log(\"begin bundle.js\")" > temp.js
cat temp.js libs/three.js libs/PointerLockControls.js libs/vr/vr.js libs/vr/OculusRiftControls.js libs/vr/OculusRiftEffect.js libs/make3d.js src/firefox/data/content.js >> src/firefox/data/unmini-bundle.js
rm temp.js

cd -
cfx run

