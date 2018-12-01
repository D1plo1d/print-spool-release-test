import {
  execute,
  parse,
  introspectionQuery,
} from 'graphql'
import { makeExecutableSchema } from 'graphql-tools'
import GraphQLJSON from 'graphql-type-json'
import { buildFullQueryFromIntrospection } from './graphQLFullQueryTools'

const snapshotTestResolvers = ({
  typeName,

  resolvers,
  typeDefs,

  rootValue,
  contextValue,
  variableValues,
}) => {
  const testFieldName = `_test${typeName}`

  const testSchema = makeExecutableSchema({
    typeDefs: [
      ...typeDefs,
      `
        extend type Query {
          ${testFieldName}: ${typeName}!
        }
      `,
    ],
    resolvers: {
      Query: {
        [testFieldName]: source => source,
      },
      [typeName]: resolvers[typeName],
      JSON: GraphQLJSON,
      // String: GraphQLStrictString,
    },
    resolverValidationOptions: {
      requireResolversForResolveType: false,
    },
  })

  const introspection = execute(
    testSchema,
    parse(introspectionQuery),
  )

  const allFieldsQuery = buildFullQueryFromIntrospection({
    introspection,
    queryRootFieldsFilter: field => field.name === testFieldName,
    depth: 2,
  })

  const { errors, data } = execute(
    testSchema,
    parse(allFieldsQuery),
    rootValue,
    contextValue,
    variableValues,
  )

  expect(errors).toEqual(undefined)
  expect(data).toMatchSnapshot()
}

export default snapshotTestResolvers
