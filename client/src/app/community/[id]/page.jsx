"use client";
import { useState, useEffect, use } from "react"; 
import Navbar from "@/components/Navbar";
import { Star, Send, Cpu, MonitorPlay, MemoryStick, User, ArrowLeft, Loader2, FileText, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useAuth } from "@/context/auth"; // Auth Context import
import BuildDetailsModal from "@/components/BuildDetailsModal"; // Importing the modal component

export default function BuildDetails({ params }) {
    const { user, loading: authLoading } = useAuth(); // user data and auth loading state from context
    const resolvedParams = use(params); 
    const id = resolvedParams.id;

    const [post, setPost] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    const API_BASE_URL = "http://localhost:8000/api";

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const postRes = await fetch(`${API_BASE_URL}/posts/${id}`);
                const postData = await postRes.json();
                if (postData.success) setPost(postData.data);

                const reviewRes = await fetch(`${API_BASE_URL}/reviews/${id}`);
                if (reviewRes.ok) {
                    const reviewData = await reviewRes.json();
                    setReviews(reviewData.data || []);
                }
            } catch (err) {
                toast.error("Could not load build data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id, API_BASE_URL]);

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        
        if (!user) {
            toast.error("You must be logged in to leave a review!");
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    postId: id, 
                    rating: Number(rating), 
                    comment, 
                    userName: user.name // removing hardcoded username and using the one from auth context
                })
            });

            if (res.ok) {
                toast.success("Feedback submitted!");
                setComment("");
                window.location.reload(); 
            }
        } catch (err) {
            toast.error("Failed to submit review.");
        }
    };

    if (isLoading || authLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <Loader2 className="animate-spin h-12 w-12 text-blue-500" />
            <p className="ml-4 font-bold">Connecting to Build System...</p>
        </div>
    );

    if (!post) return <div className="p-20 text-center">Build Not Found.</div>;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            <Navbar />
            <main className="max-w-6xl mx-auto p-4 sm:p-8">
                {/* ── Build Specs Section ── */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border p-6 lg:p-10 flex flex-col lg:flex-row gap-8 mb-10">
                    <div className="flex-1">
                        <img src={post.imageUrl} className="rounded-2xl w-full aspect-video object-cover border" alt="PC" />
                        <h2 className="mt-4 text-3xl font-black text-slate-900 dark:text-white uppercase italic">{post.caption}</h2>
                    </div>
                    <div className="flex-1 bg-slate-50 dark:bg-slate-800 p-8 rounded-2xl border">
                        <h2 className="text-2xl font-bold text-blue-600 mb-6 underline">Technical Specs:</h2>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3"><Cpu className="text-blue-500" /> <strong>CPU:</strong> {post.cpu}</li>
                            <li className="flex items-center gap-3"><MonitorPlay className="text-violet-500" /> <strong>GPU:</strong> {post.gpu}</li>
                            <li className="flex items-center gap-3"><MemoryStick className="text-emerald-500" /> <strong>RAM:</strong> {post.ram}</li>
                        </ul>
                    </div>
                </div>

                {/* ── Detailed Story (1500 Words) ── */}
                <div className="bg-white dark:bg-slate-900 p-10 rounded-3xl border shadow-sm mb-10">
                    <h3 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
                        <FileText className="text-blue-600" /> The Builder's Narrative
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg whitespace-pre-wrap">
                        {post.description}
                    </p>
                </div>

                {/* ── Feedback Form (Conditional Logic) ── */}
                <div className="mt-10 bg-blue-600 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
                    {!user && (
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center text-center p-6">
                            <Lock className="h-10 w-10 mb-2 text-blue-400" />
                            <h4 className="text-xl font-bold">Community Ratings Locked</h4>
                            <p className="opacity-80 mb-4">You need to be logged in to share your thoughts.</p>
                            <Link href="/signin" className="bg-white text-blue-600 px-8 py-2 rounded-full font-bold hover:bg-slate-100 transition-all">Sign In</Link>
                        </div>
                    )}
                    
                    <h3 className="text-2xl font-bold mb-6">Rate this Configuration</h3>
                    <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold opacity-80 uppercase">Rating (1-5)</label>
                            <input type="number" min="1" max="5" value={rating} onChange={(e) => setRating(e.target.value)} className="w-24 p-4 rounded-xl text-slate-900 font-bold outline-none" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-bold opacity-80 uppercase">Your Feedback</label>
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} className="w-full p-5 rounded-2xl text-slate-900 h-32 outline-none" placeholder="Write your review..." required />
                        </div>
                        <button type="submit" className="bg-white text-blue-600 font-black py-4 px-10 rounded-2xl flex items-center gap-2">
                            <Send size={20} /> SUBMIT AS {user ? user.name.toUpperCase() : "GUEST"}
                        </button>
                    </form>
                </div>
            </main>
        </div>
    );
}