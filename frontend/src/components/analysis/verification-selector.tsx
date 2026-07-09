"use client";

import React from "react";
import { 
  Image, Newspaper, Video, FileText, Mic,
  Shield, CheckCircle2, Clock
} from "lucide-react";

export interface VerificationType {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  available: boolean;
  comingSoon?: boolean;
  color: string;
  gradient: string;
}

export const VERIFICATION_TYPES: VerificationType[] = [
  {
    id: "image",
    title: "Image Verification",
    description: "Detect manipulation, AI-generated images, deepfakes, metadata inconsistencies, and digital forgeries.",
    icon: <Image className="w-8 h-8" />,
    available: true,
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    id: "news",
    title: "News Verification",
    description: "Verify articles, headlines, URLs, screenshots, and news credibility using trusted sources.",
    icon: <Newspaper className="w-8 h-8" />,
    available: true,
    color: "emerald",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    id: "video",
    title: "Video Verification",
    description: "Detect deepfakes, manipulated video content, and verify video authenticity.",
    icon: <Video className="w-8 h-8" />,
    available: true,
    comingSoon: false,
    color: "purple",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    id: "document",
    title: "Document Verification",
    description: "Verify document authenticity, detect forgeries, and analyze document metadata.",
    icon: <FileText className="w-8 h-8" />,
    available: false,
    comingSoon: true,
    color: "orange",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    id: "audio",
    title: "Audio Verification",
    description: "Detect AI-generated audio, voice cloning, and verify audio authenticity.",
    icon: <Mic className="w-8 h-8" />,
    available: false,
    comingSoon: true,
    color: "pink",
    gradient: "from-pink-500 to-pink-600",
  },
];

interface VerificationSelectorProps {
  selectedType: string | null;
  onSelect: (typeId: string) => void;
}

export function VerificationSelector({ selectedType, onSelect }: VerificationSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {VERIFICATION_TYPES.map((type) => (
        <button
          key={type.id}
          onClick={() => type.available && onSelect(type.id)}
          disabled={!type.available}
          className={`
            relative group text-left p-6 rounded-2xl border-2 transition-all duration-300
            ${selectedType === type.id 
              ? "border-primary bg-primary-50 shadow-lg scale-[1.02]" 
              : "border-border hover:border-primary/50 hover:shadow-md"
            }
            ${!type.available && "opacity-60 cursor-not-allowed"}
          `}
        >
          {/* Icon */}
          <div className={`
            w-14 h-14 rounded-xl bg-gradient-to-br ${type.gradient} 
            flex items-center justify-center text-white mb-4
            shadow-lg group-hover:scale-110 transition-transform
          `}>
            {type.icon}
          </div>

          {/* Content */}
          <h3 className="text-lg font-semibold text-text mb-2">
            {type.title}
            {type.comingSoon && (
              <span className="ml-2 text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
            )}
          </h3>
          <p className="text-sm text-muted leading-relaxed">
            {type.description}
          </p>

          {/* Hover Effect */}
          <div className={`
            absolute inset-0 rounded-2xl bg-gradient-to-br ${type.gradient} 
            opacity-0 group-hover:opacity-5 transition-opacity pointer-events-none
          `} />

          {/* Selected Indicator */}
          {selectedType === type.id && (
            <div className="absolute top-4 right-4">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
          )}
        </button>
      ))}
    </div>
  );
}