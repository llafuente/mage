module.exports = {
    EventEmitter: require("./lib/event-emitter.js"),
    Assets: require("./lib/assets.js"),
    Movable: require("./lib/movable.js"),
    Node: require("./lib/node.js"),
    Entity: require("./lib/entity.js"),
    EntityTMX: require("./lib/entity-tmx.js"),
    Scene: require("./lib/scene.js"),
    EventMachine: require("./lib/event-machine.js"),

    Mage: require("./lib/mage.js")
};

module.exports.globalize = function (object) {
    require("js-2dmath").globalize(object);

    var i;
    for (i in module.exports) {
        if ("globalize" !== i) {
            object[i] = module.exports[i];
        }
    }
};
