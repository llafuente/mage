var Nodes = 0,
    Movable = require("./movable.js"),
    array = require("array-enhancements");

/**
 * @class Node
 */
function Node(name) {
    this.id = name || "node/" + (++Nodes);

    this.resetMovable();

    this.childNodes = [];
    this.childEntities = [];
    this.__body = [];
}
Node.prototype = new Movable();
/**
 * @member Node
 * @type String
 */
Node.prototype.id =  "";
/**
 * @member Node
 * @type Boolean
 */
Node.prototype.visible =  true;
/**
 * @member Node
 * @type Number
 */
Node.prototype.alpha =  1;
/**
 * @member Node
 * @type Boolean
 */
Node.prototype.__dirty = null;
/**
 * @member Node
 * @type Polygon
 */
Node.prototype.__body = null;
/**
 * List of bodies in world space cached for ray performance!
 * @member Node
 * @type Polygon
 */
Node.prototype.__wbody = null;
/**
 * @member Node
 * @type Array
 */
Node.prototype.childNodes = [];
/**
 * @member Node
 * @type Array
 */
Node.prototype.childEntities = [];
/**
 * @member Node
 * @type Array
 */
Node.prototype.parentNode = null;
/**
 * @member Node
 * @type Boolean
 */
Node.prototype.isRoot = false;
/**
 * @member Node
 * @return Node this for chaining
 */
Node.prototype.freeze = function freeze() {
    this.__freezed = true;
    this.readonly = true;

    return this;
};
/**
 * @member Node
 * @return Node this for chaining
 */
Node.prototype.unfreeze = function unfreeze() {
    this.__freezed = false;
    this.readonly = false;

    return this;
};
/**
 * Initialize the CanvasNode and merge an optional config hash.
 *
 * @member Node
 * @return Vec2
 */
Node.prototype.getWorldPosition = function getWorldPosition() {
    var node = this,
        out = [0, 0],
        pos;

    while (node !== null) {
        pos = node.getPosition();

        out[0] += pos[0];
        out[1] += pos[1];

        node = node.isRoot ? null : node.parentNode;
    }

    return out;
};
/**
 * @member Node
 * @return Vec2
 */
Node.prototype.getDerivedPosition = function getDerivedPosition(include_root) {
    include_root = include_root === true;

    var node = this,
        out = [0, 0],
        pos;

    if (node.isRoot) {
        return include_root ? this.getPosition() : out;
    }

    do {
        pos = node.getPosition();

        out[0] += pos[0];
        out[1] += pos[1];

        node = node.parentNode;
    } while (!node.isRoot);

    if (include_root) {
        pos = node.getPosition();

        out[0] += pos[0];
        out[1] += pos[1];
    }

    return out;
};
/**
 * @member Node
 * @return Node null if cannot be found
 */
Node.prototype.getNextSibling = function getNextSibling() {
    if (this.parentNode) {
        return this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) + 1];
    }

    return null;
};
/**
 * @member Node
 * @return Node null if cannot be found
 */
Node.prototype.getPreviousSibling = function getPreviousSibling() {
    if (this.parentNode) {
        return this.parentNode.childNodes[this.parentNode.childNodes.indexOf(this) - 1];
    }
    return null;
};
/**
 * Create a new Node, append it and return it
 * @member Node
 * @return Node
 */
Node.prototype.createNode = function createNode(id) {
    var node = new Radamn.Node({
        id: id || ("node-" + (++nodes))
    });

    this.appendChild(node);

    return node;
};
/**
 * @member Node
 * @return Boolean
 */
Node.prototype.hasChildren = function hasChildren() {
    return this.childNodes.length > 0;
};

/**
 * Appends arguments as childNodes to the node.
 *
 * Adding a child sets child.parentNode to be the node and calls
 * child.setRoot(node.root)
 *
 * @member Node
 * @param Array obj list of nodes or a single node
 * @return Node this for chaining
 */
Node.prototype.appendChild = function appendChild(obj) {
    var a = array.ize(arguments),
        i;

    for (i = 0; i < a.length; ++i) {
        if (a[i].parentNode) {
            a[i].removeSelf();
        }
        this.childNodes.push(a[i]);
        a[i].parentNode = this;
    }

    return this;
},
/**
 * Removes all childNodes from the node.
 * @member Node
 * @return Node this for chaining
 */
