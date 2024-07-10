import "dotenv/config";
import promptSync from "prompt-sync";
import promptSyncHistory from "prompt-sync-history";
import axios from "axios";
const prompt = promptSync({
    history: promptSyncHistory(), // open history file
});
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
} from "@google/generative-ai";

let apiKey;
if (!process.env.GEMINI_API_KEY) {
    apiKey = prompt("Enter your api key: ");
    // fs.writeFile("api_key.txt", apiKey, (err) => {
    //     if (err) throw err;
    // });
}

let parts;
let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://gnome-ai.vineetprash.workers.dev",
    headers: {},
};
await (async function () {
    try {
        const response = await axios.request(config);
        parts = response.data;
        console.log(response.data, typeof response.data);
    } catch (err) {
        console.log(err);
    }
})();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || apiKey);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
});
const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 64,
    maxOutputTokens: 2048,
    responseMimeType: "text/plain",
};

async function gnomeAi(prompt) {
    const part = { text: prompt };
    parts = [...parts, part];
    const result = await model.generateContent({
        contents: [{ role: "user", parts }],
        generationConfig,
    });
    return result.response.text();
}

while (true) {
    let input = prompt("Enter your prompt: ");
    if (input === "exit" || input === "x") {
        break;
    }
    let response = await gnomeAi(input || "i dont have anything to speak");
    parts = [...parts, { text: `output: ${response}` }];
    console.log("\n", response);
}
