/**
 * This class implements a singleton game world instance, created by Lance.
 * It represents an instance of the game world, and includes all the game objects.
 * It is the state of the game.
 */
import { v4 as uuidv4 } from 'uuid';

class GameWorld {

    /**
     * Constructor of the World instance.  Invoked by Lance on startup.
     *
     * @hideconstructor
     */
    constructor() {
        this.stepCount = 0;
        this.objects = {};
        this.playerCount = 0;
        this.idCount = 0;
        this.groups = {}
    }

    /**
     * Gets a new, fresh and unused id that can be used for a new object
     * @private
     * @return {Number} the new id
     */
    getNewId() {
        return uuidv4();
    }

    /**
     * Returns all the game world objects which match a criteria
     * @param {Object} query The query object
     * @param {Object} [query.id] object id
     * @param {Object} [query.playerId] player id
     * @param {Class} [query.instanceType] matches whether `object instanceof instanceType`
     * @param {Array} [query.components] An array of component names
     * @param {Boolean} [query.returnSingle] Return the first object matched
     * @return {Array | Object} All game objects which match all the query parameters, or the first match if returnSingle was specified
     */
    queryObjects(query) {
        let queriedObjects = [];

        // todo this is currently a somewhat inefficient implementation for API testing purposes.
        // It should be implemented with cached dictionaries like in nano-ecs
        this.forEachObject((id, object) => {
            let conditions = [];

            // object id condition
            conditions.push(!('id' in query) || query.id !== null && object.id === query.id);

            // player id condition
            conditions.push(!('playerId' in query) || query.playerId !== null && object.playerId === query.playerId);

            // instance type conditio
            conditions.push(!('instanceType' in query) || query.instanceType !== null && object instanceof query.instanceType);

            // components conditions
            if ('components' in query) {
                query.components.forEach(componentClass => {
                    conditions.push(object.hasComponent(componentClass));
                });
            }

            // all conditions are true, object is qualified for the query
            if (conditions.every(value => value)) {
                queriedObjects.push(object);
                if (query.returnSingle) return false;
            }
        });

        // return a single object or null
        if (query.returnSingle) {
            return queriedObjects.length > 0 ? queriedObjects[0] : null;
        }

        return queriedObjects;
    }

    /**
     * Returns The first game object encountered which matches a criteria.
     * Syntactic sugar for {@link queryObjects} with `returnSingle: true`
     * @param {Object} query See queryObjects
     * @return {Object} The game object, if found
     */
    queryObject(query) {
        return this.queryObjects(Object.assign(query, {
            returnSingle: true
        }));
    }

    getObject(id) {
        if (typeof id != 'string') {
            id = id.id
        }
        return this.objects[id]
    }

    getObjectsOfGroup(groupName) {
        return this.groups[groupName].map(id => this.getObject(id))
    }

    /**
     * Add an object to the game world
     * @private
     * @param {Object} object object to add
     */
    addObject(object, groupName) {
        if (groupName) {
            this.groups[groupName].push(object.id)
        }
        this.objects[object.id] = object;
    }

    /**
     * Remove an object from the game world
     * @private
     * @param {number} id id of the object to remove
     */
    removeObject(id) {
        for (let groupName in this.groups) {
            this.removeObjectOfGroup(groupName, id)
        }
        delete this.objects[id];
    }

    /**
     * World object iterator.
     * Invoke callback(objId, obj) for each object
     *
     * @param {function} callback function receives id and object. If callback returns false, the iteration will cease
     */
    forEachObject(callback) {
        for (let id of Object.keys(this.objects)) {
            let returnValue = callback(id, this.objects[id]);  // TODO: the key should be Number(id)
            if (returnValue === false) break;
        }
    }

    addGroup(name) {
        this.groups[name] = []
    }

    removeGroup(name) {
        delete this.groups[name]
    }

    removeObjectOfGroup(name, id) {
        const index = this.groups[name].findIndex(object => object.id == id)
        if (index == -1) return
        this.groups[name].splice(index, 1)
    }

}

export default GameWorld;
