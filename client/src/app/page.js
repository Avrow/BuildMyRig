import Link from "next/link";
import { ArrowRight, Zap, ShieldCheck, Cpu, ShoppingCart, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
    return (
        <div className='min-h-screen bg-white dark:bg-slate-950'>
            <Navbar />
            <section className='relative overflow-hidden'>
                <div className='pointer-events-none absolute inset-0 -z-10'>
                    <div className='absolute left-1/2 top-0 h-150 w-225 -translate-x-1/2 rounded-full bg-linear-to-b from-blue-100/60 to-transparent dark:from-blue-900/20 blur-3xl' />
                </div>
                <div className='mx-auto max-w-6xl px-4 py-24 sm:py-36 text-center'>
                    <Badge variant='secondary' className='mb-6 rounded-full px-4 py-1 text-sm'>
                        <Zap className='h-3.5 w-3.5 text-blue-500 mr-1' /> The Ultimate PC Enthusiast Community
                    </Badge>
                    <h1 className='text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight'>
                        Build Your <span className='text-blue-600'>Dream Rig</span> with Confidence
                    </h1>
                    <p className='mt-6 text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto font-medium'>
                        Join BuildMyRig to showcase your setup, find deals, and connect with builders across Bangladesh.
                    </p>
                    <div className='mt-10 flex flex-wrap justify-center gap-4'>
                        <Button size='lg' className='bg-blue-600 text-white px-8 rounded-full' asChild>
                            <Link href='/signup'>Join Community <ArrowRight className='ml-2 h-4 w-4' /></Link>
                        </Button>
                        <Button size='lg' variant='outline' className='px-8 rounded-full' asChild>
                            <Link href='/marketplace'>Explore Market</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <footer className='border-t py-12 text-center text-slate-400 text-sm'>
                <p>© {new Date().getFullYear()} BuildMyRig. Designed for Enthusiasts.</p>
            </footer>
        </div>
    );
}