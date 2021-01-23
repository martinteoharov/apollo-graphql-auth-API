const mongo = require('../db/mongoUtil');

const getAllUsers = async () => {
    return await mongo.getDB().collection('users').find({}, { username: 1, password: 0 }).toArray();
}
const getUserByUsername = async ({ username }) => {
    const users = await mongo.getDB().collection('users').find({ username }).toArray();
    return users[0];
}
const addUser = async ({ username, password }) => {
    return mongo.getDB().collection('users').insertOne({ username, password });
}

module.exports.getAllUsers = getAllUsers;
module.exports.getUserByUsername = getUserByUsername;
module.exports.addUser = addUser;
