const Discord = require('discord.js');
const https = require("https");
const http = require("http");

class rebblcheck{
  constructor(discord,options) {

    this.reddit = options.redditOptions;
    this.coachCount =[];
    this.redditAuthToken = '';
    this.discord = discord;
    this.discordGuild = options.guild;
    this.league = options.league;
    this.round = options.round;
    this.cyanideKey = options.cyanideKey; 

    this.gman_admins = [{division:'Season 8 - Division 1', name:'majorbyte'},
    {division:'Season 8 - Division 2', name:'Gerbear'},
    {division:'Season 8 - Division 3', name:'Gerbear'},
    {division:'Season 8 - Division 4', name:'FullMetal'},
    {division:'Season 8 - Division 5', name:'TomasT'},
    {division:'Season 8 - Division 6A', name:'Hippy'},
    {division:'Season 8 - Division 6B', name:'Harringzord'},
    {division:'Season 8 - Division 6C', name:'majorbyte'},
    {division:'Season 8 - Division 6D', name:'Kejiruze'},
    {division:'Season 8 - Division 6E', name:'Ken'}];
    this.rel_admins = [{division:'Season 8 - Division 1', name:'Rumblebee'},
    {division:'Season 8 - Division 2', name:'NinjaPirateAssassin'},
    {division:'Season 8 - Division 3', name:'Rumblebee'},
    {division:'Season 8 - Division 4', name:'Kallisti'},
    {division:'Season 8 - Division 5', name:'Kallisti'},
    {division:'Season 8 - Division 6', name:'Luminous'},
    {division:'Season 8 - Division 7', name:'Superfed'},
    {division:'Season 8 - Division 8', name:'Nosedive'},
    {division:'Season 8 - Division 9A', name:'Mystaes'},
    {division:'Season 8 - Division 9B', name:'NinjaPirateAssassin'},
    {division:'Season 8 - Division 9C', name:'Mystaes'},
    {division:'Season 8 - Division 9D', name:'Nosedive'},
    {division:'Season 8 - Division 9E', name:'Isenmike'}];
    this.big_o_admins = [
    {division:'Season 8 Div 1', name:'BIG O'},
    {division:'Season 8 Div 2', name:'BIG O'},
    {division:'Season 8 Div 3', name:'BIG O'},
    {division:'Season 8 Div 4A', name:'BIG O'},
    {division:'Season 8 Div 4B', name:'BIG O'}];

    this.coaches = [/* fix with external file */];

    this.excludeTeams =[ /* fix with external file */ ];
  };

