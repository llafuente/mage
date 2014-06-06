var Cameras = 0,
    Movable = require("./movable.js"),
    array = require("array-enhancements"),
    Matrix23 = require("js-2dmath").Matrix23,
    Polygon = require("js-2dmath").Polygon,
    Response = require("js-2dmath").Collision.Response,
    aux_res = Response.create(),
    getPointInPolygon = require("js-2dmath").Collision.SAT.getPointInPolygon;

/**
 * @class Camera
 */
function Camera(name, width, height) {
    this.id = name || "camera/" + (++Cameras);

    this.resetMovable();

    this.frustrum = [[0, 0], [width, 0], [width, height], [0, height]]; // polygon
    this.wFrustrum = [[0, 0], [width, 0], [width, height], [0, height]]; // polygon
}

Camera.prototype = new Movable();
/**
 * @member Camera
 * @type String
 */
Camera.prototype.id =  "";
/**
 * local coordinates
 * @type Polygon
 */
Camera.prototype.frustrum =  null;
/**
 * world coordinates
 * @type Polygon
 */
Camera.prototype.wFrustrum =  null;


Camera.prototype.isPointVisible = function(vec2) {
    if (this.matrix[7]) { // dirty ?
        Polygon.transfrom(this.wFrustrum, this.frustrum, this.matrix);
        this.matrix[7] = false;
    }

    return getPointInPolygon(aux_res, vec2, this.wFrustrum);
}


module.exports = Camera;