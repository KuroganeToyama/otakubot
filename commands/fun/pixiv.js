const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pixiv')
        .setDescription('Random Pixiv image (only Touhou girls for now)')
        .addSubcommand(subcommand =>
            subcommand
                .setName('image')
                .setDescription('Get a random Pixiv art!')
                .addStringOption(option =>
                    option
                        .setName('tag')
                        .setDescription('Choose a tag. For list of tags, run /pixiv list')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('Get a list of Pixiv art tags!')
        ),
    
    async execute(interaction) {
        await interaction.deferReply();

        if (interaction.options.getSubcommand() === 'image') {
            const tag = interaction.options.getString('tag')
            const apiCall = `https://di-nguyen-pixiv-api.onrender.com/image?tag=${tag}`;
            const response = await fetch(apiCall);
            const json = await response.json();
            
            await interaction.editReply(json.url);
            return;
        }

        if (interaction.options.getSubcommand() === 'list') {
            const list_url = 'https://github.com/KuroganeToyama/otakubot/blob/main/TAGLIST.md'
            await interaction.editReply(list_url);
            return;
        }
    },
};