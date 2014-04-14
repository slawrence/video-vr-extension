//dirty hack code to get hmd data across
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
