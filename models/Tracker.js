const mongo = require('../db/mongoUtil');

const getAllTrackers = async ({ username }) => {
    return await mongo.getDB().collection('trackers').find({ username }).toArray();
}

const addTracker = async ({ username, name, startDate, endDate, timer }) => {
    await mongo.getDB().collection('trackers').insertOne({ username, name, startDate, endDate, timer });
    const entry = await mongo.getDB().collection('trackers').find({ username, name, startDate, endDate, timer }).toArray();
    return entry[0];
}

const deleteTracker = async ({ username, _id }) => {
    _id = new mongo.ObjectId(_id);
    return await mongo.getDB().collection('trackers').deleteOne({ username, _id });
}

module.exports.getAllTrackers = getAllTrackers;
module.exports.addTracker = addTracker;
module.exports.deleteTracker = deleteTracker;
