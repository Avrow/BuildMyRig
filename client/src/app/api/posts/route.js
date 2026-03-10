import { NextResponse } from "next/server";
import connectDB from "@/lib/mongooseClient";
import BuildPost from "@/models/buildPost";

export async function GET() {
	await connectDB();

	const raw = await BuildPost.find({}).sort({ createdAt: -1 }).lean();

	// Convert Mongoose documents to plain, serialisable objects.
	const send = raw.map((b) => ({
		id: b._id.toString(),
		imageUrl: b.imageUrl,
		caption: b.caption,
		cpu: b.cpu,
		gpu: b.gpu,
		ram: b.ram,
		createdAt: b.createdAt.toISOString(),
	}));
	return NextResponse.json(send);
}
