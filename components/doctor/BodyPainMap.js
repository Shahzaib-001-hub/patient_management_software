"use client";

import { useState } from "react";
import { X } from "lucide-react";

const FRONT_REGIONS = [
  { id: "head_neck_front", label: "Head & Cervical (Front)", side: "center", cx: 100, cy: 36, r: 16 },
  { id: "right_shoulder_front", label: "Right Shoulder", side: "right", cx: 64, cy: 72, r: 12 },
  { id: "left_shoulder_front", label: "Left Shoulder", side: "left", cx: 136, cy: 72, r: 12 },
  { id: "chest", label: "Chest / Upper Torso", side: "center", cx: 100, cy: 90, r: 16 },
  { id: "abdomen", label: "Abdomen / Core", side: "center", cx: 100, cy: 128, r: 15 },
  { id: "right_arm_front", label: "Right Arm / Elbow", side: "right", cx: 48, cy: 112, r: 10 },
  { id: "left_arm_front", label: "Left Arm / Elbow", side: "left", cx: 152, cy: 112, r: 10 },
  { id: "right_hip_front", label: "Right Hip / Groin", side: "right", cx: 80, cy: 162, r: 12 },
  { id: "left_hip_front", label: "Left Hip / Groin", side: "left", cx: 120, cy: 162, r: 12 },
  { id: "right_thigh_front", label: "Right Thigh", side: "right", cx: 80, cy: 202, r: 12 },
  { id: "left_thigh_front", label: "Left Thigh", side: "left", cx: 120, cy: 202, r: 12 },
  { id: "right_knee", label: "Right Knee", side: "right", cx: 80, cy: 242, r: 11 },
  { id: "left_knee", label: "Left Knee", side: "left", cx: 120, cy: 242, r: 11 },
  { id: "right_ankle", label: "Right Ankle / Foot", side: "right", cx: 80, cy: 292, r: 10 },
  { id: "left_ankle", label: "Left Ankle / Foot", side: "left", cx: 120, cy: 292, r: 10 },
];

const BACK_REGIONS = [
  { id: "neck_back", label: "Cervical Spine (Neck)", side: "center", cx: 100, cy: 48, r: 13 },
  { id: "left_shoulder_back", label: "Left Scapula / Shoulder", side: "left", cx: 68, cy: 76, r: 12 },
  { id: "right_shoulder_back", label: "Right Scapula / Shoulder", side: "right", cx: 132, cy: 76, r: 12 },
  { id: "upper_back", label: "Thoracic Spine (Upper Back)", side: "center", cx: 100, cy: 96, r: 15 },
  { id: "lower_back", label: "Lumbar Spine (Lower Back)", side: "center", cx: 100, cy: 136, r: 16 },
  { id: "left_glute", label: "Left Gluteal / SI Joint", side: "left", cx: 80, cy: 166, r: 12 },
  { id: "right_glute", label: "Right Gluteal / SI Joint", side: "right", cx: 120, cy: 166, r: 12 },
  { id: "left_thigh_back", label: "Left Hamstring", side: "left", cx: 80, cy: 206, r: 12 },
  { id: "right_thigh_back", label: "Right Hamstring", side: "right", cx: 120, cy: 206, r: 12 },
  { id: "left_calf", label: "Left Calf / Achilles", side: "left", cx: 80, cy: 262, r: 11 },
  { id: "right_calf", label: "Right Calf / Achilles", side: "right", cx: 120, cy: 262, r: 11 },
];

const PAIN_TYPES = ["aching", "sharp", "burning", "shooting", "throbbing", "numbness"];

