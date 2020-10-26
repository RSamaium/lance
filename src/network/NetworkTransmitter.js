import BaseTypes from '../serialize/BaseTypes';

import NetworkedEventFactory from './NetworkedEventFactory';
import NetworkedEventCollection from './NetworkedEventCollection';
import Utils from './../lib/Utils';

export default class NetworkTransmitter {

    constructor(serializer, world) {
        this.serializer = serializer;
        this.world = world

        this.registeredEvents = [];
        this.networkedEventCollection = {}

        this.serializer.registerClass(NetworkedEventCollection);

        this.registerNetworkedEventFactory('objectUpdate', {
            netScheme: {
                stepCount: { type: BaseTypes.TYPES.INT32 },
                objectInstance: { type: BaseTypes.TYPES.CLASSINSTANCE }
            }
        });

        this.registerNetworkedEventFactory('objectCreate', {
            netScheme: {
                stepCount: { type: BaseTypes.TYPES.INT32 },
                objectInstance: { type: BaseTypes.TYPES.CLASSINSTANCE }
            }
        });

        this.registerNetworkedEventFactory('objectDestroy', {
            netScheme: {
                stepCount: { type: BaseTypes.TYPES.INT32 },
                objectInstance: { type: BaseTypes.TYPES.CLASSINSTANCE }
            }
        });

        this.registerNetworkedEventFactory('syncHeader', {
            netScheme: {
                stepCount: { type: BaseTypes.TYPES.INT32 },
                fullUpdate: { type: BaseTypes.TYPES.UINT8 }
            }
        });

        world.onAddGroup = (name) => {
            this.networkedEventCollection[name] = new NetworkedEventCollection()
        }

        world.onRemoveGroup = (name) => {
            delete this.networkedEventCollection[name]
        }
    }

    registerNetworkedEventFactory(eventName, options) {
        options = Object.assign({}, options);

        let classHash = Utils.hashStr(eventName);

        let networkedEventPrototype = function() {};
        networkedEventPrototype.prototype.classId = classHash;
        networkedEventPrototype.prototype.eventName = eventName;
        networkedEventPrototype.netScheme = options.netScheme;

        this.serializer.registerClass(networkedEventPrototype, classHash);

        this.registeredEvents[eventName] = new NetworkedEventFactory(this.serializer, eventName, options);
    }

    addNetworkedEvent(roomName, eventName, payload) {
        if (!this.registeredEvents[eventName]) {
            console.error(`NetworkTransmitter: no such event ${eventName}`);
            return null;
        }
        if (!this.networkedEventCollection[roomName]) {
            return null
        }

        let stagedNetworkedEvent = this.registeredEvents[eventName].create(payload);
        this.networkedEventCollection[roomName].events.push(stagedNetworkedEvent);
        return stagedNetworkedEvent;
    }

    serializePayload(roomName) {
        if (!this.networkedEventCollection[roomName]) {
            return null
        }
        if (this.networkedEventCollection[roomName].events.length === 0)
            return null;

        let dataBuffer = this.networkedEventCollection[roomName].serialize(this.serializer);

        return dataBuffer;
    }

    deserializePayload(payload) {
        return this.serializer.deserialize(payload.dataBuffer).obj;
    }

    clearPayload(roomName) {
        this.networkedEventCollection[roomName].events = []
    }

}
