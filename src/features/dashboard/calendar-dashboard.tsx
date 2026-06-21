"use client";

import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Pencil,
  Plus,
  Settings,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { signOut } from "@/app/auth/actions";
import { useTheme, type ThemeMode } from "@/app/providers";
import {
  formatCompactIncome,
  formatWon,
  getMonthCells,
  getRoundIncome,
  parseWonInput,
  sumIncome,
  toDateKey,
  type PaymentMethod,
  type RoundEntry,
} from "@/lib/calendar";
import * as styles from "./calendar-dashboard.css";

type AppView = "calendar" | "statistics" | "settings";
type StatisticsView = "monthly" | "yearly";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
const overFeeOptions = [0, 10_000, 20_000, 30_000];

const initialEntries: RoundEntry[] = [
  {
    id: "1",
    workDate: "2026-01-12",
    caddieFee: 150_000,
    overFee: 10_000,
    paymentMethod: "cash",
  },
  {
    id: "2",
    workDate: "2026-02-08",
    caddieFee: 150_000,
    overFee: 20_000,
    paymentMethod: "transfer",
  },
  {
    id: "3",
    workDate: "2026-03-17",
    caddieFee: 150_000,
    overFee: 0,
    paymentMethod: "cash",
  },
  {
    id: "4",
    workDate: "2026-04-22",
    caddieFee: 150_000,
    overFee: 30_000,
    paymentMethod: "transfer",
  },
  {
    id: "5",
    workDate: "2026-05-09",
    caddieFee: 150_000,
    overFee: 10_000,
    paymentMethod: "cash",
  },
  {
    id: "6",
    workDate: "2026-06-03",
    caddieFee: 150_000,
    overFee: 0,
    paymentMethod: "cash",
  },
  {
    id: "7",
    workDate: "2026-06-05",
    caddieFee: 150_000,
    overFee: 20_000,
    paymentMethod: "transfer",
  },
  {
    id: "8",
    workDate: "2026-06-05",
    caddieFee: 150_000,
    overFee: 0,
    paymentMethod: "cash",
  },
  {
    id: "9",
    workDate: "2026-06-08",
    caddieFee: 150_000,
    overFee: 10_000,
    paymentMethod: "transfer",
  },
  {
    id: "10",
    workDate: "2026-06-11",
    caddieFee: 150_000,
    overFee: 30_000,
    paymentMethod: "cash",
  },
  {
    id: "11",
    workDate: "2026-06-14",
    caddieFee: 150_000,
    overFee: 0,
    paymentMethod: "cash",
  },
  {
    id: "12",
    workDate: "2026-06-18",
    caddieFee: 150_000,
    overFee: 20_000,
    paymentMethod: "cash",
  },
  {
    id: "13",
    workDate: "2026-06-18",
    caddieFee: 150_000,
    overFee: 0,
    paymentMethod: "transfer",
  },
];

function BrandMark() {
  return (
    <span className={styles.brandMark} aria-hidden="true">
      <span className={styles.brandHat} />
      <span className={styles.brandHead} />
      <span className={styles.brandBody} />
    </span>
  );
}

type CalendarDashboardProps = {
  courseName: string;
  defaultCaddieFee: number;
};

