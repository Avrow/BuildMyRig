/**
 * Seed script  –  run from the /server directory:
 *   npm run seed
 *
 * Reads the real pc-part-dataset-main JSON files and upserts each component
 * into MongoDB (idempotent – safe to run multiple times).
 *
 * LIMIT controls how many items per file are processed (0 = all).
 */

import dotenv from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";
import mongoose from "mongoose";
import Component from "../src/models/Component.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, "../.env") });

const DATA_DIR = resolve(__dirname, "../pc-part-dataset-main/data/csv/json");

// Max items per file (0 = unlimited). Lower this for faster dev seeds.
const LIMIT = 500;

// ─── Per-type field mapping ────────────────────────────────────────────────

function extractBrand(name) {
	return (name ?? "").split(" ")[0] || "Unknown";
}

function transformItem(item, type) {
	const base = {
		name: item.name,
		brand: extractBrand(item.name),
		type,
		price: typeof item.price === "number" ? item.price : null,
		imageUrl: null,
	};

	switch (type) {
		case "CPU":
			return {
				...base,
				specs: {
					core_count: item.core_count ?? null,
					core_clock: item.core_clock ?? null,
					boost_clock: item.boost_clock ?? null,
					microarchitecture: item.microarchitecture ?? null,
					tdp: item.tdp ?? null,
					graphics: item.graphics ?? null,
				},
			};

		case "GPU":
			return {
				...base,
				specs: {
					chipset: item.chipset ?? null,
					memory: item.memory ?? null,
					core_clock: item.core_clock ?? null,
					boost_clock: item.boost_clock ?? null,
					color: item.color ?? null,
					length: item.length ?? null,
				},
			};

		case "RAM": {
			const [ddrGen, mhz] = Array.isArray(item.speed)
				? item.speed
				: [null, null];
			const [modCount, modSize] = Array.isArray(item.modules)
				? item.modules
				: [null, null];
			return {
				...base,
				specs: {
					speed: ddrGen && mhz ? `DDR${ddrGen}-${mhz}` : null,
					modules: modCount && modSize ? `${modCount} x ${modSize}GB` : null,
					price_per_gb: item.price_per_gb ?? null,
					color: item.color ?? null,
					first_word_latency: item.first_word_latency ?? null,
					cas_latency: item.cas_latency ?? null,
				},
			};
		}

		case "Storage":
			return {
				...base,
				specs: {
					capacity: item.capacity ?? null,
					type: item.type ?? null,
					cache: item.cache ?? null,
					form_factor: item.form_factor ?? null,
					interface: item.interface ?? null,
					price_per_gb: item.price_per_gb ?? null,
				},
			};

		case "Motherboard":
			return {
				...base,
				specs: {
					socket: item.socket ?? null,
					form_factor: item.form_factor ?? null,
					max_memory: item.max_memory ?? null,
					memory_slots: item.memory_slots ?? null,
					color: item.color ?? null,
				},
			};

		case "PSU":
			return {
				...base,
				specs: {
					type: item.type ?? null,
					efficiency: item.efficiency ?? null,
					wattage: item.wattage ?? null,
					modular: item.modular ?? null,
					color: item.color ?? null,
				},
			};

		case "Case":
			return {
				...base,
				specs: {
					type: item.type ?? null,
					color: item.color ?? null,
					side_panel: item.side_panel ?? null,
					external_volume: item.external_volume ?? null,
					internal_35_bays: item.internal_35_bays ?? null,
				},
			};

		case "Cooler":
			return {
				...base,
				specs: {
					rpm: item.rpm ?? null,
					noise_level: item.noise_level ?? null,
					color: item.color ?? null,
					size: item.size ?? null,
				},
			};

		default:
			return { ...base, specs: {} };
	}
}

// ─── Files to seed ────────────────────────────────────────────────────────
const DATA_FILES = [
	{ file: "cpu.json", type: "CPU" },
	{ file: "video-card.json", type: "GPU" },
	{ file: "memory.json", type: "RAM" },
	{ file: "internal-hard-drive.json", type: "Storage" },
	{ file: "motherboard.json", type: "Motherboard" },
	{ file: "power-supply.json", type: "PSU" },
	{ file: "case.json", type: "Case" },
	{ file: "cpu-cooler.json", type: "Cooler" },
];
// ──────────────────────────────────────────────────────────────────────────

async function seed() {
	const uri = process.env.MONGO_URI;
	if (!uri) {
		console.error("✗  MONGO_URI is not defined in /server/.env");
		process.exit(1);
	}

	try {
		await mongoose.connect(uri);
		console.log("✓  Connected to MongoDB\n");

		for (const { file, type } of DATA_FILES) {
			const filePath = resolve(DATA_DIR, file);
			let raw;
			try {
				raw = JSON.parse(readFileSync(filePath, "utf-8"));
			} catch {
				console.warn(`  ⚠  Skipped ${file} (not found or invalid JSON)`);
				continue;
			}

			// Filter out entries without a name, then apply optional limit
			const items = raw
				.filter((item) => item.name)
				.slice(0, LIMIT > 0 ? LIMIT : raw.length);

			const ops = items.map((item) => {
				const doc = transformItem(item, type);
				return {
					updateOne: {
						filter: { name: doc.name },
						update: { $setOnInsert: doc },
						upsert: true,
					},
				};
			});

			const result = await Component.bulkWrite(ops, { ordered: false });
			console.log(
				`  ${type.padEnd(12)} (${file})` +
					`  →  ${result.upsertedCount} inserted,` +
					`  ${result.matchedCount} already existed` +
					`  [${items.length} processed of ${raw.length} total]`,
			);
		}

		console.log("\n✓  Seeding complete");
	} catch (err) {
		console.error("✗  Seeding failed:", err.message);
		process.exit(1);
	} finally {
		await mongoose.disconnect();
	}
}

seed();
