import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { cn } from "./utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateRangeChange: (startDate: Date | null, endDate: Date | null) => void;
  className?: string;
}

export function DateRangePicker({
  startDate,
  endDate,
  onDateRangeChange,
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startDate || undefined,
    to: endDate || undefined,
  });

  React.useEffect(() => {
    setDate({
      from: startDate || undefined,
      to: endDate || undefined,
    });
  }, [startDate, endDate]);

  const handleRangeSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      onDateRangeChange(range.from, range.to);
    } else if (!range?.from && !range?.to) {
      onDateRangeChange(null, null);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "h-8 justify-start text-left font-normal text-sm",
              date?.from && date?.to ? "w-[205px]" : "w-[110px]",
              !date?.from && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "yyyy.MM.dd", { locale: ko })} -{" "}
                  {format(date.to, "yyyy.MM.dd", { locale: ko })}
                </>
              ) : (
                format(date.from, "yyyy.MM.dd", { locale: ko })
              )
            ) : (
              <span>기간 설정</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleRangeSelect}
            numberOfMonths={1}
            locale={ko}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
