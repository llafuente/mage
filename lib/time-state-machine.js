var assert = require("assert");
var EventEmitter = require("./event-emitter.js");
var inspect = require("util").inspect;
var time_state_machine = function(events, states) {
  this.initEventEmitter();

  this.events = {};

  var i = 0,
    max = events.length;
  for (i = 0; i < max; ++i) {
    this.events[events[i]] = {state: false, ts: null};
  }

  this.states = states;
};

time_state_machine.prototype = new EventEmitter();

time_state_machine.prototype.states = null;
time_state_machine.prototype.events = null;

time_state_machine.prototype.is_finished = function is_finished() {

};


time_state_machine.prototype.enable = function enable(event) {
  var ev = this.events[event];

  ev.state = true;
  ev.ts = Date.now();

  this.emit(event, [true]);
}

time_state_machine.prototype.toogle = function toogle(event) {
  var ev = this.events[event];

  ev.state = !ev.state;
  ev.ts = Date.now();

  this.emit(event, [ev.state]);
}

time_state_machine.prototype.disable = function disable(event) {
  var ev = this.events[event];

  ev.state = false;
  ev.ts = Date.now();

  this.emit(event, [false]);
};

time_state_machine.prototype.state = function state(state) {
  console.log("-----------------------");
  console.log(inspect(this, {depth: null, colors: true}));
  var states = this.states[state],
    ts = Date.now(),
    i = 0,
    max = states.length,
    condition,
    ev_con,
    ev_st,
    ev_name,
    oks;

  //console.log("states", states);
  for (i = 0; i < max; ++i) {
    condition = states[i];
    console.log("condition", condition);
    oks = 0;
    checks = 0;
    for (ev_name in condition) {
      ++checks;
      ev_con = condition[ev_name];
      ev_st = this.events[ev_name];

      console.log(ev_con, ev_st);

      if (ev_con.state === ev_st.state) {
        console.log(ev_name, ev_con.ts);
        if (ev_con.ts == null) { // and undefined
          ++oks; // no time check
        }else if ((ts + ev_con.ts) < ev_st.ts) {
          ++oks;
        }
      }
    }
    if (oks === checks) {
      return true;
    }
  }
  return false;
};




var tsm = new time_state_machine([
  "on_ground",
  "on_air",
  "jumping"
], {
  "can_jump": [ // or conditions
    {"on_ground": {state: true, ts: null} /*and conditions*/},
    {"on_air": {state: true, ts: -50}, "jumping": {state: false}},
  ]
});

tsm.on("jumping", function(state) {
  if (state) {
    tsm.disable("on_ground");
    tsm.enable("on_air");
  } else {
    tsm.enable("on_ground");
    tsm.disable("on_air");
  }
});

tsm.enable("on_ground");
assert.ok(tsm.state("can_jump"));

tsm.disable("on_ground");
assert.ok(!tsm.state("can_jump"));

tsm.enable("on_air");
assert.ok(tsm.state("can_jump"));
setTimeout(function() {
  assert.ok(!tsm.state("can_jump"));

  tsm.disable("on_air");
  tsm.enable("on_ground");
  assert.ok(tsm.state("can_jump"));

  tsm.enable("jumping");
  assert.ok(!tsm.state("can_jump"));
}, 200);
