import 'dotenv/config';
import { MindiBot } from './modules/Bot.js';
import { Brain } from './modules/Brain.js';
import { DiscordBot } from './modules/Discord.js';
import { LLM } from './modules/LLM.js';

// --- Main Application Setup ---

console.log(" MindiBot is starting up... ");

// 1. Initialize all the core modules
const llm = new LLM(process.env.GEMINI_API_KEY);
const discord = new DiscordBot(process.env.DISCORD_BOT_TOKEN, process.env.DISCORD_CHANNEL_ID);
const bot = new MindiBot({
    host: process.env.MC_HOST,
    port: parseInt(process.env.MC_PORT),
    username: process.env.MC_USERNAME,
    auth: process.env.MC_AUTH || undefined,
});
const brain = new Brain(bot, discord, llm);


// 2. Wire up the event-driven connections between modules
// This is the "nervous system" of our AI.

// -- Connections from Bot (Body) to Brain --
bot.on('botSpawn', () => {
    console.log("Event: Bot has spawned. Informing brain.");
    brain.onBotSpawn();
});

bot.on('chat', (username, message) => {
    // Ignore self
    if (username === bot.mc?.username) return;
    console.log(`Event: Received in-game chat from ${username}. Informing brain.`);
    brain.onChatMessage(username, message);
});

bot.on('error', (err) => {
    console.error("A critical error occurred in the Minecraft bot:", err);
});

// -- Connections from Discord (Ears) to Brain --
discord.on('command', (user, command, args) => {
    console.log(`Event: Received Discord command '${command}' from ${user}. Informing brain.`);
    brain.onDiscordCommand(user, command, args);
});


// 3. Start the application
async function start() {
    try {
        await discord.connect();
        // The bot connects automatically on instantiation.
        // The brain starts its own internal logic loop.
        console.log(" MindiBot is now fully operational. ");
    } catch (error) {
        console.error("Failed to start MindiBot:", error);
    }
}

start();
