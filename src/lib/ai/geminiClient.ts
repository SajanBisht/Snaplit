import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("GEMINI_API_KEY is not defined");
}

const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

async function testPrompt() {
  try {
    const prompt = "Explain how AI works";
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    console.log("Gemini says:", text);
  } catch (error) {
    console.error("Error generating content:", error);
  }
}

// Call the function
testPrompt();

export default model;
