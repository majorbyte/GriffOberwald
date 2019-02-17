const Discord = require('discord.js');

class rolemanager{
  constructor(discord){
	console.log('constructed');
    this.discord = discord;
	this.discord.on('ready', this.ready.bind(this));
	this.discord.on('messageReactionAdd', this.messageReactionAdd.bind(this));
	this.discord.on('messageReactionRemove', this.messageReactionRemove.bind(this));
	this.guild = null;
	this.roles = new Map();
  }

  // Create an instance of a Discord client
  
  
  ready() {
    console.log('ready');
    this.guild = this.discord.guilds.find('name', 'ReBBL');
    const channel = this.guild.channels.find('name', 'rules-and-information');
    //initialize roles
    this.roles.set('📽', this.guild.roles.find('name','GMAN Recaps'));
    this.roles.set('⚽', this.guild.roles.find('name','GMAN News')); 
    this.roles.set('📹', this.guild.roles.find('name','REL Recaps'));
    this.roles.set('🏈', this.guild.roles.find('name','REL News'));
    this.roles.set('🎥', this.guild.roles.find('name','BIG O Recaps'));
    this.roles.set('🏉', this.guild.roles.find('name','BIG O News'));
    this.roles.set('📣', this.guild.roles.find('name','Stream Announcements'));
    this.roles.set('📢', this.guild.roles.find('name','REBBL Streams'));
    this.roles.set('🎙', this.guild.roles.find('name','Podcasts'));
    this.roles.set('💾', this.guild.roles.find('name','rebbl․net updates'));   
    this.roles.set('🕋', this.guild.roles.find('name','Civ'));
    this.roles.set('clan', this.guild.roles.find('name','Clan'));

    if(channel){
		channel.fetchMessages({ limit: 10 })
			.then(messages => console.log(`Received ${messages.size} messages`))
			.catch(console.error);
	}/*
      channel.bulkDelete(50);
  
      var message = new Discord.RichEmbed();
      message.setColor('DARK_GREY');
      message.setDescription(`Welcome to the REBBL's Discord!
Please read and follow our rules, roles, and communications channel so everyone can have the best experience possible on our community discord.`);
      channel.send(message);
  
      message = new Discord.RichEmbed();
      message.setColor('DARK_GREY');
      message.setImage('https://i.imgur.com/2Gk56jc.png');
      channel.send(message);
      
      message = new Discord.RichEmbed();
      message.setColor('DARK_GREY');
      message.setDescription('**1**. **Don\'t be a dick!** Be respectful to others. Hate speech, racist remarks, sexual slurs and downright disrespect will not be tolerated.\r\n**2**. Do not post NSFW or NSFL content. Doing so opens you up to a ban without warning.\r\n**3**. Do not behave in a toxic manner. This includes spamming messages, memes, ASCII images, emoji/reaction spam, and also instigating drama.\r\n**4**. Do not link content regarding how to exploit the game to play it in a way other than how it was intended. Discussion is limited but allowed; but refrain from telling someone how to do anything.\r\n**5**. Do not advertise something without first obtaining permission from a member of staff.\r\n**6**. Please refrain from discussing politics and religion on our channels.\r\n**7**. Please be mindful of channels and their intended use.\r\n**8**. If you feel you have been wronged in anyway, please send a pm to @bloodbowladmins and we will look into it.');
      channel.send(message);
  
      
      
      message = new Discord.RichEmbed();
      message.setColor('DARK_GREY');
      message.setImage('https://i.imgur.com/28cqATI.png');
      channel.send(message);
      
      message = new Discord.RichEmbed();
      message.setColor('DARK_GREY');
      message.setDescription(`:small_blue_diamond: Blood Bowl Admin / <@&257975173867765760> These members of staff overlook everything behind the scenes and make the executive decisions. If you have a suggestion or any other inquiry regarding this server please let these guys know. These guys are the Discord Admins for the Server!
:small_blue_diamond: REBBRL Admin / <@&210909693244211200> These members are admins over at our sister league REBBRL, since they frequent both, we want to distinguish them there as well.
:small_blue_diamond: Sports Reporter / <@&248119560643805184> Members of this role are our sports reportes, responsible for recaps and other content creation.
      `);
      channel.send(message);
      
      message = new Discord.RichEmbed();
      message.setColor('DARK_GREY');
      message.setDescription(`In order for you to control what information you want to receive, the following roles are available
  :small_orange_diamond: GMAN Recaps / <@&422136547127853057> :projector:
  :small_orange_diamond: GMAN News / <@&414814404073226240> :soccer:
  :small_orange_diamond: REL Recaps / <@&422136557659619358> :video_camera:
  :small_orange_diamond: REL News / <@&422136941245366292> :football:
  :small_orange_diamond: BIG O Recaps /  <@&422137082450804756> :movie_camera:
  :small_orange_diamond: BIG O News / <@&422137140269547528> :rugby_football:
  :small_orange_diamond: REBBL Streams / <@&422109047693508629> :loudspeaker:
  :small_orange_diamond: Stream Announcements / <@&423569559581360133> :mega:
  :small_orange_diamond: Podcasts / <@&423573613288095765> :microphone2:
  :small_orange_diamond: rebbl․net updates  / <@&452623925164376074> :floppy_disk:
  :small_orange_diamond: Civ / <@&473495789260242944> :kaaba: 
  :small_orange_diamond: Clan / <@&504189458862702592> <:clan:504204933302583296>
  In order to subscribe to any of these roles, click on the appropriate emoji an click again to unsubscribe.
  *If you have one or more of roles and want to opt-out, just press the corresponding emoji twice.*`);
      channel.send(message).then(message => {
  	    message.react("📽"); //projector
  	    message.react("⚽"); //soccer
  	    message.react("📹"); //video camera
  	    message.react("🏈"); //football
  	    message.react("🎥"); //movie camera
  	    message.react("🏉"); //rugby
        message.react("📣"); //megaphone
        message.react("🎙"); //microphone2
        message.react("💾"); //floppy disk
        message.react("🕋"); //Kaaba
        message.react("504204933302583296"); // clan
  	    return message.react("📢"); //loudspeaker
      }) 
      .catch(console.error);
      } */ // end if
  };
  
  messageReactionAdd(messageReaction, user){
	console.log('messageReactionAdd');
    if (messageReaction.message.channel.name != 'rules-and-information') return;
  
    const member = this.guild.members.find('id', user.id);
	console.log(`emoji: ${messageReaction.emoji.name}`);
    const role = this.roles.get(messageReaction.emoji.name);
    if (!role) return;
    console.log(`role: ${role.id}`);
	
    if (member.roles.has(role.id)) return
      
    member.addRole(role);
  };
  
  messageReactionRemove(messageReaction, user){
  
    if (messageReaction.message.channel.name != 'rules-and-information') return;
  
    const member = this.guild.members.find('id', user.id);
    const role = this.roles.get(messageReaction.emoji.name);
    if(!role) return;
    if (member.roles.has(role.id)) {
      member.removeRole(role);
    }
  }

}

module.exports.rolemanager = rolemanager;