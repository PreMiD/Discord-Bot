import { nodeProfilingIntegration } from '@sentry/profiling-node';
import { s } from '@sapphire/shapeshift';
import * as Sentry from '@sentry/node';

{
	const processEnvValidationResult = s
		.object({
			SENTRY_DSN: s.string.url()
		})
		.run(process.env);

	if (!processEnvValidationResult.isOk()) {
		console.error(processEnvValidationResult.error);
		process.exit(1);
	}
}

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	integrations: [nodeProfilingIntegration()],
	tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1,
	sampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 1,
	environment: process.env.NODE_ENV
});
