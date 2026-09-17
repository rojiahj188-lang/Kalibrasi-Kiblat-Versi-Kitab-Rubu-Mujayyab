import React, { useState, useMemo } from 'react';
import {
  gregorianToHijri,
  hijriToGregorian,
  getEventsForHijriDate,
  isAyyamulBidh,
  HIJRI_MONTHS_ID,
  HIJRI_MONTHS_AR,
  DAYS_ID,
  DAYS_AR,
  ISLAMIC_EVENTS,
  HijriDate,
  IslamicEvent,
} from '../utils/hijriCalendar';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Moon,
  Sun,
  Star,
  Sparkles,
  ArrowRightLeft,
  Bookmark,
  CalendarDays,
  Info
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const HijriCalendarView: React.FC = () => {
  const { isNaskah } = useTheme();
  // Current view state (Year & Month in Gregorian)
  const today = useMemo(() => new Date(), []);
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [dayAdjustment, setDayAdjustment] = useState<number>(0); // Koreksi rukyat: -1, 0, +1

  // Converter state
  const [converterMode, setConverterMode] = useState<'gregToHijri' | 'hijriToGreg'>('gregToHijri');
  const [convGregDate, setConvGregDate] = useState<string>(today.toISOString().split('T')[0]);
  const [convHijriYear, setConvHijriYear] = useState<number>(1448);
  const [convHijriMonth, setConvHijriMonth] = useState<number>(1);
  const [convHijriDay, setConvHijriDay] = useState<number>(1);

  // Computed today's Hijri date
  const todayHijri: HijriDate = useMemo(() => {
    return gregorianToHijri(today, dayAdjustment);
  }, [today, dayAdjustment]);

  // Generate calendar grid for current viewDate
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay(); // 0 = Ahad, 1 = Senin, ...

    // Number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Days from previous month for grid padding
    const prevMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthDays - i);
      const h = gregorianToHijri(d, dayAdjustment);
      days.push({
        date: d,
        hijri: h,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForHijriDate(h.day, h.month),
        isAyyamulBidh: isAyyamulBidh(h.day, h.month),
      });
    }

    // Current month days
    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const d = new Date(year, month, dayNum);
      const isCurrentDay =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();
      const h = gregorianToHijri(d, dayAdjustment);

      days.push({
        date: d,
        hijri: h,
        isCurrentMonth: true,
        isToday: isCurrentDay,
        events: getEventsForHijriDate(h.day, h.month),
        isAyyamulBidh: isAyyamulBidh(h.day, h.month),
      });
    }

    // Next month padding to make full 35 or 42 grid cells
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      const h = gregorianToHijri(d, dayAdjustment);
      days.push({
        date: d,
        hijri: h,
        isCurrentMonth: false,
        isToday: false,
        events: getEventsForHijriDate(h.day, h.month),
        isAyyamulBidh: isAyyamulBidh(h.day, h.month),
      });
    }

    return days;
  }, [viewDate, today, dayAdjustment]);

  // Converter outputs
  const convGregResult = useMemo(() => {
    if (converterMode === 'gregToHijri') {
      const d = new Date(convGregDate + 'T12:00:00');
      return gregorianToHijri(d, dayAdjustment);
    }
    return null;
  }, [converterMode, convGregDate, dayAdjustment]);

  const convHijriResult = useMemo(() => {
    if (converterMode === 'hijriToGreg') {
      const greg = hijriToGregorian(convHijriYear, convHijriMonth, convHijriDay, dayAdjustment);
      const h = gregorianToHijri(greg, dayAdjustment);
      return {
        gregorianDate: greg,
        hijri: h,
        formattedGreg: greg.toLocaleDateString('id-ID', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      };
    }
    return null;
  }, [converterMode, convHijriYear, convHijriMonth, convHijriDay, dayAdjustment]);

  // Next & Prev Month
  const handlePrevMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleResetToToday = () => {
    setViewDate(new Date());
  };

  return (
    <div className={`w-full flex flex-col gap-4 ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
      {/* Today's Hero Hijri Card */}
      <div className={`p-4 sm:p-6 rounded-3xl shadow-xl relative overflow-hidden border transition-colors ${
        isNaskah
          ? 'bg-[#ede0c8] border-[#b08453]'
          : 'bg-gradient-to-br from-amber-950/50 via-stone-900 to-stone-950 border-amber-500/40'
      }`}>
        {/* Subtle background moon icon */}
        <div className="absolute right-3 top-3 opacity-10 pointer-events-none">
          <Moon className={`w-36 h-36 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}`} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className={`flex items-center gap-2 text-xs font-semibold mb-1 ${
              isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'
            }`}>
              <Sparkles className="w-4 h-4" />
              <span>Kalender Falak Hijriyah & Masehi Nusantara</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isNaskah ? 'text-[#2c1a0e]' : 'text-amber-100'
            }`}>
              {todayHijri.formattedWithPasaran}
            </h2>
            <div className={`font-serif text-lg sm:text-xl mt-1 ${
              isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300/90'
            }`}>
              {todayHijri.day} {todayHijri.monthNameAr} {todayHijri.year} هـ
            </div>
            <div className={`text-xs mt-1 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
              Masehi:{' '}
              {today.toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </div>
          </div>

          {/* Quick Adjustment Pill */}
          <div className={`p-3 rounded-2xl border flex flex-col gap-1.5 sm:items-end ${
            isNaskah ? 'bg-[#f5ebd9] border-[#d8c5a8]' : 'bg-stone-950/70 border-stone-800'
          }`}>
            <span className={`text-[11px] font-medium ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Koreksi Rukyat / Isbat Kemenag:</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setDayAdjustment(prev => Math.max(-2, prev - 1))}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isNaskah ? 'bg-[#ebdcc0] hover:bg-[#dfceb5] text-[#2c1a0e]' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
                title="Kurangi 1 hari"
              >
                -1
              </button>
              <span className={`px-2.5 py-0.5 font-mono text-xs font-bold rounded-lg border ${
                isNaskah
                  ? 'bg-[#fbf7ee] text-[#8c4e1a] border-[#d8c5a8]'
                  : 'bg-stone-900 text-amber-300 border-stone-800'
              }`}>
                {dayAdjustment > 0 ? `+${dayAdjustment}` : dayAdjustment} hari
              </span>
              <button
                onClick={() => setDayAdjustment(prev => Math.min(2, prev + 1))}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  isNaskah ? 'bg-[#ebdcc0] hover:bg-[#dfceb5] text-[#2c1a0e]' : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                }`}
                title="Tambah 1 hari"
              >
                +1
              </button>
              {dayAdjustment !== 0 && (
                <button
                  onClick={() => setDayAdjustment(0)}
                  className={`ml-1 text-[10px] underline cursor-pointer ${
                    isNaskah ? 'text-[#8c4e1a] hover:text-[#6a370e]' : 'text-stone-400 hover:text-amber-300'
                  }`}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Calendar View */}
      <div className={`p-4 rounded-3xl shadow-lg space-y-4 border transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/90 border-stone-800'
      }`}>
        {/* Month Navigation Header */}
        <div className={`flex items-center justify-between pb-3 border-b ${
          isNaskah ? 'border-[#dfceb5]' : 'border-stone-800'
        }`}>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isNaskah ? 'bg-[#ede2cd] hover:bg-[#dfceb5] text-[#2c1a0e]' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
              title="Bulan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className={`font-bold text-sm sm:text-base ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-100'}`}>
              {viewDate.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              onClick={handleNextMonth}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isNaskah ? 'bg-[#ede2cd] hover:bg-[#dfceb5] text-[#2c1a0e]' : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
              title="Bulan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleResetToToday}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border cursor-pointer transition-colors ${
              isNaskah
                ? 'bg-[#ede2cd] hover:bg-[#dfceb5] text-[#2c1a0e] border-[#cfbc9e]'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
            }`}
          >
            Bulan Ini
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs">
          {DAYS_ID.map((d, idx) => (
            <div
              key={d}
              className={`py-1.5 rounded-lg ${
                idx === 5
                  ? (isNaskah ? 'text-[#196336] bg-[#dcfce7]/60' : 'text-emerald-400 bg-emerald-950/20')
                  : idx === 0
                  ? (isNaskah ? 'text-[#991b1b] bg-[#fee2e2]/60' : 'text-rose-400 bg-rose-950/20')
                  : (isNaskah ? 'text-[#634934] bg-[#f4ebd9]' : 'text-stone-400 bg-stone-950/30')
              }`}
            >
              <span className="block text-[11px]">{d}</span>
              <span className="font-serif text-[10px] opacity-70 block">{DAYS_AR[idx]}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((item, idx) => {
            const hasEvent = item.events.length > 0;
            const isFriday = item.date.getDay() === 5;
            const isSunday = item.date.getDay() === 0;

            return (
              <div
                key={idx}
                className={`min-h-[64px] sm:min-h-[76px] p-1 sm:p-1.5 rounded-xl border flex flex-col justify-between transition-all ${
                  item.isToday
                    ? (isNaskah ? 'bg-[#ede0c8] border-[#8c4e1a] shadow-md ring-1 ring-[#8c4e1a]' : 'bg-amber-600/20 border-amber-500 shadow-md ring-1 ring-amber-400/50')
                    : item.isCurrentMonth
                    ? (isNaskah ? 'bg-[#fcf9f2] border-[#e2d5c1] hover:border-[#b08453]' : 'bg-stone-950/70 border-stone-800/80 hover:border-amber-900/50')
                    : (isNaskah ? 'bg-[#f4ebd9]/40 border-transparent opacity-40' : 'bg-stone-950/20 border-stone-900/40 opacity-40')
                }`}
              >
                {/* Top row: Gregorian Date & Pasaran */}
                <div className="flex items-center justify-between text-[11px]">
                  <span
                    className={`font-bold ${
                      item.isToday
                        ? (isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300')
                        : isFriday
                        ? (isNaskah ? 'text-[#196336]' : 'text-emerald-400')
                        : isSunday
                        ? (isNaskah ? 'text-[#991b1b]' : 'text-rose-400')
                        : (isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200')
                    }`}
                  >
                    {item.date.getDate()}
                  </span>
                  <span className={`text-[9px] font-medium ${isNaskah ? 'text-[#8c745f]' : 'text-stone-500'}`}>
                    {item.hijri.pasaran}
                  </span>
                </div>

                {/* Center row: Hijri Day & Month abbreviation */}
                <div className="text-right my-0.5">
                  <span className={`text-xs sm:text-sm font-black font-mono ${
                    isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400/90'
                  }`}>
                    {item.hijri.day}
                  </span>
                  <span className={`text-[9px] block -mt-1 truncate ${
                    isNaskah ? 'text-[#634934]' : 'text-stone-400'
                  }`}>
                    {item.hijri.monthName.slice(0, 5)}
                  </span>
                </div>

                {/* Bottom row: Indicators */}
                <div className="flex items-center gap-1 mt-auto">
                  {item.isAyyamulBidh && (
                    <span
                      className="w-2 h-2 rounded-full bg-cyan-500"
                      title="Puasa Sunnah Ayyamul Bidh"
                    />
                  )}
                  {hasEvent && (
                    <span
                      className="w-2 h-2 rounded-full bg-emerald-500"
                      title={item.events.map(e => e.title).join(', ')}
                    />
                  )}
                  {item.isToday && (
                    <span className={`text-[8px] font-bold px-1 rounded ${
                      isNaskah ? 'bg-[#8c4e1a] text-white' : 'bg-amber-500 text-stone-950'
                    }`}>
                      Hari Ini
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className={`flex flex-wrap items-center gap-4 text-[11px] pt-2 border-t ${
          isNaskah ? 'border-[#dfceb5] text-[#634934]' : 'border-stone-800 text-stone-400'
        }`}>
          <div className="flex items-center gap-1.5">
            <span className={`w-2.5 h-2.5 rounded-full ${isNaskah ? 'bg-[#8c4e1a]' : 'bg-amber-500'}`} />
            <span>Hari Ini</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span>Ayyamul Bidh (13, 14, 15)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Hari Besar Islam</span>
          </div>
          <div className={`flex items-center gap-1.5 ml-auto ${isNaskah ? 'text-[#8c745f]' : 'text-stone-500'}`}>
            <span>Tradisi Pasaran: Pon, Wage, Kliwon, Legi, Pahing</span>
          </div>
        </div>
      </div>

      {/* Two-Way Date Converter Widget */}
      <div className={`p-4 sm:p-5 rounded-3xl space-y-4 border transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/90 border-stone-800'
      }`}>
        <div className={`flex items-center justify-between pb-3 border-b ${
          isNaskah ? 'border-[#dfceb5]' : 'border-stone-800'
        }`}>
          <div className="flex items-center gap-2">
            <ArrowRightLeft className={`w-4 h-4 ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-400'}`} />
            <h3 className={`font-bold text-xs sm:text-sm ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>
              Konversi Tanggal Masehi ⇄ Hijriyah
            </h3>
          </div>

          <div className={`flex items-center gap-1 p-1 rounded-xl border text-xs ${
            isNaskah ? 'bg-[#ede2cd] border-[#cfbc9e]' : 'bg-stone-950 border-stone-800'
          }`}>
            <button
              onClick={() => setConverterMode('gregToHijri')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                converterMode === 'gregToHijri'
                  ? (isNaskah ? 'bg-[#8c4e1a] text-white font-bold' : 'bg-amber-600 text-stone-950 font-bold')
                  : (isNaskah ? 'text-[#634934] hover:text-[#2c1a0e]' : 'text-stone-400 hover:text-stone-200')
              }`}
            >
              Masehi → Hijriyah
            </button>
            <button
              onClick={() => setConverterMode('hijriToGreg')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                converterMode === 'hijriToGreg'
                  ? (isNaskah ? 'bg-[#8c4e1a] text-white font-bold' : 'bg-amber-600 text-stone-950 font-bold')
                  : (isNaskah ? 'text-[#634934] hover:text-[#2c1a0e]' : 'text-stone-400 hover:text-stone-200')
              }`}
            >
              Hijriyah → Masehi
            </button>
          </div>
        </div>

        {/* Mode 1: Masehi -> Hijriyah */}
        {converterMode === 'gregToHijri' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <label className={`font-medium block ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Pilih Tanggal Masehi:</label>
              <input
                type="date"
                value={convGregDate}
                onChange={e => setConvGregDate(e.target.value)}
                className={`w-full rounded-xl px-3 py-2 font-mono border focus:outline-none transition-colors ${
                  isNaskah
                    ? 'bg-[#fcf9f2] border-[#cfbc9e] text-[#2c1a0e] focus:border-[#8c4e1a]'
                    : 'bg-stone-950 border-stone-700 text-stone-100 focus:border-amber-500'
                }`}
              />
            </div>

            {convGregResult && (
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isNaskah
                  ? 'bg-[#ede0c8] border-[#b08453]'
                  : 'bg-stone-950 border-amber-600/30'
              }`}>
                <span className={`text-[11px] block ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Hasil Konversi Hijriyah:</span>
                <span className={`text-lg font-bold block ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'}`}>
                  {convGregResult.formattedWithPasaran}
                </span>
                <span className={`font-serif text-sm block ${isNaskah ? 'text-[#7e4518]' : 'text-amber-400/90'}`}>
                  {convGregResult.day} {convGregResult.monthNameAr} {convGregResult.year} هـ
                </span>
              </div>
            )}
          </div>
        )}

        {/* Mode 2: Hijriyah -> Masehi */}
        {converterMode === 'hijriToGreg' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className={`font-medium block mb-1 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Tanggal (1-30):</label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={convHijriDay}
                  onChange={e => setConvHijriDay(parseInt(e.target.value, 10) || 1)}
                  className={`w-full rounded-xl px-3 py-2 font-mono text-center border focus:outline-none transition-colors ${
                    isNaskah
                      ? 'bg-[#fcf9f2] border-[#cfbc9e] text-[#2c1a0e] focus:border-[#8c4e1a]'
                      : 'bg-stone-950 border-stone-700 text-stone-100 focus:border-amber-500'
                  }`}
                />
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Bulan:</label>
                <select
                  value={convHijriMonth}
                  onChange={e => setConvHijriMonth(parseInt(e.target.value, 10))}
                  className={`w-full rounded-xl px-2 py-2 text-xs border focus:outline-none transition-colors ${
                    isNaskah
                      ? 'bg-[#fcf9f2] border-[#cfbc9e] text-[#2c1a0e] focus:border-[#8c4e1a]'
                      : 'bg-stone-950 border-stone-700 text-stone-100 focus:border-amber-500'
                  }`}
                >
                  {HIJRI_MONTHS_ID.map((m, idx) => (
                    <option key={m} value={idx + 1}>
                      {idx + 1}. {m}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={`font-medium block mb-1 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Tahun (H):</label>
                <input
                  type="number"
                  min="1"
                  max="1600"
                  value={convHijriYear}
                  onChange={e => setConvHijriYear(parseInt(e.target.value, 10) || 1448)}
                  className={`w-full rounded-xl px-3 py-2 font-mono text-center border focus:outline-none transition-colors ${
                    isNaskah
                      ? 'bg-[#fcf9f2] border-[#cfbc9e] text-[#2c1a0e] focus:border-[#8c4e1a]'
                      : 'bg-stone-950 border-stone-700 text-stone-100 focus:border-amber-500'
                  }`}
                />
              </div>
            </div>

            {convHijriResult && (
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isNaskah
                  ? 'bg-[#ede0c8] border-[#b08453]'
                  : 'bg-stone-950 border-amber-600/30'
              }`}>
                <span className={`text-[11px] block ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>Hasil Konversi Masehi:</span>
                <span className={`text-lg font-bold block ${isNaskah ? 'text-[#8c4e1a]' : 'text-amber-200'}`}>
                  {convHijriResult.formattedGreg}
                </span>
                <span className={`text-[11px] block ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>
                  Pasaran: <strong className={isNaskah ? 'text-[#8c4e1a]' : 'text-amber-300'}>{convHijriResult.hijri.pasaran}</strong>
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* List of Major Islamic Events */}
      <div className={`p-4 rounded-3xl space-y-3 border transition-colors ${
        isNaskah ? 'bg-[#faf5eb] border-[#d8c5a8]' : 'bg-stone-900/80 border-stone-800'
      }`}>
        <div className={`flex items-center gap-2 font-bold text-xs pb-2 border-b ${
          isNaskah ? 'text-[#8c4e1a] border-[#dfceb5]' : 'text-amber-300 border-stone-800'
        }`}>
          <Bookmark className="w-4 h-4" />
          <span>Daftar Hari Besar & Peringatan Islam Sepanjang Tahun</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {ISLAMIC_EVENTS.map(event => (
            <div
              key={event.title}
              className={`p-3 rounded-xl border flex items-start justify-between gap-2 ${
                isNaskah
                  ? 'bg-[#f4ebd9] border-[#dfceb5]'
                  : 'bg-stone-950/70 border-stone-800/80'
              }`}
            >
              <div>
                <span className={`font-bold block ${isNaskah ? 'text-[#2c1a0e]' : 'text-stone-200'}`}>{event.title}</span>
                <span className={`text-[11px] block mt-0.5 ${isNaskah ? 'text-[#634934]' : 'text-stone-400'}`}>{event.description}</span>
              </div>
              <span className={`shrink-0 px-2 py-0.5 text-[10px] font-mono rounded-lg border ${
                isNaskah
                  ? 'bg-[#ede0c8] border-[#b08453] text-[#8c4e1a]'
                  : 'bg-amber-950/50 border-amber-600/30 text-amber-300'
              }`}>
                {event.hijriDay} {HIJRI_MONTHS_ID[event.hijriMonth - 1]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
