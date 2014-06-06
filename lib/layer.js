var Node = require("./node.js");

function Layer(scene, options) {
    this.scene = scene;
    this.rootNode = new Node("root-node");
    this.rootNode.isRoot = true;
    this.size = options.size || [0, 0];
    this.origin = options.origin || Layer.CAMERA;
}

Layer.prototype.id = null;
Layer.prototype.scene = null;
Layer.prototype.rootNode = null; //position/scale, etc.. here
Layer.prototype.size = [0, 0];
Layer.prototype.visible = true;
Layer.prototype.origin = 0;
Layer.prototype.ignoreRay = false;

Layer.CAMERA = 1;
Layer.WORLD = 2;
Layer.CANVAS = 3;


Layer.prototype.getBoundingBox = function() {
    var v = this.rootNode.getPosition();

    return [v[0], v[1], this.size[0] + v[0], this.size[1] + v[1], true];
};

Layer.prototype.render = function (ctx, delta, draw) {
    switch(this.origin) {
    case Layer.CAMERA:
        // it's the current!
        break;
    case Layer.WORLD:
        //who knows!
        break;
    case Layer.CANVAS:
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        break;
    default:
        throw new Error("invalid layer origin!");
    }
    // notify to update
    this.rootNode.tick(delta);
    // render
    this.renderNode(this.rootNode, ctx, delta, draw);

    return this;
};

Layer.prototype.renderNode = function(node, ctx, delta, draw) {
    var i;

    if (node.visible === true) {
        ctx.save();

        var m2d = node.matrix;
        node.prerender(ctx);

        if (draw) {
            for (i = 0; i < node.childEntities.length; ++i) {
                node.childEntities[i].draw(ctx, delta);
            }
        }

        for (i = 0; i < node.childNodes.length; ++i) {
            this.renderNode(node.childNodes[i], ctx, delta, draw);
        }

        node.postrender(ctx);
        ctx.restore();
    }

    return this;
};

Layer.prototype.ray = function(vec2, bnode) {
    if (this.ignoreRay === true) {
        return [];
    }
    var out,
        that = this;

    if (bnode === undefined) {
        return this.ray(vec2, this.rootNode);
    }

    out = [];

    if (bnode.hasChildren()) {

        bnode.each(function ray_each_node(node) {
            var col = node.collide(vec2);
            if (col.reason < Intersection.OUTSIDE) {
                out.push(node);
            }

            if (node.hasChildren()) {
                Array.combine(out, that.ray(vec2, node));
            }
        });
    }

    return out;
};

module.exports = Layer;
