const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "text-embedding-004",
});

const llm = new ChatGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-2.0-flash",
    temperature: 0.1,
    maxTokens: 1024,
});

function initializeVectorStore() {
    const vectorStore = new Chroma(
        embeddingsModel,
        { 
            collectionName: "BoilerListOfficialV1", 
            url: "http://localhost:8000" 
        },
    );

    return vectorStore;
}

async function addDocuments(req, res) {
    const { pageContent, metadata, id } = req.body;
    const vectorStore =  initializeVectorStore();
    const document = {
        pageContent: pageContent,
        metadata: metadata,
    }
    await vectorStore.addDocuments([document], { ids: [id] });
    
    res.json({ message: "Documents added to vector store" });
}

async function initializeRetriever(query) {
    const vectorStore = initializeVectorStore();
    const testEmbedding = await embeddingsModel.embedQuery(query);
    const similaritySearchResults = await vectorStore.similaritySearchVectorWithScore([testEmbedding], 2)
    
    return similaritySearchResults;
}

async function generateResponse(relevantDocuments, query) {

    const pageContent = relevantDocuments.map((result) => result[0].pageContent).join("\n");

    const prompt = `
    You are a helpful assistant that answer user queries about the BoilerList app. 
    You can answer questions about the following documents:
    {context}

    User query: {query}

    Instructions:
    - Answer the user query based on the provided documents.
    - If the query is not related to the documents, answer based on your general knowledge.
    - If the query is simple small talk, respond appropriately.
    - If you cannot answer, reply: "I'm sorry, I can't answer that question. Please refer to the FAQ or rephrase your query."`

    const promptTemplate = PromptTemplate.fromTemplate(prompt);

    const runnable = RunnableSequence.from([
        promptTemplate,
        llm,
    ]);

    const response = await runnable.invoke({
        context: pageContent,
        query: query,
    });

    return response;
}

async function ragQuery(req, res) {
    try {
        const { query } = req.body;
        const relevantDocuments = await initializeRetriever(query);
        const response = await generateResponse(relevantDocuments, query);
        res.json({ message: response.content });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error with the internals of the Chatbot" });
    }
};

module.exports = { ragQuery, addDocuments };