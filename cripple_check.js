const Discord = require('discord.js');
const axios = require('axios');

const ADMIN_GUILD = 'ReBBL Admins';
const ADMIN_CHANNEL = 'cripple-ladder-teams';

const REBBL_GUILD = 'ReBBL';
const REBBL_CHANNEL = 'cripple-ladder-team-applications';

class crippleCheck{
  constructor(discord,options) {
    this.discord = discord;
    this.cyanideKey = options.cyanideKey; //

    this.discord.on('ready', this.ready.bind(this));


    this.discord.on('messageReactionAdd', this.messageReactionAdd.bind(this));

    this.discord.on('message', this.messageHandler.bind(this));

    this.teams =[];
  
    this.races = [
      null,
      this.checkHuman.bind(this),
      this.checkDwarf.bind(this),
      this.checkSkaven.bind(this),
      this.checkOrc.bind(this),
      this.checkLizardman.bind(this),
      this.checkGoblin.bind(this),
      this.checkWoodElf.bind(this),
      this.checkChaos.bind(this),
      this.checkDarkElf.bind(this),
      this.checkUndead.bind(this),
      this.checkHalfling.bind(this),
      this.checkNorse.bind(this),
      this.checkAmazon.bind(this),
      this.checkElvenUnion.bind(this) ,
      this.checkHighElf.bind(this) ,
      this.checkKhemri.bind(this),
      this.checkNecromantic.bind(this),
      this.checkNurgle.bind(this),
      this.checkOgre.bind(this),
      this.checkVampire.bind(this),
      this.checkChaosDwarf.bind(this),
      this.checkUnderworldDenizens.bind(this),
      null,
      this.checkBretonnian.bind(this),
      this.checkKislev.bind(this)] 
  }

  ready(){
    this.adminGuild = this.discord.guilds.find(guild => guild.name === ADMIN_GUILD); 
    this.adminChannel = this.adminGuild.channels.find(channel => channel.name === ADMIN_CHANNEL);

    this.rebblGuild = this.discord.guilds.find(guild => guild.name === REBBL_GUILD);
    this.rebblChannel = this.rebblGuild.channels.find(channel => channel.name === REBBL_CHANNEL);
  }

