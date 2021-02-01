const mongo = require('../db/mongoUtil');

const getAllProjects = async ({ username }) => {
    const res = await mongo.getDB().collection('projects').find({ username }).toArray();
    console.log('getAllProjects', res);
    return res;
}

const addProject = async ({ username, name }) => {
    const entry = await mongo.getDB().collection('projects').find({ username, name }).toArray();

    if(!entry) 
        return false;

    await mongo.getDB().collection('projects').insertOne({ username, name });
    return true;
}

module.exports.getAllProjects = getAllProjects;
module.exports.addProject = addProject;
