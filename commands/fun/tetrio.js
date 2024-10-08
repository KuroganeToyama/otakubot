const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const QuickChart = require('quickchart-js');
const discordToTETRIO = require('../../tetrio.json');

const tetrioAPI = 'https://ch.tetr.io/api/';
const userEndpoint = 'users/';
const summaryEndpoint = 'summaries/';
const fortylineEndpoint = '40l';
const blitzEndpoint = 'blitz';
const quickplayEndpoint = 'zenith';
const expertqpEndpoint = 'zenithex';
const tetraleagueEndpoint = 'league';

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
                            { name: 'AR', value: 'AR' },
                            { name: 'Game Time', value: 'Game Time' },
                            { name: '40L', value: '40L' },
                            { name: 'Blitz', value: 'Blitz' },
                            { name: 'QP All Time', value: 'QP All Time' },
                            { name: 'QP This Week', value: 'QP This Week' },
                            { name: 'Expert QP All Time', value: 'Expert QP All Time' },
                            { name: 'Expert QP This Week', value: 'Expert QP This Week' },
                            { name: 'Games Played', value: 'Games Played' },
                            { name: 'Games Won', value: 'Games Won' },
                            { name: 'Win Rate', value: 'Win Rate' },
                            { name: 'APM', value: 'APM' },
                            { name: 'PPS', value: 'PPS' },
                            { name: 'VS', value: 'VS' },
                            { name: 'TR', value: 'TR' },
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

            // Quick Play data
            const apiCallQP = apiCallUser + '/' + summaryEndpoint + quickplayEndpoint;
            const responseQP = await fetch(apiCallQP);
            const jsonQP = await responseQP.json();

            const quickplayAlltime = (jsonQP.data.best.record === null) ? 0 : jsonQP.data.best.record.results.stats.zenith.altitude.toFixed(1);
            const quickplayWeek = (jsonQP.data.record === null) ? 0 : jsonQP.data.record.results.stats.zenith.altitude.toFixed(1);

            // Expert Quick Play data
            const apiCallQPEx = apiCallUser + '/' + summaryEndpoint + expertqpEndpoint;
            const responseQPEx = await fetch(apiCallQPEx);
            const jsonQPEx = await responseQPEx.json();

            const expertqpAlltime = (jsonQPEx.data.best.record === null) ? 0 : jsonQPEx.data.best.record.results.stats.zenith.altitude.toFixed(1);
            const expertqpWeek = (jsonQPEx.data.record === null) ? 0 : jsonQPEx.data.record.results.stats.zenith.altitude.toFixed(1);

            // Tetra League data
            const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
            const responseTL = await fetch(apiCallTL);
            const jsonTL = await responseTL.json();

            const gamesPlayed = jsonTL.data.gamesplayed;
            const gamesWon = jsonTL.data.gameswon;
            const winRate = (gamesPlayed === 0) ? 0 : ((gamesWon / gamesPlayed) * 100).toFixed(2);
            const apm = (jsonTL.data.apm === null) ? 0 : jsonTL.data.apm;
            const pps = (jsonTL.data.pps === null) ? 0: jsonTL.data.pps;
            const vs = (jsonTL.data.vs === null) ? 0: jsonTL.data.vs;
            const tr = (jsonTL.data.tr === -1) ? 0 : Math.round(jsonTL.data.tr).toLocaleString('en-US');
            const rank = (jsonTL.data.rank === 'z') ? 'None' : jsonTL.data.rank.toUpperCase();

            // Final embed
            const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle(`TETRIO profile of ${tetrioUser.toUpperCase()}`)
                    .addFields(
                        { name: 'EXP gained', value: `${exp}`, inline: true },
                        { name: 'AR', value: `${ar}`, inline: true },
                        { name: 'Game time', value: `${gameTime} hours`, inline: true },
                        { name: '40L PB', value: `${fortylineTime} secs`, inline: true },
                        { name: 'Blitz PB', value: `${blitzScore}`, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true},
                        { name: 'QP All Time', value: `${quickplayAlltime}m`, inline: true },
                        { name: 'QP This Week', value: `${quickplayWeek}m`, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true},
                        { name: 'Expert QP All Time', value: `${expertqpAlltime}m`, inline: true },
                        { name: 'Expert QP This Week', value: `${expertqpWeek}m`, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true},
                        { name: 'Games played', value: `${gamesPlayed}`, inline: true },
                        { name: 'Games won', value: `${gamesWon}`, inline: true },
                        { name: 'Win rate', value: `${winRate}%`, inline: true },
                        { name: 'APM', value: `${apm}`, inline: true },
                        { name: 'PPS', value: `${pps}`, inline: true },
                        { name: 'VS', value: `${vs}`, inline: true },
                        { name: 'TR', value: `${tr}`, inline: true },
                        { name: 'Rank', value: `${rank}`, inline: true },
                        { name: '\u200b', value: '\u200b', inline: true},
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

                let data = '';
                const apiCallUser = tetrioAPI + userEndpoint + tetrioUser;
                if (param === 'EXP') {
                    const apiCall = tetrioAPI + userEndpoint + tetrioUser;
                    const response = await fetch(apiCall);
                    const json = await response.json();
                    data = Math.round(json.data.xp);
                }

                else if (param === 'AR') {
                    const apiCall = tetrioAPI + userEndpoint + tetrioUser;
                    const response = await fetch(apiCall);
                    const json = await response.json();
                    data = json.data.ar;
                }

                else if (param === '40L') {
                    const apiCall40L = apiCallUser + '/' + summaryEndpoint + fortylineEndpoint;
                    const response40L = await fetch(apiCall40L);
                    const json40L = await response40L.json();

                    const finalTime = (json40L.data.record.results.stats.finaltime) / 1000;
                    data = finalTime.toFixed(3);
                }

                else if (param === 'Blitz') {
                    const apiCallBlitz = apiCallUser + '/' + summaryEndpoint + blitzEndpoint;
                    const responseBlitz = await fetch(apiCallBlitz);
                    const jsonBlitz = await responseBlitz.json();

                    data = jsonBlitz.data.record.results.stats.score;
                }

                else if (param === 'QP All Time') {
                    const apiCallQP = apiCallUser + '/' + summaryEndpoint + quickplayEndpoint;
                    const responseQP = await fetch(apiCallQP);
                    const jsonQP = await responseQP.json();

                    data = (jsonQP.data.best.record === null) ? 0 : jsonQP.data.best.record.results.stats.zenith.altitude.toFixed(1);
                }

                else if (param === 'QP This Week') {
                    const apiCallQP = apiCallUser + '/' + summaryEndpoint + quickplayEndpoint;
                    const responseQP = await fetch(apiCallQP);
                    const jsonQP = await responseQP.json();

                    data = (jsonQP.data.record === null) ? 0 : jsonQP.data.record.results.stats.zenith.altitude.toFixed(1);
                }

                else if (param === 'Expert QP All Time') {
                    const apiCallQPEx = apiCallUser + '/' + summaryEndpoint + expertqpEndpoint;
                    const responseQPEx = await fetch(apiCallQPEx);
                    const jsonQPEx = await responseQPEx.json();

                    data = (jsonQPEx.data.best.record === null) ? 0 : jsonQPEx.data.best.record.results.stats.zenith.altitude.toFixed(1);
                }

                else if (param === 'Expert QP This Week') {
                    const apiCallQPEx = apiCallUser + '/' + summaryEndpoint + expertqpEndpoint;
                    const responseQPEx = await fetch(apiCallQPEx);
                    const jsonQPEx = await responseQPEx.json();

                    data = (jsonQPEx.data.record === null) ? 0 : jsonQPEx.data.record.results.stats.zenith.altitude.toFixed(1);
                }

                else if (param === 'Game Time') {
                    const apiCall = tetrioAPI + userEndpoint + tetrioUser;
                    const response = await fetch(apiCall);
                    const json = await response.json();
                    data = (json.data.gametime === -1) ? 0 : Math.round(json.data.gametime / 3600);
                }

                else if (param === 'Games Played') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    data = jsonTL.data.gamesplayed;
                }

                else if (param === 'Games Won') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    data = jsonTL.data.gameswon;
                }

                else if (param === 'Win Rate') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    const gamesPlayed = jsonTL.data.gamesplayed;
                    const gamesWon = jsonTL.data.gameswon;
                    data = (gamesPlayed === 0) ? 0 : ((gamesWon / gamesPlayed) * 100).toFixed(2);
                }

                else if (param === 'APM') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    data = (jsonTL.data.apm === null) ? 0 : jsonTL.data.apm;
                }

                else if (param === 'PPS') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    data = (jsonTL.data.pps === null) ? 0: jsonTL.data.pps;
                }

                else if (param === 'VS') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    data = (jsonTL.data.vs === null) ? 0: jsonTL.data.vs;
                }

                else if (param === 'TR') {
                    const apiCallTL = apiCallUser + '/' + summaryEndpoint + tetraleagueEndpoint;
                    const responseTL = await fetch(apiCallTL);
                    const jsonTL = await responseTL.json();
                    data = (jsonTL.data.tr === -1) ? 0 : Math.round(jsonTL.data.tr);
                }

                dict[tetrioUser] = data;
            }

            console.log(dict);

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
