// ORDER IS IMPORTANT.
import 'source-map-support/register';
import 'dotenv/config';
import './instrument';
import './config';

// Sapphire plugins
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-hmr/register';

import { PreMiDClient } from './client/preMiDClient';
import { s } from '@sapphire/shapeshift';

{
	const processEnvValidationResult = s
		.object({
			TOKEN: s.string,
			MONGO_URI: s.string.url()
		})
		.run(process.env);

	if (!processEnvValidationResult.isOk()) {
		console.error(processEnvValidationResult.error);
		process.exit(1);
	}
}

const client = new PreMiDClient();

(async () => {
	await client.login();
})();

// We fully validated the process.env
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			MONGO_URI: string;
			SENTRY_DSN: string;
			NODE_ENV: string;
		}
	}
}
