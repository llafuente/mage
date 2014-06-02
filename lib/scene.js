var scenes = 0,
    Layer = require("./layer.js"),
    EventEmitter = require("./event-emitter.js");
/**
 * @class Scene
 */
function Scene(name, ctx, width, height, max_delta) {
    this.id = name || "scene/" + (++scenes);
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.max_delta = max_delta || 33; // simulate at minimum of 30 fps

    this.initEventEmitter();

    //if (invert) {
    //    ctx.setTransform(1, 0, 0, -1, 0, height);
    //}
}
Scene.prototype = new EventEmitter();
/**
 * @member Scene
 * @type {ContextRendering2D}
 */
Scene.prototype.ctx = null;
/**
 * @member Scene
 * @type {String}
 */
Scene.prototype.id = null;
/**
 * @type {Number}
 */
Scene.prototype.width = null;
/**
 * @type {Number}
 */
Scene.prototype.height = null;
/**
 * @type {Array}
 */
Scene.prototype.layers = [];
/**
 * @type {Number}
 */
Scene.prototype.frame = 0;

console.log(Scene.prototype);

/**
 * this call render but no now in 1ms
 * @param {Number} fps false means: as fast as possible!!!
 */
Scene.prototype.start = function start(requestAnimationFrame) {
    this.running = true;
    var self = this,
        ot = (new Date()).getTime();
    requestAnimationFrame(function render() {
        var i,
            ctx = self.ctx,
            ct = (new Date()).getTime(),
            delta = ct - ot,
            layers = self.layers,
            draw = delta < self.max_delta;
            if (delta > 20) {
                console.log(delta);
            }
        delta = Math.min(delta, self.max_delta);

        ctx.clearRect(0, 0, self.width, self.height);

        requestAnimationFrame(render);

        ctx.save();
        self.emit("frame:start", [delta, draw]);

        for (i = 0; i < layers.length; ++i) {
            if (layers[i].visible) {
                ctx.save();
                layers[i].render(ctx, delta, draw);
                ctx.restore();
            }
        }

        self.emit("frame:end", [delta, draw]);
        ctx.restore();
        ot = ot + delta;

        if (!draw) {
            render();
        }
    });
};
/**
 * is quad viewable, give the coords in screen position!
 */
Scene.prototype.isPointVisible = function isPointVisible(x, y) {
    return true;
    //__debug(x, this.width, id, x + w > 0 && x < this.width && y < this.height && y + h > 0);
    // return x > 0 && x < this.width && y < this.height && y > 0;
};
/**
 * is quad viewable, give the coords in screen position!
 */
Scene.prototype.isQuadVisible = function isQuadVisible(x, y, w, h) {
    //__debug(x, this.width, id, x + w > 0 && x < this.width && y < this.height && y + h > 0);
    return x + w > 0 && x < this.width && y < this.height && y + h > 0;
};
/**
 * @TODO SUPPORT SCALE!, that means __wbody must know it
 * @param Number x
 * @param Number y
 */
Scene.prototype.ray = function ray(x, y) {
    var i,
        vec2 = [x, y],
        offset = this.getCamera().getPosition(),
        out = [];

    // apply camera offset
    Vec2.add(vec2, vec2, offset);
    for (i = 0; i < this.layers.length; ++i) {
        if (this.layers[i].visible) {
            Array.combine(out, this.layers[i].ray(vec2));
        }
    }

    return out;
};
Scene.prototype.forEachNode = function forEachNode(callback, bnode) {
    var that = this,
        i;

    if (bnode === undefined) {
        // for each rootNode
        for (i = 0; i < this.layers.length; ++i) {
            if (this.layers[i].visible) {
                this.forEachNode(callback, this.layers[i].rootNode);
            }
        }
    } else {
        bnode.each(function (node) {
            callback(node);
            that.forEachNode(callback, node);
        });
    }
};
Scene.prototype.getLayer = function getLayer(layer_name) {
    var i;

    for (i = 0; i < this.layers.length; ++i) {
        if (this.layers[i].id === layer_name) {
            return this.layers[i];
        }
    }

    return null;
};
Scene.prototype.isVisible = function isVisible(body) {
    if(this.culling === false) {
        return true;
    }

    var cam = this.getCamera(),
        ret = Intersection.rectangle_rectangle(cam.frustum, body);

    return ret.reason < Intersection.OUTSIDE;
};
Scene.prototype.getCamera = function getCamera() {
    return this.__camera;
};

Scene.prototype.createLayer = function createLayer(options) {
    options = options || {};
    options.size = options.size || [this.width, this.height];
    options.origin = options.origin || Layer.CAMERA;

    var layer = new Layer(this, options);

    this.layers.push(layer);

    return layer;
};
Scene.prototype.removeLayer = function removeLayer(layer) {

}

module.exports = Scene;