Node.prototype.removeAllChildren = function removeAllChildren() {
    this.removeChild.apply(this, this.childNodes);

    return this;
},
/**
 * Removes arguments from the node's childNodes.
 *
 * Removing a child sets its parent to null and calls child.setRoot(null)
 *
 * @member Node
 * @param Array list of nodes or a single node
 * @return Node this for chaining
 */
Node.prototype.removeChild = function removeChild(obj) {
    var i,
        idx;

    for (i = 0; i < arguments.length; ++i) {
        obj = arguments[i];

        idx = this.childNodes.indexOf(obj);
        if (idx !== -1) {
            this.childNodes.splice(idx, 1);
            obj.parentNode = null;
        }
    }

    return this;
},
/**
 * Calls this.parent.removeChild(this) if this.parent is set.
 * @member Node
 * @return Node this for chaining
 */
Node.prototype.removeSelf = function removeSelf() {
    if (this.parentNode) {
        this.parentNode.removeChild(this);
    }

    return this;
},
/**
* TODO compute BB/AABB with current node matrix
* @member Node
* @return Rectangle
*/
Node.prototype.getBoundingBox = function getBoundingBox() {
    var bb = [0, 0, 0, 0, true],
        i,
        pos,
        scl,
        node;

    for (i = 0; i < this.childEntities.length; ++i) {
        if (this.childEntities[i].getBoundingBox) {
            BB2.merge(bb, bb, this.childEntities[i].getBoundingBox());
        }
    }

    for (i = 0; i < this.childNodes.length; ++i) {
        node = this.childNodes[i];
        pos = node.getPosition();

        BB2.offsetMerge(bb, bb, node.getBoundingBox(true), pos);
    }

    scl = this.getScale();

    bb[0] = (bb[0] * scl[0]);
    bb[1] = (bb[1] * scl[1]);
    bb[2] = (bb[2] * scl[0]);
    bb[3] = (bb[3] * scl[1]);

    return bb;
},
Node.prototype.getWorldBoundingBox = function getWorldBoundingBox() {
    var bb = this.getBoundingBox();
    BB2.translate(bb, bb, this.getWorldPosition());

    return bb;
},
/**
 * Appends arguments as childNodes to the node.
 *
 * Adding a child sets child.parentNode to be the node and calls
 * child.setRoot(node.root)
 *
 * @member Node
 * @param Array list of nodes or a single node
 * @return Node this for chaining
 */
Node.prototype.appendEntity = function appendEntity(obj) {
    var a = array.ize(arguments),
        i;
    for (i = 0; i < a.length; ++i) {
        this.childEntities.push(a[i]);
        a[i].parentNode = this;
    }
    //var aabb = new AABB();
    //aabb.ComputeAABBFromPoly(/*??*/);

    return this;
},
/**
 * Removes all childNodes from the node.
 *
 * @member Node
 * @return Node this for chaining
 */
Node.prototype.removeAllEntities = function removeAllEntities() {
    this.removeEntity.apply(this, this.childEntities);

    return this;
},
/**
 * Removes arguments from the node's childNodes.
 *
 * Removing a child sets its parent to null and calls child.setRoot(null)
 *
 * @member Node
 * @param Array list of nodes or a single node
 * @return Node this for chaining
 */
Node.prototype.removeEntity = function removeEntity(obj) {
    var i,
        idx;

    for (i = 0; i < arguments.length; ++i) {
        obj = arguments[i];
        idx = this.childEntities.indexOf(obj);

        if (idx !== -1) {
            this.childEntities.splice(idx, 1);
            obj.parentNode = null;
        }
    }

    return this;
},
/**
 * Get all entities recursive from this node and his children
 *
 * @member Node
 * @return Array list of Resources
 */
Node.prototype.getAllSubEntites = function getAllSubEntites() {
    var output = this.childEntities.clean(),
        i;
    for (i = 0; i < this.childNodes.length; ++i) {
        output = output.combine(this.childNodes[i].getAllSubEntites());
    }
    return output;
},
Node.prototype.getEntity = function getEntity(i) {
    return this.childEntities[i];
},
/**
 * @member Node
 * @param Primitive
 * @return Node this for chaining
 */
