const mongo = require('../db/mongoUtil');
const Project = require('./Project');

const getAllTrackers = async ({ username }) => {
    return await mongo.getDB().collection('trackers').find({ username }).toArray();
}
const getTrackersByDate = async ({ username, simpleDate }) => {
    return await mongo.getDB().collection('trackers').find({ username, simpleDate }).toArray();
}

const addTracker = async ({ username, name, startDate, endDate, simpleDate, timer, projects, tags }) => {
    await mongo.getDB().collection('trackers').insertOne({ username, name, startDate, simpleDate, endDate, timer, projects, tags });
    const entry = await mongo.getDB().collection('trackers').find({ username, name, startDate, endDate, simpleDate, timer, projects, tags }).toArray();

    // Add projects
    for(const name of projects){
        await Project.addProject({ username, name });
    }

    return entry[0];
}

const deleteTracker = async ({ username, _id }) => {
    _id = new mongo.ObjectId(_id);
    return await mongo.getDB().collection('trackers').deleteOne({ username, _id });
}

module.exports.getAllTrackers = getAllTrackers;
module.exports.getTrackersByDate = getTrackersByDate;
module.exports.addTracker = addTracker;
module.exports.deleteTracker = deleteTracker;
