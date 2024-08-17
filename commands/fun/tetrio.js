const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QuickChart = require('quickchart-js');
const discordToTETRIO = require('../../tetrio.json');

const tetrioAPI = 'https://ch.tetr.io/api/';
const userEndpoint = 'users/';
const summaryEndpoint = 'summaries/';
const fortylineEndpoint = '40l';
const blitzEndpoint = 'blitz';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tetrio')
        .setDescription('Get some fun statistics on TETRIO!')
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('Get TETRIO profile on a user in this server')
                .addUserOption(option =>
                    option
                        .setName('name')
                        .setDescription('Name of user to view TETRIO profile')
                        .setRequired(true))
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('chart')
                .setDescription('Get a chart on TETRIO profiles on all users in this server')
                .addStringOption(option =>
                    option
                        .setName('param')
                        .setDescription('Select a param to chart')
                        .setRequired(true)
                        .addChoices(
                            { name: 'EXP', value: 'EXP' },
                            { name: 'Games Played', value: 'Games Played' },
                            { name: 'Games Won', value: 'Games Won' },
                            { name: 'Win Rate', value: 'Win Rate' },
                            { name: 'AR', value: 'AR' },
                            { name: 'Game Time', value: 'Game Time' },
                        ))
        ),
    
    async execute(interaction) {
        await interaction.deferReply();

        if (interaction.options.getSubcommand() === 'user') {
            const user = interaction.options.getUser('name').username;

            if (!(user in discordToTETRIO)) {
                const errorEmbed = new EmbedBuilder()
                        .setColor('Red')
                        .setDescription('User does not have TETRIO account.');
                
                await interaction.editReply({embeds: [errorEmbed]});
                return;
            }

            const tetrioUser = discordToTETRIO[user];

            // General data
            const apiCallUser = tetrioAPI + userEndpoint + tetrioUser;
            const responseUser = await fetch(apiCallUser);
            const jsonUser = await responseUser.json();

            const exp = Math.round(jsonUser.data.xp).toLocaleString('en-US');
            const gamesPlayed = (jsonUser.data.gamesplayed === -1) ? 0 : jsonUser.data.gamesplayed;
            const gamesWon = (jsonUser.data.gameswon === -1) ? 0 : jsonUser.data.gameswon;
            const winRate = (jsonUser.data.gamesplayed === -1) ? 0 : ((jsonUser.data.gameswon / jsonUser.data.gamesplayed) * 100).toPrecision(2);
            const ar = jsonUser.data.ar;
            const gameTime = (jsonUser.data.gametime === -1) ? 0 : Math.round(jsonUser.data.gametime / 3600);

            // 40 Lines data
            const apiCall40L = apiCallUser + '/' + summaryEndpoint + fortylineEndpoint;
            const response40L = await fetch(apiCall40L);
            const json40L = await response40L.json();

            const finalTime = (json40L.data.record.results.stats.finaltime) / 1000;
            const fortylineTime = finalTime.toFixed(3);

            // Blitz data
            const apiCallBlitz = apiCallUser + '/' + summaryEndpoint + blitzEndpoint;
            const responseBlitz = await fetch(apiCallBlitz);
            const jsonBlitz = await responseBlitz.json();

            const finalScore = jsonBlitz.data.record.results.stats.score;
            const blitzScore = finalScore.toLocaleString('en-US');

            // Final embed
            const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`TETRIO profile of ${tetrioUser.toUpperCase()}`)
                    .addFields(
                        { name: 'EXP gained', value: `${exp}`, inline: true },
                        { name: 'AR', value: `${ar}`, inline: true },
                        { name: 'Game time', value: `${gameTime} hours`, inline: true },
                        { name: 'Games played', value: `${gamesPlayed}`, inline: true },
                        { name: 'Games won', value: `${gamesWon}`, inline: true },
                        { name: 'Win rate', value: `${winRate}%`, inline: true },
                        { name: '40L PB', value: `${fortylineTime} secs`, inline: true },
                        { name: 'Blitz PB', value: `${blitzScore}`, inline: true },
                    );

            await interaction.editReply({embeds: [embed]});
            return;
        }

        if (interaction.options.getSubcommand() === 'chart') {
            const param = interaction.options.getString('param');
            let userArr = [];
            let dataArr = [];
            let dict = [];

            for (const discordUser in discordToTETRIO) {
                const tetrioUser = discordToTETRIO[discordUser];
                const apiCall = tetrioAPI + userEndpoint + tetrioUser;
                const response = await fetch(apiCall);
                const json = await response.json();

                let data = '';
                if (param === 'EXP') {
                    data = Math.round(json.data.xp);
                }
                else if (param === 'Games Played') {
                    data = (json.data.gamesplayed === -1) ? 0 : json.data.gamesplayed;
                }
                else if (param === 'Games Won') {
                    data = (json.data.gameswon === -1) ? 0 : json.data.gameswon;
                }
                else if (param === 'Win Rate') {
                    if (json.data.gamesplayed === -1) {
                        data = 0;
                    }
                    else {
                        data = ((json.data.gameswon / json.data.gamesplayed) * 100).toPrecision(2);
                    }
                }
                else if (param === 'AR') {
                    data = json.data.ar;
                }
                else if (param === 'Game Time') {
                    data = (json.data.gametime === -1) ? 0 : Math.round(json.data.gametime / 3600);
                }

                dict[tetrioUser] = data;
            }

            const sortedArr = Object.entries(dict).sort(([, valueA], [, valueB]) => valueA - valueB);
            const sortedDict = Object.fromEntries(sortedArr);

            for (const key in sortedDict) {
                userArr.push(key);
                dataArr.push(sortedDict[key]);
            }

            const chart = new QuickChart();
            chart.setConfig({
                    type: 'bar',
                    data: {
                        labels: userArr,
                        datasets: [
                            {
                                label: param,
                                data: dataArr
                            }
                        ]
                    },
                    options: {
                        legend: {
                            labels: {
                                fontSize: 10,
                                fontStyle: 'bold',
                                fontColor: '#404040',
                            }
                        },
                        scales: {
                            yAxes: [
                                {
                                    ticks: {
                                        fontStyle: 'bold',
                                        fontColor: '#404040',
                                    },
                                },
                            ],
                            xAxes: [
                                {
                                    ticks: {
                                        fontStyle: 'bold',
                                        fontColor: '#404040',
                                    },
                                },
                            ],
                        },
                    }
                })
                .setWidth(800)
                .setHeight(400);
            
            const url = await chart.getShortUrl();
            const chartEmbed = new EmbedBuilder()
                    .setTitle(`Chart on ${param} of all TETRIO players in this server`)
                    .setColor('Green')
                    .setImage(url);
            
            await interaction.editReply({embeds: [chartEmbed]}); 
            return;
        }
    },
};
