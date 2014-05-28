var Matrix23 = require("js-2dmath").Matrix23;
    Transitions = require("js-2dmath").Transitions,
    EventEmitter = require("./event-emitter.js");


function Movable() {

};

Movable.prototype = new EventEmitter();
Movable.prototype.offset = null;
Movable.prototype.matrix = null;
Movable.prototype.look_at = null;
Movable.prototype.look_at_offset = 0;
Movable.prototype.tracking = null;
Movable.prototype.tracking_offset = null;

Movable.prototype.resetMovable = function resetMovable() {
    this.initEventEmitter();
    this.offset = [0, 0];

    this.matrix = Matrix23.create();

    this.tracking_offset = [0, 0];
}

//
// matrix wrap
//
Movable.prototype.getScale = function getScale() {
    return Matrix23.getScale([0, 0], this.matrix);
};
Movable.prototype.scale = function scale(x, y) {
    var out = Matrix23.scale(this.matrix, this.matrix, [x, y]);
    this._update_offset();

    return out;
};
Movable.prototype.scalation = function scalation(x, y) {
    var out = Matrix23.scalation(this.matrix, this.matrix, [x, y]);
    this._update_offset();

    return out;
};
Movable.prototype.skew = function skew(x, y) {
    return Matrix23.dSetSkew(this.matrix, this.matrix, [x, y]);
};
Movable.prototype.rotate = function rotate(angle) {
    return Matrix23.rotate(this.matrix, this.matrix, angle);
};
Movable.prototype.rotation = function rotation(angle) {
    return Matrix23.dSetRotation(this.matrix, this.matrix, angle);
};
Movable.prototype.getWorldPosition = function getWorldPosition() {
    var pos = Matrix23.getPosition([0, 0], this.matrix);
    pos[0] += this.offset[0];
    pos[1] += this.offset[1];

    return pos;
};
Movable.prototype.getDerivedPosition = function getDerivedPosition() {
    return Matrix23.getPosition([0, 0], this.matrix);
};
Movable.prototype.getPosition = function getPosition() {
    return Matrix23.getPosition([0, 0], this.matrix);
};
Movable.prototype.position = function position(x, y) {
    x = x === false ? this.matrix[4] : x;
    y = y === false ? this.matrix[5] : y;

    return Matrix23.position(this.matrix, this.matrix, [x, y]);
};

/**
 * apply (overwrite) the transformation to the canvas
 * @returns Matrix2D this for chaining
 */
Movable.prototype.setTransform = function setTransform(ctx) {
    var p = this.matrix,
        off = this.offset;

    ctx.setTransform(p[0], p[1], p[2], p[3], p[4] - off[0], p[5] - off[1]);

    return this;
};
//
Movable.prototype.transform = function transform(ctx) {
    var p = this.matrix,
        off = this.offset;

    ctx.transform(p[0], p[1], p[2], p[3], p[4] - off[0], p[5] - off[1]);

    return this;
};
Movable.prototype.positionAlign = function positionAlign(alignament, bb) {
    var vec2 = [0, 0];

    BB2.align(vec2, bb, alignament);
    Matrix23.position(this.matrix, this.matrix, vec2);

    return this;
};
Movable.prototype.offsetAlign = function offsetAlign(alignament) {
    var bb = this.getBoundingBox();

    BB2.align(this.offset, bb, alignament);
    this.offset_alignament = alignament;

    return this;
};
Movable.prototype._update_offset = function _update_offset() {
    this.offsetAlign(this.offset_alignament);
};
/**
 * Look at the movable object the eyes on the top
 * For eyes on the right offset_rotation = Math.HALFPI
 */
Movable.prototype.lookAt = function lookAt(movable_object, offset_rotation) {
    var rot = 0,
        origin = this.getPosition(),
        target = movable_object.getPosition();

    Vec2.sub(target, target, origin);
    rot = Vec2.toAngle(target) + (offset_rotation || 0);
    Matrix23.setRotation(this.matrix, this.matrix, rot);

    return this;
};
/**
 * Keep the eye in the object
 */
Movable.prototype.autoLookAt = function autoLookAt(enable, movable_object, offset_rotation) {
    if (!enable) {
        this.look_at = null;
    } else {
        this.look_at = movable_object;
        this.look_at_offset = offset_rotation || 0;
    }
};
/**
 * Track position
 */
Movable.prototype.autoTracking = function autoTracking(enable, movable_object, tracking_offset) {
    if (!enable) {
        this.tracking = null;
    } else {
        this.tracking = movable_object;
        this.tracking_offset[0] = tracking_offset && tracking_offset[0] ? tracking_offset[0] : 0;
        this.tracking_offset[1] = tracking_offset && tracking_offset[1] ? tracking_offset[1] : 0;
    }

};

Movable.prototype.tick = function tick(delta) {
    var pos;
    if (this.look_at !== null) {
        this.lookAt(this.look_at, this.look_at_offset);
    }

    if (this.tracking) {
        pos = this.tracking.getPosition();
        Vec2.add(pos, pos, this.tracking_offset);
        this.position(pos);
    }
};

Movable.prototype.translate = function animate(values, time) {
    if (time) { // tween/animate
        var self = this,
            aux = [0, 0];

        this.animate(function(delta, factor, a, b) {
            aux[0] = a[0] + (b[0] - a[0]) * factor;
            aux[1] = a[1] + (b[1] - a[1]) * factor;

            self.matrix[4] = aux[0];
            self.matrix[5] = aux[1];
        }, values, time);
    } else { //set
        Matrix23.translate(this.matrix, this.matrix, values);
    }

    return this;
};



Movable.prototype.scale = function animate(values, time) {
    if (time) { // tween/animate
        var self = this,
            aux = [0, 0];

        this.animate(function(delta, factor, a, b) {
            aux[0] = a[0] + (b[0] - a[0]) * factor;
            aux[1] = a[1] + (b[1] - a[1]) * factor;

            Matrix23.scalation(self.matrix, self.matrix, aux);
        }, values, time);
    } else { //set
        Matrix23.scalation(this.matrix, this.matrix, values);
    }

    return this;
};


Movable.prototype.rotate = function animate(values, time) {
    if (time) { // tween/animate
        var self = this;

        this.animate(function(delta, factor, a, b) {
            Matrix23.setRotation(self.matrix, self.matrix, a + (b - a) * factor);
        }, values, time);
    } else {
        Matrix23.setRotation(this.matrix, this.matrix, values);
    }
    return this;
};

Movable.prototype.animate = function animate(tick_fn, values, time, transition) {
    transition = transition || Transitions.linear;

    var vals = [],
        fvals = [],
        i,
        max;

    if (Array.isArray(values)) {
        for (i = 0, max = values.length; i < max; ++i) {
            fvals.push(i === 0 ? 0 : (i + 1) / max);
            vals.push(values[i]);
        }
    } else {
        for (i in values) {
            fvals.push(parseFloat(i) * 0.01);
            vals.push(values[i]);
        }
    }

    var current = 0,
        self = this;

    this.on("tick", function update(delta) {
        current+=delta;
        if (current > time) {
            current = time;
            self.on("pre:tick", function() {
                self.off("tick", update);
            });
        }

        var factor = transition(current / time),
            i = 0,
            max = values.length,
            a,
            af,
            b,
            bf;

        do {
            af = fvals[i];
            a = vals[i];
            ++i;
            bf = fvals[i];
            b = vals[i];
        } while(fvals[i] < factor && i < max)

        tick_fn(delta, (factor - af) / (bf - af), a, b);
    });
};

module.exports = Movable;
