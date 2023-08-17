"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_hid_1 = __importDefault(require("node-hid"));
const hw_transport_node_hid_noevents_1 = __importStar(require("@ledgerhq/hw-transport-node-hid-noevents"));
const devices_1 = require("@ledgerhq/devices");
const errors_1 = require("@ledgerhq/errors");
const listenDevices_1 = __importDefault(require("./listenDevices"));
let listenDevicesDebounce = 500;
let listenDevicesPollingSkip = () => false;
/**
 * node-hid Transport implementation
 * @example
 * import TransportNodeHid from "@ledgerhq/hw-transport-node-hid";
 * ...
 * TransportNodeHid.create().then(transport => ...)
 */
class TransportNodeHid extends hw_transport_node_hid_noevents_1.default {
    /**
     * if path="" is not provided, the library will take the first device
     */
    static open(path) {
        return Promise.resolve().then(() => {
            if (path) {
                return new TransportNodeHid(new node_hid_1.default.HID(path));
            }
            const device = (0, hw_transport_node_hid_noevents_1.getDevices)()[0];
            if (!device)
                throw new errors_1.TransportError("NoDevice", "NoDevice");
            return new TransportNodeHid(new node_hid_1.default.HID(device.path));
        });
    }
}
/**
 *
 */
TransportNodeHid.isSupported = hw_transport_node_hid_noevents_1.default.isSupported;
/**
 *
 */
TransportNodeHid.list = hw_transport_node_hid_noevents_1.default.list;
/**
 *
 */
TransportNodeHid.setListenDevicesDebounce = (delay) => {
    listenDevicesDebounce = delay;
};
/**
 *
 */
TransportNodeHid.setListenDevicesPollingSkip = (conditionToSkip) => {
    listenDevicesPollingSkip = conditionToSkip;
};
/**
 *
 */
TransportNodeHid.setListenDevicesDebug = () => {
    console.warn("setListenDevicesDebug is deprecated. Use @ledgerhq/logs instead. No logs will get emitted there anymore.");
};
/**
 */
TransportNodeHid.listen = (observer) => {
    let unsubscribed = false;
    Promise.resolve((0, hw_transport_node_hid_noevents_1.getDevices)()).then(devices => {
        // this needs to run asynchronously so the subscription is defined during this phase
        for (const device of devices) {
            if (!unsubscribed) {
                const descriptor = device.path;
                const deviceModel = (0, devices_1.identifyUSBProductId)(device.productId);
                observer.next({
                    type: "add",
                    descriptor,
                    device,
                    deviceModel,
                });
            }
        }
    });
    const { events, stop } = (0, listenDevices_1.default)(listenDevicesDebounce, listenDevicesPollingSkip);
    const onAdd = device => {
        if (unsubscribed || !device)
            return;
        const deviceModel = (0, devices_1.identifyUSBProductId)(device.productId);
        observer.next({
            type: "add",
            descriptor: device.path,
            deviceModel,
            device,
        });
    };
    const onRemove = device => {
        if (unsubscribed || !device)
            return;
        const deviceModel = (0, devices_1.identifyUSBProductId)(device.productId);
        observer.next({
            type: "remove",
            descriptor: device.path,
            deviceModel,
            device,
        });
    };
    events.on("add", onAdd);
    events.on("remove", onRemove);
    function unsubscribe() {
        unsubscribed = true;
        events.removeListener("add", onAdd);
        events.removeListener("remove", onRemove);
        stop();
    }
    return {
        unsubscribe,
    };
};
exports.default = TransportNodeHid;
//# sourceMappingURL=TransportNodeHid.js.map