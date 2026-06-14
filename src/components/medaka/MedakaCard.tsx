"use client";

import { Medaka } from "@/types/medaka";
import { getGenderLabel, getGenderColor, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Fish, Calendar, StickyNote } from "lucide-react";

interface MedakaCardProps {
  medaka: Medaka;
  onClick?: () => void;
}

export function MedakaCard({ medaka, onClick }: MedakaCardProps) {
  const hasPhoto = medaka.photos.length > 0;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-95"
    >
      <div className="flex">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-cyan-100 flex-shrink-0 flex items-center justify-center">
          {hasPhoto ? (
            <img
              src={medaka.photos[medaka.photos.length - 1].url}
              alt={medaka.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <Fish className="w-8 h-8 text-cyan-400" />
          )}
        </div>
        <div className="flex-1 p-3 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{medaka.name}</h3>
              <p className="text-xs text-gray-500 truncate">{medaka.variety}</p>
            </div>
            <span className={`text-sm font-bold flex-shrink-0 ${getGenderColor(medaka.gender)}`}>
              {medaka.gender === "male" ? "♂" : medaka.gender === "female" ? "♀" : "?"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {medaka.generation && (
              <Badge variant="info">F{medaka.generation}</Badge>
            )}
            {!medaka.isAlive && (
              <Badge variant="error">★</Badge>
            )}
            {medaka.parentIds?.father || medaka.parentIds?.mother ? (
              <Badge variant="success">血統あり</Badge>
            ) : null}
          </div>
          {medaka.notes && (
            <p className="text-xs text-gray-400 mt-1 truncate">{medaka.notes}</p>
          )}
        </div>
      </div>
    </div>
  );
}
