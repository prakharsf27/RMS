'use client';
import { useState } from "react";
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";
import styles from "./Calendar.module.css";

export const CalendarCustom = ({ selected, onSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const renderHeader = () => {
    return (
      <div className={styles.header}>
        <div className={styles.monthTitle}>
          {format(currentMonth, "MMMM yyyy")}
        </div>
        <div className={styles.navButtons}>
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}><ChevronLeft size={18} /></button>
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}><ChevronRight size={18} /></button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const date = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    for (let i = 0; i < 7; i++) {
      days.push(<div key={i} className={styles.dayLabel}>{date[i]}</div>);
    }
    return <div className={styles.daysRow}>{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d");
        const cloneDay = day;
        days.push(
          <div
            key={day}
            className={cn(
              styles.cell,
              !isSameMonth(day, monthStart) ? styles.disabled : isSameDay(day, selected) ? styles.selected : ""
            )}
            onClick={() => onSelect(cloneDay)}
          >
            <span className={styles.number}>{formattedDate}</span>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className={styles.row} key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className={styles.body}>{rows}</div>;
  };

  return (
    <div className={styles.calendar}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};
