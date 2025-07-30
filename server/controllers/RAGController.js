// server/controllers/RAGController.js
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { PromptTemplate } = require("@langchain/core/prompts");
const { RunnableSequence } = require("@langchain/core/runnables");
const chatController = require('./chatController'); // NEW: Import chatController

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
    const vectorStore = initializeVectorStore();
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

// --- MODIFIED FUNCTION: ragQuery to save messages ---
async function ragQuery(req, res) {
    try {
        const { query, chatId } = req.body; // NEW: Get chatId from request body
        const userId = req.user.id; // Get userId from auth middleware

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: User not authenticated for chat.' });
        }
        if (!chatId) {
            return res.status(400).json({ message: 'Chat ID is required for saving messages.' });
        }

        // 1. Save user message to DB
        await chatController.addMessageToChat(chatId, userId, 'user', query);

        // 2. Generate bot response
        const relevantDocuments = await initializeRetriever(query);
        const botResponse = await generateResponse(relevantDocuments, query);
        const botContent = botResponse.content;

        // 3. Save bot message to DB
        await chatController.addMessageToChat(chatId, userId, 'bot', botContent);

        res.json({ message: botContent }); // Send only the bot's content back to client
    } catch (error) {
        console.error('Error in RAG query or saving chat:', error);
        res.status(500).json({ message: 'Error with the internals of the Chatbot or saving history.' });
    }
};

module.exports = { ragQuery, addDocuments };