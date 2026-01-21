import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * Generates content from text prompt
 * @param {string} prompt 
 * @returns {Promise<string>}
 */
export const generateAIResponse = async (prompt) => {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("AI Error:", error);
        return "Error: Unable to generate response. Please check your API key or try again.";
    }
};

/**
 * Generates summary/answer from long text (document context)
 * @param {string} context - The document text
 * @param {string} question - User question
 * @returns {Promise<string>}
 */
export const askDocument = async (context, question) => {
    const prompt = `
  You are an intelligent study assistant.
  Base your answer STRICTLY on the following provided content. 
  If the answer is not in the context, say "I cannot find the answer in the document."
  
  CONTEXT:
  ${context.substring(0, 30000)} {/* Limit context to avoid token limits for now, though 1.5 flash handles 1M */}
  
  QUESTION: 
  ${question}
  
  Answer in markdown format. keep it concise and clear.
  `;
    return generateAIResponse(prompt);
};

/**
 * Generates summary from multiple contexts (Websites)
 * @param {string} context 
 */
export const summarizeContext = async (context) => {
    const prompt = `
    Summarize the following content into key takeaways, important points, and a brief overview.
    Format with clearer headers and bullet points.
    
    CONTENT:
    ${context}
    `;
    return generateAIResponse(prompt);
};
