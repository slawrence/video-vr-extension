//dirty hack code to get hmd data across
//This file must be script tag injected via a content script tag
setInterval(function() {
    if(window._vr_native_) {
        document.dispatchEvent(new CustomEvent('pollData', {
            detail: {
                poll: window._vr_native_.poll(),
                command1: window._vr_native_.exec(1,'')
            }
        }));
    }
}, 0);

//reset the HMD!
document.addEventListener('resetHmd', function(e) {
    window._vr_native_.exec(2, '');
});
