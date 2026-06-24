import React, { useMemo, useRef, useState } from 'react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getDisplayValue = (value) => {
  if (!value) return '';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};

const getInitialMonth = (value) => {
  if (!value) return new Date();
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
};

const DarkDatePicker = ({ value, onChange, required = false }) => {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => getInitialMonth(value));

  const calendarDays = useMemo(() => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    return [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, month, index + 1))
    ];
  }, [visibleMonth]);

  const selectedDate = value ? getInitialMonth(value) : null;
  const todayValue = toDateValue(new Date());

  const changeMonth = (offset) => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  };

  const selectDate = (date) => {
    onChange(toDateValue(date));
    setIsOpen(false);
  };

  const handleBlur = (event) => {
    if (!wrapperRef.current?.contains(event.relatedTarget)) {
      setIsOpen(false);
    }
  };

  return (
    <div className="date-picker" ref={wrapperRef} onBlur={handleBlur}>
      <input
        type="text"
        className="form-control date-picker-trigger"
        value={value ? getDisplayValue(value) : ''}
        placeholder="Select date"
        readOnly
        required={required}
        onClick={() => setIsOpen((current) => !current)}
        onFocus={() => setIsOpen(true)}
        aria-label="Activity date"
        onChange={() => {}}
      />

      {isOpen && (
        <div className="date-picker-calendar" role="dialog" aria-label="Choose activity date">
          <div className="date-picker-header">
            <button type="button" className="date-picker-nav" onClick={() => changeMonth(-1)} aria-label="Previous month">
              &lt;
            </button>
            <div className="date-picker-month">
              {visibleMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
            </div>
            <button type="button" className="date-picker-nav" onClick={() => changeMonth(1)} aria-label="Next month">
              &gt;
            </button>
          </div>

          <div className="date-picker-grid date-picker-weekdays">
            {WEEKDAYS.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          <div className="date-picker-grid">
            {calendarDays.map((date, index) => {
              if (!date) return <div key={`empty-${index}`} className="date-picker-empty" />;

              const dateValue = toDateValue(date);
              const isSelected = selectedDate && toDateValue(selectedDate) === dateValue;
              const isToday = todayValue === dateValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  className={`date-picker-day${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default DarkDatePicker;
