const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pixiv')
        .setDescription('Random Pixiv image (only Touhou girls for now)')
        .addStringOption(option =>
            option.setName('tag')
                .setDescription('Choose a tag from this list: https://github.com/KuroganeToyama/otakubot/blob/main/TAGLIST.md')
                .setRequired(true)
        ),
    
    async execute(interaction) {
        await interaction.deferReply();

        const tag = interaction.options.getString('tag')
        const apiCall = `https://di-nguyen-pixiv-api.onrender.com/image?tag=${tag}`;
        const response = await fetch(apiCall);
        const json = await response.json();
        
        await interaction.editReply(json.url);
    },
};