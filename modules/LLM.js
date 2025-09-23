import { GoogleGenerativeAI } from '@google/generative-ai';

// Part of the "Mouth"
// This class is a simple wrapper for the Gemini API.
// Its job is to take a prompt and context, and return a text response.
export class LLM {
    constructor(apiKey) {
        if (!apiKey) {
            console.warn("GEMINI_API_KEY is not set. LLM features will be disabled.");
            this.genAI = null;
            this.model = null;
            return;
        }
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });
    }

    /**
     * Generates a text response based on a prompt and system context.
     * @param {string} userPrompt The user's message or question.
     * @param {string} systemContext The context for the AI's persona.
     * @returns {Promise<string>} The generated text response.
     */
    async generateResponse(userPrompt, systemContext) {
        if (!this.model) {
            return "I can't think right now, my connection to my brain is offline.";
        }

        try {
            const payload = {
                contents: [{ parts: [{ text: userPrompt }] }],
                systemInstruction: {
                    parts: [{ text: systemContext }]
                },
            };

            const result = await this.model.generateContent(payload);
            const response = result.response;
            const text = response.text();
            return text;

        } catch (error) {
            console.error("Error generating response from Gemini API:", error);
            return "I'm having trouble thinking of a response right now.";
        }
    }
}
