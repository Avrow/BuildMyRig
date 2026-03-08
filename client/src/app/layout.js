import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth";
import { Toaster } from "@/components/ui/sonner";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "@/app/api/uploadthing/core";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata = {
	title: "MyApp",
	description: "A modern full-stack application",
};

export default function RootLayout({ children }) {
	return (
		<html lang='en'>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				{/* Avoids an extra round-trip for UploadThing component hydration */}
				<NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
				<AuthProvider>
					{children}
					<Toaster richColors position='top-right' />
				</AuthProvider>
			</body>
		</html>
	);
}
