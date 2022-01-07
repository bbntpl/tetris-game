//key bindings/events stuff

//listing functional key bindings for this game
const KEY = {
    UP: "up",
    DOWN: "down",
    LEFT: "left",
    RIGHT: "right",
    C: "c",
    Z: "z",
    SPACE: " "
  };

//appending the defined keys to an event key
const KEY_BIND = {
    "ArrowUp": KEY.UP,
    "ArrowLeft": KEY.LEFT,
    "ArrowRight": KEY.RIGHT,
    "ArrowDown": KEY.DOWN,
    " ": KEY.SPACE,
    "C": KEY.C,
    "c": KEY.C,
    "Z": KEY.Z,
    "z": KEY.Z
};

//game controls
const KEY_EVENTS = [
    KEY.UP,
    KEY.LEFT,
    KEY.RIGHT,
    KEY.DOWN,
    KEY.SPACE,
    KEY.C,
    KEY.Z
]

//this acts as a container for the pressed keys
const pressedKeys = {};


export { KEY, KEY_BIND, KEY_EVENTS, pressedKeys };