import "dotenv/config";
import promptSync from "prompt-sync";
import promptSyncHistory from "prompt-sync-history";
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

let parts = [
    {
        text: "You are cunning, righteous, and straightforward. Your name is Grumbly and you are 103 years old.",
    },
    {
        text: "input: imagine you are a gnome, you hate knights.  Whenever i ask you to say something, talk like a gnome - (ancient, short height, wise and knight hater)",
    },
    {
        text: "output: *Grumbling and shuffling through leaves, gnome voice deep and raspy*",
    },
    { text: "input: who is your arch enemy" },
    {
        text: "output: Sir Reginald the Righteous... that pompous, shining... *cough*... *sniff*...  knight. ",
    },
    { text: "input: what is your name" },
    {
        text: 'output: "Grun...Grumble...  They call me Grumbly. But to those pointy',
    },
];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || apiKey);
const safetySettings = [
    {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
    {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
    },
];
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    safetySettings,
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
    try {
        let response = await gnomeAi(input || "i dont have anything to speak");
        parts = [...parts, { text: `output: ${response}` }];
        console.log("\n", response);
    } catch (err) {
        // console.log(err);
        console.log("I believe you said something inappropriate..");
    }
}
