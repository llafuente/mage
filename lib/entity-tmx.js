var Entity = require("./entity.js");

/**
 * @todo support multiple tilesets
 * @todo cache render
 * @todo frustrum/visble render only
 */

function EntityTMX(json) {
    this.data = json;
    this.objects = [];
    this.tilesets = [];
    this.parsePolygons();
    this.loadTilesets();
}


EntityTMX.prototype = new Entity();

EntityTMX.prototype.polygons = null;

EntityTMX.prototype.tilesets = null;

EntityTMX.prototype.drawPolygons = true;

EntityTMX.prototype.loadTilesets = function loadTilesets() {
    var self = this,
      tilesets = this.data.tilesets,
      tileset,
      i,
      max = tilesets.length,
      loaded = 0;

    function load() {
        if (++loaded === self.tilesets.length) {
            self.__ready = true;
        }
    }

    for (i = 0; i < max; ++i) {
        tileset = tilesets[i];

        var img = new Image(),
            self = this;

        if (img.addEventListener) {
            img.addEventListener("load", load);
        } else {
            img.attachEvent('onload', load);
        }

        img.src = tileset.image;

        tileset.image = img;
        this.tilesets.push(tileset);
    }

    delete this.data.tilesets;
}
EntityTMX.prototype.parsePolygons = function parsePolygons() {
  var self = this,
    layers = this.data.layers,
    layer,
    i,
    max = this.data.layers.length;

  for (i = 0; i < max; ++i) {
    layer = layers[i];

    if (layer.type === "objectgroup") {
      layer.objects.forEach(function(object) {
        console.log(object);
        if (object.height && object.width && !object.ellipse) {
          object.polygon = Polygon.create(
            [object.x, object.y],
            [object.x + object.width, object.y],
            [object.x + object.width, object.y + object.height],
            [object.x, object.y + object.height]
          );
        } else if (object.ellipse && object.width == object.height) {
          object.polygon = Polygon.fromCircle(Circle.create(object.x + object.width * 0.5, object.y + object.width * 0.5, object.width * 0.5), 8, 0);

        } else if (object.polygon) {
          var i,
            max = object.polygon.length,
            poly = [];
          for (i = 0; i < max; ++i) {
            poly.push([object.x + object.polygon[i].x, object.y +object.polygon[i].y]);
          }
          object.polygon = poly;
        }

        delete object.x;
        delete object.y;
        delete object.width;
        delete object.height;
        delete object.ellipse;

        self.objects.push(object);
      });

      layers.splice(i, 1);
      --i;
      --max;
    }
  }
};

EntityTMX.prototype.draw = function(ctx, dt) {
    if (!this.__ready) {
        return false;
    }

    var self = this,
        layers = this.data.layers,
        i,
        max = this.data.layers.length;

    for (i = 0; i < max; ++i) {
        this.drawLayer(layers[i]);
    }

    if (this.drawPolygons) {
        this.objects.forEach(function(object) {
            Draw.polygon(ctx, object.polygon, "blue");
        });
    }
}

EntityTMX.prototype.drawLayer = function(layer) {
    // data: [array of tiles, 1-based, position of sprite from top-left]
    // height: integer, height in number of sprites
    // name: "string", internal name of layer
    // opacity: integer
    // type: "string", layer type (tile, object)
    // visible: boolean
    // width: integer, width in number of sprites
    // x: integer, starting x position
    // y: integer, starting y position
    if (layer.type !== "tilelayer" || !layer.opacity) {
        return;
    }

    var size = this.data.tilewidth,
        tilesets = this.tilesets;

    layer.data.forEach(function(tile_idx, i) {
        if (!tile_idx) { return; }
        var img_x, img_y, s_x, s_y,
            tile = tilesets[0];
        tile_idx--;
        img_x = (tile_idx % (tile.imagewidth / size)) * size;
        img_y = ~~(tile_idx / (tile.imagewidth / size)) * size;
        s_x = (i % layer.width) * size;
        s_y = ~~(i / layer.width) * size;
        ctx.drawImage(tilesets[0].image, img_x, img_y, size, size,
                  s_x, s_y, size, size);
    });
};

module.exports = EntityTMX;
