import 'dotenv/config';

// Sapphire plugins
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-hmr/register';

// Import sapphire validation
import { s } from '@sapphire/shapeshift';

{
	const processEnvValidationResult = s
		.object({
			TOKEN: s.string,
			MONGO_URI: s.string.url(),
		})
		.run(process.env);

	if (!processEnvValidationResult.isOk()) {
		console.error(processEnvValidationResult.error);
		process.exit(1);
	}
}

(async () => {
	// await client.login();
})();

// We fully validated the process.env
declare global {
	namespace NodeJS {
		interface ProcessEnv {
			TOKEN: string;
			MONGO_URI: string;
			NODE_ENV: string;
		}
	}
}