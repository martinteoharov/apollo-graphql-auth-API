const mongo = require('../db/mongoUtil');

const getAllTrackers = async ({ username }) => {
    return await mongo.getDB().collection('trackers').find({ username }).toArray();
}

const addTracker = async ({ username, trackerName, startDate, endDate, timer }) => {
    return await mongo.getDB().collection('trackers').insertOne({ username, name:trackerName, startDate, endDate, timer });
}

const deleteTracker = async ({ username, startDate }) => {
    return await mongo.getDB().collection('trackers').removeOne({ username, startDate }, { justOne: true });
}

module.exports.getAllTrackers = getAllTrackers;
module.exports.addTracker = addTracker;
