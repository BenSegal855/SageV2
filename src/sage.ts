import 'module-alias/register';
import consoleStamp from 'console-stamp';
import { MongoClient } from 'mongodb';
import { ApplicationCommandPermissionData, Client, ExcludeEnum, Intents, PartialTypes } from 'discord.js';
import { readdirRecursive } from '@lib/utils/generalUtils';
import { DB, BOT, PREFIX, GITHUB_TOKEN } from '@root/config';
import { Octokit } from '@octokit/rest';
import { version as sageVersion } from '@root/package.json';
import { registerFont } from 'canvas';
import { SageData } from '@lib/types/SageData';
import { setBotmasterPerms } from './lib/permissions';
import { ActivityTypes } from 'discord.js/typings/enums';

const BOT_INTENTS = [
	Intents.FLAGS.DIRECT_MESSAGES,
	Intents.FLAGS.GUILDS,
	Intents.FLAGS.GUILD_BANS,
	Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
	Intents.FLAGS.GUILD_INVITES,
	Intents.FLAGS.GUILD_MEMBERS,
	Intents.FLAGS.GUILD_MESSAGES,
	Intents.FLAGS.GUILD_MESSAGE_REACTIONS
];

const BOT_PARTIALS: PartialTypes[] = [
	'CHANNEL',
	'MESSAGE',
	'GUILD_MEMBER'
];

consoleStamp(console, {
	format: ':date(dd/mm/yy hh:MM:ss.L tt)'
});

async function main() {
	const bot = new Client({
		partials: BOT_PARTIALS,
		intents: BOT_INTENTS,
		allowedMentions: { parse: ['users'] }
	});

	await MongoClient.connect(DB.CONNECTION, { useUnifiedTopology: true }).then((client) => {
		bot.mongo = client.db(BOT.NAME);
	});

	bot.login(BOT.TOKEN);

	bot.octokit = new Octokit({
		auth: GITHUB_TOKEN,
		userAgent: `Sage v${sageVersion}`
	});

	registerFont(`${__dirname}/../../assets/Roboto-Regular.ttf`, { family: 'Roboto' });

	bot.once('ready', async () => {
		// I'm mad about this - Josh </3
		// Don't worry Josh, I fix - Ben <3 
		const owners = (await bot.application.fetch()).owner;
		if ('members' in owners) {
			setBotmasterPerms(owners.members.map(value => {
				const permData: ApplicationCommandPermissionData = {
					id: value.id,
					permission: true,
					type: 'USER'
				};
				return permData;
			}));
		} else {
			setBotmasterPerms([{
				id: owners.id,
				permission: true,
				type: 'USER'
			}]);
		}


		const pieceFiles = readdirRecursive(`${__dirname}/pieces`);
		for (const file of pieceFiles) {
			const piece = await import(file);
			const dirs = file.split('/');
			const name = dirs[dirs.length - 1].split('.')[0];
			if (typeof piece.default !== 'function') throw `Invalid piece: ${name}`;
			piece.default(bot);
			console.log(`${name} piece loaded.`);
		}

		console.log(`${BOT.NAME} online`);
		console.log(`${bot.ws.ping}ms WS ping`);
		console.log(`Logged into ${bot.guilds.cache.size} guilds`);
		console.log(`Serving ${bot.users.cache.size} users`);

		// eslint-disable-next-line no-extra-parens
		const status = (await bot.mongo.collection(DB.CLIENT_DATA).findOne({ _id: bot.user.id }) as SageData)?.status;

		const activity = status?.name || `${PREFIX}help`;

		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore: type's typing not properly inferred
		const type: ExcludeEnum<typeof ActivityTypes, 'CUSTOM'> = status?.type || 'PLAYING';
		bot.user.setActivity(`${activity} (v${sageVersion})`, { type });
		setTimeout(() => bot.user.setActivity(activity, { type }), 30e3);
	});
}

main();
