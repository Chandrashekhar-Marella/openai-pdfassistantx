import { Pinecone } from '@pinecone-database/pinecone';

export const getPineconeClient = async () => {
  const apiKey = process.env.PINECONE_API_KEY;
  const environment = process.env.PINECONE_ENVIRONMENT;

  if (!apiKey) {
    throw Error('PINECONE_API_KEY is not set');
  } 

  const client = new Pinecone({
    environment: environment!,
    apiKey: apiKey!,
  });

  return client;
};
