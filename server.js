const { ApolloServer } = require('apollo-server');
const mongoose = require('mongoose');
require('dotenv').config();

const typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const { findOrCreateUser } = require('./controllers/userController');

mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true })
  // eslint-disable-next-line no-console
  .then(() => console.log('DB connected!'))
  // eslint-disable-next-line no-console
  .catch(err => console.error(err));

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    let authToken = null;
    let currentUser = null;
    try {
      if (req && req.headers && req.headers.authorization) {
               authToken = req.headers.authorization;
        currentUser = await findOrCreateUser(authToken);
      }
    } catch (err) {
      console.error(`Unable to authenticate user with token ${authToken}`);
      console.error(err);
    }
    return { currentUser };
  },
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`Server listening on ${url}`);
});

/*
Google, mongo, mapbox, cloudary
*/
