"use strict";
const Discord = require('discord.js');

const ADMIN_GUILD = 'ReBBL Admins';
//const ADMIN_CHANNEL = 'cripple-ladder-teams';
const CLAN_CHANNEL = 'clan-relay';

const REBBL_GUILD = 'REBBL Clan League';

const CLAN_ROLE = 'Admin';

class relayHandler{
  constructor(discord) {
    this.discord = discord;

    this.discord.on('ready', this.ready.bind(this));

    this.discord.on('message', this.messageHandler.bind(this));

  }

  ready(){
    this.adminGuild = this.discord.guilds.find(guild => guild.name === ADMIN_GUILD); 
    //this.adminChannel = this.adminGuild.channels.find(channel => channel.name === ADMIN_CHANNEL);
    this.clanChannel = this.adminGuild.channels.find(channel => channel.name === CLAN_CHANNEL);

    this.rebblGuild = this.discord.guilds.find(guild => guild.name === REBBL_GUILD);
  }

  messageHandler(msg){
    const role = msg.mentions.roles.find(r => r.name === CLAN_ROLE)
    
    if (!role) return;

    if (msg.guild.name !== REBBL_GUILD) return;

    let message = new Discord.RichEmbed();

    message.setColor('DARK_GREY');
    message.setDescription(`**user**: ${msg.author.tag}
    **channel**: ${msg.channel.name}

    **message**:
    ${msg.content}
    `);
    this.clanChannel.send(message);

  }
}

module.exports.relayHandler = relayHandler; 