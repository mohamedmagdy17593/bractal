const { prisma } = require('./generated/prisma-client')
const { GraphQLServer } = require('graphql-yoga')

const resolvers = {
  Query: {
    todo(root, args, context) {
      return context.prisma.todo({ id: args.todoId })
    },
    todosByUser(root, args, context) {
      return context.prisma.user({
        id: args.userId
      }).todos()
    },
    getUsers(root, args, context) {
      return context.prisma.users({})
    },
  },
  Mutation: {
    createTodo(root, args, context) {
      return context.prisma.createTodo({
        title: args.data.title,
        description: args.data.description,
        author: {
          connect: { id: args.data.userId }
        },
      })
    },
    createUser(root, args, context) {
      return context.prisma.createUser(
        {
          name: args.data.name,
          password: args.data.password,
        },
      )
    },
    async Signin(root, args, context, info) {
      const user = await context.prisma.users({where:{name: args.data.name}})
      if (user[0].password == args.data.password) {
        return user[0];
      } else {
        throw "Incorrect password";
      }
    }
  },
  User: {
    todos(root, args, context) {
      return context.prisma.user({
        id: root.id
      }).todos()
    }
  },
  Todo: {
    author(root, args, context) {
      return context.prisma.todo({
        id: root.id
      }).author()
    }
  }
}

const server = new GraphQLServer({
  typeDefs: './schema.graphql',
  resolvers,
  context: {
    prisma
  },
})
server.start(() => console.log('Server is running on http://localhost:4000'))
