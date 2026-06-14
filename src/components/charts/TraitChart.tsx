"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Medaka } from "@/types/medaka";

interface TraitChartProps {
  medakas: Medaka[];
  traitName?: string;
}

export function VarietyDistributionChart({ medakas }: { medakas: Medaka[] }) {
  const counts: Record<string, number> = {};
  medakas.forEach((m) => {
    counts[m.variety] = (counts[m.variety] || 0) + 1;
  });
  const data = Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
        <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} name="個体数" />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface RadarData {
  subject: string;
  value: number;
  fullMark: number;
}

export function MedakaRadarChart({ medaka }: { medaka: Medaka }) {
  const traitMap: Record<string, number> = {};
  medaka.traits.forEach((t) => {
    if (typeof t.value === "number") {
      traitMap[t.name] = t.value;
    }
  });

  const data: RadarData[] = Object.entries(traitMap).map(([subject, value]) => ({
    subject,
    value,
    fullMark: 10,
  }));

  if (data.length < 3) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        特性データが3項目以上必要です
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <RadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
        <Radar
          name={medaka.name}
          dataKey="value"
          stroke="#06b6d4"
          fill="#06b6d4"
          fillOpacity={0.3}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export function GenerationChart({ medakas }: { medakas: Medaka[] }) {
  const counts: Record<number, number> = {};
  medakas.forEach((m) => {
    if (m.generation) {
      counts[m.generation] = (counts[m.generation] || 0) + 1;
    }
  });
  const data = Object.entries(counts)
    .map(([gen, count]) => ({ name: `F${gen}`, value: count }))
    .sort((a, b) => a.name.localeCompare(b.name));

  if (data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height={150}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip
          contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}
        />
        <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="個体数" />
      </BarChart>
    </ResponsiveContainer>
  );
}
