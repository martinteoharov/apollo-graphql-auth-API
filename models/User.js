const mongo = require('../db/mongoUtil');

const getUserByUsername = async ({ username }) => {
    const users = await mongo.getDB().collection('users').find({ username }).toArray();
    return users[0];
}
const addUser = async ({ username, password }) => {
    return mongo.getDB().collection('users').insertOne({ username, password });
}

module.exports.getUserByUsername = getUserByUsername;
module.exports.addUser = addUser;