export function BodyPainMap({ value = [], onChange, readOnly = false }) {
  const [view, setView] = useState("front");

  const regions = view === "front" ? FRONT_REGIONS : BACK_REGIONS;

  function toggleRegion(region) {
    if (readOnly) return;
    const exists = value.find((item) => item.bodyRegion === region.id);
    if (exists) {
      onChange(value.filter((item) => item.bodyRegion !== region.id));
    } else {
      onChange([
        ...value,
        {
          bodyRegion: region.id,
          label: region.label,
          view,
          side: region.side,
          painType: "aching",
          severity: 5,
        },
      ]);
    }
  }

  function updateRegion(bodyRegion, field, val) {
    if (readOnly) return;
    onChange(
      value.map((item) =>
        item.bodyRegion === bodyRegion ? { ...item, [field]: val } : item
      )
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <div className="bg-[#F5F8FC] rounded-xl border border-slate-200 p-4 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-3">
          <button
            type="button"
            onClick={() => setView("front")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              view === "front"
                ? "bg-[#283983] text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Front View
          </button>
          <button
            type="button"
            onClick={() => setView("back")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              view === "back"
                ? "bg-[#283983] text-white"
                : "bg-white text-slate-600 border border-slate-200"
            }`}
          >
            Back View
          </button>
        </div>

        <svg viewBox="0 0 200 320" className="w-56 h-80 select-none">
          {/* Stylized Anatomical Silhouette */}
          <g fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5">
            <circle cx="100" cy="28" r="16" />
            <rect x="92" y="44" width="16" height="12" rx="4" />
            <path d="M62 60 Q100 52 138 60 L144 150 Q100 162 56 150 Z" />
            {/* Arms */}
            <path d="M58 64 L36 142 L48 146 L66 78 Z" />
            <path d="M142 64 L164 142 L152 146 L134 78 Z" />
            {/* Legs */}
            <path d="M66 152 L70 298 L88 298 L96 164 Z" />
            <path d="M134 152 L130 298 L112 298 L104 164 Z" />
          </g>

          {regions.map((r) => {
            const selected = value.find((v) => v.bodyRegion === r.id);
            return (
              <g
                key={r.id}
                onClick={() => toggleRegion(r)}
                className={readOnly ? "" : "cursor-pointer"}
              >
                <circle
                  cx={r.cx}
                  cy={r.cy}
                  r={r.r}
                  fill={selected ? "#BA2820" : "#283983"}
                  fillOpacity={selected ? 0.65 : 0.14}
                  stroke={selected ? "#BA2820" : "#283983"}
                  strokeWidth={selected ? 2 : 1}
                />
                {selected && (
                  <text
                    x={r.cx}
                    y={r.cy + 3.5}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {selected.severity}
                  </text>
                )}
                <title>{r.label}</title>
              </g>
            );
          })}
        </svg>

        <p className="text-[11px] text-slate-500 mt-2 text-center">
          {readOnly
            ? "Marked pain locations"
            : "Click body regions to mark or unmark painful locations"}
        </p>
      </div>

      <div className="space-y-2.5">
        <h3 className="text-sm font-semibold text-slate-800">
          Selected Pain Locations ({value.length})
        </h3>
        {value.length === 0 ? (
          <div className="p-4 rounded-xl border border-dashed border-slate-300 text-xs text-slate-500 text-center">
            No body regions marked yet. Click on the diagram to add locations.
          </div>
        ) : (
          value.map((loc) => (
            <div
              key={loc.bodyRegion}
              className="p-3 rounded-xl bg-white border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-900">
                  {loc.label || loc.bodyRegion.replace(/_/g, " ")} ({loc.view}, {loc.side})
                </span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() =>
                      onChange(value.filter((v) => v.bodyRegion !== loc.bodyRegion))
                    }
                    className="text-slate-400 hover:text-[#BA2820]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Pain Type
                  </label>
                  <select
                    disabled={readOnly}
                    value={loc.painType}
                    onChange={(e) =>
                      updateRegion(loc.bodyRegion, "painType", e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
                  >
                    {PAIN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Severity ({loc.severity}/10)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    disabled={readOnly}
                    value={loc.severity}
                    onChange={(e) =>
                      updateRegion(
                        loc.bodyRegion,
                        "severity",
                        Number(e.target.value)
                      )
                    }
                    className="w-full accent-[#BA2820]"
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
