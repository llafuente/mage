var Fun = require("function-enhancements"),
    array = require("array-enhancements");
//
// Events (Event Emitter)
// support

/**
 * @class Events
 */
function EventEmitter() {
    this.initEventEmitter();
}

EventEmitter.prototype.__events = null;

EventEmitter.prototype.__eventskeys = null;

EventEmitter.prototype.__pipes = null;

EventEmitter.prototype.initEventEmitter = function initEventEmitter() {
    var i,
        k;

    this.__events = Object.create(null);
    this.__eventskeys = [];
    this.__pipes = [];
};

EventEmitter.prototype.on_unhandled_event = function (fn) {
    return this.on("*", fn);
};
/**
 * @member Events
 */
EventEmitter.prototype.on = function on(event, fn, times, internal) { //TODO: push on unshift
    var ev_name;

    //object check
    if (typeof event === "object") {
        for (ev_name in event) {
            this.on(ev_name, event[ev_name]);
        }
        return this;
    }

    this.__events[event] = this.__events[event] || [];
    this.__events[event].push(fn);


    if (this.__eventskeys.indexOf(event) === -1) {
        this.__eventskeys.push(event);
    }

    fn.$ev_times = times || -1;


    return this;
};
EventEmitter.prototype.once = function (event, fn) {
    return this.on(event, fn, 1, false);
};
EventEmitter.prototype.listeners = function (event) {
    return this.__events[event] ?
            (this.__events[event].length === 0 ? false : this.__events[event].length)
        : false;
};
EventEmitter.prototype.getListeners = function (event) {
    if (debug) {
        notStrictEqual(this.__events, null, "Remember to call \"this.__parent()\" in the constructor!");
    }

    return this.__events[event] ? array.clone(this.__events[event]) : [];
};
EventEmitter.prototype.emit = function (event, args, delay_ms) {
    var events,
        i,
        fn,
        max,
        check,
        key,
        ev_ast,
        ev_data;

    // dispatch pipe"d first
    if ("*" !== event && this.__pipes.length) {
        for (i = 0; i < this.__pipes.length; ++i) {
            if (delay_ms !== undefined) {
                this.__pipes[i].emit(event, args, delay_ms);
            } else if (args) {
                this.__pipes[i].emit(event, args);
            } else {
                this.__pipes[i].emit(event);
            }

        }
    }

    ev_ast = event.indexOf("*");

    if (ev_ast === -1 || "*" === event) {
        events = this.__events[event];
    } else {
        check = new RegExp("^" + event.replace("*", "(.*)", "g"));
        events = [];

        i = this.__eventskeys.length;
        while (i--) {
            key = this.__eventskeys[i];
            if (check.test(key)) {
                this.emit(key, args, delay_ms);
            }
        }
    }

    if (!events || events.length === 0) {
        if (this.__events["*"] && this.__events["*"].length) {
            return this.emit("*", args, delay_ms);
        }

        if (event === "error") {
            //throw
            throw new Error(args);
        }

        // nothing to work!
        return this;
    }

    max = events.length;
    for (i = 0; i < max; ++i) {
        fn = events[i];

        if (delay_ms !== undefined) {
            args = array.ize(args);
            fn.delay(delay_ms, fn/*this*/, args); // !!!<--
        } else {

            if (arguments.length === 1) {
                //fn.apply(fn);
                fn();
            } else {
                if (Array.isArray(args)) {
                    args = array.ize(args);
                }

                if (!args) {
                    fn();
                } else if (args.length === 1) {
                    fn(args[0]);
                } else if (args.length === 2) {
                    fn(args[0], args[1]);
                } else if (args.length === 3) {
                    fn(args[0], args[1], args[2]);
                } else {
                    fn.apply(fn, /*this*/ args);
                }
            }
        }

        if (--fn.$ev_times === 0) {
            this.off(event, fn);

            if (max === 1) {
                return this;
            }

            --i;
            --max;
        }

        //stop ?
        if (fn.$ev_stop === true) {
            return this;
        }
    }

    return this;
},

EventEmitter.prototype.off = function (event, fn) {
    var events = this.__events[event],
        index;

    if (events && !(fn.$Event && fn.$Event[event] && fn.$Event[event].internal)) {
        index = events.indexOf(fn);

        if (index !== -1) {
            events.splice(index, 1);
            return true;
        }
    }
    return false;
},

EventEmitter.prototype.offAll  = function (events) {
    var event,
        fns,
        i;

    if (__typeof(events) === "object") {
        for (event in events) {
            this.removeListener(event, events[event]);
        }
        return this;
    }

    for (event in this.__events) {
        if (!(events && events !== event)) {
            fns = this.__events[event];
            i = fns.length;

            while (i--) {
                if (fns[i] !== undefined) {
                    this.removeListener(event, fns[i]);
                }
            }
        }
    }
    return this;
};

EventEmitter.prototype.pipe = function (cls) {
    if (debug) {
        notStrictEqual(cls, this, "cannot pipe to \"myself\"");
    }

    //if (!__instanceof(cls, "Events")) {
    //    throw new Error("cls need to extends from Events");
    //}

    this.__pipes.push(cls);
};


EventEmitter.when = function (event, list, callback) {
    if (!list || list.length === 0) {
        callback();
        return;
    }

    var i,
        callback_nth = Fun.after(callback, list.length);

    for (i = 0; i < list.length; ++i) {
        list[i].once(event, callback_nth);
    }
};


module.exports = EventEmitter;
