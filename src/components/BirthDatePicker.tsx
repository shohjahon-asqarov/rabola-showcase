import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Props {
  value?: string; // ISO yyyy-mm-dd
  onChange: (v: string) => void;
  placeholder?: string;
}

export default function BirthDatePicker({ value, onChange, placeholder = "Tug'ilgan sanani tanlang" }: Props) {
  const selected = value ? new Date(value) : undefined;
  const [month, setMonth] = React.useState<Date>(selected || new Date(2005, 0, 1));
  const today = new Date();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm text-left flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all",
            !selected && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          {selected ? format(selected, "dd MMM yyyy") : placeholder}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={(d) => d && onChange(format(d, "yyyy-MM-dd"))}
          month={month}
          onMonthChange={setMonth}
          captionLayout="dropdown-buttons"
          fromYear={1900}
          toYear={today.getFullYear()}
          disabled={{ after: today }}
          initialFocus
          className="p-3 pointer-events-auto"
          classNames={{
            caption_label: "hidden",
            caption_dropdowns: "flex gap-2 justify-center",
            dropdown: "rounded-lg border border-border bg-background text-sm px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary/30",
            dropdown_month: "font-medium",
            dropdown_year: "font-medium",
            vhidden: "hidden",
          }}
        />
      </PopoverContent>
    </Popover>
  );
}