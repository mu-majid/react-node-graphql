const express = require('express');
const graphqlHTTP = require('express-graphql');
const mongoose = require('mongoose');
const cors = require('cors');

const schema = require('./schema/schema');
const { DB_URL } = require('./config');
const app = express();

mongoose.connect(DB_URL,{ useNewUrlParser: true } , (err) => {
  if(err) {
    console.log(err);
    process.exit(1);
  }
  console.log('Connected to database server.');

});

// allow cross-origin requests (coming from react server)
app.use(cors());

// used as middleware on a single route
// takes schema, that represent how our entities are related. and describes our graph
// so that our gql server know how to deal with queries sent to it.
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true // for testing purposes
}));


app.listen(4000, () => {
  console.log('Now listening on port 4000');
});