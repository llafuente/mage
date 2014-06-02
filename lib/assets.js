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
    },
    loadJson: function(file, callback) {
        // if jQuery ?
        if ("function" === typeof window.jQuery) {
            return jQuery.ajax({
                url: file,
                dataType: "json"
            }).done(function(data) {
                callback(null, data);
            });
        }

        throw new Error("not atm, ejecta soon!");
    }
};
