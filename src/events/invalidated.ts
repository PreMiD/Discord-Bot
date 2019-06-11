var { info } = require("../util/debug");

module.exports = () => {
  info("Bot token changed, exiting.");
  process.exit(1);
};
