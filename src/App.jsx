import { useEffect, useRef, useState } from "react";

const STORAGE_KEYS = {
  activePage: "fuguang-active-page",
  entered: "fuguang-entered",
  profile: "fuguang-personal-profile",
  dailyRitual: "fuguang-daily-ritual",
  dailyTasks: "fuguang-today-tasks",
  dailyStatus: "fuguang-daily-status",
  dailyRecords: "fuguang-daily-records",
  voyageRecords: "fuguang-voyage-records",
  voyageDraft: "fuguang-voyage-draft",
  emotionRecords: "fuguang-emotion-shelf-records",
  emotionImages: "fuguang-emotion-shelf-images",
  wishOrbit: "fuguang-wish-orbit-state",
  wishes: "fuguang-wishes",
  worldAtlas: "fuguang-world-atlas",
  bookFilmLog: "fuguang-book-film-log",
  activities: "fuguang-activities",
};

const readStoredJson = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeStoredJson = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
};

const readStoredValue = (key, fallback = "") => {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

const writeStoredValue = (key, value) => {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
};

const loadDailyRecords = () => {
  const saved = readStoredJson(STORAGE_KEYS.dailyRecords, {});
  return saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
};

const updateDailyRecord = (date, patch) => {
  const records = loadDailyRecords();
  const current = records[date] && typeof records[date] === "object" ? records[date] : {};
  records[date] = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return writeStoredJson(STORAGE_KEYS.dailyRecords, records);
};

const loadActivities = () => {
  const saved = readStoredJson(STORAGE_KEYS.activities, []);
  return Array.isArray(saved)
    ? saved.filter((item) => item?.id && item?.createdAt).slice(0, 50)
    : [];
};

const recordActivity = (type, title, targetId = "") => {
  const activity = {
    id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    type,
    title,
    targetId,
    createdAt: new Date().toISOString(),
  };
  const next = [activity, ...loadActivities()].slice(0, 50);
  writeStoredJson(STORAGE_KEYS.activities, next);
  window.dispatchEvent(new CustomEvent("fuguang-activity-updated", { detail: next }));
  return activity;
};

const showSavedToast = (message = "已保存，刷新后仍会保留") => {
  window.dispatchEvent(new CustomEvent("fuguang-toast", { detail: message }));
};

const formatActivityTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const today = getTodayKey();
  const dateKey = date.toLocaleDateString("en-CA");
  return dateKey === today
    ? date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
};

const formatStoredTime = (value, fallback = "尚未记录") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const navItems = [
  { id: "dashboard", icon: "⌁", label: "夜航控制台", english: "NAVIGATION" },
  { id: "voyage", icon: "◷", label: "今日航行", number: "01" },
  { id: "mood", icon: "≈", label: "心绪仓库", number: "02" },
  { id: "wishes", icon: "✦", label: "愿望星轨", number: "03" },
  { id: "world", icon: "◎", label: "世界图鉴", number: "04" },
  { id: "books", icon: "☾", label: "书影航志", number: "05" },
];

const pageMeta = {
  dashboard: { eyebrow: "PERSONAL GROWTH CONSOLE", title: "夜航控制台", description: "把今天过清楚，也为正在发生的改变留下一点痕迹。" },
  voyage: { eyebrow: "TODAY'S LITTLE DRAW", title: "今日记录", description: "幸运抽取处。" },
  mood: { eyebrow: "SYSTEM 02 · INNER ARCHIVE", title: "心绪仓库", description: "收好细微感受，也慢慢理解真实的自己。" },
  wishes: { eyebrow: "SYSTEM 03 · WISH ORBIT", title: "愿望星轨", description: "那些想抵达的地方，正在远方缓慢发亮。" },
  world: { eyebrow: "SYSTEM 04 · WORLD ATLAS", title: "世界图鉴", description: "把走过的地方，慢慢点亮成自己的生活地图。" },
  books: { eyebrow: "BOOK & FILM LOG", title: "书影航志", description: "把读过的书、看过的电影，和想抵达的故事都留在这里。" },
};

const Icon = ({ name }) => {
  const paths = {
    wave: <path d="M3 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M4 9h16M7 5h10" />,
    route: <path d="M5 19c4-1 2-6 6-7s5 3 8-1M5 19l3-1M5 19l1-3M19 11l-3-1M19 11l-1 3M6 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" />,
    glow: <path d="m12 3 1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3ZM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />,
    storm: <path d="M8 18h8a5 5 0 0 0 .8-9.9A6 6 0 0 0 5.4 10 4 4 0 0 0 8 18Zm1.5-6.5 5 5m0-5-5 5" />,
    orbit: <path d="M12 15.5A3.5 3.5 0 1 0 12 8a3.5 3.5 0 0 0 0 7.5Zm0-11c6 0 10 3.4 10 7.5s-4 7.5-10 7.5S2 16.1 2 12s4-7.5 10-7.5Z" />,
    map: <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Zm6-3v15m6-12v15" />,
    clock: <path d="M12 8v4l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />,
    pin: <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Zm-8 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />,
  };
  return <svg viewBox="0 0 24 24" aria-hidden="true">{paths[name]}</svg>;
};

const dashboardColors = [
  { name: "月光白", value: "#E9EDFF", description: "适合整理思绪，把复杂的事情慢慢说清楚。", category: "安静整理" },
  { name: "雾灰蓝", value: "#8295AD", description: "适合放慢节奏，不急着做出答案。", category: "安静整理" },
  { name: "静水蓝", value: "#698DA7", description: "适合减少干扰，给注意力留出完整空间。", category: "安静整理" },
  { name: "纸页米白", value: "#DDD8C9", description: "适合收拾桌面，也整理脑海里散落的事情。", category: "安静整理" },
  { name: "薄暮灰", value: "#85889B", description: "适合接受暂时的模糊，先把能确认的部分写下来。", category: "安静整理" },
  { name: "极光蓝", value: "#68C8D8", description: "适合重新开始，给自己一点新的可能。", category: "重新开始" },
  { name: "清晨青", value: "#69B8B5", description: "适合把昨天放下，从一个清楚的小动作开始。", category: "重新开始" },
  { name: "新芽绿", value: "#86B89A", description: "适合从很小的动作开始恢复。", category: "重新开始" },
  { name: "雨后蓝", value: "#6EA4C5", description: "适合重新安排节奏，不沿用已经失效的方法。", category: "重新开始" },
  { name: "初晴黄", value: "#D7C984", description: "适合打开窗，也给停滞的事情一个新入口。", category: "重新开始" },
  { name: "雾紫色", value: "#AA9BD7", description: "适合允许自己慢一点，不急着给所有问题答案。", category: "温柔自洽" },
  { name: "淡丁香", value: "#B7A6D5", description: "适合把情绪放软，不和自己较劲。", category: "温柔自洽" },
  { name: "珊瑚粉", value: "#D88FA5", description: "适合照顾感受，不把所有情绪都压下去。", category: "温柔自洽" },
  { name: "豆沙粉", value: "#BA8998", description: "适合对自己说实话，也保留一点体谅。", category: "温柔自洽" },
  { name: "云絮紫", value: "#9187B6", description: "适合承认疲惫，让今天不必处处用力。", category: "温柔自洽" },
  { name: "深海蓝", value: "#3C66AC", description: "适合专注做一件小事，安静地往前推进。", category: "行动推进" },
  { name: "电光青", value: "#43B3C2", description: "适合快速完成一个明确的小任务。", category: "行动推进" },
  { name: "墨青色", value: "#397D86", description: "适合稳住节奏，把注意力放回正在做的事。", category: "行动推进" },
  { name: "蓝莓紫", value: "#665FA8", description: "适合推进需要耐心的工作，不频繁切换方向。", category: "行动推进" },
  { name: "松针绿", value: "#527C70", description: "适合按步骤行动，让进度一点点变得可见。", category: "行动推进" },
  { name: "微光金", value: "#D9B978", description: "适合记住今天值得开心的一件小事。", category: "记录美好" },
  { name: "星尘银", value: "#B6BED0", description: "适合记录那些很轻、但确实发生过的改变。", category: "记录美好" },
  { name: "日落橙", value: "#D99468", description: "适合承认今天已经努力过了。", category: "记录美好" },
  { name: "栀子黄", value: "#E1CF91", description: "适合收藏一个让心里亮了一点的瞬间。", category: "记录美好" },
  { name: "晚霞粉", value: "#CE8EA9", description: "适合记下一次被理解、被回应或被温柔对待。", category: "记录美好" },
];

const dashboardQuotes = [
  "不用一下子变得很厉害，先把今天过清楚。",
  "你不是没有进度，只是有些成长发生得很安静。",
  "今天做一点点，也算是在认真生活。",
  "允许自己缓慢，但不要完全停下。",
  "先完成一个很小的开始，再考虑更完整的答案。",
  "今天不必解决所有问题，先处理最靠近手边的一个。",
  "状态不好时，把任务缩小，不必把自己否定掉。",
  "有些进步不明显，但它正在改变你处理事情的方式。",
  "先把事实写下来，再决定要不要担心。",
  "不够完美的行动，也比一直等待更接近结果。",
  "今天可以普通，但要留下一点真实的痕迹。",
  "累的时候先休息，不要在疲惫里评价自己。",
  "一次没做好，只说明这次的方法还需要调整。",
  "允许计划改变，重要的是你仍然知道自己在意什么。",
  "把注意力放回自己能做的部分，心会慢慢安定。",
  "不需要证明今天很有价值，认真生活本身就够了。",
  "有些答案要在持续行动以后才会变得清楚。",
  "先照顾身体，再处理那些看起来很急的事情。",
  "你可以晚一点明白，但不要因为暂时不懂而责怪自己。",
  "今天只推进百分之一，也仍然属于进度。",
  "把复杂的事情拆小，给自己一个容易开始的入口。",
  "不必用别人的速度，衡量自己正在经历的阶段。",
  "情绪出现不是失败，它只是提醒你有些需要还没被看见。",
  "先承认真实感受，再考虑怎样回应它。",
  "做不到全部时，选一个最重要的部分认真完成。",
  "重新开始不需要特别的时刻，现在就可以调整一点。",
  "没有立刻看到结果，不代表之前的积累没有意义。",
  "今天的目标可以只是让生活恢复一点秩序。",
  "把已经做到的部分也算进去，不要只盯着缺口。",
  "有些事情慢一点，反而更容易留下来。",
  "先让自己回到稳定，再决定下一步往哪里用力。",
  "你可以不喜欢现在的状态，但不必因此讨厌自己。",
  "休息不是中断成长，而是给持续行动保留空间。",
  "不确定的时候，先做一个可撤回的小尝试。",
  "今天愿意面对一点，就已经比逃开更靠近答案。",
  "不用把每一次表达都变成成果，先说清楚真实想法。",
  "把一个小任务做完，往往比制定更多计划更有帮助。",
  "允许自己有反复，稳定本来就是练习出来的。",
  "今天没能完成的，可以重新安排，不必变成自责。",
  "先减少一个干扰，再增加一份专注。",
  "你需要的可能不是更努力，而是更明确。",
  "把想做的事写具体，它就会比焦虑更容易被处理。",
  "真正适合你的节奏，不一定看起来很热闹。",
  "有些成长，是你终于不再用旧方式为难自己。",
  "今天可以先把自己从混乱里轻轻捞出来。",
  "不必马上变好，先停止继续消耗自己。",
  "完成以后再修改，往往比一直构想更有效。",
  "给情绪一点时间，也给行动一个明确期限。",
  "把今天过得具体，比把未来想得完美更重要。",
  "你可以一边不确定，一边认真地做下一件事。",
  "当事情太多时，先决定什么今天可以不做。",
  "不是所有空白都要立刻填满，有些空间可以用来恢复。",
  "持续记录的意义，是让细小变化有机会被看见。",
  "不必把一次停顿解释成退步。",
  "先完成对自己有用的部分，不必追求看起来完整。",
  "如果今天只能做一件事，就把它做得清楚一点。",
  "对自己温柔，不等于放弃要求，而是换一种可持续的方法。",
  "从能控制的十分钟开始，常常比等待整块时间更实际。",
  "今天的困惑，可以成为明天更准确的问题。",
  "不用急着成为新的自己，先理解现在的自己。",
  "把期待调回现实，行动会重新变得轻一些。",
  "认真吃饭、睡觉和休息，也是今天的重要进度。",
  "允许结果普通，但过程要对自己诚实。",
  "你可以暂时走得慢，只要没有放弃观察和调整。",
  "先留下一版，再让它在之后慢慢变好。",
  "今天值得被记录，不是因为它特别，而是因为它真实。",
  "当你不知道怎么继续时，就回到最初想做这件事的原因。",
  "少做一点，但把注意力真正放进去。",
];

const dashboardKeywords = [
  "缓慢", "调整", "继续", "专注", "整理", "休息", "开始", "稳定", "清醒", "松弛",
  "行动", "观察", "修复", "表达", "沉淀", "靠近", "重启", "积累", "自洽", "轻盈",
  "更新", "完成", "安放", "尝试", "具体", "耐心", "取舍", "回应", "照顾", "复盘",
  "倾听", "留白", "推进", "恢复", "确认", "练习", "记录", "探索", "收束", "诚实",
  "暂停", "连接", "简化", "呼吸", "落实", "接受", "边界", "节奏",
];
const dashboardTasks = [
  { id: "must", type: "必须完成", text: "", number: "01" },
  { id: "progress", type: "推进一点", text: "", number: "02" },
  { id: "care", type: "照顾自己", text: "", number: "03" },
];
const DASHBOARD_RITUAL_KEY = STORAGE_KEYS.dailyRitual;
const DASHBOARD_TASKS_KEY = STORAGE_KEYS.dailyTasks;
const DASHBOARD_STATUS_KEY = STORAGE_KEYS.dailyStatus;

const getDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dateFromKey = (dateKey) => {
  const [year, month, day] = String(dateKey || "").split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day, 12) : new Date();
};

const getTodayKey = () => getDateKey(new Date());

const pickKeywordIndexes = () => {
  const indexes = dashboardKeywords.map((_, index) => index);
  for (let index = indexes.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [indexes[index], indexes[randomIndex]] = [indexes[randomIndex], indexes[index]];
  }
  return indexes.slice(0, 3);
};

const createDashboardRitual = (previous = null) => {
  let next;
  do {
    next = {
      date: getTodayKey(),
      color: Math.floor(Math.random() * dashboardColors.length),
      quote: Math.floor(Math.random() * dashboardQuotes.length),
      keywords: pickKeywordIndexes(),
    };
  } while (
    previous
    && next.color === previous.color
    && next.quote === previous.quote
    && next.keywords.join(",") === previous.keywords.join(",")
  );
  return next;
};

const loadDashboardRitual = () => {
  const saved = readStoredJson(DASHBOARD_RITUAL_KEY);
  if (saved?.date === getTodayKey() && Array.isArray(saved.keywords)) return saved;
  return createDashboardRitual();
};

const loadDashboardTasks = (dateKey = getTodayKey()) => {
  const today = dateKey;
  const defaults = Object.fromEntries(dashboardTasks.map((task) => [task.id, task.text]));
  const archiveTasks = loadDailyRecords()[today]?.tasks;
  const legacyTasks = dateKey === getTodayKey() ? readStoredJson(DASHBOARD_TASKS_KEY) : null;
  if (legacyTasks?.date && legacyTasks.date !== getTodayKey() && legacyTasks.completed) {
    updateDailyRecord(legacyTasks.date, {
      tasks: {
        completed: legacyTasks.completed || {},
        texts: { ...defaults, ...(legacyTasks.texts || {}) },
      },
    });
  }
  const saved = archiveTasks && typeof archiveTasks === "object"
    ? { date: today, ...archiveTasks }
    : legacyTasks;
  if (saved?.date === today && saved.completed && typeof saved.completed === "object") {
    return {
      date: today,
      completed: saved.completed,
      texts: { ...defaults, ...(saved.texts || {}) },
    };
  }
  return {
    date: today,
    completed: {},
    texts: defaults,
  };
};

const loadDashboardStatus = (dateKey = getTodayKey()) => {
  const defaults = { mood: 50, energy: 50, focus: 50, sleep: 7.5 };
  const today = dateKey;
  const archived = loadDailyRecords()[today]?.status;
  const legacy = dateKey === getTodayKey() ? readStoredJson(DASHBOARD_STATUS_KEY) : null;
  if (legacy?.date && legacy.date !== getTodayKey()) {
    updateDailyRecord(legacy.date, {
      status: {
        mood: legacy.mood ?? defaults.mood,
        energy: legacy.energy ?? defaults.energy,
        focus: legacy.focus ?? defaults.focus,
        sleep: legacy.sleep ?? defaults.sleep,
      },
    });
  }
  const saved = archived && typeof archived === "object" ? archived : legacy;
  if ((archived || saved?.date === today) && saved && typeof saved === "object") {
    return { ...defaults, ...saved };
  }
  return defaults;
};

function Dashboard({ navigate, selectedDateKey }) {
  const [ritual, setRitual] = useState(loadDashboardRitual);
  const [taskState, setTaskState] = useState(() => loadDashboardTasks(selectedDateKey));
  const [dailyStatus, setDailyStatus] = useState(() => loadDashboardStatus(selectedDateKey));
  const [statusSaved, setStatusSaved] = useState(false);
  const [statusDate, setStatusDate] = useState(getTodayKey);
  const [activities, setActivities] = useState(loadActivities);
  const skipTaskSaveRef = useRef(false);
  const didMountTaskSaveRef = useRef(false);
  const luckyColor = dashboardColors[ritual.color];
  const completedCount = dashboardTasks.filter((task) => taskState.completed[task.id]).length;

  useEffect(() => {
    writeStoredJson(DASHBOARD_RITUAL_KEY, ritual);
  }, [ritual]);

  useEffect(() => {
    if (!didMountTaskSaveRef.current) {
      didMountTaskSaveRef.current = true;
      return;
    }
    if (skipTaskSaveRef.current) {
      skipTaskSaveRef.current = false;
      return;
    }
    if (taskState.date === getTodayKey()) writeStoredJson(DASHBOARD_TASKS_KEY, taskState);
    updateDailyRecord(taskState.date || getTodayKey(), {
      tasks: {
        completed: taskState.completed || {},
        texts: taskState.texts || {},
      },
    });
  }, [taskState]);

  useEffect(() => {
    skipTaskSaveRef.current = true;
    setTaskState(loadDashboardTasks(selectedDateKey));
    setDailyStatus(loadDashboardStatus(selectedDateKey));
    setStatusSaved(false);
  }, [selectedDateKey]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const today = getTodayKey();
      if (today !== statusDate) {
        setStatusDate(today);
        setRitual(loadDashboardRitual());
      }
    }, 60 * 1000);
    return () => window.clearInterval(interval);
  }, [statusDate]);

  useEffect(() => {
    const refreshActivities = (event) => setActivities(event.detail || loadActivities());
    window.addEventListener("fuguang-activity-updated", refreshActivities);
    window.addEventListener("storage", refreshActivities);
    return () => {
      window.removeEventListener("fuguang-activity-updated", refreshActivities);
      window.removeEventListener("storage", refreshActivities);
    };
  }, []);

  const redrawRitual = () => {
    setRitual((current) => createDashboardRitual(current));
  };

  const toggleDashboardTask = (id) => {
    setTaskState((current) => ({
      date: selectedDateKey,
      completed: { ...current.completed, [id]: !current.completed[id] },
      texts: current.texts,
    }));
  };

  const updateDashboardTask = (id, text) => {
    setTaskState((current) => ({
      ...current,
      date: selectedDateKey,
      texts: { ...current.texts, [id]: text },
    }));
  };

  const resetDashboardTasks = () => {
    if (!window.confirm("确认重置今日三件事的内容和完成状态吗？")) return;
    setTaskState({
      date: selectedDateKey,
      completed: {},
      texts: Object.fromEntries(dashboardTasks.map((task) => [task.id, task.text])),
    });
  };

  const saveDailyStatus = () => {
    const date = selectedDateKey;
    if (date === getTodayKey()) writeStoredJson(DASHBOARD_STATUS_KEY, { date, ...dailyStatus });
    updateDailyRecord(date, { status: dailyStatus });
    setStatusSaved(true);
    window.setTimeout(() => setStatusSaved(false), 2000);
  };

  return (
    <div className="dashboard-bento">
      {selectedDateKey !== getTodayKey() && !loadDailyRecords()[selectedDateKey] && (
        <div className="selected-date-empty-note">
          <strong>这一天还没有记录。</strong>
          <span>可以补写一点，也可以回到今天。</span>
        </div>
      )}
      <article className="glass-card ritual-card">
        <div className="ritual-heading">
          <div>
            <span className="dashboard-kicker">今日仪式</span>
            <h2>收下一点属于今天的提示</h2>
          </div>
          <button type="button" onClick={redrawRitual}><span>↻</span>重新抽取</button>
        </div>
        <div className="ritual-content">
          <div className="ritual-color" style={{ "--ritual-color": luckyColor.value, "--ritual-glow": `color-mix(in srgb, ${luckyColor.value} 38%, transparent)` }}>
            <small className="ritual-color-index">COLOR · {String(ritual.color + 1).padStart(2, "0")}</small>
            <div className="ritual-orb" style={{ "--ritual-color": luckyColor.value, "--ritual-glow": `color-mix(in srgb, ${luckyColor.value} 38%, transparent)` }}><i /></div>
            <div><span>今日幸运色 · {luckyColor.category}</span><h3>{luckyColor.name}</h3><p>{luckyColor.description}</p></div>
          </div>
          <div className="ritual-quote">
            <span>写给自己</span>
            <blockquote>“{dashboardQuotes[ritual.quote]}”</blockquote>
            <div className="ritual-note-action">
              <small>今日小动作</small>
              <p>从「{dashboardKeywords[ritual.keywords[0]]}」开始，完成一件能让此刻更清楚的小事。</p>
            </div>
          </div>
        </div>
        <div className="ritual-keywords"><span>今日关键词</span>{ritual.keywords.map((index) => <i className="active" key={dashboardKeywords[index]}>{dashboardKeywords[index]}</i>)}</div>
      </article>

      <section className="glass-card dashboard-status">
        <div className="status-metrics">
          {[
            { id: "mood", label: "情绪值", tone: "violet", min: 0, max: 100, step: 1, suffix: "%" },
            { id: "energy", label: "能量值", tone: "cyan", min: 0, max: 100, step: 1, suffix: "%" },
            { id: "focus", label: "专注值", tone: "blue", min: 0, max: 100, step: 1, suffix: "%" },
            { id: "sleep", label: "睡眠", tone: "gold", min: 0, max: 12, step: .5, suffix: "h" },
          ].map((item) => {
            const value = dailyStatus[item.id];
            const percent = ((value - item.min) / (item.max - item.min)) * 100;
            return (
            <div className="status-metric" key={item.id}>
              <span><i className={item.tone} />{item.label}</span><strong>{value}{item.suffix}</strong>
              <input
                className={`status-slider ${item.tone}`}
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={value}
                style={{ "--status-progress": `${percent}%` }}
                onChange={(event) => { setDailyStatus((current) => ({ ...current, [item.id]: Number(event.target.value) })); setStatusSaved(false); }}
                aria-label={item.label}
              />
            </div>
            );
          })}
        </div>
        <div className="status-save-area">
          <button type="button" onClick={saveDailyStatus}>保存今日状态</button>
          <span className={statusSaved ? "visible" : ""}>今日状态已记录</span>
        </div>
      </section>

      <article className="glass-card today-plan-card">
        <div className="bento-card-heading">
          <div><span className="dashboard-kicker">今日计划</span><h2>今日三件事</h2></div>
          <div className="plan-card-tools">
            <button type="button" onClick={resetDashboardTasks}>重置今日任务</button>
            <span className="quiet-count">{completedCount} / 3</span>
          </div>
        </div>
        <div className="today-plan-list">
          {dashboardTasks.map((task) => (
            <div className={taskState.completed[task.id] ? "task-row completed" : "task-row"} key={task.id}>
              <button className="task-check-button" type="button" onClick={() => toggleDashboardTask(task.id)} aria-label={`切换${task.type}完成状态`}>
                <span className="static-check">{taskState.completed[task.id] ? "✓" : ""}</span>
              </button>
              <div>
                <small>{task.type}</small>
                <input
                  value={taskState.texts[task.id] || ""}
                  placeholder="写下今天想完成的一件小事"
                  onChange={(event) => updateDashboardTask(task.id, event.target.value)}
                  aria-label={`${task.type}任务内容`}
                />
              </div>
              <i>{task.number}</i>
            </div>
          ))}
        </div>
      </article>

      <article className="glass-card quick-entry-card">
        <div className="bento-card-heading">
          <div><span className="dashboard-kicker">快速记录</span><h2>此刻想记下什么？</h2></div>
        </div>
        <div className="quick-entry-grid">
          {[
            ["✎", "写今日记录", "violet", "voyage"],
            ["✦", "存一件美好", "gold", "mood"],
            ["⌁", "拆一个烦恼", "rose", "mood"],
            ["＋", "加一个愿望", "cyan", "wishes"],
          ].map(([icon, label, tone, target]) => (
            <button className={`quick-entry ${tone}`} type="button" onClick={() => navigate(target)} key={label}><span>{icon}</span><strong>{label}</strong><i>→</i></button>
          ))}
        </div>
      </article>

      <article className="glass-card recent-update-card">
        <div className="bento-card-heading">
          <div><span className="dashboard-kicker">最近更新</span><h2>持续发生的小变化</h2></div>
        </div>
        <div className="update-timeline">
          {activities.length ? activities.slice(0, 6).map((activity, index) => (
            <div className={index === 0 ? "current" : ""} key={activity.id}>
              <time>{formatActivityTime(activity.createdAt)}</time><i /><span>{activity.title}</span>
            </div>
          )) : (
            <div className="current"><time>今天</time><i /><span>保存一条记录后，最近更新会出现在这里。</span></div>
          )}
        </div>
      </article>
    </div>
  );
}

