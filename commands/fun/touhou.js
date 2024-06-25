const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('touhou')
        .setDescription('Random image of Touhou girls 東方'),
    
    async execute(interaction) {
        await interaction.deferReply();

        const apiCall = 'https://www.mylittlewallpaper.com/c/touhou/api/v1/random.json';
        const response = await fetch(apiCall);
        const json = await response.json();
        
        await interaction.editReply(json.result[0].downloadurl);
    },
};