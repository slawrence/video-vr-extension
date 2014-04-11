//dirty hack code to get hmd data across
var c1 = false;
setInterval(function() {
    /* Example: Send data to your Chrome extension*/
    if(window._vr_native_) {
        document.dispatchEvent(new CustomEvent('pollData', {
            detail: window._vr_native_.poll()
        }));
        if (!c1) {
            document.dispatchEvent(new CustomEvent('command1', {
                detail: window._vr_native_.exec(1,'')
            }));
            c1 = true;
        }
    }

}, 0);
