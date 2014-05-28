var entities = 0;

/**
 * @class Entity
 * @event moved
 * @event rotated
 * @event scaled
 * @extends Resource
 */
Entity = function Entity(name, image) {
    this.id = name || "entity/" + (++entities)
    if ("string" === typeof image) {
        var img = new Image(),
            self = this;

        function load() {
            self.__ready = true;
        }

        if (img.addEventListener) {
            img.addEventListener("load", load);
        } else {
            img.attachEvent('onload', load);
        }


        img.src = image;

        this.image = img;
    } else {
        this.image = image;
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
Entity.prototype.draw = function (ctx) {
    if (!this.__ready) {
        return false;
    }

    // apply alpha
    // apply blending

    return ctx.drawImage(this.image, 0, 0);
}

module.exports = Entity;
