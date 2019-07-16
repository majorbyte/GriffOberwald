const Discord = require('discord.js');
const RoleManager = require('./rolemanager.js');
const RelayHandler = require('./relayHandler.js');
const Check = require('./cripple_check.js');
const restify = require('restify');

// Create an instance of a Discord client
const client = new Discord.Client();

const roleManager = new RoleManager.rolemanager(client);
const dr = new RelayHandler.relayHandler(client);

client.login(process.env['DiscordToken']);

var server = restify.createServer();
server.use(restify.plugins.queryParser());

const options = {
	cyanideKey: process.env['cyanideKey']
};

checker = new Check.crippleCheck(client, options);


const okHandler = function (request, res, next) {
	res.send('ok');
	next();
};


server.get('/', okHandler);

server.listen(process.env.PORT, function() {
	console.log('%s listening at %s', server.name, server.url);
});