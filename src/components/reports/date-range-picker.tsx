import { useTranslation } from "react-i18next";
import { format, startOfDay, endOfDay } from "date-fns";
import { IconCalendar } from "@tabler/icons-react";
import type { DateRange as DayPickerDateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DateRange, DatePreset } from "@/lib/types/report";
import { getDateRangeForPreset } from "@/lib/report-utils";

interface DateRangePickerProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  preset: DatePreset;
  onPresetChange: (preset: DatePreset) => void;
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  preset,
  onPresetChange,
}: DateRangePickerProps) {
  const { t } = useTranslation("reports");

  const handlePresetChange = (value: DatePreset) => {
    onPresetChange(value);
    if (value !== "custom") {
      const newRange = getDateRangeForPreset(value);
      onDateRangeChange(newRange);
    }
  };

  const handleCalendarSelect = (range: DayPickerDateRange | undefined) => {
    // Only update when both dates are selected
    if (range?.from && range?.to) {
      // Normalize dates: start of day for 'from', end of day for 'to'
      // This ensures the full day is included in the date range
      onDateRangeChange({
        from: startOfDay(range.from),
        to: endOfDay(range.to)
      });
      onPresetChange("custom");
    }
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {/* Preset Selector */}
      <Select value={preset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="today">{t("datePresets.today")}</SelectItem>
          <SelectItem value="this_week">{t("datePresets.thisWeek")}</SelectItem>
          <SelectItem value="this_month">{t("datePresets.thisMonth")}</SelectItem>
          <SelectItem value="last_30_days">{t("datePresets.last30Days")}</SelectItem>
          <SelectItem value="custom">{t("datePresets.custom")}</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range Display & Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal sm:w-auto"
          >
            <IconCalendar className="mr-2 h-4 w-4" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "PP")} - {format(dateRange.to, "PP")}
                </>
              ) : (
                format(dateRange.from, "PP")
              )
            ) : (
              <span>{t("datePresets.custom")}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={dateRange.from}
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
