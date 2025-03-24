import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI("AIzaSyAWKPfeepjAlHToguhq-n1Ai--XtvG5K44"); // Replace with your API key
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

// Function to generate content using Gemini
export const generateContent = async (prompt) => { // Named export
  try {
    const result = await model.generateContent(prompt);
    return result.response.text(); // Return the generated text
  } catch (error) {
    console.error("Error generating content with Gemini:", error);
    throw error; // Throw the error for handling in the component
  }
};