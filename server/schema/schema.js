const gql = require('graphql');
const _ = require('lodash');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLSchema,
  GraphQLID,
  GraphQLInt,
  GraphQLList,
  GraphQLNonNull
} = gql;

const Book = require('../models/book');
const Author = require('../models/author');


// dummy data
const books = [
  { name: 'Book 1', genre: 'Fantasy', id: '1', authorId: '1' },
  { name: 'Book 2', genre: 'Sci-Fi', id: '2', authorId: '2' },
  { name: 'Book 3', genre: 'Religion', id: '3', authorId: '3' },
  { name: 'Book 4', genre: 'Religion', id: '4', authorId: '2' },
  { name: 'Book 5', genre: 'Religion', id: '5', authorId: '3' },
  { name: 'Book 6', genre: 'Religion', id: '6', authorId: '3' }

];

const authors = [
  { name: 'author 1', age: 33, id: '1' },
  { name: 'author 2', age: 43, id: '2' },
  { name: 'author 3', age: 50, id: '3' }
];

// schema file is used tofirstly define types
// and secondly to define relationships between types
// and thirdly define root Queries, whuch define how a user can jump into the graph.
const BookType = new GraphQLObjectType({
  name: 'Book',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    genre: { type: GraphQLString },
    author: {
      type: AuthorType,
      async resolve (parent, args) {
        // return _.find(authors, { id: parent.authorId });
        return await Author.findById(parent.authorId);
      }
    }
  })
});

const AuthorType = new GraphQLObjectType({
  name: 'Author',
  fields: () => ({ // wrapped in function so that after whole filw is parsed we execute it and no refernece error is thrown
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    age: { type: GraphQLInt },
    books: {
      type: new GraphQLList(BookType),
      async resolve (parent, args) {
        // return _.filter(books, { authorId: parent.id });
        return await Book.find({ authorId: parent.id });
      }
    }
  })
});

// args are what is passed when a query is made like so `book(id:"123") {}`
const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: { // will have all options that we have to jump into the graph
    book: {
      type: BookType,
      args: { id: { type: GraphQLID } }, // GraphQLID good for querting, but will be converted to string as defined in book in resolve function
      async resolve (parent, args) {
        // code to get data from db/other source
        // return _.find(books, { id: args.id });
        const foundBook = await Book.findById(args.id);

        return foundBook;
      }
    },
    author: {
      type: AuthorType,
      args: { id: { type: GraphQLID } },
      async resolve (parent, args) {
        // return _.find(authors, { id: args.id });
        const foundAuthor = await Author.findById(args.id);

        return foundAuthor;
      }
    },
    books: {
      type: new GraphQLList(BookType),
      async resolve (parent, args) {
        // return books;
        const allBooks = await Book.find({});

        return allBooks;
      }
    },
    authors: {
      type: new GraphQLList(AuthorType),
      async resolve (parent, args) {
        // return authors;
        const allAuthors = await Author.find({});

        return allAuthors;
      }
    }
  }
});

// Mutations are for adding and updating data.
const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addAuthor: {
      type: AuthorType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: GraphQLInt }
      },
      async resolve (parent, args) {
        const author = new Author ({
          name: args.name,
          age: args.age
        });
        const saved = await author.save();
        console.log('created an author with id: ', saved._id);

        return saved;
      }
    },

    addBook: {
      type: BookType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        genre: { type: GraphQLString },
        authorId: { type: new GraphQLNonNull(GraphQLID) }
      },
      async resolve (parent, args) {
        const book = new Book({
          name: args.name,
          genre: args.genre,
          authorId: args.authorId
        });
        const saved = await book.save();
        console.log('created a book with id: ', saved._id);

        return saved;
      }
    }
  }
});

// A GraphQL schema provides a root type for each kind of operation (like query, mutations).

module.exports = new GraphQLSchema ({
  query: RootQuery,
  mutation: Mutation
});