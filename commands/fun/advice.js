const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('advice')
        .setDescription('Get a random advice! Might be useful (or not)'),
    
    async execute(interaction) {
        await interaction.deferReply();

        const apiCall = 'https://api.adviceslip.com/advice';
        const response = await fetch(apiCall);
        const json = await response.json();

        await interaction.editReply(json.slip.advice);
    },
};
