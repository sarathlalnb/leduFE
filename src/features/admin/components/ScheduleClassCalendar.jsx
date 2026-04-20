import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ScheduleClassCalendar = ({ onDatesSelected, selectedDates = [] }) => {
  const [scheduleType, setScheduleType] = useState("single"); // single, pattern, custom
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [time, setTime] = useState("09:00"); // default time 9:00 AM
  const [patternType, setPatternType] = useState("preset"); // preset or multi-select
  const [pattern, setPattern] = useState("all-saturdays");
  const [selectedWeekDays, setSelectedWeekDays] = useState([]); // for multi-select
  const [customDays, setCustomDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Day map with all individual days and combinations
  const dayMap = {
    "all-days": [0, 1, 2, 3, 4, 5, 6],
    "all-sundays": [0],
    "all-mondays": [1],
    "all-tuesdays": [2],
    "all-wednesdays": [3],
    "all-thursdays": [4],
    "all-fridays": [5],
    "all-saturdays": [6],
    "weekdays": [1, 2, 3, 4, 5],
    "weekends": [0, 6],
  };

  // Get all days in current month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Generate dates based on pattern
  const generateDatesByPattern = (start, end, patternDays) => {
    const dates = [];
    const current = new Date(start);
    const endDate = new Date(end);

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (patternDays.includes(dayOfWeek)) {
        dates.push(new Date(current));
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  // Generate final dates based on selection
  const generateDates = () => {
    let dates = [];

    if (scheduleType === "single" && startDate) {
      dates = [new Date(startDate)];
    } else if (scheduleType === "pattern" && startDate && endDate) {
      let daysToInclude = [];
      
      if (patternType === "preset") {
        daysToInclude = dayMap[pattern] || [];
      } else {
        daysToInclude = selectedWeekDays.length > 0 ? selectedWeekDays : [];
      }
      
      if (daysToInclude.length > 0) {
        dates = generateDatesByPattern(startDate, endDate, daysToInclude);
      }
    } else if (scheduleType === "custom" && customDays.length > 0) {
      dates = customDays.map(dateStr => new Date(dateStr)).sort((a, b) => a - b);
    }

    // Format dates with time to ISO datetime strings
    const formattedDates = dates.map(d => {
      const dateStr = d.toISOString().split('T')[0];
      return `${dateStr}T${time}`;
    });
    onDatesSelected(formattedDates);
  };

  // Toggle custom day selection
  const toggleCustomDay = (dateStr) => {
    setCustomDays(prev => {
      if (prev.includes(dateStr)) {
        return prev.filter(d => d !== dateStr);
      } else {
        return [...prev, dateStr];
      }
    });
  };

  // Handle calendar navigation
  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  // Render calendar
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      const isSelected = customDays.includes(dateStr);

      days.push(
        <button
          key={day}
          onClick={() => toggleCustomDay(dateStr)}
          className={`p-2 rounded text-sm font-medium transition-colors ${
            isSelected
              ? "bg-red-500 text-white"
              : "bg-gray-100 text-gray-900 hover:bg-gray-200"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div className="space-y-4">
      {/* Schedule Type Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Schedule Type</label>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="single"
              checked={scheduleType === "single"}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm">Single Date</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="pattern"
              checked={scheduleType === "pattern"}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm">Pattern (e.g., All Saturdays)</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="custom"
              checked={scheduleType === "custom"}
              onChange={(e) => setScheduleType(e.target.value)}
              className="w-4 h-4"
            />
            <span className="text-sm">Custom Days</span>
          </label>
        </div>
      </div>

      {/* Single Date */}
      {scheduleType === "single" && (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Select Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Select Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      )}

      {/* Pattern Selection */}
      {scheduleType === "pattern" && (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>

          {/* Pattern Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Pattern Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="preset"
                  checked={patternType === "preset"}
                  onChange={(e) => {
                    setPatternType(e.target.value);
                    setSelectedWeekDays([]);
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Preset Patterns</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="multi"
                  checked={patternType === "multi"}
                  onChange={(e) => {
                    setPatternType(e.target.value);
                    setPattern("all-saturdays");
                  }}
                  className="w-4 h-4"
                />
                <span className="text-sm">Select Multiple Days</span>
              </label>
            </div>
          </div>

          {/* Preset Patterns */}
          {patternType === "preset" && (
            <div>
              <label className="text-sm font-medium">Choose Pattern</label>
              <select
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="all-days">All Days</option>
                <option value="all-mondays">All Mondays</option>
                <option value="all-tuesdays">All Tuesdays</option>
                <option value="all-wednesdays">All Wednesdays</option>
                <option value="all-thursdays">All Thursdays</option>
                <option value="all-fridays">All Fridays</option>
                <option value="all-saturdays">All Saturdays</option>
                <option value="all-sundays">All Sundays</option>
                <option value="weekdays">All Weekdays (Mon-Fri)</option>
                <option value="weekends">All Weekends (Sat-Sun)</option>
              </select>
            </div>
          )}

          {/* Multi-Select Days */}
          {patternType === "multi" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Select Days of Week</label>
              <div className="grid grid-cols-2 gap-2">
                {[0, 1, 2, 3, 4, 5, 6].map((dayNum) => (
                  <label key={dayNum} className="flex items-center gap-2 p-2 border rounded hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedWeekDays.includes(dayNum)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedWeekDays([...selectedWeekDays, dayNum]);
                        } else {
                          setSelectedWeekDays(selectedWeekDays.filter(d => d !== dayNum));
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{daysOfWeek[dayNum]}</span>
                  </label>
                ))}
              </div>
              {selectedWeekDays.length > 0 && (
                <p className="text-xs text-gray-600 mt-2">
                  Selected: {selectedWeekDays.map(d => daysOfWeek[d]).join(", ")}
                </p>
              )}
            </div>
          )}

          {/* Time Selection for Pattern */}
          <div>
            <label className="text-sm font-medium">Select Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      )}

      {/* Custom Calendar */}
      {scheduleType === "custom" && (
        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={previousMonth}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronLeft size={20} />
              </button>
              <h3 className="font-semibold text-center flex-1">
                {currentMonth.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </h3>
              <button
                onClick={nextMonth}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {daysOfWeek.map((day) => (
                <div key={day} className="p-2 text-center text-xs font-semibold text-gray-600">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {renderCalendar()}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <p className="font-medium">Selected dates: {customDays.length}</p>
            {customDays.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {customDays.sort().map((date) => (
                  <span
                    key={date}
                    className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs"
                  >
                    {new Date(date).toLocaleDateString()}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Time Selection for Custom Days */}
          <div>
            <label className="text-sm font-medium">Select Time</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="mt-1 w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
        </div>
      )}

      {/* Generate Dates Button */}
      <button
        onClick={generateDates}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
      >
        Generate Schedule
      </button>

      {/* Preview */}
      {selectedDates.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Generated Schedule: {selectedDates.length} classes
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {selectedDates.map((datetime, idx) => {
              const date = new Date(datetime);
              const dateStr = date.toLocaleDateString();
              const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              return (
                <p key={idx} className="text-xs text-blue-700">
                  {dateStr} at {timeStr}
                </p>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleClassCalendar;
