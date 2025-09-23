// The "Brain"
// This class is the core of the AI. It holds the bot's current state,
// its goals, and makes decisions about what to do next. It receives
// information from the Body (Bot) and the Ears (Discord) and sends
// commands back to the Body.
export class Brain {
    /**
     * @param {import('./Bot.js').MindiBot} bot The bot instance (Body)
     * @param {import('./Discord.js').DiscordBot} discord The Discord bot instance (Ears)
     * @param {import('./LLM.js').LLM} llm The Language Model instance
     */
    constructor(bot, discord, llm) {
        this.bot = bot;
        this.discord = discord;
        this.llm = llm;

        // --- AI State ---
        this.state = {
            isIdle: true,
            currentTask: 'none',
            lastChatMessage: null,
            playersNearby: [],
        };

        console.log("Brain initialized. Awaiting bot spawn...");
    }

    // --- Event Handlers (Inputs to the Brain) ---

    onBotSpawn() {
        const welcomeMessage = "Hello everyone! MindiBot is online and ready to play.";
        this.bot.say(welcomeMessage);
        this.discord.sendMessage(welcomeMessage);
        this.state.isIdle = true;
        this.state.currentTask = 'observing';
    }

    async onChatMessage(username, message) {
        console.log(`Brain processing chat from ${username}: "${message}"`);
        this.state.lastChatMessage = { username, message };
        
        // Decide if the bot should respond.
        // For now, it responds if its name is mentioned.
        if (message.toLowerCase().includes('mindibot')) {
            this.state.isIdle = false;
            this.state.currentTask = 'generating_response';

            // Construct a prompt for the LLM
            const context = `You are MindiBot, a friendly AI playing Minecraft. You are currently ${this.state.currentTask}.`;
            const prompt = `${username} said to you: "${message}". How do you respond?`;
            
            const response = await this.llm.generateResponse(prompt, context);
            this.bot.say(response);

            this.state.isIdle = true;
            this.state.currentTask = 'observing';
        }
    }

    onDiscordCommand(user, command, args) {
        console.log(`Brain processing discord command from ${user}: ${command} ${args.join(' ')}`);
        
        switch (command) {
            case 'say':
                this.bot.say(args.join(' '));
                this.discord.sendMessage(`Ok, I said "${args.join(' ')}" in the game.`);
                break;
            case 'goto':
                const [x, y, z] = args.map(Number);
                if ([x, y, z].some(isNaN)) {
                    this.discord.sendMessage("Invalid coordinates. Use `!goto x y z`.");
                    return;
                }
                this.bot.goTo(x, y, z);
                this.discord.sendMessage(`Ok, I'm heading towards ${x}, ${y}, ${z}.`);
                break;
            case 'status':
                 this.discord.sendMessage(`Here's my current status:\n- **State:** ${this.state.isIdle ? 'Idle' : 'Busy'}\n- **Current Task:** ${this.state.currentTask}`);
                break;
            default:
                this.discord.sendMessage(`I don't know the command '${command}'.`);
                break;
        }
    }
}
