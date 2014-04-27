/**
 * Wraps vr related functions
 *
 * Will want to add support for other potential libs (oculus bridge, webrift)
 * here
 */
var VIDEO_VR = (function (my, vr) {

    if (!vr) {
        console.error("Uh oh vr is not defined!");
        return;
    }

    var Wrapper = function () {
        this.enabled = true;
        this.statusMessage = "Not initialized";
    };

    Wrapper.prototype.init = function () {
        if (!vr.isInstalled()) {
            this.enabled = false;
            this.statusMessage = 'NPVR plugin not installed!';
        }
        vr.load(function(error) {
            if (error) {
                this.statusMessage = 'Plugin load failed: ' + error.toString();
                this.enabled = false;
            }
        });
    };

    my.vr = new Wrapper();

    return my;

}(VIDEO_VR || {}, vr));
