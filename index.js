/* Read: 
 *      [0]: https://www.apollographql.com/docs/apollo-server/security/authentication/
 *      [1]: https://www.apollographql.com/blog/setting-up-authentication-and-authorization-with-apollo-federation/
 */

const { ApolloServer, gql } = require('apollo-server');
const { User, Tracker } = require('./models/index');
const mongo = require('./db/mongoUtil');
const jwt = require('jsonwebtoken');

const jwtSecret = "asdasd";

// Establish connection to DB
mongo.init((err) => {
    if(err) console.log(`ERROR: ${ err }`);
    console.log('INFO: MongoDB Root Call Established...');
});

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = gql(`
    type User {
        username: String!
        password: String!
    }

    type Tracker {
        _id: String!
        username: String!
        name: String!
        startDate: String!
        endDate: String!
        timer: String!
    }

    type Query {
        getAllTrackers: [Tracker]
    }

    type Mutation {
        addTracker(name: String!, startDate: String!, endDate: String!, timer: String!): Tracker
        removeTracker(_id: String!): Boolean
        login(username: String!, password: String!): String
        register(username: String!, password: String!): String
    }
`);

const resolvers = {
    Query: {
        /* Get all the trackers for a specific user.. */
        getAllTrackers: async (parent, args, context) => {
            const trackers = await context.models.Tracker.getAllTrackers({ 'username': context.user.username });
            console.log('FETCH: getAllTrackers');
            return trackers;
        },
    },
    Mutation: {
        login: async (parent, args, context) => {
            // Find user in DB..
            const user = await context.models.User.getUserByUsername({ username: args.username });
            if(!user) return;
            if(user.password === args.password){
                // Generate JWT...
                const token = jwt.sign(user, jwtSecret);
                return token;
            }
            // TODO: Send error codes..
            return "Something failed, it's probably your fault dummy";
        },
        register: async (parent, args, context) => {
            const user = { username: args.username, password: args.password };
            // Add user to DB...
            const res = await context.models.User.addUser(user);
            // Generate JWT...
            const token = jwt.sign(user, jwtSecret);
            // TODO: Send error codes..
            return token || "Something failed, it's probably your fault dummy";
        },

        addTracker: async (parent, args, context) => {
            const tracker = await context.models.Tracker.addTracker({ username: context.user.username, name: args.name, startDate: args.startDate, endDate: args.endDate, timer: args.timer });
            return tracker;
        },

        removeTracker: async (parent, args, context) => {
            return !!(await context.models.Tracker.deleteTracker({ username: context.user.username, _id: args._id }));
        },
    }
}

const server = new ApolloServer({
    typeDefs, // GraphQL type defs
    resolvers, // Resolvers
    /*
     * The context object is one that gets passed to every single resolver at every level, so we 
     * can access it anywhere in our schema code. It’s where we can store things like data fetchers, 
     * database connections, and (conveniently) information about the user making the request
     * 
     * Additionally we can think of context as middleware ran before every resolver exec, so we do the
     * auth here
    */
    context: ({ req }) => {
        console.log(`REQUEST: Req Referer: ${ req.headers.referer }`);
        console.log(`REQUEST: Req Operation: ${ req.body.operationName }`);

        let user, token;
        const models = { models: { User, Tracker }};

        if(req.body.operationName === 'Login' || req.body.operationName === 'Register'){
            //console.log(`Return ${JSON.stringify({ ...models, user: null })}`);
            return { ...models, user: null };
        }

        if(req.headers.authorization){
            token = req.headers.authorization.split(' ')[1];
            try {
                user = jwt.verify(token, jwtSecret);
                console.log(`INFO: Decoded User: ${ JSON.stringify(user) }`);
                return { ...models, user:user };
            }
            catch (e){
                console.log(`ERROR: ${ e }`);
                return null;
            }
        }
    },
});

server.listen().then(({ url }) => {
    console.log(`INFO: Server Listening: ${url}...`);
});
