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
        username: String!
        name: String!
        startDate: String!
        endDate: String!
        timer: String!
    }

    type Query {
        getAllUsers: [User]

        getAllTrackers: [Tracker]
    }

    type Mutation {
        addTracker(name: String!, startDate: String!, endDate: String!, timer: String!): Boolean
        removeTracker(startDate: String!): Boolean
        login(username: String!, password: String!): String
        register(username: String!, password: String!): String
    }
`);

const resolvers = {
    Query: {
        /* USER */
        getAllUsers: async (parent, args, context) => {
            return await context.models.User.getAllUsers();
        },

        /* Get all the trackers for a specific user.. */
        getAllTrackers: async (parent, args, context) => {
            return await context.models.Tracker.getAllTrackers({ 'username': context.user.username });
        },
    },
    Mutation: {

        /* AUTH */
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

        /* TRACKER */
        addTracker: async (parent, args, context) => {
            console.log(args);
            return !!(await context.models.Tracker.addTracker({ username: context.user.username, trackerName: args.name, startDate: args.startDate, endDate: args.endDate, timer: args.timer }));
        },
        removeTracker: async (parent, args, context) => {
            return await context.models.Tracker.addTracker({ username: context.user.username, startDate: args.startDate });
        },
    }
}

const server = new ApolloServer({
    // GraphQL type defs
    typeDefs,

    // Resolvers
    resolvers,

    /*
     * The context object is one that gets passed to every single resolver at every level, so we 
     * can access it anywhere in our schema code. It’s where we can store things like data fetchers, 
     * database connections, and (conveniently) information about the user making the request
     * 
     * Think of context as middleware ran before every resolver exec
    */
    context: ({ req }) => {
        console.log("REQUEST!");
        const token = req.headers.authorization.split(' ')[1].slice(0, -1);
        if(!token) return;

        // Try to get the user from the token...
        let user;
        try {
            user = jwt.verify(token, jwtSecret);
            console.log(user);
        }
        catch (e){
            console.log(`ERROR: ${e}`);
        }

        return { 
            user,
            models: {
                User: User,
                Tracker: Tracker,
            }
        };
    },
});

server.listen().then(({ url }) => {
    console.log(`INFO: Server Listening: ${url}...`);
});
