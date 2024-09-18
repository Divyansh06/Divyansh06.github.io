# GraphQL Notes

Notes in WIP

## What Is It?

- GraphQL is a query language for your API
- Uses Type system to define data (and thus a server-side runtime for executing queries)
- Backed by your existing code and data (i.e. not DB dependent)

Benefits
- More efficient - less roundtrips, multi-request/multi-resource requests are handled server side. Don't need to deal with multiple resource endpoints
- Client has control on what data is returned
- How to handle versioning: Can add new fields without removing the old ones, because we have a graph and we can flexibly grow the graph by adding more nodes

Cons
- Easier is resource exhaustion attacks (AKA Denial of Service attacks). 
E.g. (1) an overly complex queries that will consume all the resources of the server, requesting deep nested relationships (e.g. user -> friends -> friends …)
(2) use field aliases to ask for the same field many times
- Client data caching - can't use the query as key to cache as there can be overlap between keys. Can use a Graph Cache (see below)
- N+1 SQL queries - for each field requested, this can result in a new database request per resolved field (see: https://github.com/facebook/dataloader that tries to resolve this).

Mitigation
- Cost analysis on the query in advance and enforce some kind of limits on the amount of data one can consume. 
- Implement a time-out to kill requests that take too long to resolve
- Rate limiting at a lower level under GraphQL.
- Whitelisting endpoints (e.g. if internally consumable api)

Authentication & Authorisation
- This can be a layer behind GraphQL. GraphQL can be used by clients to pass tokens to

Graph Cache
- Normalize the query to flat collection of records (each record gets unique id), then the record can be cached instead of the full response.
- Note: Cyclic graph - this can happen if records reference eachother (Relay.js manages this)

DataLoader
- A utility one can use to read data from databases and make it available to GraphQL resolver functions. 
- DataLoader will act as our agent to reduce the SQL queries sent to the DB 
- Uses a combination of caching and batching (i.e. answers cached, queries batched)

## Example APIs

* http://graphql.org/swapi-graphql
* https://developer.github.com/v4/explorer
* https://www.graphqlhub.com/playground 

```
https://www.graphqlhub.com/playground?query=%23%20Hit%20the%20Play%20button%20above!%0A%23%20Hit%20%22Docs%22%20on%20the%20right%20to%20explore%20the%20API%0A%0A%7B%0A%20%20graphQLHub%0A%20%20twitter%20%7B%0A%20%20%20%20user%20(identifier%3A%20name%2C%20identity%3A%20%22clayallsopp%22)%20%7B%0A%20%20%20%20%20%20created_at%0A%20%20%20%20%20%20description%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20screen_name%0A%20%20%20%20%20%20name%0A%20%20%20%20%20%20profile_image_url%0A%20%20%20%20%20%20url%0A%20%20%20%20%20%20tweets_count%0A%20%20%20%20%20%20followers_count%0A%20%20%20%20%20%20tweets(limit%3A%201)%20%7B%0A%20%20%20%20%20%20%20%20text%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20tweet(id%3A%20%22687433440774459392%22)%20%7B%0A%20%20%20%20%20%20text%2C%0A%20%20%20%20%20%20retweets(limit%3A%202)%20%7B%0A%20%20%20%20%20%20%20%20id%2C%0A%20%20%20%20%20%20%20%20retweeted_status%20%7B%0A%20%20%20%20%20%20%20%20%20%20id%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%20%20user%20%7B%0A%20%20%20%20%20%20%20%20%20%20screen_name%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%20%20search(q%3A%20%22Javascript%22%2C%20count%3A%201%2C%20result_type%3A%20mixed)%20%7B%0A%20%20%20%20%20%20user%20%7B%0A%20%20%20%20%20%20%20%20screen_name%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20id%0A%20%20%20%20%20%20text%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D
```

Guide:
* https://developer.github.com/v4/guides/forming-calls/
* https://about.sourcegraph.com/graphql/graphql-at-twitter/

## Best Practises

- http://graphql.org/learn/thinking-in-graphs/
- http://graphql.org/learn/serving-over-http/
- http://graphql.org/learn/authorization/
- http://graphql.org/learn/pagination/
- http://graphql.org/learn/caching/

## Example

```
type Query {
  me: User
}

type User {
  id: ID
  name: String
}
```
```
function Query_me(request) {
  return request.auth.user;
}

function User_name(user) {
  return user.getName();
}
```

Query:
```
{
  me {
    name
  }
}
```

Result:
```
{
  "me": {
    "name": "Luke Skywalker"
  }
}
```

### Live Demo
http://graphql.org/swapi-graphql/

Request
```
{
  person(personID: 4) {
    name,
    birthYear,
    homeworld {
      name
    },
    filmConnection {
      films {
        title
      }
    }
  }
}
```
^ Notes
- persionID is an **argument**
- **sub-selection** of fields on an object

Response
```
{
  "data": {
    "person": {
      "name": "Darth Vader",
      "birthYear": "41.9BBY",
      "homeworld": {
        "name": "Tatooine"
      },
      "filmConnection": {
        "films": [
          {
            "title": "A New Hope"
          },
          {
            "title": "The Empire Strikes Back"
          },
          {
            "title": "Return of the Jedi"
          },
          {
            "title": "Revenge of the Sith"
          }
        ]
      }
    }
  }
}
```

The Query: http://graphql.org/swapi-graphql/?query=%7B%0A%20%20person(personID%3A%204)%20%7B%0A%20%20%20%20name%2C%0A%20%20%20%20birthYear%2C%0A%20%20%20%20homeworld%20%7B%0A%20%20%20%20%20%20name%0A%20%20%20%20%7D%2C%0A%20%20%20%20filmConnection%20%7B%0A%20%20%20%20%20%20films%20%7B%0A%20%20%20%20%20%20%20%20title%0A%20%20%20%20%20%20%7D%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D&operationName=null

## Aliases

When you want to name the resulting field e.g. when fields may conflict

Query:
```
{
  empireHero: hero(episode: EMPIRE) {
    name
  }
  jediHero: hero(episode: JEDI) {
    name
  }
}
```
Result:
```
{
  "data": {
    "empireHero": {
      "name": "Luke Skywalker"
    },
    "jediHero": {
      "name": "R2-D2"
    }
  }
}
```

## Fragments

When: Want to split complicated application data requirements into smaller chunks
e.g. when combining UI components with different fragments into one data fetch

Request

```
{
  leftComparison: hero(episode: EMPIRE) {
    ...comparisonFields
  }
  rightComparison: hero(episode: JEDI) {
    ...comparisonFields
  }
}

fragment comparisonFields on Character {
  name
  appearsIn
  friends {
    name
  }
}
```

Result
```
{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        },
        {
          "name": "C-3PO"
        },
        {
          "name": "R2-D2"
        }
      ]
    },
    "rightComparison": {
      "name": "R2-D2",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

## Operation Name

Operation Types:
- query
- mutation
- subscription

When: In production, to make query less ambiguous

Why:
- Easier to debug
- Easier to see in logs

Query:
```
query HeroNameAndFriends {
  hero {
    name
    friends {
      name
    }
  }
}
```

Result
```
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

## Variables

When: Handling dynamic arguments 
e.g. selecting an item in a dropdown

Query
```
query HeroNameAndFriends($episode: Episode) {
  hero(episode: $episode) {
    name
    friends {
      name
    }
  }
}
```

Result
```
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

Declared variables - must be either scalars, enums, or input object types

Optional variable
```
query ($episode: Episode) { 
  ... 
}
```

Mandatory variable
```
query ($episode: Episode!) {
  ...
}
```

Default Variable

```
query HeroNameAndFriends($episode: Episode = "JEDI") {
  hero(episode: $episode) {
    ...
  }
}
```

Passing input type
```
mutation {
  createMessage(input: {
    author: "andy",
    content: "hope is a good thing",
  }) {
    id
  }
}
```

## Directives

When: Add/Remove fields from your query

Can be attached to a field or fragment

```
@include(if: Boolean) Only include this field in the result if the argument is true.
@skip(if: Boolean) Skip this field if the argument is true.
```

Query
```
query Hero($episode: Episode, $withFriends: Boolean!) {
  hero(episode: $episode) {
    name
    friends @include(if: $withFriends) {
      name
    }
  }
}
```

Response
```
{
  "data": {
    "hero": {
      "name": "R2-D2"
    }
  }
}
```

## Mutations

When: Modifying server-side data

Mutation field returns an object type, you can ask for nested fields (e.g. when you want to see the result of an update)

```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

Variables
```
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
```

Result
```
{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```
### Multiple fields in mutations

**Query** fields are executed in parallel
**Mutation** fields run in series, one after the other

## Inline Fragments

When: `to access data on the underlying concrete type` (inheritance - field on concrete type)

Query

```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
    ... on Human {
      height
    }
  }
}
```

Variable
```
{
  "ep": "JEDI"
}
```

Result
```
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "primaryFunction": "Astromech"
    }
  }
}
```
^ Notes:
- Return type: Character
- Character can be either Droid or Human
- "name" field - is common to Character
- specific fields - primaryFunction / height, are specific to the concrete type

## Meta Fields

When: Want to know specific details

E.g. `__typename` metafield to know what object type is returned

Query
```
{
  search(text: "an") {
    __typename
    ... on Human {
      name
    }
    ... on Droid {
      name
    }
    ... on Starship {
      name
    }
  }
}
```

Result
```
{
  "data": {
    "search": [
      {
        "__typename": "Human",
        "name": "Han Solo"
      },
      {
        "__typename": "Human",
        "name": "Leia Organa"
      },
      {
        "__typename": "Starship",
        "name": "TIE Advanced x1"
      }
    ]
  }
}
```

## Schemas and Types

### Type System

Schema
- what fields can be selected
- What kinds of objects might be returned
- What fields are available on those sub-objects

### Type Language

"GraphQL schema language" - like the query language
Allows us to talk about GraphQL schemas in a language-agnostic way.

### Object Types and Fields

#### Schema

```
type Character {
  name: String!
  appearsIn: [Episode]!
}
```

Notes:
- object type - `Character`
- fields - `name`, `appearsIn`
- scalar type - `String`
- non-nullable - `!` in `String!` and `[Episode]`
- array - `[Episode]!` (as non-nullable array, an array of zero-or-more elements is returned)

#### Arguments

```
type Starship {
  id: ID!
  name: String!
  length(unit: LengthUnit = METER): Float
}
```
^ Notes: 
- Can have zero or more args
- arguments must be **named** e.g. `unit`
- default value e.g. `METER`

#### Query and Mutation Types

Define the entry point of every GraphQL query

```
schema {
  query: Query
  mutation: Mutation
}
```

#### Scalar Types

The leaves of the query

- Int: A signed 32‐bit integer.
- Float: A signed double-precision floating-point value.
- String: A UTF‐8 character sequence.
- Boolean: true or false.
- ID: unique identifier, used to refetch an object or as the key for a cache. Serialized in the same way as a String (not intended to be human‐readable)

**Custom Scalar Types** 
e.g.
```
scalar Date
```
^ the implementation defines how that type should be serialized, deserialized e.g. `Date` could be serialized as integer timestamp

#### Enumeration Types

Example:
```
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```
#### Lists and Non-Null

Exmaple:
```
type Character {
  name: String!
  appearsIn: [Episode]!
}
```
`!` indicates the field is non-null

List of non-null strings:

```
myField: [String!]
```
^ List can be null, but the items must be non-null strings

```
myField: null // valid
myField: [] // valid
myField: ['a', 'b'] // valid
myField: ['a', null, 'b'] // error
```

Non-null list
```
myField: [String]!
```
```
myField: null // error
myField: [] // valid
myField: ['a', 'b'] // valid
myField: ['a', null, 'b'] // valid
```

#### Interfaces

Character Interface
```
interface Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
}
```

Implementations

```
type Human implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  starships: [Starship]
  totalCredits: Int
}

type Droid implements Character {
  id: ID!
  name: String!
  friends: [Character]
  appearsIn: [Episode]!
  primaryFunction: String
}
```

Asking for fields that exist on specific implementation
```
query HeroForEpisode($ep: Episode!) {
  hero(episode: $ep) {
    name
    ... on Droid {
      primaryFunction
    }
  }
}
```

#### Union Types

Example
```
union SearchResult = Human | Droid | Starship
```
^ Must be concrete object types

Query
```
{
  search(text: "an") {
    ... on Human {
      name
      height
    }
    ... on Droid {
      name
      primaryFunction
    }
    ... on Starship {
      name
      length
    }
  }
}
```

#### Input Types

Can also pass in complex types - need keyword `Input`

```
input ReviewInput {
  stars: Int!
  commentary: String
}
```

Use `ReviewInput` 
```
mutation CreateReviewForEpisode($ep: Episode!, $review: ReviewInput!) {
  createReview(episode: $ep, review: $review) {
    stars
    commentary
  }
}
```

Variables
```
{
  "ep": "JEDI",
  "review": {
    "stars": 5,
    "commentary": "This is a great movie!"
  }
}
```

Result
```
{
  "data": {
    "createReview": {
      "stars": 5,
      "commentary": "This is a great movie!"
    }
  }
}
```
^ Notes:
- fields on an input object type can refer to input object types
- can't mix input and output types in your schema
- Input object types can't have arguments on their fields

## Validation

Example of invalid cases: https://github.com/graphql/graphql-js/blob/master/src/__tests__/starWarsValidation-test.js

(1) Cyclic references
Example: A fragment cannot refer to itself or create a cycle, as this could result in an unbounded result

```
{
  hero {
    ...NameAndAppearancesAndFriends
  }
}

fragment NameAndAppearancesAndFriends on Character {
  name
  appearsIn
  friends {
    ...NameAndAppearancesAndFriends
  }
}
```
(2) Fields that don't exist

```
{
  hero {
    favoriteSpaceship
  }
}
```
(3) Must specify which fields returned

```
{
  hero
}
```
(4) Cannot query fields on a scalar

Exmaple: name is a scalar
```
{
  hero {
    name {
      firstCharacterOfName
    }
  }
}
```

(5) Can't query fields that exist on implementation

Example: `primaryFunction` does not exist
```
{
  hero {
    name
    primaryFunction
  }
}
```

**Valid** request: request the fields on `Droid`
```
{
  hero {
    name
    ...DroidFields
  }
}

fragment DroidFields on Droid {
  primaryFunction
}
```

^ Refactored (as this is not used more than once)
```
{
  hero {
    name
    ... on Droid {
      primaryFunction
    }
  }
}
```
Code on validation: https://github.com/graphql/graphql-js/blob/master/src/validation

## Execution

GraphQL query is executed by a GraphQL server 
Each field on each type is backed by a function called the `resolver`

### Root fields & resolvers

Top level is **Root** / **Query** type

JS Example:
```
Query: {
  human(obj, args, context) {
    return context.db.loadHumanByID(args.id).then(
      userData => new Human(userData)
    )
  }
}
```

Resolver Args

- obj - The previous object, which for a field on the root Query type is often not used.
- args - The arguments provided to the field in the GraphQL query.
- context - A value provided to the resolver and holds contextual info e.g logged in user, or access to a database.

### Asynchronous resolvers

Example:

```
human(obj, args, context) {
  return context.db.loadHumanByID(args.id).then(
    userData => new Human(userData)
  )
}
```

- context - provides access to DB for lookup
- DB is async operation, which returns a `Promise` (Futures/Tasks/Deferred)
- During execution, GraphQL will wait for Promises, Futures, and Tasks to complete before continuing and will do so with optimal concurrency

### Trivial Resolvers

Example: Human object to have a name property which we can read and return directly
```
Human: {
  name(obj, args, context) {
    return obj.name
  }
}
```

GraphQL libraries will let you omit resolvers this simple 
Assume that if a resolver isn't provided for a field, that a property of the same name should be read and returned


### Scalar coercion

The **type system** knows what to expect and converts values returned by a resolver function into something that upholds the API contract

```
Each item in the list was coerced to the appropriate enum value
```

Example: Enums Resolver

```
Human: {
  appearsIn(obj) {
    return obj.appearsIn // returns [ 4, 5, 6 ]
  }
}
```
Where `apearsIn` is an Enum

```
enum Episode {
  NEWHOPE
  EMPIRE
  JEDI
}
```

^ The function returns numbers, but results returned (from example above) return enums

E.g.

```
{
  "data": {
    "leftComparison": {
      "name": "Luke Skywalker",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "friends": [
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        },
        {
          "name": "C-3PO"
        },
        {
          "name": "R2-D2"
        }
      ]
    },
    ...
 }
 ```
 
### List resolvers

```
Human: {
  starships(obj, args, context) {
    return obj.starshipIDs.map(
      id => context.db.loadStarshipByID(id).then(
        shipData => new Starship(shipData)
      )
    )
  }
}
```
^ The resolver returns a **list** of Promises

GraphQL will wait for all of these Promises concurrently before continuing
When left with a list of objects, it will concurrently continue to load the name field on each of these items.

### Producing the result

A **key-value** map is used to store each resolved field

Key: field name (or alias)

Value: resolved value

Resolved bottom up (leaves to the root of the query)

Example:

Query

```
{
  human(id: 1002) {
    name
    appearsIn
    starships {
      name
    }
  }
}
```

Result

```
{
  "data": {
    "human": {
      "name": "Han Solo",
      "appearsIn": [
        "NEWHOPE",
        "EMPIRE",
        "JEDI"
      ],
      "starships": [
        {
          "name": "Millenium Falcon"
        },
        {
          "name": "Imperial shuttle"
        }
      ]
    }
  }
}
```

## Introspection

When: Ask a GraphQL schema for information about what queries it supports

Example of queries for the introspection system:

https://github.com/graphql/graphql-js/blob/master/src/__tests__/starWarsIntrospection-test.js

Query the `__schema` field

```
{
  __schema {
    types {
      name
    }
  }
}
```

Result

```
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Query"
        },
        {
          "name": "Episode"
        },
        {
          "name": "Character"
        },
        {
          "name": "ID"
        },
        {
          "name": "String"
        },
        {
          "name": "Int"
        },
        {
          "name": "FriendsConnection"
        },
        {
          "name": "FriendsEdge"
        },
        {
          "name": "PageInfo"
        },
        {
          "name": "Boolean"
        },
        {
          "name": "Review"
        },
        {
          "name": "SearchResult"
        },
        {
          "name": "Human"
        },
        {
          "name": "LengthUnit"
        },
        {
          "name": "Float"
        },
        {
          "name": "Starship"
        },
        {
          "name": "Droid"
        },
        {
          "name": "Mutation"
        },
        {
          "name": "ReviewInput"
        },
        {
          "name": "__Schema"
        },
        {
          "name": "__Type"
        },
        {
          "name": "__TypeKind"
        },
        {
          "name": "__Field"
        },
        {
          "name": "__InputValue"
        },
        {
          "name": "__EnumValue"
        },
        {
          "name": "__Directive"
        },
        {
          "name": "__DirectiveLocation"
        }
      ]
    }
  }
}
```

Notes

- `__Schema`, `__Type`, `__TypeKind`, `__Field`, `__InputValue`, `__EnumValue`, `__Directive`: These start with a double underscore - they are part of the introspection system.


Example queries


(1) Ask for Query types

```
{
  __schema {
    queryType {
      name
    }
  }
}
```

Result

```
{
  "data": {
    "__schema": {
      "queryType": {
        "name": "Query"
      }
    }
  }
}
```

(2) Look at specific type - name and "kind" (i.e. interface or object?)

```
{
  __type(name: "Droid") {
    name
    kind
  }
}
```

Result

```
{
  "data": {
    "__type": {
      "name": "Droid",
      "kind": "OBJECT"
    }
  }
}
```
`kind` returns a `__TypeKind` - `INTERFACE`, `OBJECT` are values in the Enum

(3) Ask for details on fields

```
{
  __type(name: "Droid") {
    name
    fields {
      name
      type {
        name
        kind
      }
    }
  }
}
```

Result

```
{
  "data": {
    "__type": {
      "name": "Droid",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "name",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "friends",
          "type": {
            "name": null,
            "kind": "LIST"
          }
        },
        {
          "name": "friendsConnection",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "appearsIn",
          "type": {
            "name": null,
            "kind": "NON_NULL"
          }
        },
        {
          "name": "primaryFunction",
          "type": {
            "name": "String",
            "kind": "SCALAR"
          }
        }
      ]
    }
  }
}
```

Looking at `id`

```
{
  "name": "id",
  "type": {
    "name": null,
    "kind": "NON_NULL"
   }
}
```

^ `name` is `null` - this is because it's a `"wrapper"` type of kind `NON_NULL`

Query `ofType` on that field's type which returns `ID`

```
ofType {
  name
  kind
}
```

Example:

```
{
  __type(name: "Droid") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```

Result

```
"ofType": {
  "name": "ID",
  "kind": "SCALAR"
}
```
From:

```
{
  "data": {
    "__type": {
      "name": "Droid",
      "fields": [
        {
          "name": "id",
          "type": {
            "name": null,
            "kind": "NON_NULL",
            "ofType": {
              "name": "ID",
              "kind": "SCALAR"
            }
          }
        },
        ...
      ]
    }
  }
}        
```
(4) Ask for docs

```
{
  __type(name: "Droid") {
    name
    description
  }
}
```

Result

```
{
  "data": {
    "__type": {
      "name": "Droid",
      "description": "An autonomous mechanical character in the Star Wars universe"
    }
  }
}
```

## Best Practises

network, authorization, and pagination

### JSON with GZIP

Better performance using gzip
```
Accept-Encoding: gzip
```

### Versioning

It's not required, as the api is evolutionary
Why: GraphQL only returns the data that's explicitly requested. Can add new fields without breaking changes

### Nullability

Every field is nullable by default
If there are issues with downstream systems, particular fields could be returned as "null" - i.e. failure not thrown

GraphQL provides non-null variants of types - the field will never return "null" when an error, the previous parent field will be "null" instead.

### Pagination

Fields that could return long lists accept arguments "first" and "after" - "after" is a unique identifier of each of the values in the list.

"Connections" - best practice pattern for pagination

Example tools that use the "Connections" pattern
- https://facebook.github.io/relay/

More details on pagination
- http://graphql.org/learn/pagination/

### Server-side Batching & Caching

For performance reasons and address repeated requests to backend db/services

Batching - multiple requests for data are requested in a single request to an underlying database/microservice. FB's `DataLoader` can be used for this.

### Thinking in Graphs

```
Business Domain - you model your business domain as a graph
```

Model your business domain as a graph by defining a schema; 
Define different types of nodes and how they connect/relate to one another

#### Shared Language

Name things intiuitively - for a shared understanding and consensus of these business domain rules 

#### Business Logic Layer

```
Single source of truth for enforcing business domain rules
```

E.g. business logic, validation, authentication

![http://graphql.org/img/diagrams/business_layer.png](http://graphql.org/img/diagrams/business_layer.png)

Entry points to the system - REST / GraphQL / RPC 

#### Legacy data

```
GraphQL schema that describes how clients use the data
```

- Avoid mirroring the legacy database schema
- "what" rather than "how"

#### Keep iterating

Build only the part of the schema that you need for one scenario at a time. Then gradually expand the schema

### Serving over HTTP

GraphQL usually served over HTTP

#### Web Request Pipeline

Flow:

```
Request -> Auth / Filters / Transformers -> GraphQL 
```

Auth/Filters/Transformers - middleware 

#### URIs, Routes

```
GraphQL's conceptual model is an entity graph
```

GraphQL server operates on a single URL/endpoint, usually /graphql

#### HTTP Methods, Headers, and Body

HTTP Methods handled - GET and POST

##### GET request

`"Query"` indicates GET request

```
{
  me {
    name
  }
}
```

`http://myapi/graphql?query={me{name}}`

`variables` - Query Variables are sent as JSON-encoded string (optional)
`operationName` - which named operation is to be executed (optional)

##### POST request

Content-Type: `application/json`

```
{
  "query": "...",
  "operationName": "...",
  "variables": { "myVariable": "someValue", ... }
}
```

`operationName` - optional

`variables` - optional

`query` - if defined, should act same way as `GET`

`"application/graphql"` - HTTP POST body contents as the GraphQL query string

##### Response

Resonses always in JSON

Response fields `data` (and `errors` if present)

```
{
  "data": { ... },
  "errors": [ ... ]
}
```

##### GraphiQL

Testing and Dev

If using `express-graphql`

```
app.use('/graphql', graphqlHTTP({
  schema: MySessionAwareGraphQLSchema,
  graphiql: process.env.NODE_ENV === 'development',
}));
```

##### Node

- https://github.com/graphql/express-graphql
- https://github.com/apollostack/graphql-server

### Authorisation

```
Delegate authorization logic to the business logic layer
```

Why: to have a single source of truth for authorization

```
//Authorization logic lives inside postRepository
var postRepository = require('postRepository');

var postType = new GraphQLObjectType({
  name: ‘Post’,
  fields: {
    body: {
      type: GraphQLString,
      resolve: (post, args, context, { rootValue }) => {
        return postRepository.getBody(context.user, post);
      }
    }
  }
});
```
^ User object should be populated on the `context` argument or `rootValue`

Should: pass a `fully-hydrated` User object instead of an opaque token or API key to your business logic layer (e.g. current user)

### Pagination

Pagination Models

How relationships are expressed in GraphQL:

- Plurals
- Slicing
- Pagination & Edges
- End-of-list, counts, and Connections
- Connection Model

#### Plurals

Example: Requesting `friends`

```
{
  hero {
    name
    friends {
      name
    }
  }
}
```

Result:

```
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friends": [
        {
          "name": "Luke Skywalker"
        },
        {
          "name": "Han Solo"
        },
        {
          "name": "Leia Organa"
        }
      ]
    }
  }
}
```

#### Slicing

Limiting number of results returned

e.g.

```
{
  hero {
    name
    friends(first:2) {
      name
    }
  }
}
```

### Pagination & Edges

Methods:

- `friends(first:2 offset:2)` - next 2 in the list
- `friends(first:2 after:$friendId)` - 2 after a specific friend
- `friends(first:2 after:$friendCursor)` - (`cursor-based pagination`) using cursor from the last item (used for pagination)


`cursors` should be base64 encoded

To model a cursor:

- This belongs on an `edge` (not on the User object)

```
{
  hero {
    name
    friends(first:2) {
      edges {
        node {
          name
        }
        cursor
      }
    }
  }
}
```

### End-of-list, counts, and Connections 

To indicate 

- When we've reached the end
- Total number

Object -> Connection -> Edges

```
{
  hero {
    name
    friends(first:2) {
      totalCount
      edges {
        node {
          name
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
```

```
Object
|
|- Connection
		|
		|- totalCount
		|
		|- edges
		|	|- node
		|	|- cursor
		|
		|- pageInfo
			|- endCursor
			|- hasNextPage
			
```

`PageInfo` might also have `startCursor` and `endCursor`

### Connection Model

Object -> Connection -> Edges

Connection - `friendsConnection`

Example:

```
{
  hero {
    name
    friendsConnection(first:2 after:"Y3Vyc29yMQ==") {
      totalCount
      edges {
        node {
          name
        }
        cursor
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
}
```

Result:

```
{
  "data": {
    "hero": {
      "name": "R2-D2",
      "friendsConnection": {
        "totalCount": 3,
        "edges": [
          {
            "node": {
              "name": "Han Solo"
            },
            "cursor": "Y3Vyc29yMg=="
          },
          {
            "node": {
              "name": "Leia Organa"
            },
            "cursor": "Y3Vyc29yMw=="
          }
        ],
        "pageInfo": {
          "endCursor": "Y3Vyc29yMw==",
          "hasNextPage": false
        }
      }
    }
  }
}
```

### Caching

GraphQL does not have an endpoint for fetching specific resources (like in REST API), so cannot cache the response

Use an **opaque** `globally unique id` (`UUIDs`) for clients to use for caching

i.e. so Clients can cache what is returned to them

#### Globally Unique IDs

Some techniques:

- reuse UUID in the backend
- ID_type
- Base64 encoding the ID

e.g. of request

```
{
  starship(id:"3003") {
    id
    name
  }
  droid(id:"2001") {
    id
    name
    friends {
      id
      name
    }
  }
}
```

#### Compatibility with existing APIs

How to pass the ID to the backend that it can understand

How - can have a field for the old id e.g. `previousApiId`

#### Alternatives

```
Aim: The client needs to derive a globally unique identifier for their caching
```

2 methods:

- server derives the id
- the client derives the id (query with the `id` and `__typename`)



# Resources

Official

- https://github.com/facebook/graphql
- https://code.facebook.com/projects/1185927624774996/express-graphql/
- https://code.facebook.com/projects/975632519217066/graphql-js/

Libraries

- http://graphql.org/code/#elixir
- GraphQL Elixir
  - http://graphql-elixir.org/
  - https://github.com/graphql-elixir/graphql
- absinthe-graphql
  - https://hexdocs.pm/absinthe/overview.html
  - http://absinthe-graphql.org/
  - https://github.com/absinthe-graphql/absinthe

Others

- https://www.howtographql.com/ 
- https://www.pluralsight.com/blog/software-development/react-graphql-and-relay
- https://app.pluralsight.com/library/courses/graphql-scalable-apis/table-of-contents
- https://medium.freecodecamp.org/rest-apis-are-rest-in-peace-apis-long-live-graphql-d412e559d8e4
- https://code.tutsplus.com/tutorials/what-is-graphql--cms-29271
- https://code.tutsplus.com/tutorials/wrangling-with-the-facebook-graph-api--net-23059
- https://code.facebook.com/posts/1691455094417024/graphql-a-data-query-language/
- https://building.buildkite.com/tutorial-getting-started-with-graphql-queries-and-mutations-11211dfe5d64
- https://medium.com/graphql-mastery/graphql-quick-tip-how-to-pass-variables-into-a-mutation-in-graphiql-23ecff4add57

GraphiQL

- Demo - http://graphql.org/swapi-graphql/
- https://github.com/skevy/graphiql-app
- https://medium.com/the-graphqlhub/graphiql-graphql-s-killer-app-9896242b2125
- https://medium.com/graphql-mastery/graphql-quick-tip-how-to-pass-variables-into-a-mutation-in-graphiql-23ecff4add57

Relay.js

- https://facebook.github.io/relay/
- http://facebook.github.io/relay/docs/en/thinking-in-relay.html

DataLoader

- https://github.com/facebook/dataloader

Example APIs/Projects

- http://graphql.org/swapi-graphql/
- https://github.com/graphql/swapi-graphql
- https://github.com/a7v8x/express-graphql-demo
