const Discord = require('discord.js');
const restify = require('restify');
const Check = require('./rebblcheck');
const RoleManager = require('./rolemanager');

const client = new Discord.Client();

const roleManager = new RoleManager.rolemanager(client);

client.login(process.env['DiscordToken']);

var server = restify.createServer();
server.use(restify.plugins.queryParser());

const options = {
	league : '',
	round: 0,
	guild: process.env['guild'],
	cyanideKey: process.env['cyanideKey'],
	redditOptions: {
		username : process.env['redditUsername'],
		password : process.env['redditPassword'],
		appId : process.env['redditAppId'],
		secret : process.env['redditSecret']
	}};


const handler = function (request, res, next) {

	if (request.query.verify === process.env['verifyToken']){
		options.league = request.params.league;
		options.round = request.query.round;
		const checker = new Check.rebblcheck(client, options);
		checker.check();
	}

	res.send('done');
	next();
};

server.get('/api/:league', handler);

server.listen(process.env.PORT, function() {
	
});