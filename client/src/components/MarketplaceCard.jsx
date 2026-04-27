"use client";
import React from "react";
import { MapPin, Tag, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "./ui/badge";

export default function MarketplaceCard({ item }) {
    if (!item) return null;
    return (
        <div className="group bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-xl transition-all duration-300">
            {/* Image section like build gallery */}
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                <img 
                    src={item.imageUrl || "https://via.placeholder.com/500x400?text=BuildMyRig"} 
                    className="object-cover w-full h-full group-hover:scale-110 transition duration-500" 
                    alt={item.title} 
                />
                <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 text-[10px] font-bold px-3 py-1 rounded-full">
                    Just listed
                </div>
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg truncate">{item.title}</h3>
                    <Badge variant="outline" className="text-[10px] border-blue-200 text-blue-600 uppercase">{item.type}</Badge>
                </div>

                <p className="text-2xl font-black text-blue-600 mb-2">
                    BDT {item.price?.toLocaleString()}
                </p>

                <div className="flex flex-col gap-1 text-slate-500 text-xs mb-6">
                    <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-slate-400" /> {item.location}
                    </div>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        By: {item.sellerName || "Enthusiast"}
                    </div>
                </div>

                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 rounded-2xl shadow-lg transition-all">
                    View Details
                </Button>
            </div>
        </div>
    );
}