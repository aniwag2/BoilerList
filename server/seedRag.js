// server/seedRag.js
// One-off script to (re)populate the Chroma vector store with BoilerList FAQ docs,
// re-embedded with the current embeddings model. Run: node seedRag.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Chroma } = require("@langchain/community/vectorstores/chroma");
const { GoogleGenerativeAIEmbeddings } = require("@langchain/google-genai");

const COLLECTION_NAME = "BoilerListOfficialV2";

const embeddingsModel = new GoogleGenerativeAIEmbeddings({
    apiKey: process.env.GOOGLE_API_KEY,
    model: "gemini-embedding-001",
});

async function main() {
    const docsPath = path.join(__dirname, "rag-documents.json");
    const raw = JSON.parse(fs.readFileSync(docsPath, "utf-8"));

    const documents = raw.map((d) => ({
        pageContent: d.pageContent,
        metadata: d.metadata || {},
    }));
    const ids = raw.map((d) => d.id);

    const url = process.env.CHROMA_URL || "http://localhost:8000";
    console.log(`Seeding collection "${COLLECTION_NAME}" at ${url} with ${documents.length} docs...`);

    const vectorStore = new Chroma(embeddingsModel, {
        collectionName: COLLECTION_NAME,
        url,
    });

    await vectorStore.addDocuments(documents, { ids });

    console.log(`Done. Added ${documents.length} documents.`);
}

main().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
});
