var EventMachine = require("./event-machine.js"),
    Scene = require("./scene.js"),
    EventEmitter = require("./event-emitter.js");

/**
 * @todo Move scene.start here
 */
function Engine(ctx) {
    this.ctx = ctx;

    this.initEventEmitter();
    var evm = this.evm = new EventMachine();

    if (document.attachEvent) {

    } else {
        document.addEventListener("keyup", function(e) {
            var t = evm.keyNameFromEvent(e);
            evm.disable(t, true);
            e.preventDefault();
        });

        document.addEventListener("keydown", function(e) {
            var t = evm.keyNameFromEvent(e);
            evm.enable(t);
            e.preventDefault();
        });
    }
}

Engine.prototype = new EventEmitter();

Engine.prototype.evm = null;

Engine.prototype.ctx = null;

Engine.prototype.currentScene = null;

Engine.prototype.createScene = function createScene(name, width, height, time_step) {
    this.currentScene = new Scene(name, this.ctx, width, height, time_step);

    return this.currentScene;
}

Engine.prototype.listen = function listen(name, combination, fn_on, fn_off, delay) {
    this.evm.on(name, combination, fn_on, fn_off, delay);

    return this;
}

Engine.prototype.isKeyOn = function listen(name) {
    return this.evm.isOn(name);
}



module.exports = Engine;
