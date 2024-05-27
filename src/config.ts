import ValidationUtility from './utility/ValidationUtility';
import { InferType, s } from '@sapphire/shapeshift';
import path from 'node:path';
import fs from 'node:fs';

const ConfigType = s.object({
	guildId: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
	roles: s.object({
		contributor: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		volunteer: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		presenceDev: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		beta: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		alpha: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		patron: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		donator: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX),
		booster: s.string.regex(ValidationUtility.SNOWFLAKE_REGEX)
	})
});

const configPath = path.resolve(process.cwd(), 'config.json');
const config = fs.readFileSync(configPath, 'utf-8');

let parsedJSON: any;
let result: InferType<typeof ConfigType>;

{
	try {
		parsedJSON = JSON.parse(config);
	} catch (error) {
		console.error('Invalid config.json file!');
		process.exit(1);
	}

	const validationResult = ConfigType.run(parsedJSON);

	if (!validationResult.success) {
		console.error(validationResult.error);
		process.exit(1);
	}

	result = validationResult.unwrap();
}

export default result;
