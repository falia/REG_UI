import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  Topic: a
    .model({
      id: a.id(),
      title: a.string().required(),
      createdAt: a.datetime(),
      updatedAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),

  Message: a
    .model({
      id: a.id(),
      topicId: a.id().required(),
      content: a.string().required(),
      role: a.enum(['user', 'assistant']),
      sources: a.string().array(),
      createdAt: a.datetime(),
    })
    .authorization((allow) => [allow.owner()]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
  },
});