  check(){
    console.dir(this.reddit);
    console.log(Buffer.from(this.reddit.appId + ':' + this.reddit.secret).toString('base64'));

    const options = {
      hostname: 'www.reddit.com',
      port: 443,
      path: '/api/v1/access_token?grant_type=password&username=' + this.reddit.username + '&password=' + this.reddit.password,
      method: 'POST',
      headers: {
        'User-Agent': 'RebblPlanner Script Scheduling parser',
        'Authorization': 'Basic ' + Buffer.from(this.reddit.appId + ':' + this.reddit.secret).toString('base64')
      }
    };

    https.get(options, (res) => {

      let data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        this.parseToken(data);
        this.getData();
      }.bind(this));

    });
  }


  parseToken (data) {
    this.redditAuthToken = JSON.parse(data).access_token;
  };

  getData() {
    const search = this.league +' Season 8 Week '+ this.round;
    const oauthOptions = {
      hostname: 'oauth.reddit.com',
      port: 443,
      path: '/r/rebbl/search?q='+encodeURIComponent(search)+'&limit=1&restrict_sr=true',
      action: 'GET',
      headers: {
        'Authorization': 'Bearer ' + this.redditAuthToken,
        'User-Agent': 'RebblPlanner Script Scheduling parser'
      }
    };


    https.get(oauthOptions, (res) => {

      let data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        const parsed = JSON.parse(data).data.children[0].data,
          threadId = parsed.id,
          title = parsed.title;
        if (title === search){
          this.getComments(threadId);
        }
      }.bind(this));
    });

  };

  getComments(id) {
    const oauthOptions = {
      hostname: 'oauth.reddit.com',
      port: 443,
      path: '/r/rebbl/comments/'+id + '?limit=500',
      action: 'GET',
      headers: {
        'Authorization': 'Bearer ' + this.redditAuthToken,
        'User-Agent': 'RebblPlanner Script Scheduling parser'
      }
    };

    https.get(oauthOptions, (res) => {

      let data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function(){
        const comments = JSON.parse(data.toString())[1];
        this.parseComments(comments);

        this.getRoundData();
      }.bind(this));
    });
  };

  parseComments(comment) {
    if (Array.isArray(comment)) {
      for (var x = 0; x < comment.length; x++){
        this.parseComment(comment[x]);
      }
    } else {
      const len = comment.data.children.length;
      for (var i = 0; i < len; i++) {
        this.parseComment(comment.data.children[i]);
      }
    }
  };

  /**
   * @param {Object} comment
   * @param {Object} comment.data
   * @param {string} comment.data.author
   * @param {string} comment.data.permalink
   * @param {string} comment.data.replies
   */
  parseComment(comment) {
    const c = this.coachCount.find(
      /**
       *
       * @param {{author:string}} e
       * @returns {boolean}
       */
      function(e){
        return e.author === comment.data.author;
      });

    if(!c){
      if (comment.data.author){
        this.coachCount.push({author: comment.data.author, link: comment.data.permalink});
      }
    }
    if (comment.data.replies && comment.data.replies !== "")  this.parseComments(comment.data.replies);
  };

  getRoundData() {

    const url = 'http://web.cyanide-studio.com/ws/bb2/contests/?key='+ this.cyanideKey +'&league=Rebbl - ' + this.league + '&competition=Season 8&status=scheduled&round=' + this.round;

    http.get(url, (res) => {
      let data = '';
      res.on('data', function (chunk) {
        data += chunk;
      });
      res.on('end', function () {
        this.parseRoundData( JSON.parse(data))
      }.bind(this))
    });
  };


  /**
   * @param {Object} matchData
   * @param {Object} matchData.upcoming_matches
   *
   */
  parseRoundData(matchData){

    let result = matchData.upcoming_matches.map(
      /** @param {Object} match
       */
      function(match){
        const coach1 = this.coaches.find(
          /**
           * @param {Object} e
           */
          function(e){
            if (e.coach && match.opponents[0].coach.name)
              return e.coach.toLowerCase() === match.opponents[0].coach.name.toLowerCase();
            if (e.team && match.opponents[0].team.name)
              return e.team.toLowerCase() === match.opponents[0].team.name.toLowerCase();
            return false;
          });
        if (!coach1) {
          console.dir(match.opponents[0]);
        }
        const coach2 = this.coaches.find(function(e){
          if (e.coach && match.opponents[1].coach.name)
            return e.coach.toLowerCase() === match.opponents[1].coach.name.toLowerCase();
          if (e.team && match.opponents[1].team.name)
            return e.team.toLowerCase() === match.opponents[1].team.name.toLowerCase();
          return false;
        });
        if (!coach2) {
          console.dir(match.opponents[1]);
        }

        const reddit1 = this.coachCount.find(function(e){
          return coach1 ? e.author.toLowerCase() === coach1.reddit.toLowerCase() : false;
        });
        const reddit2 = this.coachCount.find(function(e){
          return coach2 ? e.author.toLowerCase() === coach2.reddit.toLowerCase() : false;
        });

        const excludeTeam = this.excludeTeams.find(function(e){
          return e.toLowerCase() === match.opponents[0].team.name.toLowerCase() || e.toLowerCase() === match.opponents[1].team.name.toLowerCase();
        });

        if (excludeTeam) return false;

        return {
          competition : match.competition,
          team1: match.opponents[0].team.name,
          coach1: match.opponents[0].coach.name,
          team2: match.opponents[1].team.name,
          coach2: match.opponents[1].coach.name ,
          is1: reddit1,
          is2: reddit2,
          link1: reddit1 ? 'https://www.reddit.com'+ reddit1.link : undefined,
          link2: reddit2 ? 'https://www.reddit.com'+reddit2.link : undefined
        };
      }.bind(this)).sort();

    if (result.indexOf(false) > -1)
      result = result.slice(0, result.indexOf(false));


    this.sendToDiscord(result);
  };

  sendToDiscord(data){
    let channelName = (this.league).toLowerCase().replace(' ', '_') + '_status';
    let admins;

    switch (this.league.toLowerCase()){
      case 'big o':
        admins = this.big_o_admins;
        break;
      case 'gman':
        admins = this.gman_admins;
        break;
      case 'rel':
        admins = this.rel_admins;
        break;
    }


    if (data.length === 0) return;


    const grouped = data.reduce(function (r, a) {
      r[a.competition] = r[a.competition] || [];
      r[a.competition].push(a);
      return r;
    }, {});


    const guild = this.discord.guilds.find('name', this.discordGuild); 
    const channel = guild.channels.find('name', channelName);

    for (var group in grouped) {
      if (grouped && grouped.hasOwnProperty(group)) {
        let message = new Discord.RichEmbed();
        message.setColor('DARK_GREY');
        message.setTitle(group);

        const admin = (function (inner_group){ return admins.find(function(e){
          return e.division === inner_group;
        })}(group));

        let field = '';
        for (var x=0; x < grouped[group].length;x++){
          let part1 = '';
          let part2 = '';

          if(grouped[group][x].is1){
            part1 = "["  + grouped[group][x].coach1 + "]("+ grouped[group][x].link1 +")";
          } else {
            part1 = grouped[group][x].coach1;
          }

          if(grouped[group][x].is2){
            part2 = "[" + grouped[group][x].coach2 + "]("+ grouped[group][x].link2 +")";
          } else {
            part2 = grouped[group][x].coach2;
          }

          field += '**' + grouped[group][x].team1 + "** vs **" + grouped[group][x].team2 + '** \r\n' + 
            part1 + " vs " + part2 + '\r\n\r\n';
        }
        message.addField(admin.name ,field);
        channel.send(message);
      }
    }
  };
}

module.exports.rebblcheck = rebblcheck;