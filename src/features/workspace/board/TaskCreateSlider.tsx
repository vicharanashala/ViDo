import React, { useState, useRef, useEffect } from 'react';
import {
  AlignLeft,
  Calendar,
  Clock,
  Star,
  Flag,
  X,
  ChevronDown,
  Check,
  Folder,
  CalendarClock,
} from 'lucide-react';
import { formatDeadlineLabel } from './TaskBoardCard';
import { formatTaskDate } from '../../../utils/recurrence';

export interface TaskCreateSliderProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (
    category: string,
    title: string,
    options?: {
      description?: string;
      dueDate?: string;
      dueTime?: string;
      deadline?: string;
      priority?: 'high' | 'medium' | 'low';
      starred?: boolean;
    }
  ) => void;
  categories: { id: string; title: string }[];
  defaultCategory?: string;
  referenceDateStr?: string;
}

export const TaskCreateSlider: React.FC<TaskCreateSliderProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  categories,
  defaultCategory = 'personal',
  referenceDateStr,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [deadline, setDeadline] = useState('');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [starred, setStarred] = useState(false);
  const [priority, setPriority] = useState<'high' | 'medium' | 'low' | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = useState(defaultCategory);

  // Popover toggles
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [showDeadlinePicker, setShowDeadlinePicker] = useState(false);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const sliderContainerRef = useRef<HTMLDivElement>(null);
  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const categoryMenuRef = useRef<HTMLDivElement>(null);
  const [openCategoryMenuUpward, setOpenCategoryMenuUpward] = useState(true);

  // Check category dropdown placement whenever opened
  useEffect(() => {
    if (showCategoryMenu && categoryBtnRef.current) {
      const rect = categoryBtnRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      setOpenCategoryMenuUpward(spaceBelow < 240);
    }
  }, [showCategoryMenu]);

  // Click outside category menu
  useEffect(() => {
    if (!showCategoryMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        categoryMenuRef.current &&
        !categoryMenuRef.current.contains(e.target as Node) &&
        categoryBtnRef.current &&
        !categoryBtnRef.current.contains(e.target as Node)
      ) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCategoryMenu]);

  // Reset & focus on open
  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setShowDetails(false);
      setDueDate('');
      setDueTime('');
      setDeadline('');
      setDeadlineDate('');
      setDeadlineTime('23:59');
      setStarred(false);
      setPriority(undefined);
      setSelectedCategory(defaultCategory);
      setShowCategoryMenu(false);
      setShowDatePicker(false);
      setShowPriorityMenu(false);
      setShowDeadlinePicker(false);

      const timer = setTimeout(() => {
        titleInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, defaultCategory]);

  // Keyboard navigation: Escape closes slider
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showDatePicker || showPriorityMenu || showCategoryMenu || showDeadlinePicker) {
          setShowDatePicker(false);
          setShowPriorityMenu(false);
          setShowCategoryMenu(false);
          setShowDeadlinePicker(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, showDatePicker, showPriorityMenu, showCategoryMenu, showDeadlinePicker]);

  if (!isOpen) return null;

  const currentCategoryTitle =
    categories.find((c) => c.id === selectedCategory)?.title ||
    categories[0]?.title ||
    'Personal & Routine';

  const dateInfo = dueDate ? formatTaskDate(dueDate, dueTime || undefined, referenceDateStr) : null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const options: {
      description?: string;
      dueDate?: string;
      dueTime?: string;
      deadline?: string;
      priority?: 'high' | 'medium' | 'low';
      starred?: boolean;
    } = {};

    if (description.trim()) options.description = description.trim();
    if (dueDate) options.dueDate = dueDate;
    if (dueTime) options.dueTime = dueTime;
    if (deadline) options.deadline = deadline;
    if (priority) options.priority = priority;
    if (starred) options.starred = true;

    onCreateTask(selectedCategory, cleanTitle, Object.keys(options).length > 0 ? options : undefined);
    onClose();
  };

  const handleQuickDateSelect = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    setDueDate(d.toISOString().substring(0, 10));
  };

  const handleQuickDeadlineSelect = (daysToAdd: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysToAdd);
    const dateStr = d.toISOString().substring(0, 10);
    setDeadlineDate(dateStr);
    setDeadlineTime('23:59');
    setDeadline(`${dateStr} 23:59`);
    setShowDeadlinePicker(false);
  };

  return (
    <>
      {/* Dim backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[1px] z-50 transition-opacity animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Docked Bottom Sheet Slider */}
      <div
        ref={sliderContainerRef}
        role="dialog"
        aria-label="Add a task"
        className="fixed inset-x-0 bottom-0 z-50 flex justify-center p-0 sm:pb-3 pointer-events-none"
      >
        <div className="pointer-events-auto w-full max-w-xl bg-[var(--surface)] text-[var(--ink)] border-t sm:border border-[var(--line)] rounded-t-2xl sm:rounded-2xl shadow-2xl p-4 sm:p-5 flex flex-col space-y-3.5 animate-in slide-in-from-bottom duration-200">
          {/* Header Row: Category Selector */}
          <div className="flex items-center justify-between relative">
            <div className="relative">
              <button
                ref={categoryBtnRef}
                type="button"
                onClick={() => {
                  setShowCategoryMenu(!showCategoryMenu);
                  setShowDatePicker(false);
                  setShowPriorityMenu(false);
                  setShowDeadlinePicker(false);
                }}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--canvas)] hover:bg-[var(--line)]/50 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer shadow-2xs"
                title="Select list"
              >
                <Folder className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate max-w-[180px]">{currentCategoryTitle}</span>
                <ChevronDown className="w-3 h-3 text-[var(--muted)] shrink-0" />
              </button>

              {/* Category Dropdown Menu */}
              {showCategoryMenu && (
                <div
                  ref={categoryMenuRef}
                  className={`absolute left-0 ${
                    openCategoryMenuUpward ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                  } w-56 bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-xl z-50 py-1 overflow-y-auto`}
                  style={{
                    maxHeight: openCategoryMenuUpward
                      ? Math.max(120, Math.min(224, (categoryBtnRef.current?.getBoundingClientRect().top ?? 300) - 16))
                      : Math.max(120, Math.min(224, window.innerHeight - (categoryBtnRef.current?.getBoundingClientRect().bottom ?? 0) - 16)),
                  }}
                >
                  <div className="px-3 py-1 text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    Add to list
                  </div>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setShowCategoryMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors text-left cursor-pointer ${
                        cat.id === selectedCategory
                          ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                          : 'text-[var(--ink)] hover:bg-[var(--canvas)]'
                      }`}
                    >
                      <span className="truncate">{cat.title}</span>
                      {cat.id === selectedCategory && <Check className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)] transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Title Input */}
            <div>
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="New task"
                aria-label="New task"
                className="w-full bg-transparent text-base sm:text-lg font-medium text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none"
              />
            </div>

            {/* Optional Details Input */}
            {(showDetails || description.trim().length > 0) && (
              <div className="pt-1 animate-in fade-in duration-150">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add details"
                  rows={2}
                  className="w-full bg-transparent text-xs sm:text-sm text-[var(--ink)] placeholder-[var(--muted)] focus:outline-none resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Badges / Active Options Row */}
            {(dateInfo || deadline || priority) && (
              <div className="flex items-center space-x-2 flex-wrap gap-y-1.5 pt-0.5">
                {dateInfo && (
                  <span className="inline-flex items-center space-x-1.5 text-xs bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1 rounded-full border border-[var(--accent)]/30 font-semibold shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{dateInfo.label}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDueDate('');
                        setDueTime('');
                      }}
                      className="ml-1 hover:opacity-70 p-0.5 rounded-full cursor-pointer"
                      title="Clear date"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {deadline && (
                  <span className="inline-flex items-center space-x-1.5 text-xs bg-rose-500/10 text-rose-700 px-3 py-1 rounded-full border border-rose-400/30 font-semibold shadow-2xs">
                    <CalendarClock className="w-3.5 h-3.5 shrink-0 text-rose-600" />
                    <span>Deadline: {formatDeadlineLabel(deadline)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setDeadline('');
                        setDeadlineDate('');
                        setDeadlineTime('23:59');
                      }}
                      className="ml-1 hover:opacity-70 p-0.5 rounded-full cursor-pointer"
                      title="Clear deadline"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {priority && (
                  <span className="inline-flex items-center space-x-1.5 text-xs bg-[var(--canvas)] text-[var(--ink)] px-3 py-1 rounded-full border border-[var(--line)] font-semibold shadow-2xs capitalize">
                    <Flag
                      className={`w-3.5 h-3.5 shrink-0 ${
                        priority === 'high'
                          ? 'text-rose-600'
                          : priority === 'medium'
                          ? 'text-amber-500'
                          : 'text-blue-500'
                      }`}
                    />
                    <span>{priority}</span>
                    <button
                      type="button"
                      onClick={() => setPriority(undefined)}
                      className="ml-1 hover:opacity-70 p-0.5 rounded-full cursor-pointer"
                      title="Clear priority"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}

            {/* Date Picker Popover Panel */}
            {showDatePicker && (
              <div className="p-3 bg-[var(--canvas)] border border-[var(--line)] rounded-xl shadow-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                  <span>Date & Time</span>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Date Buttons */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDateSelect(0)}
                    className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDateSelect(1)}
                    className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDateSelect(7)}
                    className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
                  >
                    Next Week
                  </button>
                </div>

                {/* Date & Time Input Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--muted)] mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--muted)] mb-1">
                      Time (optional)
                    </label>
                    <input
                      type="time"
                      value={dueTime}
                      onChange={(e) => setDueTime(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-[var(--accent)]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDueDate('');
                      setDueTime('');
                      setShowDatePicker(false);
                    }}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDatePicker(false)}
                    className="px-3 py-1 text-xs bg-[var(--accent)] text-white rounded-lg font-semibold hover:opacity-90 cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {/* Priority Popover Panel */}
            {showPriorityMenu && (
              <div className="p-2.5 bg-[var(--canvas)] border border-[var(--line)] rounded-xl shadow-lg space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)] px-1">
                  <span>Priority</span>
                  <button
                    type="button"
                    onClick={() => setShowPriorityMenu(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['none', 'low', 'medium', 'high'] as const).map((p) => {
                    const isSelected = p === 'none' ? !priority : priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setPriority(p === 'none' ? undefined : p);
                          setShowPriorityMenu(false);
                        }}
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold capitalize transition-all border text-center cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-2xs'
                            : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--line)]/50'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Deadline Picker Popover Panel */}
            {showDeadlinePicker && (
              <div className="p-3 bg-[var(--canvas)] border border-rose-500/20 rounded-xl shadow-lg space-y-3 animate-in fade-in duration-150">
                <div className="flex items-center justify-between text-xs font-bold text-[var(--ink)]">
                  <div className="flex items-center space-x-1.5 text-rose-600">
                    <CalendarClock className="w-4 h-4 shrink-0" />
                    <span>Set Deadline</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowDeadlinePicker(false)}
                    className="text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Quick Deadline Presets */}
                <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                  <button
                    type="button"
                    onClick={() => handleQuickDeadlineSelect(0)}
                    className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
                  >
                    Today (23:59)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDeadlineSelect(1)}
                    className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
                  >
                    Tomorrow (23:59)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDeadlineSelect(7)}
                    className="px-2.5 py-1 text-xs rounded-full bg-[var(--surface)] hover:bg-rose-500/10 hover:text-rose-600 text-[var(--ink)] border border-[var(--line)] transition-colors cursor-pointer"
                  >
                    Next Week (23:59)
                  </button>
                </div>

                {/* Deadline Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--muted)] mb-1">
                      Target Deadline Date
                    </label>
                    <input
                      type="date"
                      value={deadlineDate}
                      onChange={(e) => {
                        setDeadlineDate(e.target.value);
                      }}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-semibold text-[var(--muted)] mb-1">
                      Deadline Time
                    </label>
                    <input
                      type="time"
                      value={deadlineTime || '23:59'}
                      onChange={(e) => setDeadlineTime(e.target.value)}
                      className="w-full bg-[var(--surface)] border border-[var(--line)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--ink)] focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDeadline('');
                      setDeadlineDate('');
                      setDeadlineTime('23:59');
                      setShowDeadlinePicker(false);
                    }}
                    className="text-xs text-rose-500 hover:underline cursor-pointer"
                  >
                    Clear Deadline
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (deadlineDate) {
                        const time = deadlineTime || '23:59';
                        setDeadline(`${deadlineDate} ${time}`);
                      }
                      setShowDeadlinePicker(false);
                    }}
                    className="px-3 py-1 text-xs bg-rose-600 text-white rounded-lg font-semibold hover:opacity-90 cursor-pointer"
                  >
                    Set Deadline
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Action Toolbar (matching Google Tasks mobile) */}
            <div className="flex items-center justify-between pt-2 border-t border-[var(--line)]/70">
              {/* Action Icons */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                {/* 1. Details toggle icon */}
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    showDetails || description.trim()
                      ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]'
                  }`}
                  title="Add details"
                >
                  <AlignLeft className="w-4 h-4" />
                </button>

                {/* 2. Date & Time icon */}
                <button
                  type="button"
                  onClick={() => {
                    setShowDatePicker(!showDatePicker);
                    setShowPriorityMenu(false);
                    setShowCategoryMenu(false);
                    setShowDeadlinePicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    dueDate
                      ? 'text-[var(--accent)] bg-[var(--accent-soft)]'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]'
                  }`}
                  title="Set date and time"
                >
                  <Clock className="w-4 h-4" />
                </button>

                {/* 3. Star icon */}
                <button
                  type="button"
                  onClick={() => setStarred(!starred)}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    starred
                      ? 'text-amber-400 bg-amber-400/10'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]'
                  }`}
                  title={starred ? 'Starred' : 'Star task'}
                >
                  <Star className={`w-4 h-4 ${starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                </button>

                {/* 4. Priority icon */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPriorityMenu(!showPriorityMenu);
                    setShowDatePicker(false);
                    setShowCategoryMenu(false);
                    setShowDeadlinePicker(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    priority
                      ? 'text-rose-500 bg-rose-500/10'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]'
                  }`}
                  title="Set priority"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {/* 5. Deadline icon */}
                <button
                  type="button"
                  onClick={() => {
                    if (!showDeadlinePicker) {
                      if (deadline) {
                        const parts = deadline.split(' ');
                        setDeadlineDate(parts[0] || '');
                        setDeadlineTime(parts[1] || '23:59');
                      } else {
                        const today = new Date().toISOString().substring(0, 10);
                        setDeadlineDate(today);
                        setDeadlineTime('23:59');
                      }
                    }
                    setShowDeadlinePicker(!showDeadlinePicker);
                    setShowDatePicker(false);
                    setShowPriorityMenu(false);
                    setShowCategoryMenu(false);
                  }}
                  className={`p-2 rounded-full transition-colors cursor-pointer ${
                    deadline
                      ? 'text-rose-600 bg-rose-500/10'
                      : 'text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--canvas)]'
                  }`}
                  title="Set deadline"
                >
                  <CalendarClock className="w-4 h-4" />
                </button>
              </div>

              {/* Save Button */}
              <div>
                <button
                  type="submit"
                  disabled={!title.trim()}
                  className={`px-4 py-1.5 text-sm font-semibold transition-all rounded-lg ${
                    title.trim()
                      ? 'text-[var(--accent)] hover:bg-[var(--accent-soft)] cursor-pointer active:scale-95'
                      : 'text-[var(--muted)] opacity-40 cursor-not-allowed pointer-events-none'
                  }`}
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
