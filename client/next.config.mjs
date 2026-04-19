/** @type {import('next').NextConfig} */
const nextConfig = {
	reactCompiler: true,
	images: {
		remotePatterns: [
			{
				// UploadThing CDN – used for uploaded build photos
				protocol: "https",
				hostname: "utfs.io",
			},
			{
				protocol: "https",
				hostname: "*.ufs.sh",
			},
		],
	},
};

export default nextConfig;
