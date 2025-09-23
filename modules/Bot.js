import mineflayer from 'mineflayer';
import { EventEmitter } from 'events';

// The "Body"
// This class is a wrapper around the Mineflayer bot.
// Its job is to connect to the server and provide simple, high-level
// methods for actions, and to emit events about the world.
export class MindiBot extends EventEmitter {
    constructor(options) {
        super();
        this.options = options;
        this.mc = null; // This will hold the mineflayer instance

        this.connect();
    }

    connect() {
        try {
            this.mc = mineflayer.createBot(this.options);
            this.registerEvents();
        } catch (error) {
            console.error('Failed to create Mineflayer bot:', error);
            setTimeout(() => this.connect(), 10000); // Retry connection after 10s
        }
    }

    registerEvents() {
        if (!this.mc) return;

        this.mc.on('login', () => {
            console.log(`Logged into Minecraft server ${this.options.host}:${this.options.port}`);
        });

        this.mc.on('spawn', () => {
            console.log('Bot has spawned into the world.');
            // We emit our own standardized event for the Brain to listen to.
            this.emit('botSpawn');
        });

        this.mc.on('chat', (username, message) => {
            // We emit our own event to decouple the Brain from Mineflayer's specific API.
            this.emit('chat', username, message);
        });

        this.mc.on('kicked', (reason) => {
            console.log('Bot was kicked from the server:', reason);
        });

        this.mc.on('error', (err) => {
            console.error('Mineflayer error:', err);
            this.emit('error', err);
        });

        this.mc.on('end', (reason) => {
            console.log('Bot disconnected:', reason);
            setTimeout(() => this.connect(), 10000); // Attempt to reconnect
        });
    }

    // --- High-Level Action Methods ---
    // The Brain will call these methods to interact with the world.

    /**
     * Sends a message in the in-game chat.
     * @param {string} message The message to send.
     */
    say(message) {
        if (!this.mc) return;
        this.mc.chat(message);
    }

    /**
     * Makes the bot go to a specific coordinate.
     * NOTE: This is a placeholder. For real pathfinding, you'd use the 'mineflayer-pathfinder' plugin.
     * @param {number} x
     * @param {number} y
     * @param {number} z
     */
    goTo(x, y, z) {
        if (!this.mc) return;
        this.say(`I'm not smart enough to move yet, but I would go to ${x}, ${y}, ${z}.`);
        // In a real implementation:
        // const { pathfinder, Movements } = require('mineflayer-pathfinder');
        // const { GoalBlock } = require('mineflayer-pathfinder').goals;
        // this.mc.loadPlugin(pathfinder);
        // const defaultMove = new Movements(this.mc);
        // this.mc.pathfinder.setMovements(defaultMove);
        // this.mc.pathfinder.setGoal(new GoalBlock(x, y, z));
    }
}
