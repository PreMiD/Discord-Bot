import { info } from "../util/debug";

module.exports = () => {
  info("Token changed, exiting.");
  process.exit(1);
};
