import { Router } from "express";

const router = Router();

const generateMockNews = (count = 1) => {
	const topics = [
		"Global Markets",
		"Quantum Tech",
		"Urban Wildlife",
		"Deep Space",
		"AI Policy",
	];
	const actions = [
		"Surge",
		"Reveals Truth",
		"Shifts Focus",
		"Breaks Records",
		"Face Backlash",
	];
	const entities = [
		"Startups",
		"Scientists",
		"Leaked Files",
		"New Laws",
		"Rare Species",
	];
	const outlets = [
		"The Daily Wire",
		"TechPulse",
		"Global Echo",
		"Frontier Post",
	];

	return Array.from({ length: count }, () => {
		const title = `${topics[Math.floor(Math.random() * topics.length)]} ${
			actions[Math.floor(Math.random() * actions.length)]
		}: ${entities[Math.floor(Math.random() * entities.length)]}`;

		return {
			id: crypto.randomUUID(),
			title: title,
			summary: `In a landmark development, researchers discuss how ${title.toLowerCase()}.`,
			publishedAt: new Date(
				Date.now() - Math.floor(Math.random() * 1000000000),
			).toISOString(),
			source: outlets[Math.floor(Math.random() * outlets.length)],
			category: ["Tech", "Finance", "Science", "Politics"][
				Math.floor(Math.random() * 4)
			],
		};
	});
};

router.get("/", (req, res) => {
	res.json(generateMockNews(5));
});

export default router;