Node.prototype.addToBody = function addToBody(primitive) {
    this.__body.push(primitive);
    this.__wbody.push(Rectangle.clone(primitive));

    // little hack to force the update of bodies
    this.matrix[7] = true;

    return this;
},
/**
 * @member Array with primitives
 */
Node.prototype.getBodyList = function getBodyList() {
    return this.__body;
},
/**
 * check collision between operand and all Node bodies
 * @member Node
 * @return Intersection
 */
Node.prototype.collide = function collide(operand) {
    if (this.__body.length === 0) {
        return {success: false, reason: "nobody"}; //no-body ?
    }

    if (this.__body.length > 1) {
        throw new Error("multiple body collision is not supported atm!");
    }

    // todo support more operands!
    return Intersection.rectangle_vec2(this.__wbody[0], operand);
},
/**
 * Get all entities recursive from this node and his children
 *
 * @member Node
 * @return Array list of Resources
 */
Node.prototype.each = function each(fn) {
    var i;
    for (i = 0; i < this.childNodes.length; ++i) {
        fn(this.childNodes[i]);
    }
},
/**
 * Get all entities recursive from this node and his children
 *
 * @member Node
 * @return Array list of Resources
 */
Node.prototype.eachEntity = function eachEntity(fn) {
    var i;
    for (i = 0; i < this.childEntities.length; ++i) {
        fn(this.childEntities[i]);
    }
};

// supper call
Node.prototype.tickMovable = Node.prototype.tick;

Node.prototype.tick = function tick(delta, force_update) {
    this.tickMovable(delta, force_update);

    force_update = force_update === true;

    var i;

    if (force_update || this.matrix[7]) {
        if (this.__body.length) {
            Rectangle.translate(this.__wbody[0], this.__body[0], this.getWorldPosition());

            this.matrix[7] = false;

            // check visible
            this.visibilityCheck();
        }

        force_update = true;
    }

    this.emit("pre:tick", [delta, force_update]);
    this.emit("tick", [delta, force_update]);
    this.emit("post:tick", [delta, force_update]);

    for (i = 0; i < this.childNodes.length; ++i) {
        this.childNodes[i].tick(delta, force_update);
    }

    for (i = 0; i < this.childEntities.length; ++i) {
        //this.childEntities[i].emit("tick", [delta]);
    }
},
Node.prototype.getScene = function getScene() {
    var node = this,
        scene;

    while (!node.isRoot) {
        node = node.parentNode;
    }
    return node.scene;
},
Node.prototype.visibilityCheck = function visibilityCheck(scene) {
    var node;

    if (this.__wbody.length) {
        // get scene
        scene = scene || this.getScene();

        this.__visibility = scene.isVisible(this.__wbody[0]);
    }

    return this.__visibility;
},
Node.prototype.prerender = function prerender(ctx) {
    if (this.alpha !== 1) {
        // this maybe need to be multiplied!
        ctx.globalAlpha = this.alpha;
    }

    if (this.__debug === true) {
        ctx.save();
        var pos = this.getWorldPosition();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        var bb = this.getWorldBoundingBox(true);

        ctx.font="12px Consolas";
        ctx.fillText(this.id, pos[0], pos[1]);

        ctx.strokeStyle = "red";
        ctx.strokeRect(bb[0],bb[1],bb[2]-bb[0],bb[3]-bb[1]);
        ctx.restore();
    }

    var m2d = this.matrix;
    ctx.transform(m2d[0], m2d[1], m2d[2], m2d[3], m2d[4], m2d[5]);
},
// this maybe need to be in movable...
Node.prototype.postrender = function postrender(ctx) {

},
Node.prototype.ray = function ray(x, y) {
    if (this.visible === false) {
        return {success: false, reason: -1}; // hidden
    }

    var i,
        offset = this.getScene().getCamera().getPosition(),
        vec2 = [x + offset[0], y + offset[1]];

    return this.collide(vec2);
};

module.exports = Node;
