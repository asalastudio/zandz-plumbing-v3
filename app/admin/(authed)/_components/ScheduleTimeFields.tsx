"use client";

import { useMemo, useState } from "react";
import { CalendarClock, ChevronDown } from "lucide-react";

type TimeOption = {
  value: string;
  label: string;
};

type ScheduleTimeFieldsProps = {
  initialStart?: string | null;
  initialEnd?: string | null;
  description?: string;
  scheduledBadge?: string;
  className?: string;
};

const TIME_OPTIONS = buildTimeOptions(6, 20);

function buildTimeOptions(startHour: number, endHour: number): TimeOption[] {
  const options: TimeOption[] = [];
  for (let hour = startHour; hour <= endHour; hour += 1) {
    for (const minute of [0, 30]) {
      if (hour === endHour && minute > 0) continue;
      const value = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
      const hour12 = hour % 12 || 12;
      const period = hour < 12 ? "AM" : "PM";
      options.push({ value, label: `${hour12}:${minute.toString().padStart(2, "0")} ${period}` });
    }
  }
  return options;
}

function localDateValue(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function localTimeValue(date: Date): string {
  const minutes = date.getMinutes() < 30 ? "00" : "30";
  return `${date.getHours().toString().padStart(2, "0")}:${minutes}`;
}

function parseInitialDate(iso?: string | null): Date | null {
  if (!iso) return null;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIso(date: string, time: string): string {
  if (!date || !time) return "";
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? "" : parsed.toISOString();
}

export function ScheduleTimeFields({
  initialStart,
  initialEnd,
  description = "Choose a day and time after the first callback. Leave the start time blank to keep this as a new lead.",
  scheduledBadge = "Will create as scheduled",
  className = "",
}: ScheduleTimeFieldsProps) {
  const parsedStart = parseInitialDate(initialStart);
  const parsedEnd = parseInitialDate(initialEnd);
  const [date, setDate] = useState(() => localDateValue(parsedStart ?? new Date()));
  const [startTime, setStartTime] = useState(() => (parsedStart ? localTimeValue(parsedStart) : ""));
  const [endTime, setEndTime] = useState(() => (parsedEnd ? localTimeValue(parsedEnd) : ""));

  const endOptions = useMemo(
    () => TIME_OPTIONS.filter((option) => !startTime || option.value > startTime),
    [startTime]
  );

  const scheduledStart = startTime ? toIso(date, startTime) : "";
  const scheduledEnd = startTime && endTime > startTime ? toIso(date, endTime) : "";

  return (
    <section className={`border border-line bg-raised p-5 md:p-6 ${className}`}>
      <input type="hidden" name="scheduled_start" value={scheduledStart} />
      <input type="hidden" name="scheduled_end" value={scheduledEnd} />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-bold text-[#F96302]">
            <CalendarClock className="h-5 w-5" aria-hidden="true" />
            Schedule
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>
        </div>
        {startTime && (
          <span className="inline-flex bg-[#F96302]/15 px-3 py-2 text-sm font-semibold text-[#F96302]">
            {scheduledBadge}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-muted">Service day</span>
          <input
            type="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="h-12 w-full border border-line bg-card px-4 text-base text-ink outline-none transition-colors focus:border-[#F96302]"
          />
        </label>

        <SelectField
          label="Scheduled start"
          value={startTime}
          onChange={(value) => {
            setStartTime(value);
            if (!value || (endTime && endTime <= value)) setEndTime("");
          }}
          options={TIME_OPTIONS}
          placeholder="Not scheduled yet"
        />

        <SelectField
          label="Scheduled end"
          value={endTime}
          onChange={setEndTime}
          options={endOptions}
          placeholder={startTime ? "Select end time" : "Choose start first"}
          disabled={!startTime}
        />
      </div>
    </section>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: TimeOption[];
  placeholder: string;
  disabled?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-muted">{label}</span>
      <span className="relative block">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          className="h-12 w-full appearance-none border border-line bg-card px-4 pr-11 text-base text-ink outline-none transition-colors focus:border-[#F96302] disabled:cursor-not-allowed disabled:text-muted"
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#F96302]"
          aria-hidden="true"
        />
      </span>
    </label>
  );
}
