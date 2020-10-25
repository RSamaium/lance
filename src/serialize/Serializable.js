import Utils from './../lib/Utils';
import BaseTypes from './BaseTypes';

class Serializable {
    /**
     *  Class can be serialized using either:
     * - a class based netScheme
     * - an instance based netScheme
     * - completely dynamically (not implemented yet)
     *
     * @param {Object} serializer - Serializer instance
     * @param {Object} [options] - Options object
     * @param {Object} options.dataBuffer [optional] - Data buffer to write to. If null a new data buffer will be created
     * @param {Number} options.bufferOffset [optional] - The buffer data offset to start writing at. Default: 0
     * @param {String} options.dry [optional] - Does not actually write to the buffer (useful to gather serializeable size)
     * @return {Object} the serialized object.  Contains attributes: dataBuffer - buffer which contains the serialized data;  bufferOffset - offset where the serialized data starts.
     */
    
     constructor() {
        this.paramsChanged = new Set()
        this.prevValues = {}
     }

     get scheme() {
        return Object.assign({}, this.netScheme || {}, this.constructor.netScheme || {})
     }
    
     _serialize(serializer, options) {
        options = Object.assign({
            bufferOffset: 0
        }, options);

        let netScheme;
        let dataBuffer;
        let dataView;
        let classId = 0;
        let bufferOffset = options.bufferOffset;
        let localBufferOffset = 0; // used for counting the bufferOffset

        // instance classId
        if (this.classId) {
            classId = this.classId;
        } else {
            classId = Utils.hashStr(this.constructor.name);
        }

        netScheme = Object.assign({}, this.netScheme || {}, this.constructor.netScheme || {})

        // TODO: currently we serialize every node twice, once to calculate the size
        //       of the buffers and once to write them out.  This can be reduced to
        //       a single pass by starting with a large (and static) ArrayBuffer and
        //       recursively building it up.
        // buffer has one Uint8Array for class id, then payload
        if (options.dataBuffer == null && options.dry != true) {
            let bufferSize = this.serialize(serializer, { dry: true }).bufferOffset;
            dataBuffer = new ArrayBuffer(bufferSize);
        } else {
            dataBuffer = options.dataBuffer;
        }

        if (options.dry != true) {
            dataView = new DataView(dataBuffer);
            // first set the id of the class, so that the deserializer can fetch information about it
            dataView.setUint8(bufferOffset + localBufferOffset, classId);
        }

        // advance the offset counter
        localBufferOffset += Uint8Array.BYTES_PER_ELEMENT;

        if (netScheme) {
            for (let property of Object.keys(netScheme).sort()) {

                // write the property to buffer
                if (options.dry != true) {
                    serializer.writeDataView(dataView, this[property], bufferOffset + localBufferOffset, netScheme[property]);
                }

                if (netScheme[property].type === BaseTypes.TYPES.STRING) {
                    // derive the size of the string
                    localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;
                    if (this[property] !== null && this[property] !== undefined)
                        localBufferOffset += this[property].length * Uint16Array.BYTES_PER_ELEMENT;
                } else if (netScheme[property].type === BaseTypes.TYPES.CLASSINSTANCE) {
                    // derive the size of the included class
                    let objectInstanceBufferOffset = this[property].serialize(serializer, { dry: true }).bufferOffset;
                    localBufferOffset += objectInstanceBufferOffset;
                } else if (netScheme[property].type === BaseTypes.TYPES.LIST) {
                    // derive the size of the list
                    // list starts with number of elements
                    localBufferOffset += Uint16Array.BYTES_PER_ELEMENT;

                    for (let item of this[property]) {
                        // todo inelegant, currently doesn't support list of lists
                        if (netScheme[property].itemType === BaseTypes.TYPES.CLASSINSTANCE) {
                            let listBufferOffset = item.serialize(serializer, { dry: true }).bufferOffset;
                            localBufferOffset += listBufferOffset;
                        } else if (netScheme[property].itemType === BaseTypes.TYPES.STRING) {
                            // size includes string length plus double-byte characters
                            localBufferOffset += Uint16Array.BYTES_PER_ELEMENT * (1 + item.length);
                        } else {
                            localBufferOffset += serializer.getTypeByteSize(netScheme[property].itemType);
                        }
                    }
                } else {
                    // advance offset
                    localBufferOffset += serializer.getTypeByteSize(netScheme[property].type);
                }

            }
        } else {
            // TODO no netScheme, dynamic class
        }

        return { dataBuffer, bufferOffset: localBufferOffset };
    }

    setPrev(key, val) {
        this.prevValues[key] = val 
    }

    getPrev(key) {
        return this.prevValues[key]
    }

    serialize() {
        let dataBuffer = {}

        const setCommonProp = (groups, val) => {
            
        }
    
        const deepSerialize = (val) => {
            if (val == undefined) return
            if (val instanceof Array) {
                const groupsArray = {}
                for (let i=0 ; i < val.length ; i++) {
                    const item = val[i]
                    const newVal = deepSerialize(item)
                    for (let key in newVal.groups) {
                        if (!groupsArray[key]) groupsArray[key] = []
                        groupsArray[key].push(newVal.groups[key])
                    }
                    val[i] = newVal.origin
                }
                return { groups: groupsArray, origin: val }
            }
            if (val.netScheme || val.constructor.netScheme) {
                let scheme = val.scheme
                const detectChanges = val.detectChanges 
                const groups = {
                    update: {},
                    all: {}
                }
                for (let key in scheme) {
                    const value = val[key]
                    const originVal = val.getPrev(key)
                    if (value == undefined || typeof value == 'number' ||  typeof value == 'string') {
                        if (detectChanges && originVal != val[key]) {
                            groups['update'][key] = value
                        }
                        else if (!detectChanges) groups['update'][key] = value
                        groups['all'][key] = value
                        val.setPrev(key, value)
                    }
                    else {
                        const newVal = deepSerialize(val[key])
                        for (let keyGroup in newVal.groups) {
                            groups[keyGroup][key] = newVal.groups[keyGroup]
                        }
                        val[key] = newVal.origin
                    }
                }
                let classId
                if (val.classId) {
                    classId = val.classId
                } else {
                    classId = Utils.hashStr(val.constructor.name)
                }
                for (let key in groups) {
                    groups[key].id = val.id
                    groups[key].classId = classId
                }
                return { groups, origin: val }
            }
            if (typeof val == 'object') {
                const newObj = Object.assign({}, val)
                for (let key in newObj) {
                    const newVal = deepSerialize(val[key])
                    newObj[key] = newVal.groups
                    val[key] = newVal.origin
                }
                return { groups: newObj, origin: val }
            }
        }
        dataBuffer = deepSerialize(this)
        return dataBuffer.groups
    }

    // build a clone of this object with pruned strings (if necessary)
    prunedStringsClone(serializer, prevObject) {

        if (!prevObject) return this;
        prevObject = serializer.deserialize(prevObject).obj;

        // get list of string properties which changed
        let netScheme = this.constructor.netScheme;
        let isString = p => netScheme[p].type === BaseTypes.TYPES.STRING;
        let hasChanged = p => prevObject[p] !== this[p];
        let changedStrings = Object.keys(netScheme).filter(isString).filter(hasChanged);
        if (changedStrings.length == 0) return this;

        // build a clone with pruned strings
        let prunedCopy = new this.constructor(null, { id: null });
        for (let p of Object.keys(netScheme))
            prunedCopy[p] = changedStrings.indexOf(p) < 0 ? this[p] : null;

        return prunedCopy;
    }

    syncTo(other) {
        return other
    }

}

export default Serializable;
