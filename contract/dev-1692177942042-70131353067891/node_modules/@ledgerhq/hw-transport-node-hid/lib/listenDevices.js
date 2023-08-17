"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = __importDefault(require("events"));
const usb_1 = require("usb");
const debounce_1 = __importDefault(require("lodash/debounce"));
const hw_transport_node_hid_noevents_1 = require("@ledgerhq/hw-transport-node-hid-noevents");
const logs_1 = require("@ledgerhq/logs");
exports.default = (delay, listenDevicesPollingSkip) => {
    const events = new events_1.default();
    events.setMaxListeners(0);
    let listDevices = (0, hw_transport_node_hid_noevents_1.getDevices)();
    const flatDevice = d => d.path;
    const getFlatDevices = () => [...new Set((0, hw_transport_node_hid_noevents_1.getDevices)().map(d => flatDevice(d)))];
    const getDeviceByPaths = paths => listDevices.find(d => paths.includes(flatDevice(d)));
    let lastDevices = getFlatDevices();
    const poll = () => {
        if (!listenDevicesPollingSkip()) {
            (0, logs_1.log)("hid-listen", "Polling for added or removed devices");
            let changeFound = false;
            const currentDevices = getFlatDevices();
            const newDevices = currentDevices.filter(d => !lastDevices.includes(d));
            if (newDevices.length > 0) {
                (0, logs_1.log)("hid-listen", "New device found:", newDevices);
                listDevices = (0, hw_transport_node_hid_noevents_1.getDevices)();
                events.emit("add", getDeviceByPaths(newDevices));
                changeFound = true;
            }
            else {
                (0, logs_1.log)("hid-listen", "No new device found");
            }
            const removeDevices = lastDevices.filter(d => !currentDevices.includes(d));
            if (removeDevices.length > 0) {
                (0, logs_1.log)("hid-listen", "Removed device found:", removeDevices);
                events.emit("remove", getDeviceByPaths(removeDevices));
                listDevices = listDevices.filter(d => !removeDevices.includes(flatDevice(d)));
                changeFound = true;
            }
            else {
                (0, logs_1.log)("hid-listen", "No removed device found");
            }
            if (changeFound) {
                lastDevices = currentDevices;
            }
        }
        else {
            (0, logs_1.log)("hid-listen", "Polling skipped, re-debouncing");
            debouncedPoll();
        }
    };
    const debouncedPoll = (0, debounce_1.default)(poll, delay);
    const attachDetected = device => {
        (0, logs_1.log)("hid-listen", "Device add detected:", device);
        debouncedPoll();
    };
    usb_1.usb.on("attach", attachDetected);
    (0, logs_1.log)("hid-listen", "attach listener added");
    const detachDetected = device => {
        (0, logs_1.log)("hid-listen", "Device removal detected:", device);
        debouncedPoll();
    };
    usb_1.usb.on("detach", detachDetected);
    (0, logs_1.log)("hid-listen", "detach listener added");
    return {
        stop: () => {
            (0, logs_1.log)("hid-listen", "Stop received, removing listeners and cancelling pending debounced polls");
            debouncedPoll.cancel();
            usb_1.usb.removeListener("attach", attachDetected);
            usb_1.usb.removeListener("detach", detachDetected);
        },
        events,
    };
};
//# sourceMappingURL=listenDevices.js.map