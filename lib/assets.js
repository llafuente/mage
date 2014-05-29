module.exports = {
    loadImage: function(src, callback) {
        var img = new Image(),
            self = this;

        function load() {
            callback && callback(null, img, src);
        }

        function error() {
            callback && callback(new Error("image-not-found"), null, src);
        }

        if (img.addEventListener) {
            img.addEventListener("load", load);
            img.addEventListener("error", error);
        } else {
            img.attachEvent("onload", load);
            img.attachEvent("error", error);
        }

        img.src = src;
    }
};
