/**
 * @todo support modifiers :mintime()
 */
var EventMachine = function() {
    this.chain = [];
    this.state = {};
    this.cfg = {};
}

EventMachine.prototype.chain = [];
EventMachine.prototype.state = {};
EventMachine.prototype.cfg = {};

EventMachine.prototype.parse = function (combo) {
    return combo.split(",").map(function (state) {
        return state.split("+").map(function (event) {
            return event.trim(); // TODO parse "!"
        });
    });
}
/**
 * on("ev + ev + !ev", fn)
 */
EventMachine.prototype.on = function (name, combination, fn_on, fn_off, delay) {
    combination = this.parse(combination);

    this.cfg[name] = {
        single: combination.length === 1 && combination[0].length === 1,
        combination: combination,
        on: fn_on || null,
        off: fn_off || null,
        stage: 0,
        delay: delay || 0
    };

    return this;
};

EventMachine.prototype.isOn = function (key) {
    return this.state[key];
};

EventMachine.prototype.isCombinationOn = function (name) {
    var cfg = this.cfg[name];

    return cfg.combination.length === cfg.stage;
};
EventMachine.prototype.__checkCombination = function (combination) {
    var cc = combination.stage
}
EventMachine.prototype.__check_events = function (events) {
    var events_ok = 0,
        j;

    for (j = 0; j < events.length; ++j) {
        check_against = events[j][0] !== "!";
        ev_name = check_against ? events[j] : events[j].substring(1);

        this.state[ev_name] = this.state[ev_name] || false;

        //console.log("eve state", ev_name, "[", check_against ,"]", this.state[ev_name]);

        if (this.state[ev_name] === check_against) {
            ++events_ok;
        }
    }

    return events_ok;
}

EventMachine.prototype.__check_all_events = function (keydown) {
    var name = null,
        cfg,
        ev_name,
        events,
        events_ok,
        i,
        check_against,
        current_combo;

    for (name in this.cfg) {
        cfg = this.cfg[name];

        //console.log(name, cfg.combination, cfg.stage);

        this.__checkCombination(cfg);

        events = cfg.combination[cfg.stage];

        // if there is events, we check it and advance
        if (events) {
            events_ok = this.__check_events(events);

            //console.log("events_ok", events_ok, events.length);
            if (events_ok === events.length) { // combo done!
                if (cfg.stage + 1 === cfg.combination.length) {
                    cfg.on && cfg.on(name, cfg, this);
                }
                // go next state
                ++cfg.stage;
            } else if(keydown && cfg.stage !== 0) {
                cfg.stage = 0;
                cfg.off && cfg.off(name, cfg, this);
            }
        } else {
            // check last stage, if ok, do nothing if not, reset
            events = cfg.combination[cfg.stage - 1];
            events_ok = this.__check_events(events);
            if (events_ok !== events.length && !keydown) {
                cfg.stage = 0;
                cfg.off && cfg.off(name, cfg, this);
            }
        }

    }
};

EventMachine.prototype.trigger = function (event) {
    this.state[event] = true;
    this.__check_all_events(true);

    this.state[event] = false;
    this.__check_all_events(false);
};

EventMachine.prototype.enable = function (event, check) {
    //console.log("********enable", event);
    if (this.state[event] === true) {
        return;
    }

    this.state[event] = true;
    if (check || check === undefined) {
        this.__check_all_events(true);
    }
};

EventMachine.prototype.disable = function (event, check) {
    //console.log("********disable", event);
    if (this.state[event] === false) {
        return;
    }

    this.state[event] = false;
    if (check || check === undefined) {
        this.__check_all_events(false);
    }
};




var re_keyCode = {
    '38': 'up',
    '40': 'down',
    '37': 'left',
    '39': 'right',
    '27': 'esc',
    '32': 'space',
    '8': 'backspace',
    '9': 'tab',
    '46': 'delete',
    '13': 'enter',
    '36': 'home',
    '35': 'end',
    '34': 'pagedown',
    '33': 'pageup',
    '45': 'insert',
    '46': 'bloqnum'
};

var re_key = {
    ":": "colon"
};

EventMachine.prototype.keyNameFromEvent = function (event, check) {
    var code = (event.which || event.keyCode);
    if (event.type == 'keydown' || event.type == 'keyup') {
        if (code > 111 && code < 124) {
            return key = 'f' + (code - 111);
        } else if (code > 95 && code < 106) {
            return this.key = code - 96;
        }
    }


    if (re_keyCode[code]) {
        return re_keyCode[code];
    }
    if (re_key[event.key]) {
        return re_key[event.key];
    }


    return String.fromCharCode(code).toLowerCase();
};

module.exports = EventMachine;
