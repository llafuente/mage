var entities = 0,
    Assets = require("./assets.js");

/**
 * @class Entity
 * @event moved
 * @event rotated
 * @event scaled
 * @extends Resource
 */
function Entity(name, image_src) {
    var self = this,
        ti = typeof image_src;
    this.id = name || "entity/" + (++entities)
    switch(ti) {
    case "string":
        Assets.loadImage(image_src, function(err, image) {
            if (err) throw err;

            self.image = image;
            self.width = image.width;
            self.height = image.height;
            self.__ready = true;
        });
        break;
    case "object":
        this.image = image_src;
        this.width = image_src.width;
        this.height = image_src.height;
        self.__ready = true;
        break;
    }
};

/**
 * @member Entity
 * @private
 * @type {Node}
 */
Entity.prototype.parentNode = null;
/**
 * @member Entity
 * @private
 * @type {HTMLImage}
 */
Entity.prototype.image = null;
/**
 * @member Entity
 * @private
 * @type {Number}
 */
Entity.prototype.width = null;
/**
 * @member Entity
 * @private
 * @type {Number}
 */
Entity.prototype.height = null;
/**
 * @member Entity
 * @private
 * @type {String}
 */
Entity.prototype.blending = null;
/**
 * @member Entity
 * @private
 * @type {String}
 */
Entity.prototype.alpha = null;
/**
 * @member Entity
 * @private
 * @type {Boolean}
 */
Entity.prototype.__ready = false;

/**
 * @member Entity
 * @param String blend_mode
 * @returns this
 */
Entity.prototype.setBlendMode = function setBlendMode(blend_mode) {
    this.blending = blend_mode;

    return this;
};
/**
 * @member Entity
 * @param Number alpha
 * @returns this
 */
Entity.prototype.setAlpha = function setAlpha(alpha) {
    this.alpha = alpha;

    return this;
};
/**
 * detach from parent node if possible
 * @return {parentNode|Null}
 */
Entity.prototype.detach = function () {
    if (this.parentNode !== null) {
        var node = this.parentNode;
        this.parentNode = null;

        node.removeEntity(this);

        return node;
    }
    return null;
};
/**
 * create a new Node under parent_node and append to it
 * @member Entity
 * @param {Node} parent_node
 * @returns this
 */
Entity.prototype.attachTo = function (parent_node) {
    var node = parent_node.createNode();
    node.appendEntity(this);

    return node;
};
/**
 * append entity to given node.
 * @member Entity
 * @param {Node} parent_node
 * @returns this
 */
Entity.prototype.appendTo = function (parent_node) {
    parent_node.appendEntity(this);

    return parent_node;
};
/**
 * @member Entity
 * @todo clipping support!
 * @private
 * @param CanvasRenderingContext2D ctx
 * @param Number x
 * @param Number y
 * @returns Boolean
 */
Entity.prototype.draw = function (ctx, dt) {
    if (!this.__ready) {
        return false;
    }

    // apply alpha
    // apply blending

    return ctx.drawImage(this.image, 0, 0);
}

module.exports = Entity;