export function CalendarDashboard({
  courseName,
  defaultCaddieFee,
}: CalendarDashboardProps) {
  const [activeView, setActiveView] = useState<AppView>("calendar");
  const [statisticsView, setStatisticsView] =
    useState<StatisticsView>("monthly");
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(5);
  const [selectedDay, setSelectedDay] = useState(18);
  const [entries, setEntries] = useState(initialEntries);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [caddieFee, setCaddieFee] = useState(String(defaultCaddieFee));
  const [overFee, setOverFee] = useState(0);
  const [customOverFee, setCustomOverFee] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [memo, setMemo] = useState("");
  const { mode, setMode } = useTheme();

  const selectedDateKey = toDateKey(year, month, selectedDay);
  const selectedEntries = entries.filter(
    (entry) => entry.workDate === selectedDateKey,
  );
  const monthPrefix = `${year}-${String(month + 1).padStart(2, "0")}`;
  const monthEntries = entries.filter((entry) =>
    entry.workDate.startsWith(monthPrefix),
  );
  const yearEntries = entries.filter((entry) =>
    entry.workDate.startsWith(`${year}-`),
  );
  const cells = getMonthCells(year, month);

  const dayTotals = useMemo(() => {
    const totals = new Map<string, number>();
    monthEntries.forEach((entry) => {
      totals.set(
        entry.workDate,
        (totals.get(entry.workDate) ?? 0) + getRoundIncome(entry),
      );
    });
    return totals;
  }, [monthEntries]);

  const monthlyChart = Array.from({ length: 12 }, (_, index) => {
    const prefix = `${year}-${String(index + 1).padStart(2, "0")}`;
    return sumIncome(
      entries.filter((entry) => entry.workDate.startsWith(prefix)),
    );
  });

  function changeMonth(offset: number) {
    const next = new Date(year, month + offset, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
    setSelectedDay(1);
  }

  function openNewRound() {
    setEditingId(null);
    setCaddieFee(String(defaultCaddieFee));
    setOverFee(0);
    setCustomOverFee("");
    setPaymentMethod("cash");
    setMemo("");
    setSheetOpen(true);
  }

  function openEditRound(entry: RoundEntry) {
    setEditingId(entry.id);
    setCaddieFee(String(entry.caddieFee));
    setOverFee(entry.overFee);
    setCustomOverFee(
      overFeeOptions.includes(entry.overFee) ? "" : String(entry.overFee),
    );
    setPaymentMethod(entry.paymentMethod);
    setMemo(entry.memo ?? "");
    setSheetOpen(true);
  }

  function saveRound(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextEntry: RoundEntry = {
      id: editingId ?? crypto.randomUUID(),
      workDate: selectedDateKey,
      caddieFee: parseWonInput(caddieFee),
      overFee: customOverFee ? parseWonInput(customOverFee) : overFee,
      paymentMethod,
      memo: memo.trim() || undefined,
    };

    setEntries((current) =>
      editingId
        ? current.map((entry) => (entry.id === editingId ? nextEntry : entry))
        : [...current, nextEntry],
    );
    setSheetOpen(false);
  }

  function deleteRound(id: string) {
    setEntries((current) => current.filter((entry) => entry.id !== id));
  }

  const selectedOverFee = customOverFee
    ? parseWonInput(customOverFee)
    : overFee;
  const formTotal = parseWonInput(caddieFee) + selectedOverFee;

  return (
    <div className={styles.app}>
      <main className={styles.shell}>
        <header className={styles.topBar}>
          <div className={styles.brand}>
            <BrandMark />
            <div>
              <div className={styles.brandName}>캐디하루</div>
              <div className={styles.courseName}>{courseName}</div>
            </div>
          </div>
          <span className={styles.prototypeBadge}>UI 프로토타입</span>
        </header>

        <div className={styles.content}>
          {activeView === "calendar" && (
            <CalendarView
              year={year}
              month={month}
              selectedDay={selectedDay}
              cells={cells}
              dayTotals={dayTotals}
              monthEntries={monthEntries}
              selectedEntries={selectedEntries}
              onChangeMonth={changeMonth}
              onSelectDay={setSelectedDay}
              onAddRound={openNewRound}
              onEditRound={openEditRound}
              onDeleteRound={deleteRound}
            />
          )}

          {activeView === "statistics" && (
            <StatisticsViewContent
              view={statisticsView}
              onChangeView={setStatisticsView}
              year={year}
              month={month}
              monthEntries={monthEntries}
              yearEntries={yearEntries}
              monthlyChart={monthlyChart}
            />
          )}

          {activeView === "settings" && (
            <SettingsView
              mode={mode}
              courseName={courseName}
              defaultCaddieFee={defaultCaddieFee}
              onChangeMode={setMode}
            />
          )}
        </div>

        <nav className={styles.bottomNav} aria-label="주요 메뉴">
          <NavButton
            active={activeView === "calendar"}
            label="캘린더"
            icon={<CalendarDays size={21} />}
            onClick={() => setActiveView("calendar")}
          />
          <NavButton
            active={activeView === "statistics"}
            label="통계"
            icon={<BarChart3 size={21} />}
            onClick={() => setActiveView("statistics")}
          />
          <NavButton
            active={activeView === "settings"}
            label="설정"
            icon={<Settings size={21} />}
            onClick={() => setActiveView("settings")}
          />
        </nav>
      </main>

      {sheetOpen && (
        <div className={styles.overlay} role="presentation">
          <form
            className={styles.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="round-sheet-title"
            onSubmit={saveRound}
          >
            <div className={styles.sheetHandle} />
            <div className={styles.sheetHeader}>
              <div>
                <div className={styles.eyebrow}>
                  {month + 1}월 {selectedDay}일
                </div>
                <h2 id="round-sheet-title" className={styles.sectionTitle}>
                  {editingId
                    ? "라운드 수정"
                    : `${selectedEntries.length + 1}라운드 추가`}
                </h2>
              </div>
              <button
                className={styles.iconButton}
                type="button"
                aria-label="닫기"
                onClick={() => setSheetOpen(false)}
              >
                <X size={21} />
              </button>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>캐디피</span>
              <input
                className={styles.moneyInput}
                type="text"
                inputMode="numeric"
                value={caddieFee}
                onChange={(event) => setCaddieFee(event.target.value)}
                aria-label="캐디피"
              />
            </label>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>오버피</span>
              <div className={styles.chips}>
                {overFeeOptions.map((amount) => (
                  <button
                    key={amount}
                    className={`${styles.chip} ${
                      !customOverFee && overFee === amount
                        ? styles.selectedChip
                        : ""
                    }`}
                    type="button"
                    onClick={() => {
                      setOverFee(amount);
                      setCustomOverFee("");
                    }}
                  >
                    {amount === 0 ? "없음" : `${amount / 10_000}만원`}
                  </button>
                ))}
                <button
                  className={`${styles.chip} ${
                    customOverFee ? styles.selectedChip : ""
                  }`}
                  type="button"
                  onClick={() => setCustomOverFee(customOverFee || "50000")}
                >
                  직접 입력
                </button>
              </div>
              {customOverFee && (
                <input
                  className={styles.moneyInput}
                  type="text"
                  inputMode="numeric"
                  value={customOverFee}
                  onChange={(event) => setCustomOverFee(event.target.value)}
                  aria-label="직접 입력할 오버피"
                />
              )}
            </div>

            <div className={styles.field}>
              <span className={styles.fieldLabel}>결제 수단</span>
              <div className={styles.segment}>
                {(["cash", "transfer"] as const).map((method) => (
                  <button
                    key={method}
                    className={`${styles.segmentButton} ${
                      paymentMethod === method ? styles.selectedSegment : ""
                    }`}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                  >
                    {method === "cash" ? "현금" : "계좌이체"}
                  </button>
                ))}
              </div>
            </div>

            <label className={styles.field}>
              <span className={styles.fieldLabel}>메모 (선택)</span>
              <textarea
                className={styles.textarea}
                value={memo}
                maxLength={200}
                onChange={(event) => setMemo(event.target.value)}
                placeholder="필요한 내용을 남겨주세요"
              />
            </label>

            <div className={styles.sheetTotal}>
              <span>라운드 합계</span>
              <strong className={styles.sheetTotalAmount}>
                {formatWon(formTotal)}
              </strong>
            </div>
            <button className={styles.addButton} type="submit">
              {editingId ? "수정 저장" : "라운드 저장"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

type CalendarViewProps = {
  year: number;
  month: number;
  selectedDay: number;
  cells: ReturnType<typeof getMonthCells>;
  dayTotals: Map<string, number>;
  monthEntries: RoundEntry[];
  selectedEntries: RoundEntry[];
  onChangeMonth: (offset: number) => void;
  onSelectDay: (day: number) => void;
  onAddRound: () => void;
  onEditRound: (entry: RoundEntry) => void;
  onDeleteRound: (id: string) => void;
};

function CalendarView({
  year,
  month,
  selectedDay,
  cells,
  dayTotals,
  monthEntries,
  selectedEntries,
  onChangeMonth,
  onSelectDay,
  onAddRound,
  onEditRound,
  onDeleteRound,
}: CalendarViewProps) {
  return (
    <>
      <section className={styles.summary} aria-label="이번 달 요약">
        <div>
          <div className={styles.eyebrow}>이번 달 수입</div>
          <div className={styles.summaryAmount}>
            {formatWon(sumIncome(monthEntries))}
          </div>
        </div>
        <div className={styles.roundCount}>{monthEntries.length}라운드</div>
      </section>

      <div className={styles.monthHeader}>
        <button
          className={styles.iconButton}
          type="button"
          aria-label="이전 달"
          onClick={() => onChangeMonth(-1)}
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className={styles.monthTitle}>
          {year}년 {month + 1}월
        </h1>
        <button
          className={styles.iconButton}
          type="button"
          aria-label="다음 달"
          onClick={() => onChangeMonth(1)}
        >
          <ChevronRight size={22} />
        </button>
      </div>

      <div className={styles.weekdays} aria-hidden="true">
        {weekdays.map((weekday) => (
          <div key={weekday} className={styles.weekday}>
            {weekday}
          </div>
        ))}
      </div>
      <div className={styles.calendarGrid}>
        {cells.map((cell, index) =>
          cell ? (
            <button
              key={cell.dateKey}
              className={`${styles.dayCell} ${
                cell.day === selectedDay ? styles.selectedDay : ""
              }`}
              type="button"
              aria-label={`${month + 1}월 ${cell.day}일${
                dayTotals.get(cell.dateKey)
                  ? `, ${formatWon(dayTotals.get(cell.dateKey) ?? 0)}`
                  : ""
              }`}
              onClick={() => onSelectDay(cell.day)}
            >
              <span className={styles.dayNumber}>{cell.day}</span>
              <span className={styles.dayAmount}>
                {formatCompactIncome(dayTotals.get(cell.dateKey) ?? 0)}
              </span>
            </button>
          ) : (
            <div key={`empty-${index}`} className={styles.emptyDayCell} />
          ),
        )}
      </div>

      <section>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>
            {month + 1}월 {selectedDay}일
          </h2>
          <div className={styles.sectionTotal}>
            {formatWon(sumIncome(selectedEntries))}
          </div>
        </div>

        {selectedEntries.length > 0 ? (
          <div className={styles.roundList}>
            {selectedEntries.map((entry, index) => (
              <div className={styles.roundRow} key={entry.id}>
                <div className={styles.roundMeta}>
                  <div className={styles.roundLabel}>
                    {index + 1}라운드
                    <span className={styles.payment}>
                      {entry.paymentMethod === "cash" ? "현금" : "계좌이체"}
                    </span>
                  </div>
                  <div className={styles.feeBreakdown}>
                    캐디피 {formatWon(entry.caddieFee)}
                    {entry.overFee > 0 &&
                      ` · 오버피 ${formatWon(entry.overFee)}`}
                  </div>
                </div>
                <div className={styles.roundIncome}>
                  {formatWon(getRoundIncome(entry))}
                </div>
                <div className={styles.rowActions}>
                  <button
                    className={styles.iconButton}
                    type="button"
                    aria-label={`${index + 1}라운드 수정`}
                    onClick={() => onEditRound(entry)}
                  >
                    <Pencil size={17} />
                  </button>
                  <button
                    className={styles.iconButton}
                    type="button"
                    aria-label={`${index + 1}라운드 삭제`}
                    onClick={() => onDeleteRound(entry.id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>기록된 라운드가 없습니다.</div>
        )}

        <button className={styles.addButton} type="button" onClick={onAddRound}>
          <Plus size={19} />
          라운드 추가
        </button>
      </section>
    </>
  );
}

type StatisticsViewContentProps = {
  view: StatisticsView;
  onChangeView: (view: StatisticsView) => void;
  year: number;
  month: number;
  monthEntries: RoundEntry[];
  yearEntries: RoundEntry[];
  monthlyChart: number[];
};

function StatisticsViewContent({
  view,
  onChangeView,
  year,
  month,
  monthEntries,
  yearEntries,
  monthlyChart,
}: StatisticsViewContentProps) {
  const entries = view === "monthly" ? monthEntries : yearEntries;
  const chartData =
    view === "monthly"
      ? Array.from(
          { length: new Date(year, month + 1, 0).getDate() },
          (_, index) =>
            sumIncome(
              monthEntries.filter(
                (entry) => Number(entry.workDate.slice(-2)) === index + 1,
              ),
            ),
        )
      : monthlyChart;
  const chartMax = Math.max(...chartData, 1);

  return (
    <>
      <div className={styles.viewHeader}>
        <h1 className={styles.viewTitle}>수입 통계</h1>
        <p className={styles.viewDescription}>
          기간별 수입과 라운드 흐름을 확인합니다.
        </p>
      </div>
      <div className={styles.tabList} role="tablist" aria-label="통계 기간">
        {(["monthly", "yearly"] as const).map((item) => (
          <button
            key={item}
            className={`${styles.segmentButton} ${
              view === item ? styles.selectedSegment : ""
            }`}
            type="button"
            role="tab"
            aria-selected={view === item}
            onClick={() => onChangeView(item)}
          >
            {item === "monthly" ? "월간" : "연간"}
          </button>
        ))}
      </div>
      <div className={styles.eyebrow}>
        {view === "monthly" ? `${year}년 ${month + 1}월` : `${year}년`}
      </div>
      <div className={styles.metricGrid}>
        <Metric label="총수입" value={formatWon(sumIncome(entries))} />
        <Metric label="총 라운드" value={`${entries.length}회`} />
        <Metric
          label="캐디피"
          value={formatWon(
            entries.reduce((sum, entry) => sum + entry.caddieFee, 0),
          )}
        />
        <Metric
          label="오버피"
          value={formatWon(
            entries.reduce((sum, entry) => sum + entry.overFee, 0),
          )}
        />
      </div>
      <h2 className={styles.sectionTitle}>
        {view === "monthly" ? "일별 수입" : "월별 수입"}
      </h2>
      <div className={styles.chart} aria-label="수입 막대그래프">
        {chartData.map((value, index) => (
          <div className={styles.barGroup} key={index} title={formatWon(value)}>
            <div className={styles.barTrack}>
              <div
                className={styles.bar}
                style={{
                  height: `${Math.max((value / chartMax) * 100, value ? 3 : 0)}%`,
                }}
              />
            </div>
            {(view === "yearly" || (index + 1) % 5 === 0) && (
              <span className={styles.barLabel}>
                {index + 1}
                {view === "yearly" ? "월" : "일"}
              </span>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.metric}>
      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
    </div>
  );
}

function SettingsView({
  mode,
  courseName,
  defaultCaddieFee,
  onChangeMode,
}: {
  mode: ThemeMode;
  courseName: string;
  defaultCaddieFee: number;
  onChangeMode: (mode: ThemeMode) => void;
}) {
  const themeLabels: Record<ThemeMode, string> = {
    system: "시스템 설정",
    light: "라이트",
    dark: "다크",
  };

  return (
    <>
      <div className={styles.viewHeader}>
        <h1 className={styles.viewTitle}>설정</h1>
        <p className={styles.viewDescription}>
          소속 정보와 기본 입력값을 관리합니다.
        </p>
      </div>
      <div className={styles.settingsList}>
        <Setting label="소속 골프장" value={courseName} />
        <Setting label="기본 캐디피" value={formatWon(defaultCaddieFee)} />
        <Setting label="오버피 빠른 선택" value="1만 · 2만 · 3만원" />
      </div>
      <h2 className={styles.sectionTitle} style={{ marginTop: 28 }}>
        화면 모드
      </h2>
      <div className={styles.themeControls}>
        {(["system", "light", "dark"] as const).map((themeMode) => (
          <button
            key={themeMode}
            className={`${styles.themeButton} ${
              mode === themeMode ? styles.selectedThemeButton : ""
            }`}
            type="button"
            onClick={() => onChangeMode(themeMode)}
          >
            {themeLabels[themeMode]}
          </button>
        ))}
      </div>
      <div className={styles.settingsList}>
        <form action={signOut}>
          <button className={styles.settingButton} type="submit">
            <span className={styles.settingLabel}>로그아웃</span>
            <LogOut size={18} aria-hidden="true" />
          </button>
        </form>
      </div>
    </>
  );
}

function Setting({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.settingRow}>
      <span className={styles.settingLabel}>{label}</span>
      <span className={styles.settingValue}>{value}</span>
    </div>
  );
}

function NavButton({
  active,
  label,
  icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      className={`${styles.navButton} ${active ? styles.activeNavButton : ""}`}
      type="button"
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