  static _serialize(params) {
    var str = [];
    for (var p in params)
      if (params.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(params[p]));
      }
    return str.join("&");
  }

  _url(method){
    return `http://web.cyanide-studio.com/ws/bb2/${method}/?key=${this.cyanideKey}`;
  }

  async _getData(endpoint, params){
    const queryString = crippleCheck._serialize(params);
    const response =  await axios.get(`${this._url(endpoint)}&${queryString}`);

    if (response.data.meta)
      delete response.data.meta;
    if (response.data.urls)
      delete response.data.urls;

    return response.data;

  }
  /**
   * Return team details
   * @param {Object} params - The search criteria.
   * @param {string} [params.platform] - pc|ps4|xb1
   * @param {number} [params.team] - team id
   * @param {string} [params.name] - name of the team
   * @param {string} [params.order] - ID|LastMatchDate|CreationDate
   */
  async getTeam(params){
    try{
      if (!params.order) params.order = 'CreationDate';
      return await this._getData("team", params);
    } catch(e){
      console.log(e);
    }
  }

    /**
   * Return team details
   * @param {Object} params - The search criteria.
   * @param {string} [params.platform] - pc|ps4|xb1
   * @param {number} [params.league] - League name (default = Cabalvision Official League)
   * @param {string} [params.competition] - Competition name (default = all competitions from given league)
   * @param {string} [params.limit] - Max amount of team results (default = 100)
   * @param {string} [params.sensitive] - Case-sensitive names matching
   */
  async getTeams(params){
    try{
      return await this._getData("teams", params);
    } catch(e){
      console.log(e);
    }
  }


  async checkTeam(teamname, msg){
    let team = await this.getTeam({platform:"pc",name:teamname });



    let result = team 
      ? await this.checkTeams(team.coach.name) 
      : `Could not find team ${teamname}`;

    if (team) result += this.checkRoster(team) + this.hasRerolls(team) + this.hasApo(team);

    let message = new Discord.RichEmbed();
    message.setColor('LIGHT_GREY');
    message.setTitle(teamname);

    let notifyAdmin = false;
    if (result !== "") {
      message.addField('😱 check the following:' ,result);
    } else {
      message.addField('your team is ok!' ,`Now you just have to wait for it to be accepted\r\n😇`);
      notifyAdmin = true;
      this.teams.push({
        team: teamname,
        user: msg.author.id
      })
    }
    this.rebblChannel.send(message);

    if (notifyAdmin) this.sendToAdmins(team);

  }

  sendToAdmins(team){
    let message = new Discord.RichEmbed();
    message.setColor('LIGHT_GREY');

    message.addField(team.coach.name, team.team.name);
    this.adminChannel.send(message);

  }

  async checkTeams(coachName){
    let result = await this.getTeams({platform:"pc",league:"ReBBL Cripple Ladder",competition:"ReBBL Cripple Ladder", limit:500 });
    let dead = await this.getTeams({platform:"pc",league:"ReBBL Cripple Ladder", competition:"Dead Crippled Teams",limit:500 });


    dead.teams.map(d => {
      const team = result.teams.find(r => r.id = d.id);
      const index = result.teams.indexOf(team);
      result.teams.splice(index,1  );
    } );

    if (coachName){
      let r = result.teams.filter(c => c.coach === coachName).length; 
      return r >= 3 
        ? `🔸 You can not have more than 3 active teams\r\n      Forfeit one of your teams by moving it into the **Dead Crippled Teams** competition.\r\n`
        : '';
    }

    let _groupBy = function(xs, key) {
      return xs.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
      }, {});
    };

    let data = _groupBy(result.teams,"coach");

    let m = '';
    for(var p in data){
      if (data[p].length > 2) m += `${p}: ${data[p].length}\r\n`;
    }
    this.adminChannel.send(m);
  }


  messageHandler(msg) {
      //if (msg.channel.name === 'cripple-ladder-team-applications' && msg.content.indexOf("!apply ")=== 0) {
      if (msg.guild.name === REBBL_GUILD && msg.channel.name === REBBL_CHANNEL && msg.content.indexOf("!apply ")=== 0) {
          const name = msg.content.slice(7).replace(/`/g,'');
          if (name.length > 25) return;

          this.checkTeam(name, msg); 
      }
      if(msg.guild.name === ADMIN_GUILD && msg.channel.name === ADMIN_CHANNEL && msg.content.indexOf("!coaches")=== 0) {
        this.checkTeams();
      }
  }


//  Cripple Cup Rules:
  // You may not take any re-rolls, either through staff or inducements. Specific skill rerolls (Eg. Dodge, Sure Feet) are allowed but Pro and Leader are prohibited.
  hasRerolls(t) {return t.team.rerolls === 0 ? "" : `🔸 No rerolls allowed!\r\n` }

  // You may not take an Apothecary either through staff or inducements. Seriously, this is the entire point.
  hasApo(t) {return t.team.apothecary === 0 ? "" : `🔸 No Apo allowed!\r\n`}

  checkRoster(t) {
      const r = t.roster;
      if (!t.roster) return '🔸 no roster found!\r\n';;
      const f = this.races[t.team.idraces];
      if (f != null) return f(r);
  }

  checkRosterStartSize (r,n){
    return r.length <= n ? "" : `🔸 More than ${n} starting players not allowed\r\n`
  }

  checkPosition(r,type,n,minimum,name){

    let players = r.filter(p => p.type === type);
    if (minimum){
      return players.length >= n ? "" : `🔸 Need at least ${n} ${name}\r\n`;
    } else {
        return players.length <= n ? "" : `🔸 Maximum of ${n} ${name} allowed\r\n`;
    }

  }

  //  Team Rules and Restrictions
  
  //  Dwarfs – Banned, because we like fun and in this format, they ain’t.
  checkDwarf(r){return "🔨 NO DWARF FOR YOU! 🔨";}
  //  High Elf – Must take all 4 catchers, Max 13 Players start.
  checkHighElf(r) {
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"HighElf_Catcher",4,true,"Catchers");

    return m;
  }
  //Dark Elf – Max 3 Blitzers Permitted, Must take at least 1 Runner, 1 Witch Elf and 1 Assassin – Max 13 players start
  checkDarkElf(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"DarkElf_Blitzer",3,false,"Blitzers");
    m += this.checkPosition(r,"DarkElf_Runner",1,true,"Runner");
    m += this.checkPosition(r,"DarkElf_WitchElf",1,true,"Witch Elf");
    m += this.checkPosition(r,"DarkElf_Assassin",1,true,"Assassin");

    return m;
  }
  //Humans – Max 3 Blitzers Permitted, Must take Ogre, must take at least 2 Catchers – Max 14 Players start
  checkHuman(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Human_Blitzer",3,false,"Blitzers");
    m += this.checkPosition(r,"Human_Ogre",1,true,"Ogre");
    m += this.checkPosition(r,"Human_Catcher",2,true,"Catchers");

    return m;
  }
  //Wood Elves – Must take Treeman – Max 13 Players start
  checkWoodElf(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"WoodElf_Treeman",1,true,"Treeman");

    return m;
  }
  //Bretonnian – Max 3 Blitzers Permitted – Max 14 Players start
  checkBretonnian(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Bretonnia_Blitzer",3,false,"Blitzers");

    return m;
  }

  //Orc – Must take Troll, 4 Goblins and 2 Throwers, can then only have 5 of their remaining positionals (i.e. may have 2 Blitzers and 3 Black Orcs or 4 Blitzers and one Black Orc, etc) – Max 13 Players start
  checkOrc(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"Orc_Troll",1,true,"Troll");
    m += this.checkPosition(r,"Orc_Goblin",4,true,"Goblins");
    m += this.checkPosition(r,"Orc_Thrower",3,false,"Throwers");

    let players = r.filter(p => p.type === "Orc_Blitzer" || p.type === "Orc_BlackOrcBlocker");
    
    m += players.length <= 5 ? "" : `🔸 Need a total of 5 Blitzers and Black Orc Blockers\r\n`;

    return m;
  }
  //Chaos – Must take Minotaur, max 3 Warriors – Max 13 Players start
  checkChaos(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"Chaos_Minotaur",1,true,"Minotaur");
    m += this.checkPosition(r,"Chaos_Warrior",3,false,"Warriors");

    return m;
  }  
  //Lizardmen – Must take Kroxigor, max 4 Saurus – Max 14 Players start
  checkLizardman(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Lizardman_Kroxigor",1,true,"Kroxigor");
    m += this.checkPosition(r,"Lizardman_Saurus",4,false,"Saurus");

    return m;
  }  
  //Skaven – Must take Rat Ogre, must take at least 1 thrower – Max 14 Players start
  checkSkaven(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Skaven_RatOgre",1,true,"Rat Ogre");
    m += this.checkPosition(r,"Skaven_Thrower",1,true,"Thrower");

    return m;
  }  
  //Norse – Must take Yhetee and 2 Throwers, max 1 Runner – Max 14 Players start
  checkNorse(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Norse_Yhetee",1,true,"Yhetee");
    m += this.checkPosition(r,"Norse_Thrower",2,true,"Throwers");
    m += this.checkPosition(r,"Norse_Runner",1,true,"Runner");

    return m;
  }  

  //Undead - Must take 4 Ghouls and 4 Skeletons - Max 13 Players start
  checkUndead(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"Undead_Ghoul",4,true,"Ghouls");
    m += this.checkPosition(r,"Undead_Skeleton",4,true,"Skeletons");

    return m;
  }    
  //Necromantic - Must take both Ghouls, Max 1 Werewolf - Max 13 Players start
  checkNecromantic(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"Necromantic_Ghoul",2,true,"Ghouls");
    m += this.checkPosition(r,"Necromantic_Werewolf",1,false,"Werewolf");

    return m;
  }  
  //Nurgle - Must Take Beast of Nurgle, Must take all 4 Pestigors, max 2 Nurgle Warriors - Max 13 Players start
  checkNurgle(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"Nurgle_BeastOfNurgle",1,true,"Beast Of Nurgle");
    m += this.checkPosition(r,"Nurgle_Pestigor",4,true,"Pestigors");
    m += this.checkPosition(r,"Nurgle_NurgleWarrior",2,false,"Nurgle Warriors");

    return m;
  }   
  //Chaos Dwarf - Must take Minotaur, max 4 Chaos Dwarf blockers and max 1 Bull Centaur - Max 13 players start
  checkChaosDwarf(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"ChaosDwarf_Minotaur",1,true,"Minotaur");
    m += this.checkPosition(r,"ChaosDwarf_BullCentaur",1,false,"BullCentaur");
    m += this.checkPosition(r,"ChaosDwarf_Blocker",4,false,"Blockers");

    return m;
  }   
  //Ogre – Must take all 6 Ogres (why wouldn’t you? It’s no re-roll) – Max 16 players start
  checkOgre(r){
    let m = this.checkRosterStartSize(r,16);

    m += this.checkPosition(r,"Ogre_Ogre",6,true,"Ogres");

    return m;
  }   
  //Halfling – Must take both Treemen and at least 12 Halflings. Cannot induce a Master Chef under any circumstances. Max 16 players start
  checkHalfling(r){
    let m = this.checkRosterStartSize(r,16);

    m += this.checkPosition(r,"Halfling_Treeman",2,true,"Treemen");
    m += this.checkPosition(r,"Halfling_Halfling",12,true,"Halflings");

    return m;
  }     
  //Goblin – Must take both Trolls, one Looney, one Fanatic, one Bombardier and one Pogoer. Boing. Max 16 players start
  checkGoblin(r){
    let m = this.checkRosterStartSize(r,16);

    m += this.checkPosition(r,"Goblin_Troll",2,true,"Trolls");
    m += this.checkPosition(r,"Goblin_Looney",1,true,"Looney");
    m += this.checkPosition(r,"Goblin_Fanatic",1,true,"Fanatic");
    m += this.checkPosition(r,"Goblin_Bombardier",1,true,"Bombardier");
    m += this.checkPosition(r,"Goblin_Pogoer",1,true,"Pogoer");

    return m;
  }    
  //Vampire – Must take at least 5 Vampires. Max 14 players start
  checkVampire(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Vampire_Vampire",5,true,"Vampires");

    return m;
  }    
  //Underworld Denizens – Must take the Warpstone Troll and both Skaven Linemen. Max one Skaven Thrower. Max 14 players start
  checkUnderworldDenizens(r){
    let m = this.checkRosterStartSize(r,14);

    m += this.checkPosition(r,"Underworld_Troll",1,true,"Troll");
    m += this.checkPosition(r,"Underworld_Lineman",2,true,"Linemen");
    m += this.checkPosition(r,"Underworld_Thrower",1,false,"Thrower");

    return m;
  }    
  //Amazons – Must take two Catchers, max two Blitzers. Max 13 players start
  checkAmazon(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"Amazon_Catcher",2,true,"Catchers");
    m += this.checkPosition(r,"Amazon_Blitzer",2,false,"Blitzers");

    return m;
  }    
  //Elven Union – Must take all four Catchers. Max 13 players start
  checkElvenUnion(r){
    let m = this.checkRosterStartSize(r,13);

    m += this.checkPosition(r,"ProElf_Catcher",4,true,"Catchers");

    return m;
  }    
  //Kislev Circus – Must take Tame Bear and at least two Catchers. Max 14 players start
  checkKislev(r){
    let m = this.checkRosterStartSize(r,16);

    m += this.checkPosition(r,"Kislev_TameBear",1,true,"Tame Bear");
    m += this.checkPosition(r,"Kislev_Catcher",2,true,"Catchers");

    return m;
  }   
  //Khemri - Max 3 Tomb Guardians and max 1 Blitz-Ra. 
  // Option: max one of the following: Fourth Tomb Guardian, second Blitz-Ra, 
  // or one Thro-Ra (can only ever have one of these three options in the roster at any time, 
  // if you have four TGs and are reduced to three, may then choose again) - Max 13 players start
  checkKhemri(r){
    let m = this.checkRosterStartSize(r,13);

    let tombGuardians = r.filter(p => p.type === "Khemri_TombGuardian");
    let blitzRas = r.filter(p => p.type === "Khemri_BlitzRa");
    let throwRas = r.filter(p => p.type === "Khemri_ThroRa");
    
    let wrong = `🔸 Wrong combination, allowed:
        🔹 4 Tomb Guardians and 1 Blitz-Ra
        🔹 3 Tomb Guardians and 2 Blitz-Ras
        🔹 3 Tomb Guardians, 1 Blitz-Ra, 1 Thro-Ra\r\n`;

    if (tombGuardians.length > 3 && (blitzRas.length >1 || throwRas.length > 0))
      m += wrong;
    else if (blitzRas.length >1 && throwRas.length > 0)
      m += wrong;
    else if (throwRas.length > 1)
    m += wrong;


    return m;
  }   

  messageReactionAdd(messageReaction, user){
    if (messageReaction.message.guild.name != ADMIN_GUILD || messageReaction.message.channel.name != ADMIN_CHANNEL) return;
    
    if ('👍' !== messageReaction.emoji.name ) return;

    let teamname = messageReaction.message.embeds[0].fields[0].value;

    let team = this.teams.find(t => t.team.toLowerCase() === teamname.toLowerCase());

    if (!team) return;


    this.rebblChannel.send(`Your team **${teamname}** is accepted <@${team.user}>`);
    this.teams.splice(this.teams.indexOf(team),1);
  };


}

module.exports.crippleCheck = crippleCheck;