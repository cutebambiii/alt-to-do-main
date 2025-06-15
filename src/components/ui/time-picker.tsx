import * as React from "react"
import { Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TimePicker({
  value = "09:00",
  onChange,
  disabled = false,
  placeholder = "Select time",
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hours, setHours] = React.useState(() => {
    if (value) {
      return parseInt(value.split(':')[0], 10)
    }
    return 9
  })
  const [minutes, setMinutes] = React.useState(() => {
    if (value) {
      return parseInt(value.split(':')[1], 10)
    }
    return 0
  })

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number)
      setHours(h)
      setMinutes(m)
    }
  }, [value])

  const formatTime = (h: number, m: number) => {
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHours(newHours)
    setMinutes(newMinutes)
    const timeString = formatTime(newHours, newMinutes)
    onChange?.(timeString)
  }

  const handleHourChange = (newHour: number) => {
    if (newHour >= 0 && newHour <= 23) {
      handleTimeChange(newHour, minutes)
    }
  }

  const handleMinuteChange = (newMinute: number) => {
    if (newMinute >= 0 && newMinute <= 59) {
      handleTimeChange(hours, newMinute)
    }
  }

  const displayTime = formatTime(hours, minutes)

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal h-11",
            !value && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <Clock className="mr-2 h-4 w-4" />
          {displayTime || placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="text-sm font-medium text-center">Select Time</div>
          
          <div className="flex items-center justify-center space-x-2">
            {/* Hours */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground text-center block">Hours</Label>
              <div className="flex flex-col space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 p-0"
                  onClick={() => handleHourChange(hours + 1 > 23 ? 0 : hours + 1)}
                >
                  +
                </Button>
                <Input
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => handleHourChange(parseInt(e.target.value, 10) || 0)}
                  className="h-12 w-16 text-center text-lg font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 p-0"
                  onClick={() => handleHourChange(hours - 1 < 0 ? 23 : hours - 1)}
                >
                  -
                </Button>
              </div>
            </div>

            <div className="text-2xl font-bold text-muted-foreground pt-6">:</div>

            {/* Minutes */}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground text-center block">Minutes</Label>
              <div className="flex flex-col space-y-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 p-0"
                  onClick={() => handleMinuteChange(minutes + 5 > 59 ? 0 : minutes + 5)}
                >
                  +
                </Button>
                <Input
                  type="number"
                  min="0"
                  max="59"
                  step="5"
                  value={minutes}
                  onChange={(e) => handleMinuteChange(parseInt(e.target.value, 10) || 0)}
                  className="h-12 w-16 text-center text-lg font-mono"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-12 p-0"
                  onClick={() => handleMinuteChange(minutes - 5 < 0 ? 55 : minutes - 5)}
                >
                  -
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Quick Select</Label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "9:00 AM", value: "09:00" },
                { label: "12:00 PM", value: "12:00" },
                { label: "5:00 PM", value: "17:00" },
                { label: "6:00 PM", value: "18:00" },
                { label: "8:00 PM", value: "20:00" },
                { label: "11:59 PM", value: "23:59" },
              ].map((preset) => (
                <Button
                  key={preset.value}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    const [h, m] = preset.value.split(':').map(Number)
                    handleTimeChange(h, m)
                  }}
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                handleTimeChange(9, 0)
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Reset
            </Button>
            <Button
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}