var { query } = require('../database/functions');

module.exports = async function(msg) {
	if ((msg.content.toLowerCase().includes('owo') || msg.content.toLowerCase('uwu')) && !msg.author.bot) {
		var result = await query('SELECT count FROM owoCounter WHERE userID = ?', msg.author.id);

		if (result.rows.length == 0) {
			query('INSERT INTO owoCounter (userID, count) VALUES (?, "1")', [ msg.author.id ]);
		} else {
			query('UPDATE owoCounter SET count = ? WHERE userID = ?', [ result.rows[0].count + 1, msg.author.id ]);
		}
	}
};
