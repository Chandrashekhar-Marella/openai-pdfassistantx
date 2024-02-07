import { db } from '@/db';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf';
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { PineconeStore } from 'langchain/vectorstores/pinecone';
import { getPineconeClient } from '@/lib/pinecone';
import { metadata } from './../../layout';

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f( { pdf: { maxFileSize: '4MB' } } )
    .middleware( async ( { req } ) =>
    {
      const { getUser } = getKindeServerSession();
      const user = getUser();

      if ( !user || !user.id ) throw new Error( 'Unauthorized' );

      return { userId: user.id };
      return {};
    } )
    .onUploadComplete( async ( { metadata, file } ) =>
    {
      const createdFile = await db.file.create( {
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${ file.key }`,
          uploadStatus: 'PROCESSING',
        },
      } );

      // console.log('createdFile: ', createdFile);

      try
      {
        const response = await fetch(
          `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${ file.key }`
        );

        const blob = await response.blob();

        const loader = new PDFLoader( blob );

        const pageLevelDocs = await loader.load();

        const pagesAmt = pageLevelDocs.length;

        /*create and store the embeddings in the vectorStore*/
        try
        {
          const pinecone = await getPineconeClient();

          const embeddings = new OpenAIEmbeddings( {
            openAIApiKey: process.env.OPENAI_API_KEY,
          } );

          const pdfassistantxIndex = pinecone.Index( 'openai-pdfassistantx-index' );

          //embed the PDF documents
          await PineconeStore.fromDocuments( pageLevelDocs, embeddings, {
            pineconeIndex: pdfassistantxIndex,
            namespace: createdFile.id,
          } );
        } catch ( error )
        {
          console.log( "error ", error );
          throw new Error( "Failed to load your docs !" );
        }

        await db.file.update( {
          data: {
            uploadStatus: 'SUCCESS',
          },
          where: {
            id: createdFile.id,
          },
        } );
      } catch ( error )
      {
        console.log( error );
        await db.file.update( {
          data: {
            uploadStatus: 'FAILED',
          },
          where: {
            id: createdFile.id,
          },
        } );
      }
    } ),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
