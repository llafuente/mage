var scenes = 0,
    Layer = require("./layer.js"),
    Camera = require("./camera.js"),
    EventEmitter = require("./event-emitter.js");
/**
 * @class Scene
 */
function Scene(name, ctx, width, height, time_step) {
    this.id = name || "scene/" + (++scenes);
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.time_step = time_step || 30; // simulate at minimum of 30 fps

    this.camera = new Camera(width, height);

    this.initEventEmitter();
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
/**
 * @type {Camera}
 */
Scene.prototype.camera = 0;

/**
 * this call render but no now in 1ms
 * @param {Number} fps false means: as fast as possible!!!
 */
Scene.prototype.start = function start(requestAnimationFrame) {
    this.running = true;
    var self = this,
        ot = (new Date()).getTime(),
        accumulator = 0,
        frames = 0;

    requestAnimationFrame(function raf() {
        var i,
            ct = (new Date()).getTime(),
            delta = ct - ot,
            layers = self.layers,
            draw,
            accumulated = 0;

        accumulator += delta;

        ot = ct;
        if (frames === 0) {
            self.update(self.time_step);
        } else {
            while(accumulator > self.time_step) {
                accumulated += self.time_step;
                accumulator -= self.time_step;

                self.update(self.time_step);
            }
        }

        self.ctx.clearRect(0, 0, self.width, self.height);
        self.render(accumulated);

        requestAnimationFrame(raf);
        ++frames;
    });
};

Scene.prototype.update = function render(dt) {
    this.emit("update:start", [dt]);

    var i;

    for (i = 0; i < this.layers.length; ++i) {
        this.layers[i].update(ctx, dt);
    }

    this.emit("update:end", [dt]);
};

Scene.prototype.render = function render(dt) {

    ctx.save();

    this.emit("render:start", [dt]);

    var i;

    for (i = 0; i < this.layers.length; ++i) {
        this.layers[i].render(ctx, dt);
    }

    this.emit("render:end", [dt]);

    ctx.restore();
};

/**
 * is quad viewable, give the coords in screen position!
 */
Scene.prototype.isPointVisible = function isPointVisible(x, y) {
    return this.camera.isPointVisible(x, y);
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