const systemData = {
  voyage: [
    { tag: "今日计划", title: "沿着自己的节奏前进", text: "三个小目标，完成比完美更重要。", meta: "已完成 1 / 3", icon: "route", tone: "cyan" },
    { tag: "航行状态", title: "能量稳定，海面平静", text: "能量 72% · 专注度 68% · 睡眠 7.5h", meta: "适合持续航行", icon: "wave", tone: "violet" },
    { tag: "今日复盘", title: "给今天留一页空白", text: "记录值得珍藏的瞬间，也诚实面对经过的风浪。", meta: "等待今晚填写", icon: "glow", tone: "amber" },
    { tag: "历史日志", title: "已航行 46 天", text: "每一次出发，都在让地图变得更完整。", meta: "本月 12 篇记录", icon: "clock", tone: "rose" },
  ],
  mood: [
    {
      tag: "GENTLE MOMENTS",
      title: "美好切片",
      text: "记录生活里轻微但真实的亮光。",
      examples: ["一句让我舒服的话", "一个让我觉得生活还可以的瞬间", "一件很小但值得记住的事"],
      question: "今天有什么小事让我被安慰了一下？",
      icon: "glow",
      tone: "amber",
    },
    {
      tag: "UNTANGLE WORRIES",
      title: "烦恼拆解",
      text: "把困扰我的事拆开，看清它真正影响我的地方。",
      examples: ["我真正害怕的是什么？", "这件事有没有被我想得太严重？", "我现在能做的一小步是什么？"],
      question: "这个烦恼背后，真正的需求是什么？",
      icon: "storm",
      tone: "rose",
    },
    {
      tag: "EMOTION PATTERNS",
      title: "情绪样本",
      text: "观察我反复出现的情绪模式，慢慢理解自己。",
      examples: ["我什么时候最容易焦虑？", "我什么时候最容易逃避？", "什么事情会让我恢复能量？"],
      question: "这个情绪是不是以前也出现过？",
      icon: "wave",
      tone: "cyan",
    },
    {
      tag: "UNFORMED THOUGHTS",
      title: "未成形的念头",
      text: "存放那些还没变成文章、计划或答案的想法。",
      examples: ["一个还没有答案的问题", "一句想写进文章里的话", "一个模糊但重要的想法"],
      question: "这个想法以后可能长成什么？",
      icon: "orbit",
      tone: "violet",
    },
  ],
  wishes: [
    { tag: "当前主线", title: "写下你的当前主线", text: "把最近最想靠近的方向放在这里。", meta: "等待设置", icon: "orbit", tone: "violet" },
    { tag: "想做的事", title: "新增第一颗愿望星", text: "这里会收藏你想慢慢抵达的愿望。", meta: "0 颗愿望星", icon: "glow", tone: "amber" },
    { tag: "星轨节点", title: "还没有点亮节点", text: "完成一个重要进展后，可以把它记录成星轨。", meta: "等待点亮", icon: "route", tone: "cyan" },
    { tag: "愿望补给", title: "收藏第一份补给", text: "灵感、工具、素材和参考资料都可以放进来。", meta: "0 份补给", icon: "clock", tone: "rose" },
  ],
  world: [
    { tag: "最近点亮", title: "还没有地点记忆", text: "搜索一个城市，留下第一段地点记忆。", meta: "0 个地点", icon: "pin", tone: "cyan" },
    { tag: "城市记忆", title: "等待被点亮", text: "去过、想去、想重返的地方都会出现在这里。", meta: "尚无记录", icon: "map", tone: "violet" },
    { tag: "想去的地方", title: "添加一个远方", text: "把想抵达的城市先放进自己的世界图鉴。", meta: "等待添加", icon: "orbit", tone: "amber" },
    { tag: "图鉴进度", title: "开始建立地图", text: "世界很大，可以一座一座慢慢认识。", meta: "0 已点亮 · 0 待探索", icon: "glow", tone: "rose" },
  ],
};

const moodShelves = [
  {
    title: "美好切片",
    description: "存放生活里轻微但真实的亮光。",
    question: "今天有什么小事让我被安慰了一下？",
    items: [
      ["✨", "一句舒服的话", "记下一句让身体和心都松了一点的话。", "“不用着急，你已经做得很好了。”"],
      ["🌤", "今天的天空", "收藏某一刻抬头时看见的光线、云朵和颜色。", "傍晚的云边有一点很浅的金色。"],
      ["🎧", "一首歌", "留住一首恰好接住当下心情的歌。", "循环了三遍，心里慢慢安静下来。"],
      ["💬", "朋友的消息", "保存一句来自他人的真诚关心或分享。", "朋友突然问我最近有没有好好吃饭。"],
      ["🫧", "被安慰的瞬间", "记录一个让情绪得到理解和安放的片刻。", "有人认真听完了我没有整理好的表达。"],
      ["🌷", "小小开心", "收好普通一天里短暂但真实的快乐。", "买到喜欢的面包，回家时风也很轻。"],
    ],
  },
  {
    title: "烦恼拆解",
    description: "把困扰我的事拆开，看清它真正影响我的地方。",
    question: "这个烦恼背后，真正的需求是什么？",
    items: [
      ["☁️", "自我怀疑", "观察那些觉得自己不够好的时刻，以及它从哪里来。", "我担心做不好，其实是很希望得到认可。"],
      ["🪨", "比较焦虑", "分辨比较带来的压力，重新看见自己的节奏。", "看到别人进度很快时，我开始否定自己的积累。"],
      ["🕳", "拖延", "理解迟迟没有开始的原因，而不急着责备自己。", "不是不想做，而是不知道第一步要多小。"],
      ["🌧", "害怕失败", "把对失败的想象和真实后果分开来看。", "我害怕的更多是失望，而不是事情本身。"],
      ["🧩", "不确定感", "记录面对未知时最让自己不安的部分。", "没有清晰答案时，我会反复检查已经做过的决定。"],
      ["🫥", "人际小情绪", "安放关系里难以说清的失落、敏感和误解。", "对方没有回应时，我下意识觉得自己被忽略了。"],
    ],
  },
  {
    title: "情绪样本",
    description: "观察反复出现的情绪模式，慢慢理解自己。",
    question: "这个情绪是不是以前也出现过？",
    items: [
      ["🌊", "焦虑模式", "辨认焦虑经常出现的场景、想法和身体反应。", "任务堆在一起时，我会先担心而不是先排序。"],
      ["🪫", "低能量时刻", "记录能量下降前发生了什么，以及身体需要什么。", "连续社交以后，我需要一个安静的晚上。"],
      ["⚡", "突然有动力", "捕捉动力出现时的环境、契机和心理状态。", "把桌面整理干净以后，很自然地开始行动了。"],
      ["🌀", "逃避反应", "观察自己想躲开压力时习惯采取的动作。", "越担心结果，我越容易去做无关紧要的小事。"],
      ["🌱", "恢复方法", "积累那些真正帮助自己恢复稳定的小方法。", "洗澡、散步，再把手机放远半小时。"],
      ["👁", "情绪触发器", "辨认哪些话语、关系或场景容易引发强烈感受。", "被突然否定时，我会立刻变得防御。"],
    ],
  },
  {
    title: "未成形的念头",
    description: "存放那些还没变成文章、计划或答案的想法。",
    question: "这个想法以后可能长成什么？",
    items: [
      ["💡", "文章灵感", "保存一个还没有展开，但值得继续追踪的写作方向。", "也许可以写写那些不被看见的缓慢成长。"],
      ["✒️", "一句话", "收下一句突然出现、暂时不知道放在哪里的话。", "有些改变没有声音，但一直在发生。"],
      ["🌌", "梦里的画面", "记录梦境中残留的颜色、空间和模糊情节。", "一间没有门的蓝色房间，窗外一直在下雪。"],
      ["❔", "未解问题", "留下一个暂时没有答案，却不断回来的问题。", "什么样的生活才算真正属于自己？"],
      ["🪐", "新想法", "存放刚刚萌发、还需要时间验证的新鲜念头。", "把每个月看成一个可以独立命名的小版本。"],
      ["🧠", "模糊的自我认识", "记录对自己的新发现，即使它还不能被准确表达。", "我似乎不是害怕独处，而是害怕被遗忘。"],
    ],
  },
];

const EMOTION_RECORDS_STORAGE_KEY = STORAGE_KEYS.emotionRecords;
const EMOTION_IMAGES_STORAGE_KEY = STORAGE_KEYS.emotionImages;
const emotionMoodOptions = ["平静", "开心", "难过", "焦虑", "松弛", "疲惫"];
const emotionBoxes = moodShelves.map((shelf, shelfIndex) => ({
  ...shelf,
  items: shelf.items.map((item, itemIndex) => ({
    id: `emotion-${shelfIndex + 1}-${itemIndex + 1}`,
    category: shelf.title,
    emoji: item[0],
    title: item[1],
    description: item[2],
    question: shelf.question,
    example: item[3],
    color: `tone-${itemIndex + 1}`,
  })),
}));

