"use client";

import { formatMd, weekdayJa } from "@/lib/work/date";
import { WeekBucket } from "@/lib/work/planner";
import { formatMinutes } from "./taskStyles";

/**
 * 今日から7日分の負荷。
 * 「いつ詰まっているか」が見えると、前倒しの判断ができる。
 */
export function WeekLoad({
  buckets,
  capacityMin,
}: {
  buckets: WeekBucket[];
  capacityMin: number;
}) {
  const peak = Math.max(capacityMin, ...buckets.map((b) => b.minutes));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-sm font-bold text-slate-800">この先1週間の山</h2>
        <span className="text-[11px] text-slate-400">
          赤 = 目安の{formatMinutes(capacityMin)}を超える日
        </span>
      </div>

      {/* 棒の高さは % 指定なので、各列に明示的な高さが要る */}
      <div className="flex items-stretch gap-1.5" style={{ height: 96 }}>
        {buckets.map((bucket, index) => {
          const heightPct = peak === 0 ? 0 : (bucket.minutes / peak) * 100;
          const over = bucket.minutes > capacityMin;

          return (
            <div
              key={bucket.date}
              className="flex h-full flex-1 flex-col justify-end gap-1"
              title={`${formatMd(bucket.date)} ${bucket.count}件 / ${formatMinutes(bucket.minutes)}`}
            >
              <span className="text-center text-[10px] text-slate-400">
                {bucket.count > 0 ? bucket.count : ""}
              </span>
              {/* 予定が無い日も枠として見えるよう、薄い土台を敷く */}
              <div className="flex-1 rounded bg-slate-100">
                <div className="flex h-full flex-col justify-end">
                  <div
                    className={`w-full rounded transition-all ${
                      over
                        ? "bg-rose-400"
                        : index === 0
                          ? "bg-teal-600"
                          : "bg-teal-400"
                    }`}
                    style={{
                      height: `${bucket.count ? Math.max(heightPct, 8) : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-1.5 flex gap-1.5">
        {buckets.map((bucket, index) => (
          <div key={bucket.date} className="flex-1 text-center">
            <p
              className={`text-[10px] ${
                index === 0 ? "font-bold text-teal-700" : "text-slate-400"
              }`}
            >
              {index === 0 ? "今日" : weekdayJa(bucket.date)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
