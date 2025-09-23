import { Client, GatewayIntentBits, Events } from 'discord.js';
import { EventEmitter } from 'events';

// The "Ears" and part of the "Mouth"
// This class handles all communication with Discord. It listens for
// commands in a specific channel and provides a method for other
// modules to send messages to that channel.
export class DiscordBot extends EventEmitter {
    constructor(token, channelId) {
        super();
        this.token = token;
        this.channelId = channelId;
        this.commandPrefix = '!';

        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ]
        });

        this.registerEvents();
    }

    async connect() {
        try {
            await this.client.login(this.token);
            console.log(`Logged into Discord as ${this.client.user.tag}`);
        } catch (error) {
            console.error('Failed to log into Discord:', error);
            throw error; // Propagate the error to stop the app
        }
    }

    registerEvents() {
        this.client.on(Events.MessageCreate, message => {
            // Ignore messages from other bots and from channels we don't care about
            if (message.author.bot || message.channel.id !== this.channelId) {
                return;
            }

            // Check for our command prefix
            if (message.content.startsWith(this.commandPrefix)) {
                const content = message.content.slice(this.commandPrefix.length);
                const args = content.split(' ');
                const command = args.shift().toLowerCase();

                // Emit a command event for the Brain to process
                this.emit('command', message.author.username, command, args);
            }
        });
    }

    /**
     * Sends a message to the designated Discord channel.
     * @param {string} message The message to send.
     */
    async sendMessage(message) {
        try {
            const channel = await this.client.channels.fetch(this.channelId);
            if (channel) {
                channel.send(message);
            } else {
                 console.error(`Could not find Discord channel with ID: ${this.channelId}`);
            }
        } catch (error) {
            console.error('Failed to send message to Discord:', error);
        }
    }
}