function MoodWarehouse({ selectedDateKey }) {
  const [selectedBoxId, setSelectedBoxId] = useState(null);
  const [filter, setFilter] = useState("全部");
  const [isWriting, setIsWriting] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [draft, setDraft] = useState({ content: "", mood: "平静", images: [] });
  const [photoStatus, setPhotoStatus] = useState({ type: "", message: "" });
  const [isCompressingPhoto, setIsCompressingPhoto] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [randomBoxId, setRandomBoxId] = useState("");
  const [randomMessage, setRandomMessage] = useState("");
  const photoInputRef = useRef(null);
  const randomFeedbackTimerRef = useRef(null);
  const didMountEmotionRecordsRef = useRef(false);
  const [records, setRecords] = useState(() => {
    const saved = readStoredJson(EMOTION_RECORDS_STORAGE_KEY, []);
    return Array.isArray(saved)
      ? saved.filter((record) => record && typeof record === "object" && record.id && record.boxId).map((record) => ({
        ...record,
        content: typeof record.content === "string" ? record.content : "收藏了一条记录",
        mood: record.mood || "平静",
        images: Array.isArray(record.images) ? record.images.filter((image) => image?.dataUrl) : [],
        date: record.date || String(record.createdAt || "").slice(0, 10) || getTodayKey(),
        createdAt: record.createdAt || new Date().toISOString(),
      }))
      : [];
  });
  const [boxImages, setBoxImages] = useState(() => {
    const saved = readStoredJson(EMOTION_IMAGES_STORAGE_KEY, []);
    return Array.isArray(saved)
      ? saved.filter((image) => image && image.id && image.boxId && image.dataUrl)
      : [];
  });

  useEffect(() => {
    if (!didMountEmotionRecordsRef.current) {
      didMountEmotionRecordsRef.current = true;
      return;
    }
    if (!writeStoredJson(EMOTION_RECORDS_STORAGE_KEY, records)) {
      setPhotoStatus({ type: "error", message: "记录保存失败，本地空间可能已满。" });
    }
  }, [records]);

  const today = selectedDateKey;
  const allBoxes = emotionBoxes.flatMap((shelf) => shelf.items);
  const selectedBox = allBoxes.find((box) => box.id === selectedBoxId) || null;
  const selectedRecords = selectedBox
    ? records
      .filter((record) => record.boxId === selectedBox.id && record.date === selectedDateKey)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];
  const selectedWrittenToday = selectedRecords.some((record) => record.date === today);
  const selectedImages = selectedBox
    ? boxImages
      .filter((image) => image.boxId === selectedBox.id && (image.date || String(image.createdAt || "").slice(0, 10)) === selectedDateKey)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];
  const visiblePhotoDraft = isWriting ? (draft.images || []) : selectedImages;

  useEffect(() => {
    setIsWriting(false);
    setEditingRecordId(null);
    setDraft({ content: "", mood: "平静", images: [] });
    setPhotoStatus({ type: "", message: "" });
    setPreviewImage(null);
  }, [selectedDateKey]);

  useEffect(() => {
    if (!previewImage) return undefined;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setPreviewImage(null);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [previewImage]);

  useEffect(() => () => window.clearTimeout(randomFeedbackTimerRef.current), []);

  const getBoxRecords = (boxId) => records.filter((record) => record.boxId === boxId);
  const matchesFilter = (box) => {
    const boxRecords = getBoxRecords(box.id);
    if (filter === "今天写过") return boxRecords.some((record) => record.date === today);
    if (filter === "有记录") return boxRecords.length > 0;
    if (filter === "未记录") return boxRecords.length === 0;
    return true;
  };

  const selectBox = (boxId) => {
    setSelectedBoxId(boxId);
    setIsWriting(false);
    setEditingRecordId(null);
    setDraft({ content: "", mood: "平静", images: [] });
    setPhotoStatus({ type: "", message: "" });
    setPreviewImage(null);
  };

  const startWriting = () => {
    setEditingRecordId(null);
    setDraft({ content: "", mood: "平静", images: selectedImages });
    setIsWriting(true);
    setPhotoStatus(selectedImages.length
      ? { type: "success", message: "盒子里的照片已加入本次记录。" }
      : { type: "", message: "" });
  };

  const startEditing = (record) => {
    setEditingRecordId(record.id);
    setDraft({ content: record.content, mood: record.mood, images: record.images || [] });
    setIsWriting(true);
    setPhotoStatus({ type: "", message: "" });
  };

  const cancelWriting = () => {
    setIsWriting(false);
    setEditingRecordId(null);
    setDraft({ content: "", mood: "平静", images: [] });
    setPhotoStatus({ type: "", message: "" });
  };

  const saveRecord = () => {
    const images = draft.images || [];
    const content = draft.content.trim() || (images.length ? "收藏了一张照片" : "");
    if (!selectedBox || (!content && !images.length)) return;

    if (editingRecordId) {
      setRecords((current) => current.map((record) => (
        record.id === editingRecordId
          ? { ...record, content, mood: draft.mood, images, date: today }
          : record
      )));
    } else {
      const now = new Date();
      setRecords((current) => [{
        id: `emotion-record-${now.getTime()}`,
        boxId: selectedBox.id,
        date: today,
        content,
        mood: draft.mood,
        images,
        createdAt: now.toISOString(),
      }, ...current]);
    }

    if (images.length) {
      const archivedImageIds = new Set(images.map((image) => image.id));
      const remainingImages = boxImages.filter((image) => !archivedImageIds.has(image.id));
      writeStoredJson(EMOTION_IMAGES_STORAGE_KEY, remainingImages);
      setBoxImages(remainingImages);
    }
    recordActivity(
      editingRecordId ? "emotion_record_updated" : "emotion_record",
      editingRecordId ? `更新了「${selectedBox.title}」的情绪记录` : `写下了一条「${selectedBox.title}」记录`,
      selectedBox.id,
    );
    showSavedToast("已更新到情绪历史，刷新后仍会保留");
    cancelWriting();
  };

  const deleteRecord = (recordId) => {
    if (!window.confirm("确定删除这条心绪记录吗？")) return;
    setRecords((current) => current.filter((record) => record.id !== recordId));
    if (editingRecordId === recordId) cancelWriting();
  };

  const openRandomBox = () => {
    const candidates = allBoxes.filter(matchesFilter);
    if (!candidates.length) return;
    const next = candidates[Math.floor(Math.random() * candidates.length)];
    selectBox(next.id);
    setRandomBoxId(next.id);
    setRandomMessage(`今天为你打开了：${next.category} · ${next.title}`);
    window.clearTimeout(randomFeedbackTimerRef.current);
    randomFeedbackTimerRef.current = window.setTimeout(() => {
      setRandomBoxId("");
      setRandomMessage("");
    }, 2600);
  };

  const compressEmotionPhoto = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("读取图片失败"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("图片无法解析"));
      image.onload = () => {
        const maxSize = 1200;
        const scale = Math.min(1, maxSize / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d");
        if (!context) {
          reject(new Error("图片压缩失败"));
          return;
        }
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";
        context.drawImage(image, 0, 0, width, height);
        try {
          resolve(canvas.toDataURL("image/webp", 0.8));
        } catch {
          reject(new Error("图片压缩失败"));
        }
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

  const uploadEmotionPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !selectedBox) return;

    const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!supportedTypes.includes(file.type)) {
      setPhotoStatus({ type: "error", message: "仅支持 JPG、PNG 或 WEBP 图片。" });
      return;
    }

    setIsCompressingPhoto(true);
    setPhotoStatus({ type: "loading", message: file.size > 1024 * 1024 ? "图片较大，正在压缩…" : "正在整理照片…" });
    try {
      const dataUrl = await compressEmotionPhoto(file);
      const imageRecord = {
        id: `emotion-image-${Date.now()}`,
        boxId: selectedBox.id,
        dataUrl,
        name: file.name,
        type: "image/webp",
        date: selectedDateKey,
        createdAt: new Date().toISOString(),
      };
      if (isWriting) {
        setDraft((current) => ({ ...current, images: [imageRecord, ...(current.images || [])] }));
        setPhotoStatus({ type: "success", message: "照片已加入本次记录，保存记录后完成归档。" });
      } else {
        const nextImages = [imageRecord, ...boxImages];
        if (!writeStoredJson(EMOTION_IMAGES_STORAGE_KEY, nextImages)) throw new Error("storage-full");
        setBoxImages(nextImages);
        setPhotoStatus({ type: "success", message: "照片已收进这个盒子。" });
        recordActivity("emotion_photo", `为「${selectedBox.title}」上传了一张照片`, selectedBox.id);
        showSavedToast("照片已保存，刷新后仍会保留");
      }
    } catch {
      setPhotoStatus({ type: "error", message: "保存失败，请换一张更小的图片。" });
    } finally {
      setIsCompressingPhoto(false);
    }
  };

  const deleteEmotionPhoto = (imageId) => {
    const nextImages = boxImages.filter((image) => image.id !== imageId);
    try {
      if (!writeStoredJson(EMOTION_IMAGES_STORAGE_KEY, nextImages)) throw new Error("storage-full");
      setBoxImages(nextImages);
      setPhotoStatus({ type: "success", message: "照片已移出盒子。" });
    } catch {
      setPhotoStatus({ type: "error", message: "操作失败，请稍后再试。" });
    }
  };

  const deleteDraftPhoto = (imageId) => {
    setDraft((current) => ({
      ...current,
      images: (current.images || []).filter((image) => image.id !== imageId),
    }));
    if (boxImages.some((image) => image.id === imageId)) {
      const remainingImages = boxImages.filter((image) => image.id !== imageId);
      try {
        if (!writeStoredJson(EMOTION_IMAGES_STORAGE_KEY, remainingImages)) throw new Error("storage-full");
        setBoxImages(remainingImages);
      } catch {
        setPhotoStatus({ type: "error", message: "照片删除失败，请稍后再试。" });
        return;
      }
    }
    setPhotoStatus({ type: "success", message: "照片已从本次记录中移除。" });
  };

  const deleteRecordPhoto = (recordId, imageId) => {
    if (!window.confirm("确定删除这张照片吗？记录文字会继续保留。")) return;
    setRecords((current) => current.map((record) => (
      record.id === recordId
        ? { ...record, images: (record.images || []).filter((image) => image.id !== imageId) }
        : record
    )));
    if (previewImage?.id === imageId) setPreviewImage(null);
  };

  return (
    <div className="mood-warehouse">
      <section className="glass-card emotion-shelf">
        <div className="warehouse-heading">
          <div><span className="eyebrow">PRIVATE INNER ARCHIVE</span><h2>情绪货架</h2></div>
          <div className="shelf-actions">
            <div className="shelf-filters">
              {["全部", "今天写过", "有记录", "未记录"].map((option) => (
                <button className={filter === option ? "active" : ""} type="button" onClick={() => setFilter(option)} key={option}>{option}</button>
              ))}
            </div>
            <button className="random-box-button" type="button" onClick={openRandomBox}>随机打开一个盒子</button>
          </div>
        </div>
        {randomMessage && <p className="random-box-feedback" role="status">{randomMessage}</p>}

        <div className="shelf-levels">
          {emotionBoxes.map((level, shelfIndex) => {
            const visibleItems = level.items.filter(matchesFilter);
            return (
            <section className="shelf-level" key={level.title}>
              <div className="shelf-label">
                <span>0{shelfIndex + 1}</span>
                <div><h3>{level.title}</h3><p>{level.description}</p></div>
                <small>{visibleItems.length} / {level.items.length} BOXES</small>
              </div>
              <div className="emotion-boxes">
                {visibleItems.map((box) => {
                  const boxRecords = getBoxRecords(box.id);
                  const hasRecords = boxRecords.length > 0;
                  const writtenToday = boxRecords.some((record) => record.date === today);
                  const hasPhoto = boxImages.some((image) => image.boxId === box.id)
                    || boxRecords.some((record) => (record.images || []).length > 0);
                  const isSelected = selectedBoxId === box.id;
                  return (
                    <button
                      type="button"
                      className={`emotion-box box-${box.color}${hasRecords ? " has-records" : " empty"}${writtenToday ? " written-today" : ""}${hasPhoto ? " has-photo" : ""}${isSelected ? " selected" : ""}${randomBoxId === box.id ? " random-reveal" : ""}`}
                      aria-label={box.title}
                      data-tooltip={box.title}
                      onClick={() => selectBox(box.id)}
                      key={box.id}
                    >
                      <span>{box.emoji}</span>
                      {hasRecords && <b className="emotion-box-count">{boxRecords.length}</b>}
                      {hasPhoto && <i className="emotion-box-photo" aria-label="有照片">▣</i>}
                    </button>
                  );
                })}
                {!visibleItems.length && <span className="empty-shelf-note">这一层暂时没有符合条件的盒子</span>}
              </div>
            </section>
          )})}
        </div>
      </section>

      <aside className={`glass-card emotion-detail${selectedBox ? " box-open" : ""}`}>
        {!selectedBox ? (
          <div className="emotion-detail-empty">
            <div className="detail-empty-orbit"><span>✦</span></div>
            <h2>还没有打开盒子</h2>
            <p>点击左侧任意心绪盒，打开一段属于自己的记录。</p>
          </div>
        ) : (
          <>
            <div className="detail-status"><span>SELECTED BOX</span><i /></div>
            <div className="emotion-detail-head">
              <div className="detail-emoji">{selectedBox.emoji}</div>
              <div>
                <span className="detail-category">{selectedBox.category}</span>
                <h2>{selectedBox.title}</h2>
              </div>
            </div>
            <p className="detail-description">{selectedBox.description}</p>
            <div className="detail-block">
              <span>给自己的问题</span>
              <strong>{selectedBox.question}</strong>
            </div>

            <div className="emotion-photo-panel">
              <div className="emotion-photo-heading">
                <div>
                  <strong>{isWriting ? "为这条记录添加照片" : "上传一张今天的照片"}</strong>
                  <p>{isWriting ? "照片会和文字一起保存进历史记录" : "把此刻的画面也收进盒子里"}</p>
                </div>
                <small>JPG / PNG / WEBP</small>
              </div>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={uploadEmotionPhoto}
                hidden
              />
              <button
                className="emotion-photo-upload"
                type="button"
                disabled={isCompressingPhoto}
                onClick={() => photoInputRef.current?.click()}
              >
                {isCompressingPhoto ? "正在压缩…" : visiblePhotoDraft.length ? "继续添加照片" : "选择照片"}
              </button>
              {photoStatus.message && (
                <p className={`emotion-photo-status is-${photoStatus.type}`}>{photoStatus.message}</p>
              )}
              {visiblePhotoDraft.length > 0 && (
                <div className="emotion-photo-preview-list">
                  {visiblePhotoDraft.map((image) => (
                    <figure className="emotion-photo-preview-item" key={image.id}>
                      <button className="emotion-photo-open" type="button" onClick={() => setPreviewImage(image)} aria-label="查看大图">
                        <img src={image.dataUrl} alt={image.name || `${selectedBox.title}的照片`} />
                      </button>
                      <button
                        className="emotion-photo-remove"
                        type="button"
                        onClick={() => (isWriting ? deleteDraftPhoto(image.id) : deleteEmotionPhoto(image.id))}
                        aria-label="删除这张照片"
                      >
                        ×
                      </button>
                    </figure>
                  ))}
                </div>
              )}
            </div>

            {!isWriting && (
              <button className="write-emotion-button" type="button" onClick={startWriting}>＋ 写一条记录</button>
            )}

            {isWriting && (
              <div className="emotion-record-form">
                <span>{editingRecordId ? "编辑这条记录" : "收纳此刻的心绪"}</span>
                <textarea
                  rows="5"
                  value={draft.content}
                  onChange={(event) => setDraft((current) => ({ ...current, content: event.target.value }))}
                  placeholder="不必写得完整，先留下此刻真正想说的话。"
                  autoFocus
                />
                <div className="emotion-mood-picker">
                  {emotionMoodOptions.map((mood) => (
                    <button className={draft.mood === mood ? "active" : ""} type="button" onClick={() => setDraft((current) => ({ ...current, mood }))} key={mood}>{mood}</button>
                  ))}
                </div>
                <div className="emotion-form-actions">
                  <button type="button" onClick={cancelWriting}>取消</button>
                  <button
                    className="primary"
                    type="button"
                    disabled={!draft.content.trim() && !(draft.images || []).length}
                    onClick={saveRecord}
                  >
                    保存记录
                  </button>
                </div>
              </div>
            )}

            <div className="emotion-history">
              <div className="emotion-history-heading">
                <span>历史记录 <b>ARCHIVE</b></span>
                <small>{selectedRecords.length} 条</small>
              </div>
              {selectedWrittenToday && <p className="emotion-today-note">今天已经收纳过这个盒子。</p>}
              {!selectedRecords.length ? (
                <div className="emotion-empty-note">
                  <strong>这个盒子还没有被打开。</strong>
                  <span>等你愿意的时候，可以把今天的一点情绪放进来。</span>
                </div>
              ) : selectedRecords.map((record) => (
                <article className="emotion-record" key={record.id}>
                  <div className="emotion-record-meta">
                    <time>{formatStoredTime(record.createdAt, record.date)}</time>
                    <span>{record.mood}</span>
                  </div>
                  <p>{record.content}</p>
                  {(record.images || []).length > 0 && (
                    <div className="emotion-record-images">
                      {record.images.map((image) => (
                        <figure className="emotion-record-image" key={image.id}>
                          <button className="emotion-photo-open" type="button" onClick={() => setPreviewImage(image)} aria-label="查看大图">
                            <img src={image.dataUrl} alt={image.name || `${selectedBox.title}的记录照片`} />
                          </button>
                          <button
                            className="emotion-photo-remove"
                            type="button"
                            onClick={() => deleteRecordPhoto(record.id, image.id)}
                            aria-label="从记录中删除这张照片"
                          >
                            ×
                          </button>
                        </figure>
                      ))}
                    </div>
                  )}
                  <div className="emotion-record-actions">
                    <button type="button" onClick={() => startEditing(record)}>编辑</button>
                    <button type="button" onClick={() => deleteRecord(record.id)}>删除</button>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </aside>

      {previewImage && (
        <div className="emotion-image-modal" role="presentation" onClick={() => setPreviewImage(null)}>
          <button className="emotion-image-modal-close" type="button" onClick={() => setPreviewImage(null)} aria-label="关闭大图预览">×</button>
          <div className="emotion-image-modal-content" role="dialog" aria-modal="true" aria-label="照片大图预览" onClick={(event) => event.stopPropagation()}>
            <img src={previewImage.dataUrl} alt={previewImage.name || "情绪记录照片"} />
          </div>
        </div>
      )}
    </div>
  );
}

const WISH_ORBIT_STORAGE_KEY = STORAGE_KEYS.wishOrbit;
const WISHES_STORAGE_KEY = STORAGE_KEYS.wishes;
const wishStatuses = ["未开始", "准备中", "进行中", "已完成", "暂时搁置"];
const wishCategories = ["学习", "作品", "生活", "自我成长", "旅行"];
const wishRoles = ["灯塔", "大船", "海面", "光点"];

const defaultWishOrbitState = {
  mainQuest: {
    title: "",
    description: "",
    tags: [],
    doing: "",
    next: "",
    focus: "",
  },
  wishes: [],
  skills: [],
  versions: [],
};

const createOrbitId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const copyOrbitDefaults = () => JSON.parse(JSON.stringify(defaultWishOrbitState));

const defaultWishMilestones = [];

const defaultWishSupplies = [];

const milestoneImportanceOptions = ["普通", "重要", "高光"];
const wishSupplyTypeOptions = ["灵感参考", "学习成长", "工具方法", "素材案例", "机会资源", "自定义"];
const wishSupplyTypeMap = {
  灵感: "灵感参考",
  工具: "工具方法",
  素材: "素材案例",
  链接: "自定义",
  书影音: "学习成长",
  岗位参考: "机会资源",
};

const normalizeWishSupplyType = (type) => wishSupplyTypeMap[type] || type || "灵感参考";
const getWishSupplyDisplayType = (supply) => {
  const type = normalizeWishSupplyType(supply?.type);
  if (type === "自定义") return supply?.customType?.trim() || "自定义";
  return wishSupplyTypeOptions.includes(type) ? type : type;
};
const createWishSupplyDraft = (supply) => {
  const normalizedType = normalizeWishSupplyType(supply?.type);
  const isKnownType = wishSupplyTypeOptions.includes(normalizedType);
  return {
    ...supply,
    type: isKnownType ? normalizedType : "自定义",
    customType: supply?.customType || (isKnownType ? "" : normalizedType),
  };
};

const getChartPlacement = (wish, index) => {
  const roleMap = {
    灯塔: "lighthouse",
    大船: index % 2 === 0 ? "ship-hull" : "ship-sail",
    海面: "floating",
    光点: "light",
  };
  return { x: wish.x, y: wish.y, role: roleMap[wish.role] || "floating" };
};

const loadWishOrbitState = () => {
  const defaults = copyOrbitDefaults();
  const saved = readStoredJson(WISH_ORBIT_STORAGE_KEY);
  const separatelySavedWishes = readStoredJson(WISHES_STORAGE_KEY);
  const savedState = saved && typeof saved === "object" && !Array.isArray(saved) ? saved : {};
  const savedMainQuest = savedState.mainQuest && typeof savedState.mainQuest === "object"
    ? savedState.mainQuest
    : {};
  const normalizedMainQuest = {
    ...savedMainQuest,
    title: savedMainQuest.title === "成为一个更稳定、更自由，也更有创造力的人。"
      ? defaults.mainQuest.title
      : savedMainQuest.title,
    description: savedMainQuest.description === "我正在通过记录、学习、输出和行动，慢慢建立自己的生活坐标。"
      ? defaults.mainQuest.description
      : savedMainQuest.description,
    next: savedMainQuest.next === "完善心绪仓库和愿望星轨的记录功能"
      ? defaults.mainQuest.next
      : savedMainQuest.next,
    focus: savedMainQuest.focus === "让网站从“好看”变成“可长期使用”"
      ? defaults.mainQuest.focus
      : savedMainQuest.focus,
  };
  const wishSource = Array.isArray(separatelySavedWishes)
    ? separatelySavedWishes
    : Array.isArray(savedState.wishes) ? savedState.wishes : defaults.wishes;
  const normalizeWish = (wish, index) => ({
    ...defaults.wishes[index],
    ...wish,
    id: wish?.id || createOrbitId("wish"),
    category: wish?.category || "自我成长",
    role: wish?.role || defaults.wishes[index]?.role || "海面",
    progress: Math.min(100, Math.max(0, Number(wish?.progress) || 0)),
    x: Number.isFinite(Number(wish?.x)) ? Number(wish.x) : defaults.wishes[index]?.x ?? 50,
    y: Number.isFinite(Number(wish?.y)) ? Number(wish.y) : defaults.wishes[index]?.y ?? 50,
    createdAt: wish?.createdAt || `${wish?.lastUpdated || getTodayKey()}T00:00:00`,
    updatedAt: wish?.updatedAt || `${wish?.lastUpdated || getTodayKey()}T00:00:00`,
    completedAt: wish?.completedAt || (wish?.status === "已完成" ? wish?.lastUpdated || getTodayKey() : ""),
  });
  const normalizeSkills = (value) => (
    Array.isArray(value)
      ? value.filter((item) => item && typeof item === "object").map((item, index) => ({
        ...defaults.skills[index],
        ...item,
        id: item.id || createOrbitId("skill"),
        name: item.name || defaults.skills[index]?.name || "新能力",
        level: item.level || "Lv.1",
        percent: Math.min(100, Math.max(0, Number(item.percent) || 0)),
        description: item.description || "",
        recent: item.recent || "",
        updatedAt: item.updatedAt || "",
      }))
      : []
  );
  const normalizeVersions = (value) => (
    Array.isArray(value)
      ? value.filter((item) => item && typeof item === "object").map((item, index) => ({
        ...defaults.versions[index],
        ...item,
        id: item.id || createOrbitId("version"),
        version: item.version || `v${index + 1}.0`,
        title: item.title || "未命名更新",
        description: item.description || "",
        current: Boolean(item.current),
        updatedAt: item.updatedAt || "",
      }))
      : []
  );

  return {
    ...defaults,
    ...savedState,
    mainQuest: {
      ...defaults.mainQuest,
      ...normalizedMainQuest,
      tags: Array.isArray(savedMainQuest.tags) ? savedMainQuest.tags : defaults.mainQuest.tags,
    },
    wishes: wishSource.filter((wish) => wish && typeof wish === "object").map(normalizeWish),
    skills: normalizeSkills(savedState.skills),
    versions: normalizeVersions(savedState.versions),
  };
};

function OrbitField({ label, children, wide = false }) {
  return <div className={`orbit-field${wide ? " wide" : ""}`}><span>{label}</span>{children}</div>;
}

const selectOptionColors = {
  "未开始": "#8fa7c7",
  "准备中": "#a98bea",
  "进行中": "#00b9ec",
  "已完成": "#f4c84f",
  "暂时搁置": "#b6a7cf",
  "已点亮": "#00b9ec",
  "想去": "#8b6ee8",
  "想重返": "#f0b94d",
  "记忆深刻": "#ee719d",
  "学习": "#7c5cff",
  "作品": "#ff6b9a",
  "生活": "#62cfaa",
  "自我成长": "#00aeda",
  "旅行": "#f0b94d",
  "灯塔": "#f0b94d",
  "大船": "#00aeda",
  "海面": "#75a8df",
  "光点": "#ee719d",
  "书籍": "#7c5cff",
  "电影": "#00aeda",
  "想看": "#a98bea",
  "进行中": "#00b9ec",
};

function CustomSelect({ value, options, onChange, ariaLabel }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!selectRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const chooseOption = (option) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`custom-select${isOpen ? " open" : ""}`} ref={selectRef}>
      <button
        className="custom-select-trigger"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="custom-select-value">
          <i style={{ "--select-accent": selectOptionColors[value] || "#7c5cff" }} />
          {value}
        </span>
        <span className="custom-select-arrow" aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="custom-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              className={`custom-select-option${option === value ? " active" : ""}`}
              type="button"
              role="option"
              aria-selected={option === value}
              key={option}
              onClick={() => chooseOption(option)}
            >
              <i style={{ "--select-accent": selectOptionColors[option] || "#7c5cff" }} />
              <span>{option}</span>
              {option === value && <b aria-hidden="true">✓</b>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const calendarWeekdays = ["日", "一", "二", "三", "四", "五", "六"];

function CalendarDatePicker({
  value,
  onChange,
  ariaLabel = "选择日期",
  required = false,
  allowClear = !required,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => value ? dateFromKey(value) : new Date());
  const pickerRef = useRef(null);
  const todayKey = getTodayKey();

  useEffect(() => {
    if (!isOpen && value) setViewDate(dateFromKey(value));
  }, [value, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const calendarDays = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month, index - firstWeekday + 1, 12);
    return {
      date,
      key: getDateKey(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });

  const moveMonth = (offset) => {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1, 12));
  };

  const chooseDate = (dateKey) => {
    onChange(dateKey);
    setViewDate(dateFromKey(dateKey));
    setIsOpen(false);
  };

  const chooseToday = () => chooseDate(todayKey);

  const clearDate = () => {
    onChange("");
    setIsOpen(false);
  };

  return (
    <div className={`calendar-picker${isOpen ? " open" : ""}`} ref={pickerRef}>
      <button
        className="date-input-trigger"
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{value ? value.replaceAll("-", " / ") : "请选择日期"}</span>
        <i aria-hidden="true">
          <b /><b />
        </i>
      </button>
      {isOpen && (
        <div className="calendar-picker-popover" role="dialog" aria-label={ariaLabel}>
          <div className="calendar-picker-header">
            <button className="calendar-picker-nav previous" type="button" onClick={() => moveMonth(-1)} aria-label="上一个月" />
            <strong>{year}年{month + 1}月</strong>
            <button className="calendar-picker-nav next" type="button" onClick={() => moveMonth(1)} aria-label="下一个月" />
          </div>
          <div className="calendar-grid calendar-weekdays" aria-hidden="true">
            {calendarWeekdays.map((weekday) => <span key={weekday}>{weekday}</span>)}
          </div>
          <div className="calendar-grid calendar-days">
            {calendarDays.map(({ date, key, isCurrentMonth }) => (
              <button
                className={[
                  "calendar-day",
                  !isCurrentMonth ? "outside-month" : "",
                  key === todayKey ? "today" : "",
                  key === value ? "selected" : "",
                ].filter(Boolean).join(" ")}
                type="button"
                aria-label={`${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`}
                aria-pressed={key === value}
                key={key}
                onClick={() => chooseDate(key)}
              >
                {date.getDate()}
              </button>
            ))}
          </div>
          <div className="calendar-picker-footer">
            {allowClear
              ? <button className="calendar-picker-clear" type="button" onClick={clearDate}>清除</button>
              : <button className="calendar-picker-clear" type="button" onClick={() => setIsOpen(false)}>取消</button>}
            <button className="calendar-picker-today" type="button" onClick={chooseToday}>今天</button>
          </div>
        </div>
      )}
    </div>
  );
}

function WishOrbit() {
  const [orbitState, setOrbitState] = useState(loadWishOrbitState);
  const [selectedWish, setSelectedWish] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [mapScale, setMapScale] = useState(1);
  const [mainEditing, setMainEditing] = useState(false);
  const [mainDraft, setMainDraft] = useState(orbitState.mainQuest);
  const [wishMode, setWishMode] = useState("view");
  const [wishDraft, setWishDraft] = useState(null);
  const [editingSkillId, setEditingSkillId] = useState("");
  const [skillDraft, setSkillDraft] = useState(null);
  const [editingVersionId, setEditingVersionId] = useState("");
  const [versionDraft, setVersionDraft] = useState(null);
  const [editingMilestoneId, setEditingMilestoneId] = useState("");
  const [milestoneDraft, setMilestoneDraft] = useState(null);
  const [editingSupplyId, setEditingSupplyId] = useState("");
  const [supplyDraft, setSupplyDraft] = useState(null);
  const wishMapRef = useRef(null);
  const mapDragRef = useRef(null);
  const didMountOrbitRef = useRef(false);
  const didMountWishesRef = useRef(false);

  useEffect(() => {
    if (!didMountOrbitRef.current) {
      didMountOrbitRef.current = true;
      return;
    }
    writeStoredJson(WISH_ORBIT_STORAGE_KEY, orbitState);
  }, [orbitState]);

  useEffect(() => {
    if (!didMountWishesRef.current) {
      didMountWishesRef.current = true;
      return;
    }
    writeStoredJson(WISHES_STORAGE_KEY, orbitState.wishes);
  }, [orbitState.wishes]);

  const currentWish = selectedWish
    ? orbitState.wishes.find((wish) => wish.id === selectedWish.id) || null
    : null;
  const milestones = Array.isArray(orbitState.milestones) ? orbitState.milestones : defaultWishMilestones;
  const supplies = (Array.isArray(orbitState.supplies) ? orbitState.supplies : defaultWishSupplies).map(createWishSupplyDraft);
  const currentVersion = orbitState.versions.find((item) => item.current);
  const totalLevel = orbitState.skills.reduce((total, skill) => total + (Number.parseInt(String(skill.level).replace(/\D/g, ""), 10) || 0), 0);

  const updateState = (section, value) => setOrbitState((current) => ({ ...current, [section]: value }));
  const updateWishDraft = (field, value) => setWishDraft((current) => ({ ...current, [field]: value }));

  const startWishEdit = () => {
    if (!currentWish) return;
    setWishDraft({ ...currentWish });
    setWishMode("edit");
  };

  const startWishCreate = () => {
    const position = orbitState.wishes.length;
    setWishDraft({
      id: createOrbitId("wish"),
      title: "",
      status: "未开始",
      category: "自我成长",
      role: "海面",
      reason: "",
      nextAction: "",
      progress: 0,
      lastUpdated: new Date().toLocaleDateString("en-CA"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: "",
      x: 18 + (position * 17) % 68,
      y: 20 + (position * 19) % 58,
    });
    setWishMode("create");
    setIsDetailOpen(true);
  };

  const saveWish = (event) => {
    event.preventDefault();
    const now = new Date();
    const previousWish = orbitState.wishes.find((wish) => wish.id === wishDraft.id);
    const normalized = {
      ...wishDraft,
      category: wishDraft.category || "自我成长",
      role: wishDraft.role || "海面",
      progress: Math.min(100, Math.max(0, Number(wishDraft.progress))),
      x: Math.min(92, Math.max(8, Number(wishDraft.x))),
      y: Math.min(88, Math.max(12, Number(wishDraft.y))),
      createdAt: wishDraft.createdAt || now.toISOString(),
      updatedAt: now.toISOString(),
      completedAt: wishDraft.status === "已完成"
        ? wishDraft.completedAt || now.toLocaleDateString("en-CA")
        : "",
    };
    const wishes = wishMode === "create"
      ? [...orbitState.wishes, normalized]
      : orbitState.wishes.map((wish) => wish.id === normalized.id ? normalized : wish);
    updateState("wishes", wishes);
    setSelectedWish(normalized);
    setIsDetailOpen(true);
    setWishMode("view");
    setWishDraft(null);
    recordActivity(
      wishMode === "create" ? "wish_created" : "wish_updated",
      wishMode === "create" ? `新增了愿望「${normalized.title}」` : `更新了愿望「${normalized.title}」`,
      normalized.id,
    );
    showSavedToast(previousWish ? "愿望已更新，刷新后仍会保留" : "愿望已加入海图");
  };

  const deleteWish = () => {
    if (!currentWish || !window.confirm(`确认删除愿望“${currentWish.title}”吗？`)) return;
    const wishes = orbitState.wishes.filter((wish) => wish.id !== currentWish.id);
    updateState("wishes", wishes);
    setSelectedWish(null);
    setIsDetailOpen(false);
    setWishMode("view");
  };

  const saveMainQuest = (event) => {
    event.preventDefault();
    updateState("mainQuest", {
      ...mainDraft,
      tags: typeof mainDraft.tags === "string"
        ? mainDraft.tags.split(/[,，/]/).map((tag) => tag.trim()).filter(Boolean)
        : mainDraft.tags,
    });
    setMainEditing(false);
  };

  const startSkillEdit = (skill) => {
    setSkillDraft({ ...skill });
    setEditingSkillId(skill.id);
  };

  const startSkillCreate = () => {
    setSkillDraft({ id: createOrbitId("skill"), name: "", level: "Lv.1", percent: 0, description: "", recent: "" });
    setEditingSkillId("new");
  };

  const saveSkill = (event) => {
    event.preventDefault();
    const normalized = {
      ...skillDraft,
      percent: Math.min(100, Math.max(0, Number(skillDraft.percent))),
      updatedAt: new Date().toISOString(),
    };
    const skills = editingSkillId === "new"
      ? [...orbitState.skills, normalized]
      : orbitState.skills.map((skill) => skill.id === normalized.id ? normalized : skill);
    updateState("skills", skills);
    setEditingSkillId("");
    setSkillDraft(null);
    recordActivity(
      editingSkillId === "new" ? "growth_created" : "growth_updated",
      editingSkillId === "new" ? `新增了成长能力「${normalized.name}」` : `更新了成长等级「${normalized.name}」`,
      normalized.id,
    );
    showSavedToast("成长等级已保存，刷新后仍会保留");
  };

  const deleteSkill = (skill) => {
    if (!window.confirm(`确认删除能力“${skill.name}”吗？`)) return;
    updateState("skills", orbitState.skills.filter((item) => item.id !== skill.id));
  };

  const startVersionEdit = (version) => {
    setVersionDraft({ ...version });
    setEditingVersionId(version.id);
  };

  const startVersionCreate = () => {
    setVersionDraft({ id: createOrbitId("version"), version: "", title: "", description: "", current: false });
    setEditingVersionId("new");
  };

  const saveVersion = (event) => {
    event.preventDefault();
    const normalizedDraft = { ...versionDraft, updatedAt: new Date().toISOString() };
    let versions = editingVersionId === "new"
      ? [...orbitState.versions, normalizedDraft]
      : orbitState.versions.map((item) => item.id === normalizedDraft.id ? normalizedDraft : item);
    if (normalizedDraft.current) versions = versions.map((item) => ({ ...item, current: item.id === normalizedDraft.id }));
    updateState("versions", versions);
    setEditingVersionId("");
    setVersionDraft(null);
    recordActivity(
      editingVersionId === "new" ? "version_created" : "version_updated",
      editingVersionId === "new"
        ? `新增了版本日志「${normalizedDraft.version}」`
        : `更新了版本日志「${normalizedDraft.version}」`,
      normalizedDraft.id,
    );
    showSavedToast("版本日志已保存，当前版本状态会继续保留");
  };

  const deleteVersion = (version) => {
    if (!window.confirm(`确认删除版本“${version.version} ${version.title}”吗？`)) return;
    updateState("versions", orbitState.versions.filter((item) => item.id !== version.id));
  };

  const setCurrentVersion = (id) => {
    const selectedVersion = orbitState.versions.find((item) => item.id === id);
    updateState("versions", orbitState.versions.map((item) => ({
      ...item,
      current: item.id === id,
      updatedAt: item.id === id ? new Date().toISOString() : item.updatedAt,
    })));
    if (selectedVersion) {
      recordActivity("version_current", `将「${selectedVersion.version}」设为当前版本`, selectedVersion.id);
      showSavedToast("当前版本已保存，刷新后仍会保留");
    }
  };

  const startMilestoneCreate = () => {
    setMilestoneDraft({
      id: createOrbitId("milestone"),
      title: "",
      wishTitle: currentWish?.title || orbitState.wishes[0]?.title || "",
      date: getTodayKey(),
      note: "",
      feeling: "",
      importance: "重要",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setEditingMilestoneId("new");
  };

  const startMilestoneEdit = (milestone) => {
    setMilestoneDraft({ ...milestone });
    setEditingMilestoneId(milestone.id);
  };

  const saveMilestone = (event) => {
    event.preventDefault();
    const normalized = {
      ...milestoneDraft,
      title: milestoneDraft.title.trim(),
      wishTitle: milestoneDraft.wishTitle.trim(),
      note: milestoneDraft.note.trim(),
      feeling: milestoneDraft.feeling.trim(),
      importance: milestoneDraft.importance || "普通",
      createdAt: milestoneDraft.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!normalized.title) return;
    const nextMilestones = editingMilestoneId === "new"
      ? [normalized, ...milestones]
      : milestones.map((item) => item.id === normalized.id ? normalized : item);
    updateState("milestones", nextMilestones);
    setEditingMilestoneId("");
    setMilestoneDraft(null);
    recordActivity(
      editingMilestoneId === "new" ? "wish_milestone_created" : "wish_milestone_updated",
      editingMilestoneId === "new" ? `点亮了星轨节点「${normalized.title}」` : `更新了星轨节点「${normalized.title}」`,
      normalized.id,
    );
    showSavedToast("星轨节点已保存");
  };

  const deleteMilestone = (milestone) => {
    if (!window.confirm(`确认删除星轨节点“${milestone.title}”吗？`)) return;
    updateState("milestones", milestones.filter((item) => item.id !== milestone.id));
  };

  const startSupplyCreate = () => {
    setSupplyDraft({
      id: createOrbitId("supply"),
      name: "",
      type: "灵感参考",
      customType: "",
      wishTitle: currentWish?.title || orbitState.wishes[0]?.title || "",
      description: "",
      link: "",
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setEditingSupplyId("new");
  };

  const startSupplyEdit = (supply) => {
    setSupplyDraft(createWishSupplyDraft(supply));
    setEditingSupplyId(supply.id);
  };

  const saveSupply = (event) => {
    event.preventDefault();
    const normalized = {
      ...supplyDraft,
      name: supplyDraft.name.trim(),
      wishTitle: supplyDraft.wishTitle.trim(),
      description: supplyDraft.description.trim(),
      link: supplyDraft.link.trim(),
      type: supplyDraft.type || "灵感参考",
      customType: supplyDraft.type === "自定义" ? (supplyDraft.customType || "").trim() : "",
      favorite: Boolean(supplyDraft.favorite),
      createdAt: supplyDraft.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    if (!normalized.name) return;
    const nextSupplies = editingSupplyId === "new"
      ? [normalized, ...supplies]
      : supplies.map((item) => item.id === normalized.id ? normalized : item);
    updateState("supplies", nextSupplies);
    setEditingSupplyId("");
    setSupplyDraft(null);
    recordActivity(
      editingSupplyId === "new" ? "wish_supply_created" : "wish_supply_updated",
      editingSupplyId === "new" ? `收藏了愿望补给「${normalized.name}」` : `更新了愿望补给「${normalized.name}」`,
      normalized.id,
    );
    showSavedToast("愿望补给已保存");
  };

  const deleteSupply = (supply) => {
    if (!window.confirm(`确认删除愿望补给“${supply.name}”吗？`)) return;
    updateState("supplies", supplies.filter((item) => item.id !== supply.id));
  };

  const startMapDrag = (event) => {
    if (event.target.closest(".wish-node, button")) return;
    const map = wishMapRef.current;
    if (!map) return;
    map.setPointerCapture(event.pointerId);
    mapDragRef.current = { x: event.clientX, y: event.clientY, left: map.scrollLeft, top: map.scrollTop };
    map.classList.add("dragging");
  };

  const moveMapDrag = (event) => {
    const map = wishMapRef.current;
    const drag = mapDragRef.current;
    if (!map || !drag) return;
    map.scrollLeft = drag.left - (event.clientX - drag.x);
    map.scrollTop = drag.top - (event.clientY - drag.y);
  };

  const endMapDrag = () => {
    wishMapRef.current?.classList.remove("dragging");
    mapDragRef.current = null;
  };

  return (
    <div className="wish-orbit-page">
      <section className="glass-card main-quest-panel">
        <div className="quest-marker"><span>✦</span><i /></div>
        {mainEditing ? (
          <form className="orbit-form main-quest-form" onSubmit={saveMainQuest}>
            <div className="orbit-form-heading"><div><span className="eyebrow">EDIT DIRECTION</span><h2>编辑当前主线</h2></div></div>
            <div className="orbit-form-grid">
              <OrbitField label="主线标题" wide><input required value={mainDraft.title} onChange={(event) => setMainDraft({ ...mainDraft, title: event.target.value })} /></OrbitField>
              <OrbitField label="说明" wide><textarea rows="3" value={mainDraft.description} onChange={(event) => setMainDraft({ ...mainDraft, description: event.target.value })} /></OrbitField>
              <OrbitField label="标签（逗号分隔）" wide><input value={Array.isArray(mainDraft.tags) ? mainDraft.tags.join("，") : mainDraft.tags} onChange={(event) => setMainDraft({ ...mainDraft, tags: event.target.value })} /></OrbitField>
              <OrbitField label="正在推进"><input value={mainDraft.doing} onChange={(event) => setMainDraft({ ...mainDraft, doing: event.target.value })} /></OrbitField>
              <OrbitField label="下一步"><input value={mainDraft.next} onChange={(event) => setMainDraft({ ...mainDraft, next: event.target.value })} /></OrbitField>
              <OrbitField label="本周重点" wide><input value={mainDraft.focus} onChange={(event) => setMainDraft({ ...mainDraft, focus: event.target.value })} /></OrbitField>
            </div>
            <div className="orbit-form-actions"><button type="button" className="orbit-button ghost" onClick={() => setMainEditing(false)}>取消</button><button className="orbit-button primary">保存主线</button></div>
          </form>
        ) : (
          <div className="quest-copy">
            <div className="orbit-title-actions">
              <div><span className="eyebrow">CURRENT DIRECTION</span><h2>当前主线</h2></div>
              <div className="direction-actions">
                <button className="orbit-text-button" onClick={() => { setMainDraft({ ...orbitState.mainQuest, tags: [...orbitState.mainQuest.tags] }); setMainEditing(true); }}>编辑主线</button>
                <span className="quest-chapter">MAIN · 01</span>
              </div>
            </div>
            <h3>{orbitState.mainQuest.title || "还没有设置当前主线。"}</h3>
            <p>{orbitState.mainQuest.description || "写下一句你最近最想靠近的方向。"}</p>
            {orbitState.mainQuest.tags.length > 0 && (
              <div className="quest-tags">{orbitState.mainQuest.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            )}
            <div className="quest-progress-list">
              <div><span>正在推进</span><strong>{orbitState.mainQuest.doing || "暂未填写"}</strong></div>
              <div><span>下一步</span><strong>{orbitState.mainQuest.next || "暂未填写"}</strong></div>
              <div><span>本周重点</span><strong>{orbitState.mainQuest.focus || "暂未填写"}</strong></div>
            </div>
          </div>
        )}
        {mainEditing && <span className="quest-chapter editing-chapter">MAIN · 01</span>}
      </section>

      <section className="glass-card wish-map-panel">
        <div className="section-title-row">
          <div><span className="eyebrow">WISH CHART</span><h2>愿望海图</h2><p>小愿望汇成灯塔的光，也组成正在成形的行动。</p></div>
          <div className="orbit-section-tools">
            <div className="status-legend">
              <span className="status-not-started">未开始</span>
              <span className="status-preparing">准备中</span>
              <span className="status-progressing">进行中</span>
              <span className="status-completed">已完成</span>
              <span className="status-paused">暂时搁置</span>
            </div>
            <button className="orbit-button primary small" type="button" onClick={startWishCreate}>＋ 新增愿望</button>
          </div>
        </div>
        <div className={`wish-map-workspace${isDetailOpen ? " detail-open" : " detail-closed"}`}>
          <div className="wish-map-shell">
            <div
              className="wish-map"
              ref={wishMapRef}
              onPointerDown={startMapDrag}
              onPointerMove={moveMapDrag}
              onPointerUp={endMapDrag}
              onPointerCancel={endMapDrag}
            >
              <div className="wish-chart-tools">
                <span>{Math.round(mapScale * 100)}%</span>
                <button type="button" onClick={() => setMapScale((scale) => Math.min(1.5, Number((scale + .1).toFixed(1))))} aria-label="放大愿望海图">＋</button>
                <button type="button" onClick={() => setMapScale((scale) => Math.max(.75, Number((scale - .1).toFixed(1))))} aria-label="缩小愿望海图">−</button>
                <button type="button" onClick={() => { setMapScale(1); if (wishMapRef.current) { wishMapRef.current.scrollLeft = 0; wishMapRef.current.scrollTop = 0; } }}>重置视图</button>
              </div>
              <div className="wish-map-canvas" style={{ width: `${1200 * mapScale}px`, height: `${450 * mapScale}px` }}>
                <div className="wish-chart-world" style={{ width: "1200px", height: "450px", transform: `scale(${mapScale})` }}>
                  <svg className="wish-chart-lines" viewBox="0 0 1200 450" aria-hidden="true">
                    <path className="ocean-line line-one" d="M0 340 C190 318 310 365 480 342 S770 315 930 344 S1080 355 1200 332" />
                    <path className="ocean-line line-two" d="M0 378 C180 358 330 400 520 374 S840 358 1010 382 S1130 385 1200 372" />
                    <path className="guidance-line" d="M228 204 C365 138 490 175 645 232 S858 250 978 214" />
                    <path className="light-beam" d="M212 142 L524 82 L524 176 Z" />
                  </svg>

                  <div className="abstract-lighthouse" aria-hidden="true">
                    <div className="lighthouse-aura" />
                    <div className="lighthouse-light"><i /></div>
                    <div className="lighthouse-cap" />
                    <div className="lighthouse-gallery"><i /><i /><i /></div>
                    <div className="lighthouse-body"><i /><i /><i /></div>
                    <div className="lighthouse-base" />
                    <div className="lighthouse-ground" />
                    <span>LONG-TERM DIRECTION</span>
                  </div>

                  <div className="abstract-ship" aria-hidden="true">
                    <div className="ship-aura" />
                    <div className="ship-mast" />
                    <div className="ship-rigging rigging-left" />
                    <div className="ship-rigging rigging-right" />
                    <div className="ship-sail sail-left" />
                    <div className="ship-sail sail-right" />
                    <div className="ship-cabin"><i /><i /><i /></div>
                    <div className="ship-deck" />
                    <div className="ship-hull" />
                    <div className="ship-keel" />
                    <div className="ship-glow" />
                    <span>IN PROGRESS</span>
                  </div>

                  <div className="chart-horizon-label">愿望海图 · 拖动探索</div>
                  {orbitState.wishes.map((wish, index) => {
                    const placement = getChartPlacement(wish, index);
                    return (
                  <button
                    type="button"
                        className={`wish-chart-box status-${wish.status} role-${placement.role.replace(" ", "-")}${currentWish?.id === wish.id ? " selected" : ""}`}
                        style={{ left: `${placement.x}%`, top: `${placement.y}%` }}
                    onClick={() => { setSelectedWish(wish); setIsDetailOpen(true); setWishMode("view"); }}
                    key={wish.id}
                  >
                        <i />
                        <span><strong>{wish.title}</strong><em>{wish.status}</em></span>
                  </button>
                    );
                  })}
                  {orbitState.wishes.length === 0 && <div className="wish-map-empty"><span>✦</span><p>还没有愿望盒，先放入一个想认真完成的小愿望。</p></div>}
                </div>
              </div>
            </div>
            {!isDetailOpen && (
              <button
                className="wish-detail-tab"
                type="button"
                onClick={() => currentWish ? setIsDetailOpen(true) : window.alert("先选择一个愿望")}
              >
                <span>✦</span>查看愿望
              </button>
            )}
          </div>

          <aside className={`wish-detail status-${wishDraft?.status || currentWish?.status || "未开始"}${isDetailOpen ? " open" : ""}`}>
            <button className="wish-detail-close" type="button" onClick={() => setIsDetailOpen(false)} aria-label="收起愿望详情">×</button>
            {wishMode !== "view" ? (
              <form className="orbit-form wish-edit-form" onSubmit={saveWish}>
                <div className="wish-detail-top"><span>{wishMode === "create" ? "NEW WISH" : "EDIT WISH"}</span><i><b /></i></div>
                <OrbitField label="愿望名称"><input required value={wishDraft.title} onChange={(event) => updateWishDraft("title", event.target.value)} /></OrbitField>
                <OrbitField label="当前状态"><CustomSelect ariaLabel="选择愿望状态" value={wishDraft.status} options={wishStatuses} onChange={(value) => updateWishDraft("status", value)} /></OrbitField>
                <OrbitField label="愿望分类"><CustomSelect ariaLabel="选择愿望分类" value={wishDraft.category} options={wishCategories} onChange={(value) => updateWishDraft("category", value)} /></OrbitField>
                <OrbitField label="海图角色"><CustomSelect ariaLabel="选择海图角色" value={wishDraft.role} options={wishRoles} onChange={(value) => updateWishDraft("role", value)} /></OrbitField>
                <OrbitField label="为什么想做"><textarea rows="3" value={wishDraft.reason} onChange={(event) => updateWishDraft("reason", event.target.value)} /></OrbitField>
                <OrbitField label="下一步行动"><textarea rows="3" value={wishDraft.nextAction} onChange={(event) => updateWishDraft("nextAction", event.target.value)} /></OrbitField>
                <div className="orbit-form-grid compact">
                  <OrbitField label={`当前进度 ${wishDraft.progress}%`}><input type="range" min="0" max="100" value={wishDraft.progress} onChange={(event) => updateWishDraft("progress", event.target.value)} /></OrbitField>
                  <OrbitField label="最近更新时间"><CalendarDatePicker required ariaLabel="选择愿望最近更新时间" value={wishDraft.lastUpdated} onChange={(value) => updateWishDraft("lastUpdated", value)} /></OrbitField>
                  <OrbitField label="横向位置 %"><input type="number" min="8" max="92" value={wishDraft.x} onChange={(event) => updateWishDraft("x", event.target.value)} /></OrbitField>
                  <OrbitField label="纵向位置 %"><input type="number" min="12" max="88" value={wishDraft.y} onChange={(event) => updateWishDraft("y", event.target.value)} /></OrbitField>
                </div>
                <div className="orbit-form-actions"><button type="button" className="orbit-button ghost" onClick={() => { setWishMode("view"); setWishDraft(null); }}>取消</button><button className="orbit-button primary">保存修改</button></div>
              </form>
            ) : currentWish ? (
              <>
                <div className="wish-detail-top"><span>SELECTED WISH</span><i><b /></i></div>
                <h3>{currentWish.title}</h3>
                <span className="wish-detail-status">{currentWish.status}</span>
                <div className="wish-detail-meta"><span>{currentWish.category}</span><span>{currentWish.role}</span></div>
                <div className="wish-detail-section"><span>为什么想做</span><p>{currentWish.reason || "还没有写下原因。"}</p></div>
                <div className="wish-detail-section"><span>下一步行动</span><p>{currentWish.nextAction || "还没有设置下一步。"}</p></div>
                <div className="wish-detail-progress"><div><span>当前进度</span><b>{currentWish.progress}%</b></div><div><i style={{ width: `${currentWish.progress}%` }} /></div></div>
                <div className="wish-history-meta">
                  <span>创建时间 <b>{formatStoredTime(currentWish.createdAt, currentWish.lastUpdated || "尚未记录")}</b></span>
                  <span>当前状态 <b>{currentWish.status}</b></span>
                  <span>最近更新 <b>{formatStoredTime(currentWish.updatedAt, currentWish.lastUpdated || "尚未记录")}</b></span>
                  {currentWish.completedAt && <span>完成时间 <b>{formatStoredTime(currentWish.completedAt)}</b></span>}
                </div>
                <div className="wish-detail-actions"><button className="orbit-button ghost danger" type="button" onClick={deleteWish}>删除愿望</button><button className="orbit-button primary" type="button" onClick={startWishEdit}>编辑愿望</button></div>
              </>
            ) : (
              <div className="wish-detail-empty"><span>✦</span><p>先选择一个愿望，再查看它的完整内容。</p><button className="orbit-button primary" type="button" onClick={startWishCreate}>新增愿望</button></div>
            )}
          </aside>
          {isDetailOpen && <button className="wish-detail-backdrop" type="button" onClick={() => setIsDetailOpen(false)} aria-label="关闭愿望详情" />}
        </div>
      </section>

      <div className="wish-orbit-support-grid">
        <div className="wish-support-header">
          <div>
            <span className="eyebrow">WISH PROGRESS SYSTEM</span>
            <h2>星轨节点与补给</h2>
            <p>记录已经点亮的时刻，也收藏继续前行需要的灵感。</p>
          </div>
          <div className="wish-support-actions">
            <button className="orbit-button ghost small" type="button" onClick={startMilestoneCreate}>＋ 新增节点</button>
            <button className="orbit-button ghost small" type="button" onClick={startSupplyCreate}>＋ 新增补给</button>
          </div>
        </div>
        <section className="glass-card milestone-panel">
          <div className="section-title-row compact">
            <div><span className="eyebrow">STAR MILESTONES</span><h2>星轨节点</h2><p>记录愿望推进中已经被点亮的时刻。</p></div>
            <button className="orbit-button ghost small" type="button" onClick={startMilestoneCreate}>＋ 新增节点</button>
          </div>
          <div className="milestone-list">
            {milestones.length === 0 && editingMilestoneId !== "new" && (
              <div className="wish-support-empty">
                <span>✦</span>
                <strong>还没有星轨节点。</strong>
                <p>完成一个重要进展后，把它点亮在这里。</p>
              </div>
            )}
            {milestones.map((milestone) => editingMilestoneId === milestone.id ? (
              <form className="orbit-form inline-editor milestone-editor" onSubmit={saveMilestone} key={milestone.id}>
                <OrbitField label="节点名称"><input required value={milestoneDraft.title} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, title: event.target.value })} /></OrbitField>
                <OrbitField label="对应愿望"><input value={milestoneDraft.wishTitle} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, wishTitle: event.target.value })} /></OrbitField>
                <OrbitField label="完成日期"><CalendarDatePicker required ariaLabel="选择节点完成日期" value={milestoneDraft.date} onChange={(value) => setMilestoneDraft({ ...milestoneDraft, date: value })} /></OrbitField>
                <OrbitField label="重要程度"><CustomSelect ariaLabel="选择节点重要程度" value={milestoneDraft.importance} options={milestoneImportanceOptions} onChange={(value) => setMilestoneDraft({ ...milestoneDraft, importance: value })} /></OrbitField>
                <OrbitField label="一句话记录" wide><textarea rows="2" value={milestoneDraft.note} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, note: event.target.value })} /></OrbitField>
                <OrbitField label="当时感受" wide><input value={milestoneDraft.feeling} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, feeling: event.target.value })} /></OrbitField>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => { setEditingMilestoneId(""); setMilestoneDraft(null); }}>取消</button><button className="orbit-button primary">保存节点</button></div>
              </form>
            ) : (
              <article className={`milestone-item importance-${milestone.importance}`} key={milestone.id}>
                <i className="milestone-star" />
                <div className="milestone-content">
                  <div className="milestone-meta"><span>{milestone.date || "未记录日期"}</span><b>{milestone.importance || "普通"}</b></div>
                  <h3>{milestone.title}</h3>
                  <p>{milestone.note}</p>
                  <div className="milestone-foot"><span>对应愿望：{milestone.wishTitle || "未关联"}</span>{milestone.feeling && <em>{milestone.feeling}</em>}</div>
                  <div className="milestone-actions"><button type="button" onClick={() => startMilestoneEdit(milestone)}>编辑</button><button type="button" onClick={() => deleteMilestone(milestone)}>删除</button></div>
                </div>
              </article>
            ))}
            {editingMilestoneId === "new" && milestoneDraft && (
              <form className="orbit-form inline-editor milestone-editor new-editor" onSubmit={saveMilestone}>
                <OrbitField label="节点名称"><input required value={milestoneDraft.title} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, title: event.target.value })} /></OrbitField>
                <OrbitField label="对应愿望"><input value={milestoneDraft.wishTitle} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, wishTitle: event.target.value })} /></OrbitField>
                <OrbitField label="完成日期"><CalendarDatePicker required ariaLabel="选择节点完成日期" value={milestoneDraft.date} onChange={(value) => setMilestoneDraft({ ...milestoneDraft, date: value })} /></OrbitField>
                <OrbitField label="重要程度"><CustomSelect ariaLabel="选择节点重要程度" value={milestoneDraft.importance} options={milestoneImportanceOptions} onChange={(value) => setMilestoneDraft({ ...milestoneDraft, importance: value })} /></OrbitField>
                <OrbitField label="一句话记录" wide><textarea rows="2" value={milestoneDraft.note} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, note: event.target.value })} /></OrbitField>
                <OrbitField label="当时感受" wide><input value={milestoneDraft.feeling} onChange={(event) => setMilestoneDraft({ ...milestoneDraft, feeling: event.target.value })} /></OrbitField>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => { setEditingMilestoneId(""); setMilestoneDraft(null); }}>取消</button><button className="orbit-button primary">新增节点</button></div>
              </form>
            )}
          </div>
        </section>

        <section className="glass-card supply-panel">
          <div className="section-title-row compact">
            <div><span className="eyebrow">WISH SUPPLY</span><h2>愿望补给站</h2><p>收纳灵感、工具、素材和那些会帮愿望继续发光的参考。</p></div>
            <button className="orbit-button ghost small" type="button" onClick={startSupplyCreate}>＋ 新增补给</button>
          </div>
          <div className="supply-list">
            {supplies.length === 0 && editingSupplyId !== "new" && (
              <div className="wish-support-empty compact">
                <span>✦</span>
                <strong>还没有愿望补给。</strong>
                <p>把灵感、工具或参考资料先收藏进来。</p>
              </div>
            )}
            {supplies.map((supply) => editingSupplyId === supply.id ? (
              <form className="orbit-form inline-editor supply-editor" onSubmit={saveSupply} key={supply.id}>
                <OrbitField label="补给名称"><input required value={supplyDraft.name} onChange={(event) => setSupplyDraft({ ...supplyDraft, name: event.target.value })} /></OrbitField>
                <OrbitField label="补给类型"><CustomSelect ariaLabel="选择补给类型" value={supplyDraft.type} options={wishSupplyTypeOptions} onChange={(value) => setSupplyDraft({ ...supplyDraft, type: value })} /></OrbitField>
                {supplyDraft.type === "自定义" && <OrbitField label="自定义类型" wide><input placeholder="例如：播客清单 / 展览线索" value={supplyDraft.customType || ""} onChange={(event) => setSupplyDraft({ ...supplyDraft, customType: event.target.value })} /></OrbitField>}
                <OrbitField label="所属愿望" wide><input value={supplyDraft.wishTitle} onChange={(event) => setSupplyDraft({ ...supplyDraft, wishTitle: event.target.value })} /></OrbitField>
                <OrbitField label="简短说明" wide><textarea rows="2" value={supplyDraft.description} onChange={(event) => setSupplyDraft({ ...supplyDraft, description: event.target.value })} /></OrbitField>
                <OrbitField label="链接或备注" wide><input value={supplyDraft.link} onChange={(event) => setSupplyDraft({ ...supplyDraft, link: event.target.value })} /></OrbitField>
                <label className="orbit-check wide"><input type="checkbox" checked={supplyDraft.favorite} onChange={(event) => setSupplyDraft({ ...supplyDraft, favorite: event.target.checked })} /><span>收藏为重点补给</span></label>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => { setEditingSupplyId(""); setSupplyDraft(null); }}>取消</button><button className="orbit-button primary">保存补给</button></div>
              </form>
            ) : (
              <article className={supply.favorite ? "supply-item favorite" : "supply-item"} key={supply.id}>
                <div className="supply-top"><span>{getWishSupplyDisplayType(supply)}</span>{supply.favorite && <b>收藏</b>}</div>
                <h3>{supply.name}</h3>
                <p>{supply.description}</p>
                <div className="supply-meta"><span>{supply.wishTitle || "未关联愿望"}</span>{supply.link && <a href={supply.link} target="_blank" rel="noreferrer">查看备注</a>}</div>
                <div className="supply-actions"><button type="button" onClick={() => startSupplyEdit(supply)}>编辑</button><button type="button" onClick={() => deleteSupply(supply)}>删除</button></div>
              </article>
            ))}
            {editingSupplyId === "new" && supplyDraft && (
              <form className="orbit-form inline-editor supply-editor new-editor" onSubmit={saveSupply}>
                <OrbitField label="补给名称"><input required value={supplyDraft.name} onChange={(event) => setSupplyDraft({ ...supplyDraft, name: event.target.value })} /></OrbitField>
                <OrbitField label="补给类型"><CustomSelect ariaLabel="选择补给类型" value={supplyDraft.type} options={wishSupplyTypeOptions} onChange={(value) => setSupplyDraft({ ...supplyDraft, type: value })} /></OrbitField>
                {supplyDraft.type === "自定义" && <OrbitField label="自定义类型" wide><input placeholder="例如：播客清单 / 展览线索" value={supplyDraft.customType || ""} onChange={(event) => setSupplyDraft({ ...supplyDraft, customType: event.target.value })} /></OrbitField>}
                <OrbitField label="所属愿望" wide><input value={supplyDraft.wishTitle} onChange={(event) => setSupplyDraft({ ...supplyDraft, wishTitle: event.target.value })} /></OrbitField>
                <OrbitField label="简短说明" wide><textarea rows="2" value={supplyDraft.description} onChange={(event) => setSupplyDraft({ ...supplyDraft, description: event.target.value })} /></OrbitField>
                <OrbitField label="链接或备注" wide><input value={supplyDraft.link} onChange={(event) => setSupplyDraft({ ...supplyDraft, link: event.target.value })} /></OrbitField>
                <label className="orbit-check wide"><input type="checkbox" checked={supplyDraft.favorite} onChange={(event) => setSupplyDraft({ ...supplyDraft, favorite: event.target.checked })} /><span>收藏为重点补给</span></label>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => { setEditingSupplyId(""); setSupplyDraft(null); }}>取消</button><button className="orbit-button primary">新增补给</button></div>
              </form>
            )}
          </div>
        </section>
      </div>

      <div className="growth-bottom-grid removed" aria-hidden="true">
        <section className="glass-card growth-panel">
          <div className="section-title-row compact">
            <div><span className="eyebrow">GROWTH LEVEL</span><h2>成长等级</h2></div>
            <div className="orbit-section-tools horizontal"><span className="growth-total">TOTAL LV.{totalLevel}</span><button className="orbit-button ghost small" type="button" onClick={startSkillCreate}>＋ 新增能力</button></div>
          </div>
          <div className="skill-list">
            {orbitState.skills.map((skill) => editingSkillId === skill.id ? (
              <form className="orbit-form inline-editor skill-editor" onSubmit={saveSkill} key={skill.id}>
                <OrbitField label="能力名称"><input required value={skillDraft.name} onChange={(event) => setSkillDraft({ ...skillDraft, name: event.target.value })} /></OrbitField>
                <OrbitField label="等级"><input required value={skillDraft.level} onChange={(event) => setSkillDraft({ ...skillDraft, level: event.target.value })} /></OrbitField>
                <OrbitField label={`进度 ${skillDraft.percent}%`} wide><input type="range" min="0" max="100" value={skillDraft.percent} onChange={(event) => setSkillDraft({ ...skillDraft, percent: event.target.value })} /></OrbitField>
                <OrbitField label="能力说明" wide><textarea rows="2" value={skillDraft.description} onChange={(event) => setSkillDraft({ ...skillDraft, description: event.target.value })} /></OrbitField>
                <OrbitField label="最近经验" wide><input value={skillDraft.recent} onChange={(event) => setSkillDraft({ ...skillDraft, recent: event.target.value })} /></OrbitField>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => setEditingSkillId("")}>取消</button><button className="orbit-button primary">保存</button></div>
              </form>
            ) : (
              <div className="skill-item" key={skill.id}>
                <div><strong>{skill.name}</strong><span>{skill.level}</span><b>{skill.percent}%</b></div>
                <p>{skill.description}</p><div className="skill-track"><i style={{ width: `${skill.percent}%` }} /></div><small>最近经验：{skill.recent}</small>
                <time className="skill-updated-at">最近修改：{formatStoredTime(skill.updatedAt)}</time>
                <div className="skill-actions">
                  <button className="mini-edit" type="button" onClick={() => startSkillEdit(skill)}>编辑</button>
                  <button className="inline-delete" type="button" onClick={() => deleteSkill(skill)}>删除</button>
                </div>
              </div>
            ))}
            {editingSkillId === "new" && (
              <form className="orbit-form inline-editor skill-editor new-editor" onSubmit={saveSkill}>
                <OrbitField label="能力名称"><input required value={skillDraft.name} onChange={(event) => setSkillDraft({ ...skillDraft, name: event.target.value })} /></OrbitField>
                <OrbitField label="等级"><input required value={skillDraft.level} onChange={(event) => setSkillDraft({ ...skillDraft, level: event.target.value })} /></OrbitField>
                <OrbitField label={`进度 ${skillDraft.percent}%`} wide><input type="range" min="0" max="100" value={skillDraft.percent} onChange={(event) => setSkillDraft({ ...skillDraft, percent: event.target.value })} /></OrbitField>
                <OrbitField label="能力说明" wide><textarea rows="2" value={skillDraft.description} onChange={(event) => setSkillDraft({ ...skillDraft, description: event.target.value })} /></OrbitField>
                <OrbitField label="最近经验" wide><input value={skillDraft.recent} onChange={(event) => setSkillDraft({ ...skillDraft, recent: event.target.value })} /></OrbitField>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => setEditingSkillId("")}>取消</button><button className="orbit-button primary">新增能力</button></div>
              </form>
            )}
          </div>
        </section>

        <section className="glass-card version-panel">
          <div className="section-title-row compact">
            <div><span className="eyebrow">CHANGELOG</span><h2>版本日志</h2></div>
            <div className="orbit-section-tools horizontal">{currentVersion && <span className="version-current">{currentVersion.version}</span>}<button className="orbit-button ghost small" type="button" onClick={startVersionCreate}>＋ 新增</button></div>
          </div>
          <div className="version-list">
            {orbitState.versions.map((version) => editingVersionId === version.id ? (
              <form className="orbit-form inline-editor version-editor" onSubmit={saveVersion} key={version.id}>
                <OrbitField label="版本号"><input required value={versionDraft.version} onChange={(event) => setVersionDraft({ ...versionDraft, version: event.target.value })} /></OrbitField>
                <OrbitField label="标题"><input required value={versionDraft.title} onChange={(event) => setVersionDraft({ ...versionDraft, title: event.target.value })} /></OrbitField>
                <OrbitField label="更新内容" wide><textarea rows="2" value={versionDraft.description} onChange={(event) => setVersionDraft({ ...versionDraft, description: event.target.value })} /></OrbitField>
                <label className="orbit-check wide"><input type="checkbox" checked={versionDraft.current} onChange={(event) => setVersionDraft({ ...versionDraft, current: event.target.checked })} /><span>设为当前版本</span></label>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => setEditingVersionId("")}>取消</button><button className="orbit-button primary">保存</button></div>
              </form>
            ) : (
              <div className={version.current ? "version-item current" : "version-item"} key={version.id}>
                <span>{version.version}</span><i /><div><strong>{version.title}</strong><p>{version.description}</p><div className="version-actions"><button type="button" onClick={() => startVersionEdit(version)}>编辑</button>{!version.current && <button type="button" onClick={() => setCurrentVersion(version.id)}>设为当前</button>}<button type="button" onClick={() => deleteVersion(version)}>删除</button></div></div>
              </div>
            ))}
            {editingVersionId === "new" && (
              <form className="orbit-form inline-editor version-editor new-editor" onSubmit={saveVersion}>
                <OrbitField label="版本号"><input required value={versionDraft.version} onChange={(event) => setVersionDraft({ ...versionDraft, version: event.target.value })} /></OrbitField>
                <OrbitField label="标题"><input required value={versionDraft.title} onChange={(event) => setVersionDraft({ ...versionDraft, title: event.target.value })} /></OrbitField>
                <OrbitField label="更新内容" wide><textarea rows="2" value={versionDraft.description} onChange={(event) => setVersionDraft({ ...versionDraft, description: event.target.value })} /></OrbitField>
                <label className="orbit-check wide"><input type="checkbox" checked={versionDraft.current} onChange={(event) => setVersionDraft({ ...versionDraft, current: event.target.checked })} /><span>设为当前版本</span></label>
                <div className="orbit-form-actions wide"><button type="button" className="orbit-button ghost" onClick={() => setEditingVersionId("")}>取消</button><button className="orbit-button primary">新增日志</button></div>
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const WORLD_ATLAS_STORAGE_KEY = STORAGE_KEYS.worldAtlas;
const placeStatuses = ["已点亮", "想去", "想重返", "记忆深刻"];
const atlasCities = [
  { name: "北京", country: "中国", x: 75, y: 36 },
  { name: "上海", country: "中国", x: 78, y: 43 },
  { name: "广州", country: "中国", x: 75, y: 51 },
  { name: "深圳", country: "中国", x: 76, y: 53 },
  { name: "郑州", country: "中国", x: 73, y: 42 },
  { name: "新乡", country: "中国", x: 73, y: 40 },
  { name: "杭州", country: "中国", x: 77, y: 45 },
  { name: "大理", country: "中国", x: 68, y: 50 },
  { name: "成都", country: "中国", x: 69, y: 45 },
  { name: "西安", country: "中国", x: 70, y: 41 },
  { name: "南京", country: "中国", x: 76, y: 43 },
  { name: "武汉", country: "中国", x: 73, y: 47 },
  { name: "重庆", country: "中国", x: 70, y: 48 },
  { name: "厦门", country: "中国", x: 76, y: 53 },
  { name: "青岛", country: "中国", x: 77, y: 39 },
  { name: "新加坡", country: "新加坡", x: 73, y: 68 },
  { name: "东京", country: "日本", x: 84, y: 41 },
  { name: "首尔", country: "韩国", x: 81, y: 37 },
  { name: "伦敦", country: "英国", x: 47, y: 31 },
  { name: "巴黎", country: "法国", x: 49, y: 35 },
  { name: "纽约", country: "美国", x: 25, y: 38 },
  { name: "悉尼", country: "澳大利亚", x: 87, y: 78 },
  { name: "雷克雅未克", country: "冰岛", x: 40, y: 22 },
];

const placeTypeLabels = {
  country: "国家",
  region: "地区",
  city: "城市",
};

const clampMapPosition = (value, min, max) => Math.min(max, Math.max(min, value));

const coordinatesToMapPosition = (lat, lng) => ({
  x: clampMapPosition(((Number(lng) + 180) / 360) * 100, 2, 98),
  y: clampMapPosition(((90 - Number(lat)) / 180) * 100, 5, 95),
});

const getNominatimPlaceType = (item) => {
  const addressType = String(item.addresstype || "").toLowerCase();
  if (addressType === "country") return "country";
  if (["state", "province", "region"].includes(addressType)) return "region";
  if (["city", "town", "municipality"].includes(addressType)) return "city";
  return null;
};

const normalizeNominatimPlace = (item) => {
  const type = getNominatimPlaceType(item);
  const lat = Number(item.lat);
  const lng = Number(item.lon);
  if (!type || !Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const address = item.address || {};
  const country = address.country || "";
  const admin1 = address.state || address.province || address.region || "";
  const city = address.city || address.town || address.municipality || "";
  const fallbackName = String(item.display_name || "").split(",")[0].trim();
  const name = type === "country"
    ? country || item.name || fallbackName
    : type === "region"
      ? admin1 || item.name || fallbackName
      : city || item.name || fallbackName;
  const position = coordinatesToMapPosition(lat, lng);

  return {
    id: `osm-${item.place_id || `${lat}-${lng}`}`,
    name,
    displayName: item.display_name || [name, admin1, country].filter(Boolean).join(", "),
    country,
    admin1,
    city: city || (type === "city" ? name : ""),
    type,
    lat,
    lng,
    ...position,
  };
};

const fallbackPlaceSearch = (keyword) => {
  const normalizedKeyword = keyword.trim().toLowerCase();
  return atlasCities
    .filter((item) =>
      item.name.toLowerCase().includes(normalizedKeyword)
      || item.country.toLowerCase().includes(normalizedKeyword))
    .slice(0, 10)
    .map((item) => ({
      id: `fallback-${item.name}-${item.country}`,
      name: item.name,
      displayName: `${item.name}, ${item.country}`,
      country: item.country,
      admin1: "",
      city: item.name,
      type: item.name === item.country ? "country" : "city",
      lat: null,
      lng: null,
      x: item.x,
      y: item.y,
    }));
};

async function searchPlaces(keyword, { signal } = {}) {
  const query = keyword.trim();
  if (!query) return [];

  const params = new URLSearchParams({
    q: query,
    format: "jsonv2",
    addressdetails: "1",
    limit: "20",
    "accept-language": "zh-CN,zh,en",
  });
  const response = await fetch(`https://nominatim.openstreetmap.org/search?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    signal,
  });
  if (!response.ok) throw new Error(`Place search failed: ${response.status}`);

  const payload = await response.json();
  const seen = new Set();
  return payload
    .map(normalizeNominatimPlace)
    .filter(Boolean)
    .filter((item) => {
      const key = `${item.type}-${item.name}-${item.admin1}-${item.country}`.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 10);
}

const defaultAtlasPlaces = [];

const copyAtlasDefaults = () => JSON.parse(JSON.stringify(defaultAtlasPlaces));
const createAtlasId = () => `place-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
const formatAtlasDate = (value, fallback = "早期记录") => {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit" });
};
const formatAtlasLocation = (place) => [...new Set(
  [place?.city, place?.admin1, place?.country].map((item) => String(item || "").trim()).filter(Boolean)
)].join(" · ");
const toFiniteCoordinate = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
const normalizePlaceIdentity = (value) => String(value || "").trim().toLocaleLowerCase();

const findDuplicateAtlasPlace = (places, candidate, ignoredId = "") => {
  const candidateLat = toFiniteCoordinate(candidate?.lat);
  const candidateLng = toFiniteCoordinate(candidate?.lng);
  const hasCoordinates = candidateLat !== null && candidateLng !== null;
  const candidateSourceId = normalizePlaceIdentity(candidate?.sourceId || candidate?.id);
  const candidateName = normalizePlaceIdentity(candidate?.searchName || candidate?.name || candidate?.city);
  const candidateCountry = normalizePlaceIdentity(candidate?.country);
  const candidateAdmin1 = normalizePlaceIdentity(candidate?.admin1);

  return places.find((place) => {
    if (place.id === ignoredId) return false;

    const placeSourceId = normalizePlaceIdentity(place.sourceId);
    if (candidateSourceId && placeSourceId && candidateSourceId === placeSourceId) return true;

    const placeLat = toFiniteCoordinate(place.lat);
    const placeLng = toFiniteCoordinate(place.lng);
    if (
      hasCoordinates
      && placeLat !== null
      && placeLng !== null
      && Math.abs(candidateLat - placeLat) < 0.0001
      && Math.abs(candidateLng - placeLng) < 0.0001
    ) return true;

    const placeName = normalizePlaceIdentity(place.searchName || place.name || place.city);
    return Boolean(
      candidateName
      && candidateCountry
      && placeName === candidateName
      && normalizePlaceIdentity(place.country) === candidateCountry
      && normalizePlaceIdentity(place.admin1) === candidateAdmin1
    );
  }) || null;
};

const loadWorldAtlas = () => {
  const saved = readStoredJson(WORLD_ATLAS_STORAGE_KEY);
  if (Array.isArray(saved)) {
    return saved
      .filter((place) => place && typeof place === "object" && place.id)
      .map((place) => ({
        ...place,
        name: place.name || place.city || "未命名地点",
        displayName: place.displayName || [place.city || place.name, place.admin1, place.country].filter(Boolean).join(", "),
        city: place.city || place.name || "",
        country: place.country || "",
        admin1: place.admin1 || "",
        type: ["country", "region", "city"].includes(place.type) ? place.type : "city",
        lat: toFiniteCoordinate(place.lat),
        lng: toFiniteCoordinate(place.lng),
        status: placeStatuses.includes(place.status) ? place.status : "想去",
        time: place.time ?? place.date ?? "",
        memory: place.memory || "",
        detail: place.detail ?? place.details ?? "",
        tags: Array.isArray(place.tags) ? place.tags : [],
        sourceId: place.sourceId || "",
        searchName: place.searchName || place.city || place.name || "",
        createdAt: place.createdAt || "",
        updatedAt: place.updatedAt || place.createdAt || "",
        x: Number.isFinite(Number(place.x)) ? Number(place.x) : 50,
        y: Number.isFinite(Number(place.y)) ? Number(place.y) : 50,
      }));
  }
  return copyAtlasDefaults();
};

function WorldAtlas() {
  const [places, setPlaces] = useState(loadWorldAtlas);
  const [selectedPlaceId, setSelectedPlaceId] = useState(() => loadWorldAtlas()[0]?.id || "");
  const [filter, setFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchMessage, setSearchMessage] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [formMode, setFormMode] = useState("");
  const [placeDraft, setPlaceDraft] = useState(null);
  const searchRequestRef = useRef(null);
  const skipNextSearchRef = useRef(false);
  const didMountAtlasRef = useRef(false);

  useEffect(() => {
    if (!didMountAtlasRef.current) {
      didMountAtlasRef.current = true;
      return;
    }
    writeStoredJson(WORLD_ATLAS_STORAGE_KEY, places);
  }, [places]);

  const filteredPlaces = filter === "全部" ? places : places.filter((place) => place.status === filter);
  const selectedPlace = places.find((place) => place.id === selectedPlaceId) || null;
  const counts = Object.fromEntries(placeStatuses.map((status) => [status, places.filter((place) => place.status === status).length]));

  const getSavedPlaceSuggestions = (keyword) => {
    const normalizedKeyword = keyword.trim().toLowerCase();
    return places
      .filter((place) =>
        place.name.toLowerCase().includes(normalizedKeyword)
        || place.city.toLowerCase().includes(normalizedKeyword)
        || place.country.toLowerCase().includes(normalizedKeyword))
      .slice(0, 4)
      .map((place) => ({
        id: `saved-${place.id}`,
        savedPlaceId: place.id,
        name: place.name,
        displayName: [place.city, place.country].filter(Boolean).join(", "),
        country: place.country,
        admin1: "",
        city: place.city,
        type: "city",
        lat: null,
        lng: null,
        x: place.x,
        y: place.y,
      }));
  };

  const runPlaceSearch = async (keyword) => {
    const query = keyword.trim();
    if (!query) {
      searchRequestRef.current?.abort();
      setSearchSuggestions([]);
      setSearchResult(null);
      setSearchMessage("");
      setIsSearching(false);
      setIsSearchOpen(false);
      return;
    }

    searchRequestRef.current?.abort();
    const controller = new AbortController();
    searchRequestRef.current = controller;
    setIsSearching(true);
    setSearchMessage("");

    try {
      const remoteResults = await searchPlaces(query, { signal: controller.signal });
      const savedResults = getSavedPlaceSuggestions(query);
      const merged = [...savedResults, ...remoteResults]
        .filter((item, index, list) =>
          list.findIndex((candidate) =>
            `${candidate.name}-${candidate.admin1}-${candidate.country}`.toLowerCase()
            === `${item.name}-${item.admin1}-${item.country}`.toLowerCase()) === index)
        .slice(0, 10);
      setSearchSuggestions(merged);
      setIsSearchOpen(true);
      setSearchMessage(merged.length ? "" : "没有找到这个地点，可以换个关键词试试。");
    } catch (error) {
      if (error.name === "AbortError") return;
      const fallbackResults = [...getSavedPlaceSuggestions(query), ...fallbackPlaceSearch(query)].slice(0, 10);
      setSearchSuggestions(fallbackResults);
      setIsSearchOpen(true);
      setSearchMessage(fallbackResults.length
        ? "在线搜索暂时不可用，正在显示本地匹配结果。"
        : "搜索暂时不可用，请稍后再试。");
    } finally {
      if (searchRequestRef.current === controller) setIsSearching(false);
    }
  };

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return undefined;
    }
    const timer = window.setTimeout(() => runPlaceSearch(search), 380);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => () => searchRequestRef.current?.abort(), []);

  const searchCity = (event) => {
    event.preventDefault();
    runPlaceSearch(search);
  };

  const selectSearchSuggestion = (place) => {
    skipNextSearchRef.current = true;
    setSearch(place.name);
    setSearchResult(place);
    setSearchSuggestions([]);
    setIsSearchOpen(false);
    setFormMode("");
    if (place.savedPlaceId) {
      setSelectedPlaceId(place.savedPlaceId);
      setSearchResult(null);
      setSearchMessage(`已找到地点：${place.name}`);
    } else {
      setSelectedPlaceId("");
      setSearchMessage(`已定位：${place.displayName}`);
    }
  };

  const startPlaceCreate = () => {
    const city = searchResult;
    const duplicate = city ? findDuplicateAtlasPlace(places, {
      ...city,
      sourceId: city.id,
      searchName: city.name,
    }) : null;
    if (duplicate) {
      setSelectedPlaceId(duplicate.id);
      setSearchResult(null);
      setFormMode("");
      setSearchMessage(`已在图鉴中：${duplicate.name}`);
      showSavedToast("这个地方已经在图鉴里了");
      return;
    }

    const now = new Date().toISOString();
    setPlaceDraft({
      id: createAtlasId(),
      name: city?.name || "",
      displayName: city?.displayName || "",
      city: city?.city || city?.name || search.trim(),
      country: city?.country || "",
      status: "已点亮",
      time: new Date().toLocaleDateString("en-CA"),
      memory: "",
      detail: "",
      tags: [],
      admin1: city?.admin1 || "",
      type: city?.type || "city",
      lat: city?.lat ?? null,
      lng: city?.lng ?? null,
      sourceId: city?.id || "",
      searchName: city?.name || search.trim(),
      createdAt: now,
      updatedAt: now,
      x: city?.x || 50,
      y: city?.y || 50,
    });
    setFormMode("create");
  };

  const lightSelectedSearchPlace = () => {
    if (!searchResult) {
      startPlaceCreate();
      return;
    }

    const duplicate = findDuplicateAtlasPlace(places, {
      ...searchResult,
      sourceId: searchResult.id,
      searchName: searchResult.name,
    });
    if (duplicate) {
      setSelectedPlaceId(duplicate.id);
      setSearchResult(null);
      setFormMode("");
      setSearchMessage(`已在图鉴中：${duplicate.name}`);
      showSavedToast("这个地方已经在图鉴里了");
      return;
    }

    const now = new Date().toISOString();
    const place = {
      id: createAtlasId(),
      sourceId: searchResult.id,
      searchName: searchResult.name,
      name: searchResult.name,
      displayName: searchResult.displayName,
      country: searchResult.country || "",
      admin1: searchResult.admin1 || "",
      city: searchResult.city || (searchResult.type === "city" ? searchResult.name : ""),
      type: searchResult.type || "city",
      lat: searchResult.lat ?? null,
      lng: searchResult.lng ?? null,
      status: "已点亮",
      time: new Date().toLocaleDateString("en-CA"),
      memory: "",
      detail: "",
      tags: [],
      createdAt: now,
      updatedAt: now,
      x: searchResult.x ?? 50,
      y: searchResult.y ?? 50,
    };

    setPlaces((current) => [...current, place]);
    setSelectedPlaceId(place.id);
    setSearchResult(null);
    setSearchMessage(`已点亮：${place.name}`);
    setFormMode("");
    recordActivity("atlas_place", "点亮了一个地点", place.id);
    showSavedToast("已点亮这个地方");
  };

  const startPlaceEdit = () => {
    if (!selectedPlace) return;
    setPlaceDraft({ ...selectedPlace, tags: [...selectedPlace.tags] });
    setFormMode("edit");
  };

  const updatePlaceDraft = (field, value) => setPlaceDraft((current) => ({ ...current, [field]: value }));

  const savePlace = (event) => {
    event.preventDefault();
    const isCreating = formMode === "create";
    const knownCity = atlasCities.find((city) => city.name === placeDraft.city);
    const now = new Date().toISOString();
    const draftLat = toFiniteCoordinate(placeDraft.lat);
    const draftLng = toFiniteCoordinate(placeDraft.lng);
    const coordinatePosition = draftLat !== null && draftLng !== null
      ? coordinatesToMapPosition(draftLat, draftLng)
      : null;
    const normalized = {
      ...placeDraft,
      tags: typeof placeDraft.tags === "string"
        ? placeDraft.tags.split(/[,，/]/).map((tag) => tag.trim()).filter(Boolean)
        : placeDraft.tags,
      displayName: placeDraft.displayName
        || [placeDraft.name, placeDraft.admin1, placeDraft.country].filter(Boolean).join(", "),
      searchName: placeDraft.searchName || placeDraft.name || placeDraft.city,
      createdAt: placeDraft.createdAt || now,
      updatedAt: now,
      x: coordinatePosition?.x ?? knownCity?.x ?? Number(placeDraft.x),
      y: coordinatePosition?.y ?? knownCity?.y ?? Number(placeDraft.y),
    };

    const duplicate = findDuplicateAtlasPlace(places, normalized, isCreating ? "" : normalized.id);
    if (duplicate) {
      setSelectedPlaceId(duplicate.id);
      setSearchResult(null);
      setFormMode("");
      showSavedToast("这个地方已经在图鉴里了");
      return;
    }

    setPlaces((current) => formMode === "create"
      ? [...current, normalized]
      : current.map((place) => place.id === normalized.id ? normalized : place));
    setSelectedPlaceId(normalized.id);
    setSearchResult(null);
    setSearchMessage(isCreating ? `已点亮：${normalized.name}` : `已更新：${normalized.name}`);
    setFormMode("");
    showSavedToast(isCreating ? "已点亮这个地方" : "地点记忆已更新");
  };

  const deletePlace = () => {
    if (!selectedPlace || !window.confirm(`确认删除地点“${selectedPlace.name}”吗？`)) return;
    const next = places.filter((place) => place.id !== selectedPlace.id);
    setPlaces(next);
    setSelectedPlaceId(next[0]?.id || "");
    showSavedToast("地点已从图鉴中移除");
  };

  return (
    <div className="world-atlas-page">
      <section className="glass-card atlas-map-panel">
        <div className="atlas-toolbar">
          <div
            className="atlas-search-shell"
            onBlur={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) setIsSearchOpen(false);
            }}
          >
            <form className="atlas-search" onSubmit={searchCity}>
              <span>⌕</span>
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchResult(null);
                  setSearchSuggestions([]);
                  setSearchMessage("");
                  setIsSearchOpen(true);
                }}
                onFocus={() => searchSuggestions.length && setIsSearchOpen(true)}
                placeholder="搜索国家、地区或城市"
                autoComplete="off"
                aria-label="搜索国家、地区或城市"
              />
              <button type="submit" disabled={isSearching}>{isSearching ? "搜索中…" : "搜索"}</button>
            </form>
            {isSearchOpen && (isSearching || searchSuggestions.length > 0 || searchMessage) && (
              <div className="atlas-search-suggestions">
                {isSearching && <div className="atlas-search-state"><i />正在搜索全球地点…</div>}
                {!isSearching && searchSuggestions.map((place) => (
                  <button type="button" className="atlas-search-option" onClick={() => selectSearchSuggestion(place)} key={place.id}>
                    <span className="atlas-search-option-main">
                      <strong>{place.name}</strong>
                      <small>{[place.admin1, place.country].filter(Boolean).join(" · ") || place.displayName}</small>
                    </span>
                    <em>{place.savedPlaceId ? "已收藏" : placeTypeLabels[place.type]}</em>
                  </button>
                ))}
                {!isSearching && searchSuggestions.length === 0 && searchMessage && (
                  <div className="atlas-search-state empty">{searchMessage}</div>
                )}
              </div>
            )}
          </div>
          <button className="atlas-light-button" type="button" onClick={lightSelectedSearchPlace}>＋ 点亮这个地方</button>
        </div>
        {searchMessage && <div className={searchResult ? "atlas-search-message found" : "atlas-search-message"}>{searchMessage}</div>}

        <div className="atlas-map-workspace">
          <div className="abstract-world-map">
            <svg viewBox="0 0 1000 500" preserveAspectRatio="none" aria-hidden="true">
              <g className="atlas-grid-lines">
                {[100, 200, 300, 400].map((y) => <path d={`M0 ${y} H1000`} key={y} />)}
                {[125, 250, 375, 500, 625, 750, 875].map((x) => <path d={`M${x} 0 V500`} key={x} />)}
              </g>
              <g className="atlas-continents">
                <path d="M72 132 120 72l88-25 92 31 38 63-38 43-45 4-31 59-62 34-42-67-49-28Z" />
                <path d="m257 278 55 12 32 58-18 82-43 49-28-65-20-83Z" />
                <path d="m438 98 64-35 84 13 36 31 75-19 83 38 98 9 54 62-45 55-102 13-64 48-76-19-39-62-60-3-42 45-74-13-46-55 31-50Z" />
                <path d="m532 267 68 6 50 54-13 91-61 55-45-77-21-76Z" />
                <path d="m801 350 62-32 74 28 29 55-49 44-88-19-42-43Z" />
                <path d="m387 57 27-26 42 7-10 31-45 10Z" />
              </g>
              <g className="atlas-routes">
                <path d="M680 250 Q545 130 400 175" />
                <path d="M680 250 Q805 210 870 375" />
                <path d="M680 250 Q440 310 270 200" />
              </g>
            </svg>
            {filteredPlaces.map((place) => (
              <button
                type="button"
                className={`atlas-point status-${place.status}${selectedPlace?.id === place.id ? " selected" : ""}`}
                style={{ left: `${place.x}%`, top: `${place.y}%` }}
                onClick={() => { setSelectedPlaceId(place.id); setSearchResult(null); setFormMode(""); }}
                aria-label={place.name}
                key={place.id}
              >
                <i /><span>{place.city}</span>
              </button>
            ))}
            {searchResult && <div className="atlas-search-pulse" style={{ left: `${searchResult.x}%`, top: `${searchResult.y}%` }}><i /><span>{searchResult.name}</span></div>}
            <span className="atlas-coordinate">PERSONAL WORLD ATLAS · {places.length} PLACES</span>
          </div>

          <aside className="atlas-detail">
            {formMode ? (
              <form className="orbit-form atlas-place-form" onSubmit={savePlace}>
                <div className="atlas-detail-heading"><span>{formMode === "create" ? "NEW PLACE" : "EDIT PLACE"}</span><h2>{formMode === "create" ? "点亮一个地方" : "编辑地点记忆"}</h2></div>
                <div className="atlas-form-grid">
                  <OrbitField label="地点名称" wide><input required value={placeDraft.name} onChange={(event) => updatePlaceDraft("name", event.target.value)} /></OrbitField>
                  <OrbitField label="城市"><input required value={placeDraft.city} onChange={(event) => updatePlaceDraft("city", event.target.value)} /></OrbitField>
                  <OrbitField label="国家 / 地区"><input required value={placeDraft.country} onChange={(event) => updatePlaceDraft("country", event.target.value)} /></OrbitField>
                  <OrbitField label="状态"><CustomSelect ariaLabel="选择地点状态" value={placeDraft.status} options={placeStatuses} onChange={(value) => updatePlaceDraft("status", value)} /></OrbitField>
                  <OrbitField label="时间"><input value={placeDraft.time} placeholder="例如 2026.05 或 某个夏天" onChange={(event) => updatePlaceDraft("time", event.target.value)} /></OrbitField>
                  <OrbitField label="一句话记忆" wide><input value={placeDraft.memory} onChange={(event) => updatePlaceDraft("memory", event.target.value)} /></OrbitField>
                  <OrbitField label="详细记录" wide><textarea rows="4" value={placeDraft.detail} onChange={(event) => updatePlaceDraft("detail", event.target.value)} /></OrbitField>
                  <OrbitField label="标签（逗号分隔）" wide><input value={Array.isArray(placeDraft.tags) ? placeDraft.tags.join("，") : placeDraft.tags} onChange={(event) => updatePlaceDraft("tags", event.target.value)} /></OrbitField>
                  <OrbitField label="横向位置 %"><input type="number" min="2" max="98" value={placeDraft.x} onChange={(event) => updatePlaceDraft("x", event.target.value)} /></OrbitField>
                  <OrbitField label="纵向位置 %"><input type="number" min="5" max="95" value={placeDraft.y} onChange={(event) => updatePlaceDraft("y", event.target.value)} /></OrbitField>
                </div>
                <div className="orbit-form-actions"><button type="button" className="orbit-button ghost" onClick={() => setFormMode("")}>取消</button><button className="orbit-button primary">保存地点</button></div>
              </form>
            ) : selectedPlace ? (
              <>
                <div className="atlas-detail-heading">
                  <span>PLACE MEMORY · {placeTypeLabels[selectedPlace.type] || "地点"}</span>
                  <h2>{selectedPlace.name}</h2>
                  <p>{formatAtlasLocation(selectedPlace)}</p>
                </div>
                <span className={`atlas-status-badge status-${selectedPlace.status}`}>{selectedPlace.status}</span>
                <div className="atlas-memory-quote">“{selectedPlace.memory || "还没有写下一句话记忆。"}”</div>
                <div className="atlas-detail-block"><span>时间</span><p>{selectedPlace.time || "未记录"}</p></div>
                <div className="atlas-detail-block"><span>创建时间</span><p>{formatStoredTime(selectedPlace.createdAt, "早期图鉴记录")}</p></div>
                {selectedPlace.updatedAt && selectedPlace.updatedAt !== selectedPlace.createdAt && (
                  <div className="atlas-detail-block"><span>最近更新</span><p>{formatStoredTime(selectedPlace.updatedAt)}</p></div>
                )}
                <div className="atlas-detail-block"><span>详细记录</span><p>{selectedPlace.detail || "还没有详细记录。"}</p></div>
                <div className="atlas-tags">{selectedPlace.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
                <div className="atlas-detail-actions"><button className="orbit-button ghost danger" type="button" onClick={deletePlace}>删除地点</button><button className="orbit-button primary" type="button" onClick={startPlaceEdit}>编辑地点</button></div>
              </>
            ) : searchResult ? (
              <div className="atlas-search-preview">
                <span className="atlas-search-preview-icon">⌖</span>
                <div className="atlas-detail-heading">
                  <span>SEARCHED PLACE · {placeTypeLabels[searchResult.type] || "地点"}</span>
                  <h2>{searchResult.name}</h2>
                  <p>{[searchResult.admin1, searchResult.country].filter(Boolean).join(" · ") || searchResult.displayName}</p>
                </div>
                <div className="atlas-search-preview-coordinates">
                  {Number.isFinite(searchResult.lat) && Number.isFinite(searchResult.lng)
                    ? `${searchResult.lat.toFixed(4)}, ${searchResult.lng.toFixed(4)}`
                    : "已使用本地地图坐标"}
                </div>
                <p>这是搜索预览，还没有加入你的世界图鉴。确认后点击“点亮这个地方”，再写下属于它的记忆。</p>
                <button className="atlas-light-button" type="button" onClick={lightSelectedSearchPlace}>＋ 点亮这个地方</button>
              </div>
            ) : (
              <div className="atlas-detail-empty">
                <span>◎</span>
                <h2>还没有选中地点</h2>
                <p>点击地图上的光点，查看一段地点记忆。</p>
              </div>
            )}
          </aside>
        </div>
      </section>

      <section className="atlas-stats">
        {placeStatuses.map((status) => <div className={`glass-card status-${status}`} key={status}><span>{status}</span><strong>{counts[status]}</strong></div>)}
      </section>

      <section className="atlas-collection">
        <div className="atlas-collection-heading">
          <div><span className="eyebrow">PLACE COLLECTION</span><h2>地点记忆</h2></div>
          <div className="atlas-filters">{["全部", ...placeStatuses].map((item) => <button className={filter === item ? "active" : ""} type="button" onClick={() => setFilter(item)} key={item}>{item}</button>)}</div>
        </div>
        <div className="atlas-card-list">
          {filteredPlaces.map((place) => (
            <article
              className={`glass-card atlas-memory-card status-${place.status}${selectedPlaceId === place.id ? " selected" : ""}`}
              role="button"
              tabIndex="0"
              onClick={() => { setSelectedPlaceId(place.id); setSearchResult(null); setFormMode(""); }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  setSelectedPlaceId(place.id);
                  setSearchResult(null);
                  setFormMode("");
                }
              }}
              key={place.id}
            >
              <div><span>{place.status}</span><time>{formatAtlasDate(place.createdAt, place.time || "早期记录")}</time></div>
              <h3>{place.name}</h3><small>{formatAtlasLocation(place)}</small>
              <p>“{place.memory || "还没有写下一句话记忆。"}”</p>
              <footer>{place.tags.map((tag) => <i key={tag}>#{tag}</i>)}</footer>
              <div className="atlas-card-actions">
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedPlaceId(place.id); setSearchResult(null); setFormMode(""); }}>查看</button>
                <button type="button" onClick={(event) => { event.stopPropagation(); setSelectedPlaceId(place.id); setPlaceDraft({ ...place, tags: [...place.tags] }); setFormMode("edit"); }}>编辑</button>
                <button type="button" onClick={(event) => {
                  event.stopPropagation();
                  if (!window.confirm(`确认删除地点“${place.name}”吗？`)) return;
                  const next = places.filter((item) => item.id !== place.id);
                  setPlaces(next);
                  if (selectedPlaceId === place.id) setSelectedPlaceId(next[0]?.id || "");
                  showSavedToast("地点已从图鉴中移除");
                }}>删除</button>
              </div>
            </article>
          ))}
          {filteredPlaces.length === 0 && (
            <div className="atlas-list-empty">
              <span>◎</span>
              <strong>{places.length ? "这里暂时还没有地点。" : "你的世界图鉴还没有被点亮。"}</strong>
              <p>{places.length ? "换个筛选，或点亮一个新地方。" : "搜索一个城市，留下第一段地点记忆。"}</p>
              <button type="button" onClick={lightSelectedSearchPlace}>＋ 点亮一个地方</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function SystemPage({ page }) {
  return (
    <div className={page === "mood" ? "system-grid mood-grid" : "system-grid"}>
      {systemData[page].map((card, index) => (
        <article className={card.examples ? "glass-card system-card mood-card" : "glass-card system-card"} key={card.title}>
          {card.examples ? (
            <>
              <div className="mood-card-identity">
                <span className="system-index">0{index + 1}</span>
                <span className={`card-icon ${card.tone}`}><Icon name={card.icon} /></span>
                <span className="card-kicker">{card.tag}</span>
              </div>
              <div className="mood-card-content">
                <h2>{card.title}</h2>
                <p>{card.text}</p>
                <ul className="mood-examples">
                  {card.examples.map((example) => <li key={example}>{example}</li>)}
                </ul>
              </div>
              <div className="mood-question">
                <span>给自己的问题</span>
                <strong>{card.question}</strong>
                <i>→</i>
              </div>
            </>
          ) : (
            <>
              <div className="system-top"><span className={`card-icon ${card.tone}`}><Icon name={card.icon} /></span><span className="system-index">0{index + 1}</span></div>
              <span className="card-kicker">{card.tag}</span><h2>{card.title}</h2><p>{card.text}</p>
              <div className="system-meta">{card.meta}<span>→</span></div>
            </>
          )}
        </article>
      ))}
    </div>
  );
}

const bookFilmCategories = [
  {
    title: "已读书籍",
    count: 0,
    description: "把读完后仍然留在心里的句子、人物和章节收好。",
    icon: "✦",
    tone: "violet",
  },
  {
    title: "已看电影",
    count: 0,
    description: "记录那些画面、配乐、台词，以及看完之后的余温。",
    icon: "◐",
    tone: "cyan",
  },
  {
    title: "想看清单",
    count: 0,
    description: "先把想抵达的故事放进清单，等合适的时候慢慢打开。",
    icon: "☾",
    tone: "rose",
  },
];

const recentBookFilmRecords = [];

function BookFilmLog() {
  return (
    <div className="book-film-page">
      <section className="glass-card book-film-hero book-film-overview">
        <div className="book-film-hero-copy">
          <span className="eyebrow">BOOK & FILM LOG</span>
          <h2>书影航志</h2>
          <p>把读过的书、看过的电影，和想抵达的故事都留在这里。</p>
        </div>
        <div className="book-film-mark" aria-hidden="true">
          <span>05</span>
          <i />
        </div>
      </section>

      <section className="book-film-category-grid" aria-label="书影分类">
        {bookFilmCategories.map((category) => (
          <article className={`glass-card book-film-category ${category.tone}`} key={category.title}>
            <div className="book-film-card-icon">{category.icon}</div>
            <span className="book-film-card-label">{category.title}</span>
            <strong>{category.count}</strong>
            <p>{category.description}</p>
          </article>
        ))}
      </section>

      <section className="glass-card book-film-recent">
        <div className="book-film-section-heading">
          <div>
            <span className="eyebrow">RECENT NOTES</span>
            <h2>最近记录</h2>
          </div>
          <small>暂无记录</small>
        </div>
        <div className="book-film-record-list">
          {recentBookFilmRecords.map((record) => (
            <article className={`book-film-record ${record.tone}`} key={record.title}>
              <div>
                <h3>{record.title}</h3>
                <span>{record.type}｜{record.status}</span>
              </div>
              <p>{record.note}</p>
              <i aria-hidden="true">→</i>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

const BOOK_FILM_STORAGE_KEY = STORAGE_KEYS.bookFilmLog;
const bookFilmTypes = ["书籍", "电影"];
const bookFilmStatuses = ["想看", "进行中", "已完成"];
const bookFilmFilters = ["全部", "书籍", "电影", "想看", "已完成"];

const defaultBookFilmRecords = [];

const emptyBookFilmDraft = () => ({
  id: "",
  type: "书籍",
  status: "想看",
  title: "",
  creator: "",
  completedDate: "",
  rating: 0,
  tags: "",
  feeling: "",
  review: "",
});

const parseBookFilmTags = (value) => (
  Array.isArray(value)
    ? value
    : String(value || "").split(/[，,]/).map((tag) => tag.trim()).filter(Boolean)
);

const normalizeBookFilmRecord = (record) => ({
  ...emptyBookFilmDraft(),
  ...record,
  id: record?.id || `book-film-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  type: bookFilmTypes.includes(record?.type) ? record.type : "书籍",
  status: bookFilmStatuses.includes(record?.status) ? record.status : "想看",
  title: record?.title || "未命名书影",
  creator: record?.creator || "",
  completedDate: record?.completedDate || "",
  rating: Math.min(5, Math.max(0, Number(record?.rating) || 0)),
  tags: parseBookFilmTags(record?.tags),
  feeling: record?.feeling || "",
  review: record?.review || "",
  createdAt: record?.createdAt || new Date().toISOString(),
  updatedAt: record?.updatedAt || new Date().toISOString(),
});

const loadBookFilmRecords = () => {
  const saved = readStoredJson(BOOK_FILM_STORAGE_KEY);
  return Array.isArray(saved)
    ? saved.filter((record) => record && typeof record === "object").map(normalizeBookFilmRecord)
    : defaultBookFilmRecords.map(normalizeBookFilmRecord);
};

function BookFilmLogInteractive() {
  const [records, setRecords] = useState(loadBookFilmRecords);
  const [filter, setFilter] = useState("全部");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [expandedId, setExpandedId] = useState("");
  const didMountBookFilmRef = useRef(false);

  useEffect(() => {
    if (!didMountBookFilmRef.current) {
      didMountBookFilmRef.current = true;
      return;
    }
    writeStoredJson(BOOK_FILM_STORAGE_KEY, records);
  }, [records]);

  const counts = {
    readBooks: records.filter((record) => record.type === "书籍" && record.status === "已完成").length,
    watchedFilms: records.filter((record) => record.type === "电影" && record.status === "已完成").length,
    wishList: records.filter((record) => record.status === "想看").length,
  };

  const currentMonthKey = getTodayKey().slice(0, 7);
  const completedRecords = records
    .filter((record) => record.status === bookFilmStatuses[2])
    .sort((a, b) => String(b.completedDate || b.updatedAt).localeCompare(String(a.completedDate || a.updatedAt)));
  const recentCompleted = completedRecords[0] || null;
  const monthReadCount = records.filter((record) => (
    record.type === bookFilmTypes[0] && record.status === bookFilmStatuses[2] && String(record.completedDate || "").startsWith(currentMonthKey)
  )).length;
  const monthFilmCount = records.filter((record) => (
    record.type === bookFilmTypes[1] && record.status === bookFilmStatuses[2] && String(record.completedDate || "").startsWith(currentMonthKey)
  )).length;

  const categories = [
    { title: "已读书籍", count: counts.readBooks, description: "把读完后仍然留在心里的句子、人物和章节收好。", icon: "✦", tone: "violet" },
    { title: "已看电影", count: counts.watchedFilms, description: "记录那些画面、配乐、台词，以及看完之后的余温。", icon: "◐", tone: "cyan" },
    { title: "想看清单", count: counts.wishList, description: "先把想抵达的故事放进清单，等合适的时候慢慢打开。", icon: "☾", tone: "rose" },
  ];

  const normalizedSearch = search.trim().toLowerCase();
  const filteredRecords = records
    .filter((record) => {
      if (filter === "全部") return true;
      if (filter === "书籍" || filter === "电影") return record.type === filter;
      return record.status === filter;
    })
    .filter((record) => {
      if (!normalizedSearch) return true;
      return [record.title, record.creator, record.type, record.status, record.feeling, record.review, ...record.tags]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch);
    })
    .sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)));

  const openCreate = () => {
    setDraft(emptyBookFilmDraft());
    setEditingId("new");
  };

  const openEdit = (record) => {
    setDraft({ ...record, tags: record.tags.join("，") });
    setEditingId(record.id);
  };

  const closeEditor = () => {
    setDraft(null);
    setEditingId("");
  };

  const updateDraft = (field, value) => setDraft((current) => ({ ...current, [field]: value }));

  const saveRecord = (event) => {
    event.preventDefault();
    const now = new Date().toISOString();
    const normalized = normalizeBookFilmRecord({
      ...draft,
      id: editingId === "new" ? `book-film-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` : draft.id,
      title: draft.title.trim(),
      creator: draft.creator.trim(),
      tags: parseBookFilmTags(draft.tags),
      feeling: draft.feeling.trim(),
      review: draft.review.trim(),
      createdAt: draft.createdAt || now,
      updatedAt: now,
    });
    if (!normalized.title) return;
    setRecords((current) => (
      editingId === "new"
        ? [normalized, ...current]
        : current.map((record) => record.id === normalized.id ? normalized : record)
    ));
    setExpandedId(normalized.id);
    closeEditor();
    recordActivity(editingId === "new" ? "book_film_created" : "book_film_updated", `${editingId === "new" ? "记录了" : "更新了"}《${normalized.title}》`, normalized.id);
    showSavedToast("书影记录已保存，刷新后仍会保留");
  };

  const deleteRecord = (record) => {
    if (!window.confirm(`确认删除《${record.title}》这条记录吗？`)) return;
    setRecords((current) => current.filter((item) => item.id !== record.id));
    if (expandedId === record.id) setExpandedId("");
    showSavedToast("书影记录已删除");
  };

  return (
    <div className="book-film-page">
      <section className="glass-card book-film-hero book-film-overview">
        <div className="book-film-hero-copy">
          <span className="eyebrow">BOOK & FILM LOG</span>
          <h2>书影航志</h2>
          <p>把读过的书、看过的电影，和想抵达的故事都留在这里。</p>
        </div>
        <div className="book-film-hero-actions">
          <button className="book-film-add-btn" type="button" onClick={openCreate}>+ 记录一段书影</button>
          <div className="book-film-mark" aria-hidden="true"><span>05</span><i /></div>
        </div>
        <div className="book-film-summary-head">
          <div>
            <span className="eyebrow">MONTHLY SUMMARY</span>
            <h2>本月书影小结</h2>
            <p>记录最近读过、看过、想看的故事。</p>
          </div>
          <small>{recentCompleted ? `最近完成：${recentCompleted.type}《${recentCompleted.title}》` : "最近完成：暂无记录"}</small>
        </div>
        <div className="book-film-overview-title">
          <span className="eyebrow">READING & VIEWING DATA</span>
          <h2>书影数据总览</h2>
        </div>
        <div className="book-film-overview-grid">
          <article><span>已读书籍</span><strong>{counts.readBooks}</strong><small>BOOKS FINISHED</small></article>
          <article><span>已看电影</span><strong>{counts.watchedFilms}</strong><small>FILMS WATCHED</small></article>
          <article><span>想看清单</span><strong>{counts.wishList}</strong><small>WAITING LIST</small></article>
          <article className="wide"><span>最近完成记录</span><strong>{recentCompleted ? `《${recentCompleted.title}》` : "暂无完成"}</strong><small>{recentCompleted ? `${recentCompleted.type} · ${recentCompleted.completedDate || "日期未填"}` : "写下第一段完成记录吧"}</small></article>
          <article><span>本月阅读</span><strong>{monthReadCount}</strong><small>{currentMonthKey}</small></article>
          <article><span>本月观影</span><strong>{monthFilmCount}</strong><small>{currentMonthKey}</small></article>
        </div>
      </section>

      <section className="glass-card book-film-library">
        <div className="book-film-section-heading">
          <div><span className="eyebrow">LIBRARY NOTES</span><h2>书影记录</h2></div>
          <small>{records.length} 条记录</small>
        </div>
        <div className="book-film-toolbar">
          <label className="book-film-search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索书名、电影名、作者、导演或标签" /></label>
          <div className="book-film-filters">
            {bookFilmFilters.map((item) => <button className={filter === item ? "active" : ""} type="button" key={item} onClick={() => setFilter(item)}>{item}</button>)}
          </div>
        </div>
        <div className="book-film-record-list">
          {filteredRecords.map((record) => (
            <article className={`book-film-record-card ${record.type === "电影" ? "film" : "book"} status-${record.status}`} key={record.id}>
              <div className="book-film-record-main">
                <div><h3>《{record.title}》</h3><p>{record.creator || (record.type === "书籍" ? "未填写作者" : "未填写导演")}</p></div>
                <div className="book-film-record-badges"><span>{record.type}</span><span>{record.status}</span></div>
              </div>
              <div className="book-film-rating">{Array.from({ length: 5 }, (_, index) => <i className={index < record.rating ? "active" : ""} key={index}>★</i>)}</div>
              <blockquote>{record.feeling || "还没有写下一句话感受。"}</blockquote>
              <div className="book-film-record-meta"><span>{record.completedDate ? `完成于 ${record.completedDate}` : "尚未完成"}</span><span>{record.tags.map((tag) => `#${tag}`).join(" ") || "#未分类"}</span></div>
              {expandedId === record.id && <div className="book-film-review"><span>{record.type === "书籍" ? "书评正文" : "影评正文"}</span><p>{record.review || "这段完整感受还没有写下。"}</p></div>}
              <div className="book-film-card-actions">
                <button type="button" onClick={() => setExpandedId((current) => current === record.id ? "" : record.id)}>{expandedId === record.id ? "收起" : "展开全文"}</button>
                <button type="button" onClick={() => openEdit(record)}>编辑</button>
                <button type="button" onClick={() => deleteRecord(record)}>删除</button>
              </div>
            </article>
          ))}
          {filteredRecords.length === 0 && (
            <div className="book-film-empty">
              <span>☾</span><strong>这里暂时没有匹配的书影记录。</strong>
              <p>换个筛选或搜索词，也可以先记录一段刚刚想起的故事。</p>
              <button type="button" onClick={openCreate}>+ 记录一段书影</button>
            </div>
          )}
        </div>
      </section>

      {draft && (
        <div className="book-film-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeEditor()}>
          <form className="book-film-modal" onSubmit={saveRecord}>
            <button className="book-film-modal-close" type="button" onClick={closeEditor} aria-label="关闭">×</button>
            <div className="book-film-modal-heading">
              <span className="eyebrow">{editingId === "new" ? "NEW NOTE" : "EDIT NOTE"}</span>
              <h2>{editingId === "new" ? "记录一段书影" : "编辑书影记录"}</h2>
              <p>不用写得很完整，先把此刻留下来的感受保存下来。</p>
            </div>
            <div className="book-film-form-grid">
              <OrbitField label="类型"><CustomSelect ariaLabel="选择书影类型" value={draft.type} options={bookFilmTypes} onChange={(value) => updateDraft("type", value)} /></OrbitField>
              <OrbitField label="状态"><CustomSelect ariaLabel="选择书影状态" value={draft.status} options={bookFilmStatuses} onChange={(value) => updateDraft("status", value)} /></OrbitField>
              <OrbitField label="名称" wide><input required value={draft.title} onChange={(event) => updateDraft("title", event.target.value)} placeholder="书名或电影名" /></OrbitField>
              <OrbitField label="作者 / 导演"><input value={draft.creator} onChange={(event) => updateDraft("creator", event.target.value)} placeholder="作者、导演或创作者" /></OrbitField>
              <OrbitField label="完成日期"><CalendarDatePicker ariaLabel="选择完成日期" value={draft.completedDate} onChange={(value) => updateDraft("completedDate", value)} /></OrbitField>
              <OrbitField label={`评分 ${draft.rating || 0} / 5`} wide>
                <div className="book-film-star-picker">
                  {Array.from({ length: 5 }, (_, index) => <button className={index < draft.rating ? "active" : ""} type="button" key={index} onClick={() => updateDraft("rating", index + 1)}>★</button>)}
                  <button type="button" onClick={() => updateDraft("rating", 0)}>清除评分</button>
                </div>
              </OrbitField>
              <OrbitField label="标签" wide><input value={draft.tags} onChange={(event) => updateDraft("tags", event.target.value)} placeholder="成长、治愈、女性、哲学、文学、科幻" /></OrbitField>
              <OrbitField label="一句话感受" wide><input value={draft.feeling} onChange={(event) => updateDraft("feeling", event.target.value)} placeholder="留下一句最想记住的感受" /></OrbitField>
              <OrbitField label="书评 / 影评正文" wide><textarea rows="8" value={draft.review} onChange={(event) => updateDraft("review", event.target.value)} placeholder="可以写完整读后感、观后感、摘录、触动你的片段……" /></OrbitField>
            </div>
            <div className="book-film-modal-actions">
              <button type="button" onClick={closeEditor}>取消</button>
              <button className="primary" type="submit">保存记录</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const emptyVoyageLog = (date = getTodayKey()) => ({
  date,
  sea: "平潮",
  mood: 50,
  energy: 50,
  focus: 50,
  completed: "",
  unfinished: "",
  progress: "",
  glow: "",
  storm: "",
  tomorrow: "",
  closing: "",
});

const loadVoyageRecords = () => {
  const saved = readStoredJson(STORAGE_KEYS.voyageRecords, []);
  return Array.isArray(saved)
    ? saved
      .filter((log) => log && typeof log === "object" && log.date)
      .map((log) => ({ ...emptyVoyageLog(), ...log }))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    : [];
};

const loadVoyageDraft = () => {
  const saved = readStoredJson(STORAGE_KEYS.voyageDraft);
  return saved && typeof saved === "object"
    ? { ...emptyVoyageLog(), ...saved }
    : emptyVoyageLog();
};

const textFields = [
  ["completed", "今日完成", "今天完成了哪些航程？"],
  ["unfinished", "今日未完成", "哪些计划留在了航线上？"],
  ["progress", "今日小进步", "记录一点微小但真实的成长。"],
  ["glow", "今日微光", "今天有什么温柔的瞬间？"],
  ["storm", "今日风浪", "写下今天遇到的困难或情绪。"],
  ["tomorrow", "明日航向", "明天准备驶向哪里？"],
];

const luckyColors = [
  { name: "月光白", color: "#e9edff", glow: "rgba(233, 237, 255, .34)", note: "适合整理思绪，把复杂的事情慢慢说清楚。" },
  { name: "雾紫色", color: "#a99bd6", glow: "rgba(169, 155, 214, .36)", note: "适合允许自己慢一点，不急着给所有问题答案。" },
  { name: "深海蓝", color: "#315b9e", glow: "rgba(49, 91, 158, .42)", note: "适合专注做一件小事，安静地往前推进。" },
  { name: "微光金", color: "#d8b878", glow: "rgba(216, 184, 120, .34)", note: "适合记住今天值得开心的一件小事。" },
  { name: "极光蓝", color: "#69c8d8", glow: "rgba(105, 200, 216, .38)", note: "适合重新开始，给自己一点新的可能。" },
  { name: "珊瑚粉", color: "#d88fa5", glow: "rgba(216, 143, 165, .34)", note: "适合照顾情绪，不把所有感受都压下去。" },
];

const gentleQuotes = [
  "不用一下子变得很厉害，先把今天过清楚。",
  "你不是没有进度，只是有些成长发生得很安静。",
  "今天做一点点，也算是在认真生活。",
  "不必急着证明自己，先把自己照顾好。",
  "有些答案会在持续行动里慢慢出现。",
  "允许自己缓慢，但不要完全停下。",
  "普通的一天，也可以留下一个小小的更新痕迹。",
  "先完成一个很小的开始，再谈更远的地方。",
];

function TodayDraw() {
  const [colorIndex, setColorIndex] = useState(() => Math.floor(Math.random() * luckyColors.length));
  const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * gentleQuotes.length));
  const luckyColor = luckyColors[colorIndex];

  const redraw = () => {
    setColorIndex((current) => {
      if (luckyColors.length < 2) return current;
      let next = current;
      while (next === current) next = Math.floor(Math.random() * luckyColors.length);
      return next;
    });
    setQuoteIndex((current) => {
      if (gentleQuotes.length < 2) return current;
      let next = current;
      while (next === current) next = Math.floor(Math.random() * gentleQuotes.length);
      return next;
    });
  };

  return (
    <section className="glass-card today-draw-card">
      <div className="draw-card-heading">
        <div>
          <span className="eyebrow">A SMALL GIFT FOR TODAY</span>
          <h2>今日随机抽取</h2>
          <p>从微光里，收下一点属于今天的提示。</p>
        </div>
        <span className="draw-star">✦</span>
      </div>

      <div className="draw-content">
        <div className="lucky-color-section">
          <span className="draw-label">LUCKY COLOR · 幸运颜色</span>
          <div className="color-result">
            <div
              className="color-orb"
              style={{ "--lucky-color": luckyColor.color, "--lucky-glow": luckyColor.glow }}
            >
              <i />
            </div>
            <div>
              <h3>{luckyColor.name}</h3>
              <p>{luckyColor.note}</p>
            </div>
          </div>
        </div>

        <div className="gentle-quote-section">
          <span className="draw-label">A NOTE TO MYSELF · 写给自己</span>
          <blockquote>{gentleQuotes[quoteIndex]}</blockquote>
          <span className="quote-mark">“</span>
        </div>
      </div>

      <div className="draw-footer">
        <span>每次抽取，都是一枚轻轻落下的提示</span>
        <button type="button" onClick={redraw}>
          <span>↻</span>重新抽取
        </button>
      </div>
    </section>
  );
}

function VoyagePage({ logs, onSave, selectedDateKey }) {
  const [form, setForm] = useState(() => {
    const draft = loadVoyageDraft();
    return draft.date === selectedDateKey ? draft : logs.find((log) => log.date === selectedDateKey) || emptyVoyageLog(selectedDateKey);
  });
  const didMountVoyageDraftRef = useRef(false);
  const today = selectedDateKey;
  const dailyRecords = loadDailyRecords();
  const todayLog = logs.find((log) => log.date === today);
  const pastLogs = logs.filter((log) => log.date !== today);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(() => pastLogs[0]?.date || "");
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  useEffect(() => {
    if (!didMountVoyageDraftRef.current) {
      didMountVoyageDraftRef.current = true;
      return;
    }
    writeStoredJson(STORAGE_KEYS.voyageDraft, form);
  }, [form]);

  useEffect(() => {
    const savedLog = logs.find((log) => log.date === selectedDateKey);
    const archivedLog = loadDailyRecords()[selectedDateKey]?.voyage;
    setForm(savedLog || archivedLog || emptyVoyageLog(selectedDateKey));
  }, [selectedDateKey]);

  const submitVoyage = (event) => {
    event.preventDefault();
    onSave({ ...form, id: Date.now() });
    localStorage.removeItem(STORAGE_KEYS.voyageDraft);
    setForm(emptyVoyageLog(selectedDateKey));
  };

  useEffect(() => {
    if (!pastLogs.length) {
      setSelectedHistoryDate("");
      return;
    }
    if (!pastLogs.some((log) => log.date === selectedHistoryDate)) {
      setSelectedHistoryDate(pastLogs[0].date);
    }
  }, [logs, pastLogs, selectedHistoryDate]);

  const renderHistoryCard = (log, index = 0) => {
    if (!log) return null;
    const archive = dailyRecords[log.date] || {};
    const status = archive.status || {};
    const tasks = archive.tasks || {};
    const taskItems = dashboardTasks.map((task) => ({
      ...task,
      text: tasks.texts?.[task.id] || task.text,
      completed: Boolean(tasks.completed?.[task.id]),
    }));

    return (
      <article className="glass-card history-card" key={log.id || log.date}>
        <div className="history-card-top">
          <div><span className="history-index">NO. {String(Math.max(1, logs.length - index)).padStart(2, "0")}</span><h3>{log.date}</h3></div>
          <span className={`sea-badge sea-${log.sea}`}>{log.sea}</span>
        </div>
        <div className="history-meters">
          <span>情绪值 <b>{status.mood ?? log.mood}</b></span>
          <span>能量值 <b>{status.energy ?? log.energy}</b></span>
          <span>专注值 <b>{status.focus ?? log.focus}</b></span>
          <span>睡眠 <b>{status.sleep ?? 7.5}h</b></span>
        </div>
        {archive.tasks && (
          <div className="history-task-list">
            <span className="history-block-label">今日三件事</span>
            {taskItems.map((task) => (
              <p className={task.completed ? "completed" : ""} key={task.id}>
                <i>{task.completed ? "✓" : "○"}</i>{task.text}
              </p>
            ))}
          </div>
        )}
        <div className="history-details">
          {textFields.map(([field, label]) => log[field] && <div key={field}><span>{label}</span><p>{log[field]}</p></div>)}
        </div>
        {log.closing && <blockquote className="history-closing">“{log.closing}”</blockquote>}
      </article>
    );
  };

  const selectedPastLog = pastLogs.find((log) => log.date === selectedHistoryDate) || pastLogs[0];

  return (
    <div className="voyage-page">
      <section className="glass-card voyage-form-card">
        <div className="voyage-section-heading">
          <div>
            <span className="eyebrow">DAILY VOYAGE ENTRY</span>
            <h2>记录今日航行</h2>
            <p>为今天的潮汐、风浪与微光留下一枚坐标。</p>
          </div>
          <span className="log-coordinate">LOG · 01</span>
        </div>

        <form onSubmit={submitVoyage}>
          <div className="voyage-controls">
            <div className="field date-field">
              <span>航行日期</span>
              <CalendarDatePicker required ariaLabel="选择航行日期" value={form.date} onChange={(value) => update("date", value)} />
            </div>

            <fieldset className="sea-selector">
              <legend>今日海况</legend>
              <div>
                {["平潮", "微浪", "风浪", "雾航"].map((sea) => (
                  <label className={form.sea === sea ? "selected" : ""} key={sea}>
                    <input type="radio" name="sea" value={sea} checked={form.sea === sea} onChange={(event) => update("sea", event.target.value)} />
                    <span>{sea}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="voyage-meters">
            {[
              ["mood", "情绪潮汐"],
              ["energy", "能量补给"],
              ["focus", "专注罗盘"],
            ].map(([field, label]) => (
              <label className="meter-field" key={field}>
                <span><b>{label}</b><output>{form[field]}</output></span>
                <input type="range" min="0" max="100" value={form[field]} onChange={(event) => update(field, Number(event.target.value))} />
                <small><i>0</i><i>100</i></small>
              </label>
            ))}
          </div>

          <div className="voyage-text-grid">
            {textFields.map(([field, label, placeholder]) => (
              <label className="field" key={field}>
                <span>{label}</span>
                <textarea rows="3" value={form[field]} placeholder={placeholder} onChange={(event) => update(field, event.target.value)} />
              </label>
            ))}
          </div>

          <label className="field closing-field">
            <span>今日结语</span>
            <textarea rows="3" value={form.closing} placeholder="用一句话，为今天的航行收尾。" onChange={(event) => update("closing", event.target.value)} />
          </label>

          <div className="voyage-submit">
            <span>保存后会写入历史记录，刷新后仍会保留</span>
            <button type="submit">保存今日航行 <b>→</b></button>
          </div>
        </form>
      </section>

      {todayLog && (
        <section className="voyage-today-record">
          <div className="history-heading">
            <div><span className="eyebrow">SELECTED DATE ENTRY</span><h2>{today === getTodayKey() ? "今天已保存" : "这一天已保存"}</h2></div>
            <span>{today}</span>
          </div>
          {renderHistoryCard(todayLog)}
        </section>
      )}

      {!todayLog && today !== getTodayKey() && (
        <div className="selected-date-empty-note voyage-date-empty">
          <strong>这一天还没有记录。</strong>
          <span>可以在上方补写一点，也可以从日期卡片回到今天。</span>
        </div>
      )}

      {pastLogs.length > 0 && (
        <section className="voyage-history">
          <div className="history-heading">
            <div><span className="eyebrow">VOYAGE ARCHIVE</span><h2>历史航行记录</h2></div>
            <span>{pastLogs.length} 个过去日期</span>
          </div>
          <div className="voyage-history-dates" role="tablist" aria-label="选择历史日期">
            {pastLogs.map((log) => (
              <button
                className={selectedPastLog?.date === log.date ? "active" : ""}
                type="button"
                role="tab"
                aria-selected={selectedPastLog?.date === log.date}
                onClick={() => setSelectedHistoryDate(log.date)}
                key={log.id || log.date}
              >
                <span>{log.date}</span><small>{log.sea}</small>
              </button>
            ))}
          </div>
          <div className="history-list">{renderHistoryCard(selectedPastLog, pastLogs.indexOf(selectedPastLog))}</div>
        </section>
      )}
    </div>
  );
}

function LandingPage({ onEnter }) {
  const [isLeaving, setIsLeaving] = useState(false);
  const landingRef = useRef(null);
  const pointerFrameRef = useRef(0);

  const enterSite = () => {
    setIsLeaving(true);
    window.setTimeout(onEnter, 650);
  };

  const moveLight = (event) => {
    if (event.pointerType !== "mouse" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const xPercent = (x / rect.width) * 100;
    const yPercent = (y / rect.height) * 100;

    window.cancelAnimationFrame(pointerFrameRef.current);
    pointerFrameRef.current = window.requestAnimationFrame(() => {
      if (!landingRef.current) return;
      landingRef.current.style.setProperty("--cursor-x", `${x}px`);
      landingRef.current.style.setProperty("--cursor-y", `${y}px`);
      landingRef.current.style.setProperty("--cursor-opacity", "1");
      landingRef.current.style.setProperty("--drift-x", `${(xPercent - 50) / 32}px`);
      landingRef.current.style.setProperty("--drift-y", `${(yPercent - 50) / 38}px`);
    });
  };

  return (
    <main
      ref={landingRef}
      className={isLeaving ? "landing-page leaving" : "landing-page"}
      onPointerMove={moveLight}
      onPointerLeave={(event) => {
        window.cancelAnimationFrame(pointerFrameRef.current);
        event.currentTarget.style.setProperty("--cursor-opacity", "0");
        event.currentTarget.style.setProperty("--drift-x", "0px");
        event.currentTarget.style.setProperty("--drift-y", "0px");
      }}
    >
      <div className="landing-water-bg" aria-hidden="true">
        <i /><i /><i /><i />
      </div>

      <header className="landing-topbar">
        <strong>FUGUANG LOG</strong>
        <span>TIDAL MEMORY JOURNAL</span>
      </header>

      <section className="landing-dopamine-hero">
        <div className="landing-copy">
          <span className="landing-kicker">A LIQUID PLACE FOR PRIVATE GROWTH</span>
          <h1 className="landing-title">Voyage Log</h1>
          <button className="landing-water-portal" type="button" onClick={enterSite} aria-label="Enter Voyage Log">
            <span>ENTER</span>
            <i>✦</i>
          </button>
          <p className="landing-subtitle">MOOD · WISH · ATLAS · BOOK · FILM</p>
        </div>
      </section>

      <section className="landing-water-notes" aria-label="Floating notes">
        <span>SOFT CURRENT</span>
        <span>GLOWING DAYS</span>
        <span>INNER VOYAGE</span>
      </section>

      <p className="landing-ending">LET THE LIGHT STAY ON THE WATER.</p>
    </main>
  );
}

const PROFILE_STORAGE_KEY = STORAGE_KEYS.profile;
const defaultProfile = {
  name: "新用户",
  signature: "",
  avatar: "新",
  avatarType: "text",
};

function ProfileAvatar({ profile, className = "" }) {
  return (
    <span className={`profile-avatar ${className}`}>
      {profile.avatarType === "image"
        ? <img src={profile.avatar} alt={`${profile.name}的头像`} />
        : <b>{profile.avatar || "新"}</b>}
      <i />
    </span>
  );
}

const chineseWeekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
const lunarDayDigits = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];

const formatLunarDay = (day) => {
  const value = Number(day);
  if (!Number.isInteger(value) || value < 1 || value > 30) return String(day);
  if (value <= 10) return value === 10 ? "初十" : `初${lunarDayDigits[value]}`;
  if (value < 20) return `十${lunarDayDigits[value - 10]}`;
  if (value === 20) return "二十";
  if (value < 30) return `廿${lunarDayDigits[value - 20]}`;
  return "三十";
};

const getTodayInfo = (date = new Date()) => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  let lunarText = "农历日期计算中";

  try {
    const lunarFormatter = new Intl.DateTimeFormat("zh-CN-u-ca-chinese", {
      month: "long",
      day: "numeric",
    });
    const lunarDate = lunarFormatter.formatToParts(date).map((part) =>
      part.type === "day" ? formatLunarDay(part.value) : part.value
    ).join("").replace(/\s+/g, "").replace(/日$/, "");
    if (lunarDate) lunarText = `农历${lunarDate}`;
  } catch {
    // Older browsers can still show the correct solar date and weekday.
  }

  return {
    dateKey: getDateKey(date),
    dateText: `${year}年${month}月${day}日`,
    weekText: chineseWeekdays[date.getDay()],
    lunarText,
  };
};

function DateDisplay({ selectedDateKey, todayDateKey, onSelectDate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [draftDate, setDraftDate] = useState(selectedDateKey);
  const displayRef = useRef(null);
  const selectedInfo = getTodayInfo(dateFromKey(selectedDateKey));
  const isToday = selectedDateKey === todayDateKey;

  useEffect(() => {
    if (!isOpen) setDraftDate(selectedDateKey);
  }, [selectedDateKey, isOpen]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!displayRef.current?.contains(event.target)) closePicker();
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") closePicker();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen, selectedDateKey]);

  const closePicker = () => {
    setDraftDate(selectedDateKey);
    setIsOpen(false);
  };

  const applyDate = () => {
    if (!draftDate) return;
    onSelectDate(draftDate);
    setIsOpen(false);
  };

  const returnToday = () => {
    setDraftDate(todayDateKey);
    onSelectDate(todayDateKey);
    setIsOpen(false);
  };

  return (
    <div className="date-display-wrap" ref={displayRef}>
      <button
        className={`header-meta date-display-trigger${isToday ? " today" : " history"}`}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        aria-expanded={isOpen}
        aria-label={`${selectedInfo.dateText}，${selectedInfo.weekText}，${selectedInfo.lunarText}，点击选择日期`}
      >
        <span>{selectedInfo.dateText}</span>
        <small>{selectedInfo.weekText} · {selectedInfo.lunarText}</small>
        <i>{isToday ? "今天" : "历史"}</i>
      </button>
      {isOpen && (
        <div className="date-picker-popover">
          <div className="date-picker-heading">
            <span>选择记录日期</span>
            <small>{isToday ? "正在查看今天" : "正在查看历史日期"}</small>
          </div>
          <div className="date-picker-field">
            <span>日期</span>
            <CalendarDatePicker required ariaLabel="选择要查看的记录日期" value={draftDate} onChange={setDraftDate} />
          </div>
          <div className="date-picker-actions">
            <button className="date-picker-cancel" type="button" onClick={closePicker}>取消</button>
            <button className="date-picker-today" type="button" onClick={returnToday}>回到今天</button>
            <button className="date-picker-apply" type="button" onClick={applyDate}>查看这一天</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MainApp({ onReturnLanding }) {
  const [activePage, setActivePage] = useState(() => readStoredValue(STORAGE_KEYS.activePage, "dashboard"));
  const [todayDateKey, setTodayDateKey] = useState(getTodayKey);
  const [selectedDateKey, setSelectedDateKey] = useState(getTodayKey);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voyageLogs, setVoyageLogs] = useState(loadVoyageRecords);
  const [profile, setProfile] = useState(() => {
    const saved = readStoredJson(PROFILE_STORAGE_KEY);
    return saved && typeof saved === "object" && !Array.isArray(saved)
      ? { ...defaultProfile, ...saved }
      : { ...defaultProfile };
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState(profile);
  const [profileError, setProfileError] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const profileFileRef = useRef(null);
  const toastTimerRef = useRef(null);
  const todayDateKeyRef = useRef(todayDateKey);
  const didMountVoyageRecordsRef = useRef(false);

  useEffect(() => {
    writeStoredValue(STORAGE_KEYS.activePage, activePage);
  }, [activePage]);

  useEffect(() => {
    const updateDate = () => {
      const nextToday = getTodayKey();
      const previousToday = todayDateKeyRef.current;
      if (previousToday === nextToday) return;
      todayDateKeyRef.current = nextToday;
      setSelectedDateKey((currentSelected) => currentSelected === previousToday ? nextToday : currentSelected);
      setTodayDateKey(nextToday);
    };
    updateDate();
    const timer = window.setInterval(updateDate, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!didMountVoyageRecordsRef.current) {
      didMountVoyageRecordsRef.current = true;
      return;
    }
    writeStoredJson(STORAGE_KEYS.voyageRecords, voyageLogs);
  }, [voyageLogs]);

  useEffect(() => {
    const handleToast = (event) => {
      setToastMessage(event.detail || "已保存");
      window.clearTimeout(toastTimerRef.current);
      toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 2200);
    };
    window.addEventListener("fuguang-toast", handleToast);
    return () => {
      window.removeEventListener("fuguang-toast", handleToast);
      window.clearTimeout(toastTimerRef.current);
    };
  }, []);

  const saveVoyageLog = (log) => {
    setVoyageLogs((current) => {
      const nextLog = { ...emptyVoyageLog(), ...log };
      const existingIndex = current.findIndex((item) => item.date === nextLog.date);
      const next = existingIndex >= 0
        ? current.map((item, index) => (index === existingIndex ? { ...item, ...nextLog, id: item.id || nextLog.id } : item))
        : [nextLog, ...current];
      return next.sort((a, b) => String(b.date).localeCompare(String(a.date)));
    });
    updateDailyRecord(log.date, { voyage: { ...emptyVoyageLog(), ...log } });
    recordActivity("voyage_saved", `保存了 ${log.date} 的今日航行`, log.date);
    showSavedToast("已更新到历史航行记录，刷新后仍会保留");
  };

  const navigate = (id) => { setActivePage(id); setSidebarOpen(false); };
  const meta = pageMeta[activePage];
  const openProfileEditor = () => {
    setProfileDraft(profile);
    setProfileError("");
    setIsProfileOpen(true);
  };
  const closeProfileEditor = () => {
    setProfileDraft(profile);
    setProfileError("");
    setIsProfileOpen(false);
  };
  const updateTextAvatar = (value) => {
    const avatar = Array.from(value.trim()).slice(0, 2).join("");
    setProfileDraft((current) => ({ ...current, avatar, avatarType: "text" }));
  };
  const uploadAvatar = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setProfileError("请选择图片文件。");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError("头像图片请控制在 2MB 以内。");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileDraft((current) => ({ ...current, avatar: reader.result, avatarType: "image" }));
      setProfileError("");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };
  const saveProfile = () => {
    const name = profileDraft.name.trim();
    if (!name) {
      setProfileError("名称不能为空，请写下一个想被看见的名字。");
      return;
    }
    const nextProfile = {
      ...profileDraft,
      name,
      signature: profileDraft.signature.trim(),
      avatar: profileDraft.avatar || "新",
      avatarType: profileDraft.avatar ? profileDraft.avatarType : "text",
    };
    try {
      if (!writeStoredJson(PROFILE_STORAGE_KEY, nextProfile)) throw new Error("storage-full");
      setProfile(nextProfile);
      setIsProfileOpen(false);
      setProfileError("");
    } catch {
      setProfileError("头像文件可能过大，请换一张更小的图片后再保存。");
    }
  };

  return (
    <div className="app-shell">
      <div className="aurora aurora-one" /><div className="aurora aurora-two" />
      <button className="mobile-menu" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="打开导航">☰</button>
      <aside className={sidebarOpen ? "sidebar open" : "sidebar"}>
        <div className="brand">
          <button className="brand-profile-trigger" type="button" onClick={openProfileEditor} aria-label="编辑个人资料">
            <ProfileAvatar profile={profile} className="brand-avatar" />
          </button>
          <div className="brand-copy" onClick={() => navigate("dashboard")}>
            <strong>{profile.name}</strong>
            <small>FUGUANG LOG</small>
            {profile.signature && <p>{profile.signature}</p>}
          </div>
          <button className="profile-edit-mini" type="button" onClick={openProfileEditor} aria-label="编辑资料">✎</button>
        </div>
        <nav>
          <span className="nav-title">航行系统 / SYSTEMS</span>
          {navItems.map((item) => (
            <button className={activePage === item.id ? "nav-item active" : "nav-item"} onClick={() => navigate(item.id)} key={item.id}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {item.number && <b>{item.number}</b>}
            </button>
          ))}
        </nav>
        {onReturnLanding && <button className="return-landing" type="button" onClick={onReturnLanding}>← 返回入口页</button>}
      </aside>

      <main className={`main-content page-${activePage}`}>
        <header className="page-header">
          <div><span className="eyebrow">{meta.eyebrow}</span><h1>{meta.title}</h1><p>{meta.description}</p></div>
          <DateDisplay selectedDateKey={selectedDateKey} todayDateKey={todayDateKey} onSelectDate={setSelectedDateKey} />
        </header>
        {activePage === "dashboard" && <Dashboard navigate={navigate} selectedDateKey={selectedDateKey} />}
        {activePage === "voyage" && <VoyagePage logs={voyageLogs} onSave={saveVoyageLog} selectedDateKey={selectedDateKey} />}
        {activePage === "mood" && <MoodWarehouse selectedDateKey={selectedDateKey} />}
        {activePage === "wishes" && <WishOrbit />}
        {activePage === "world" && <WorldAtlas />}
        {activePage === "books" && <BookFilmLogInteractive />}
        {!["dashboard", "voyage", "mood", "wishes", "world", "books"].includes(activePage) && <SystemPage page={activePage} />}
        <footer><span>FUGUANG PERSONAL VOYAGE LOG</span><i /><span>航行第 46 天</span></footer>
      </main>

      {isProfileOpen && (
        <div className="profile-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && closeProfileEditor()}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-modal-title">
            <button className="profile-modal-close" type="button" onClick={closeProfileEditor} aria-label="关闭">×</button>
            <div className="profile-modal-heading">
              <span className="eyebrow">PERSONAL PROFILE</span>
              <h2 id="profile-modal-title">编辑个人资料</h2>
              <p>让这个私人空间保留一点属于你的辨识度。</p>
            </div>

            <div className="profile-avatar-editor">
              <ProfileAvatar profile={profileDraft} className="profile-preview" />
              <div>
                <strong>头像</strong>
                <p>上传一张图片，或使用 emoji / 单字。</p>
                <button type="button" onClick={() => profileFileRef.current?.click()}>上传本地图片</button>
                <input ref={profileFileRef} type="file" accept="image/*" onChange={uploadAvatar} hidden />
              </div>
            </div>

            <label className="profile-field">
              <span>文字头像</span>
              <input
                value={profileDraft.avatarType === "text" ? profileDraft.avatar : ""}
                onChange={(event) => updateTextAvatar(event.target.value)}
                placeholder="例如：浮 / ✦"
                maxLength="4"
              />
              <small>输入后会替换当前图片头像，最多显示两个字符。</small>
            </label>

            <label className="profile-field">
              <span>显示名称</span>
              <input
                value={profileDraft.name}
                onChange={(event) => {
                  setProfileDraft((current) => ({ ...current, name: event.target.value }));
                  setProfileError("");
                }}
                placeholder="写下你的名字"
                maxLength="20"
              />
            </label>

            <label className="profile-field">
              <span>个性签名</span>
              <textarea
                rows="3"
                value={profileDraft.signature}
                onChange={(event) => setProfileDraft((current) => ({ ...current, signature: event.target.value }))}
                placeholder="留下一句此刻想对自己说的话"
                maxLength="80"
              />
            </label>

            {profileError && <p className="profile-error">{profileError}</p>}
            <div className="profile-modal-actions">
              <button type="button" onClick={closeProfileEditor}>取消</button>
              <button className="primary" type="button" onClick={saveProfile}>保存资料</button>
            </div>
          </section>
        </div>
      )}
      <div className={toastMessage ? "save-toast visible" : "save-toast"} role="status" aria-live="polite">
        <span>✓</span>{toastMessage}
      </div>
    </div>
  );
}

export default function App() {
  return <MainApp />;
}
