import config from "../../config";

export default {
	projectLeader: "493135149274365975",
	staffCoordinator: "691382096878370837",
	administrator: "685969048399249459",
	reviewer: "630445337143935009",
	developer: "691396820236107837",
	designer: "691386502566903850",
	moderator: "514546359865442304",
	supportAgent: "566417964820070421",
	marketingDirector: "673681900476432387",
	localizationManager: "811262682408943616",
	representative: "691384256672563332",
	patron: config.roles.patron,
	donator: config.roles.donator,
	booster: config.roles.booster,
	proofreader: "522755339448483840",
	translator: "502148045991968788",
	presenceDev: config.roles.presenceDev
} as Record<string, string>;
