var EventMachine = require("./event-machine.js"),
    EventEmitter = require("./event-emitter.js");

/**
 * @todo Move scene.start here
 */
function Mage() {
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

Mage.prototype = new EventEmitter();

Mage.prototype.evm = null;

Mage.prototype.listen = function listen(name, combination, fn_on, fn_off, delay) {
    this.evm.on(name, combination, fn_on, fn_off, delay);

    return this;
}
Mage.prototype.isKeyOn = function listen(name) {
    return this.evm.isOn(name);
}



module.exports = Mage;
