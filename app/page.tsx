"use client";

import {
  ArrowRight,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  File,
  FileText,
  FolderOpen,
  GraduationCap,
  Home,
  Library,
  Link2,
  ListChecks,
  Menu,
  Mic,
  MoreHorizontal,
  NotebookPen,
  PanelRightClose,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Settings,
  Sparkles,
  SlidersHorizontal,
  Upload,
  Video,
  X,
} from "lucide-react";
import { type CSSProperties, useCallback, useEffect, useMemo, useRef, useState } from "react";

type Page = "home" | "course" | "all-resources" | "calendar" | "daily-plan" | "recitation" | "question-book";
type Tab = "Overview" | "Resources" | "Notes" | "Practice" | "Exam";
type PlanStatus = "未开始" | "专注中" | "已暂停" | "已完成" | "已跳过";
type PlanMode = "focus" | "practice" | "recitation";
type PlanItem = { id: number; title: string; course: string; minutes: number; color: string; short: string; status: PlanStatus; mode: PlanMode; source: string; deadline?: string; targetId?: number };
type FocusLog = { id: number; taskId: number; course: string; title: string; minutes: number; result: string; time: string };
type ResourceStatus = "已入库" | "已索引" | "已整理";
type Resource = {
  id: number;
  type: string;
  title: string;
  detail: string;
  date: string;
  status: ResourceStatus;
};
type NoteStage = "library" | "brief" | "searching" | "sources" | "generating" | "draft";
type NoteWorkflow = { stage: NoteStage; topic: string; resourceIds: number[]; publishedUpdate: boolean };

const courses = [
  { name: "概率论", color: "#6076a8", progress: 68, next: "作业 8 · 今天", exam: "9月5日" },
  { name: "抽象代数", color: "#a76f5b", progress: 54, next: "复习商群", exam: "9月12日" },
  { name: "机器学习", color: "#638374", progress: 72, next: "实验 5 · 明天", exam: "9月18日" },
  { name: "宏观经济学", color: "#aa8a4f", progress: 61, next: "阅读第 9 章", exam: "9月21日" },
];

const initialPlanItems: PlanItem[] = [
  { id: 1, title: "完成作业 8", course: "概率论", minutes: 25, color: courses[0].color, short: "概", status: "未开始", mode: "focus", source: "课程待办", deadline: "今天 17:00" },
  { id: 2, title: "复习条件期望错题", course: "概率论", minutes: 25, color: courses[0].color, short: "概", status: "未开始", mode: "practice", source: "我的题册 · 关联笔记 4.2", targetId: 1 },
  { id: 3, title: "重背“什么是马克思主义？”", course: "马克思主义基本原理", minutes: 15, color: "#9a625c", short: "马", status: "未开始", mode: "recitation", source: "背诵辅助" },
  { id: 4, title: "复习梯度下降笔记", course: "机器学习", minutes: 20, color: courses[2].color, short: "机", status: "未开始", mode: "focus", source: "个人安排" },
];

const initialResources: Resource[] = [
  { id: 1, type: "课件", title: "第 01 讲 — 概率空间", detail: "42 页 · 张教授", date: "8月3日", status: "已整理" },
  { id: 2, type: "课件", title: "第 02 讲 — 条件概率", detail: "38 页 · 张教授", date: "8月5日", status: "已整理" },
  { id: 3, type: "课件", title: "第 03 讲 — 随机变量", detail: "51 页 · 张教授", date: "8月8日", status: "已整理" },
  { id: 4, type: "教材", title: "概率论导论 — 第 4 章", detail: "121–164 页 · 概率分布", date: "8月8日", status: "已索引" },
  { id: 5, type: "作业", title: "作业 07", detail: "8 道题 · 8月14日截止", date: "8月10日", status: "已索引" },
  { id: 6, type: "往年试卷", title: "2025 年期末试卷", detail: "90 分钟 · 含解析", date: "8月10日", status: "已索引" },
  { id: 7, type: "笔记", title: "我的笔记 — 条件期望", detail: "第 07 讲后更新", date: "8月11日", status: "已整理" },
  { id: 8, type: "视频", title: "第 07 讲课堂录屏", detail: "1小时18分 · 原始视频", date: "8月11日", status: "已入库" },
];

const searchItems = [
  { type: "课件", title: "条件期望", source: "第 07 讲 · 第 18–31 页" },
  { type: "教材", title: "给定随机变量的条件期望", source: "第 5.2 章 · 第 186 页" },
  { type: "作业", title: "条件期望 — 塔式法则", source: "作业 6 · 第 3 题" },
  { type: "笔记", title: "我的笔记 — 条件期望", source: "5月12日编辑" },
  { type: "往年试卷", title: "条件信息下的期望", source: "2025 期末 · 第 4 题" },
];

const aiActions = [
  "解释我最薄弱的知识点",
  "查找老师讲过这里的位置",
  "生成相似练习题",
  "制定今天的学习计划",
  "估计期末复习重点",
];

const defaultAi = {
  label: "课程脉搏",
  title: "整体节奏不错，还有一个缺口值得补上。",
  body: "你在概率分布上的表现很稳定。期末前，条件期望是最值得优先提升的知识点。",
};

export default function StarDock() {
  const [page, setPage] = useState<Page>("course");
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [aiOpen, setAiOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("条件期望");
  const [resourceModal, setResourceModal] = useState(false);
  const [resources, setResources] = useState(initialResources);
  const [mastery, setMastery] = useState(48);
  const [aiMessage, setAiMessage] = useState(defaultAi);
  const [targetedReview, setTargetedReview] = useState(false);
  const [planItems, setPlanItems] = useState<PlanItem[]>(initialPlanItems);
  const [focusLogs, setFocusLogs] = useState<FocusLog[]>([
    { id: 1, taskId: 8, course: "概率论", title: "整理第 07 讲课堂笔记", minutes: 25, result: "已完成", time: "09:35–10:00" },
  ]);
  const [questionBookTarget, setQuestionBookTarget] = useState<number | null>(null);

  const addPlanItem = useCallback((item: Omit<PlanItem, "id" | "status">) => {
    setPlanItems((current) => current.some((plan) => plan.title === item.title && plan.status !== "已完成") ? current : [...current, { ...item, id: Math.max(0, ...current.map((plan) => plan.id)) + 1, status: "未开始" }]);
  }, []);

  const openCourse = useCallback((tab: Tab = "Overview") => {
    setPage("course");
    setActiveTab(tab);
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setSearchOpen(false);
        setResourceModal(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const markWrongAnswer = () => {
    if (!targetedReview) {
      setMastery(42);
      setTargetedReview(true);
      setAiMessage({
        label: "学习模型已更新",
        title: "我注意到你在条件期望上遇到了困难。",
        body: "这次错误说明你可能混淆了“对事件条件化”和“对随机变量条件化”。要进行一次 10 分钟的针对性复习吗？",
      });
      setAiOpen(true);
    }
  };

  return (
    <div className="app-shell">
      <Sidebar
        page={page}
        activeTab={activeTab}
        onHome={() => setPage("home")}
        onCourse={openCourse}
        onSearch={() => setSearchOpen(true)}
        onResources={() => setPage("all-resources")}
        onCalendar={() => setPage("calendar")}
        onDailyPlan={() => setPage("daily-plan")}
        onRecitation={() => setPage("recitation")}
        onQuestionBook={() => { setQuestionBookTarget(null); setPage("question-book"); }}
      />

      <main className={`main-shell ${page === "course" && aiOpen ? "with-ai" : ""}`}>
        <WorkspaceSearchBar onSearch={() => setSearchOpen(true)} />
        {page === "home" && <HomePage onOpenCourse={openCourse} planItems={planItems} onOpenPlan={() => setPage("daily-plan")} />}
        {page === "all-resources" && <AllResourcesPage resources={resources} onCourse={openCourse} onAdd={() => setResourceModal(true)} />}
        {page === "calendar" && <CalendarPage onCourse={openCourse} />}
        {page === "daily-plan" && <DailyPlanPage items={planItems} setItems={setPlanItems} logs={focusLogs} setLogs={setFocusLogs} onOpenQuestionBook={(id) => { setQuestionBookTarget(id); setPage("question-book"); }} onOpenRecitation={() => setPage("recitation")} />}
        {page === "recitation" && <RecitationAssistant />}
        {page === "question-book" && <QuestionBookPage initialSelectedId={questionBookTarget} onRecitation={() => setPage("recitation")} onAddPlan={addPlanItem} />}
        {page === "course" && (
          <CourseWorkspace
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            resourceCount={resources.length + 10}
            mastery={mastery}
            targetedReview={targetedReview}
            resources={resources}
            setResources={setResources}
            onAddResource={() => setResourceModal(true)}
            onWrongAnswer={markWrongAnswer}
            onAiAction={(message) => {
              setAiOpen(true);
              setAiMessage(message);
            }}
            onAddPlan={addPlanItem}
            plannedTitles={planItems.filter((item) => item.status !== "已完成").map((item) => item.title)}
            onOpenRecitation={() => setPage("recitation")}
            onOpenQuestionBook={() => { setQuestionBookTarget(null); setPage("question-book"); }}
          />
        )}
      </main>

      {page === "course" && (
        <>
          <button className="ai-toggle" onClick={() => setAiOpen(!aiOpen)} aria-label={aiOpen ? "关闭课程 AI" : "打开课程 AI"}>
            {aiOpen ? <PanelRightClose size={17} /> : <Sparkles size={17} />}
            <span>{aiOpen ? "收起 AI" : "课程 AI"}</span>
          </button>
          <CourseAI
            open={aiOpen}
            onClose={() => setAiOpen(false)}
            message={aiMessage}
            setMessage={setAiMessage}
            topic="条件期望"
            resourceCount={resources.length + 10}
            targetedReview={targetedReview}
            onOpenPractice={() => openCourse("Practice")}
          />
        </>
      )}

      {searchOpen && (
        <SearchPalette query={searchQuery} setQuery={setSearchQuery} onClose={() => setSearchOpen(false)} onSelect={() => { setSearchOpen(false); openCourse("Resources"); }} />
      )}
      {resourceModal && (
        <AddResourceModal
          onClose={() => setResourceModal(false)}
          onAdded={(resource) => {
            setResources((current) => [resource, ...current]);
            setAiMessage({ label: "资料已入库", title: "原始资料已安全保存。", body: `${resource.title} 尚未解析。发起课程笔记或专题整理时，Agent 会在同一个任务上下文中检索并处理它。` });
          }}
        />
      )}
    </div>
  );
}

function Sidebar({
  page,
  activeTab,
  onHome,
  onCourse,
  onSearch,
  onResources,
  onCalendar,
  onDailyPlan,
  onRecitation,
  onQuestionBook,
}: {
  page: Page;
  activeTab: Tab;
  onHome: () => void;
  onCourse: (tab?: Tab) => void;
  onSearch: () => void;
  onResources: () => void;
  onCalendar: () => void;
  onDailyPlan: () => void;
  onRecitation: () => void;
  onQuestionBook: () => void;
}) {
  return (
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark"><Sparkles size={13} /></div>
        <span className="brand-name">StarDock <i>星坞</i></span>
        <Menu className="sidebar-menu" size={16} />
      </div>
      <button className="user-row">
        <span className="avatar">L</span>
        <span className="user-copy"><strong>Lucian</strong><small>我的学习星坞</small></span>
        <ChevronDown size={14} />
      </button>
      <nav className="primary-nav" aria-label="主导航">
        <NavItem active={page === "home"} icon={<Home />} label="首页" onClick={onHome} />
        <NavItem active={page === "daily-plan"} icon={<Clock3 />} label="每日计划" onClick={onDailyPlan} />
        <NavItem active={page === "all-resources"} icon={<FolderOpen />} label="全部资料" onClick={onResources} />
        <NavItem active={page === "calendar"} icon={<CalendarDays />} label="日历" onClick={onCalendar} />
        <NavItem active={page === "question-book"} icon={<Library />} label="我的题册" onClick={onQuestionBook} />
        <NavItem active={page === "recitation"} icon={<Brain />} label="背诵辅助" onClick={onRecitation} />
      </nav>
      <div className="semester-section">
        <div className="sidebar-label"><span>2026 秋季学期</span><ChevronDown size={13} /></div>
        <div className="course-list">
          {courses.map((course) => (
            <button key={course.name} className={`course-item ${page === "course" && course.name === "概率论" ? "selected" : ""}`} onClick={() => onCourse("Overview")}>
              <span className="course-dot" style={{ background: course.color }} />
              <span>{course.name}</span>
              {course.name === "概率论" && page === "course" && <span className="active-course-line" />}
            </button>
          ))}
          <button className="course-item add-course" onClick={() => alert("新课程创建入口已准备好，可进入下一步引导流程。") }><Plus size={14} /><span>新建课程</span></button>
        </div>
      </div>
      <div className="sidebar-bottom">
        <button className="nav-item" onClick={() => alert("星坞设置已打开。") }><Settings /><span>设置</span></button>
      </div>
      <div className="mobile-tabs" aria-label="移动端导航">
        <button className={page === "home" ? "active" : ""} onClick={onHome}><Home /><span>首页</span></button>
        <button onClick={onSearch}><Search /><span>搜索</span></button>
        <button className={page === "course" && activeTab === "Overview" ? "active" : ""} onClick={() => onCourse("Overview")}><BookOpen /><span>课程</span></button>
        <button className={page === "all-resources" ? "active" : ""} onClick={onResources}><FolderOpen /><span>资料</span></button>
        <button className={page === "calendar" ? "active" : ""} onClick={onCalendar}><CalendarDays /><span>日历</span></button>
      </div>
    </aside>
  );
}

function NavItem({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button className={`nav-item ${active ? "active" : ""}`} onClick={onClick}><span>{icon}</span><span>{label}</span></button>;
}

function WorkspaceSearchBar({ onSearch }: { onSearch: () => void }) {
  return (
    <div className="workspace-topbar">
      <div className="workspace-topbar-inner">
        <button className="workspace-search-trigger" onClick={onSearch} aria-label="搜索整个学习空间">
          <Search size={15} />
          <span>搜索课程、资料、笔记与练习记录</span>
          <kbd>⌘K</kbd>
        </button>
      </div>
    </div>
  );
}

function CourseWorkspace(props: {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  resourceCount: number;
  mastery: number;
  targetedReview: boolean;
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  onAddResource: () => void;
  onWrongAnswer: () => void;
  onAiAction: (message: typeof defaultAi) => void;
  onAddPlan: (item: Omit<PlanItem, "id" | "status">) => void;
  plannedTitles: string[];
  onOpenRecitation: () => void;
  onOpenQuestionBook: () => void;
}) {
  const tabs: Tab[] = ["Overview", "Resources", "Notes", "Practice", "Exam"];
  const tabLabels: Record<Tab, string> = { Overview: "课程主页", Resources: "资料", Notes: "笔记", Practice: "练习", Exam: "考试" };
  const [noteWorkflow, setNoteWorkflow] = useState<NoteWorkflow>({ stage: "library", topic: "条件期望：定义、塔式法则与典型题型", resourceIds: [4, 7, 8], publishedUpdate: false });
  const startNoteWorkflow = (resourceIds: number[] = []) => {
    setNoteWorkflow((current) => ({ ...current, stage: resourceIds.length ? "sources" : "brief", resourceIds: resourceIds.length ? resourceIds : current.resourceIds }));
    props.setActiveTab("Notes");
  };
  return (
    <div className="course-page">
      <header className="course-header">
        <div className="course-title-row">
          <div>
            <div className="eyebrow">课程星坞</div>
            <h1>概率论</h1>
            <p>2026 秋季学期 <span>·</span> 张教授 <span>·</span> {props.resourceCount} 份资料</p>
          </div>
          <div className="index-status">
            <span><span className="status-dot" /> 课程笔记 v1.8</span>
            <small>14/18 份资料已整理</small>
          </div>
        </div>
        <div className="course-tabs" role="tablist">
          {tabs.map((tab) => <button key={tab} role="tab" aria-selected={props.activeTab === tab} className={props.activeTab === tab ? "active" : ""} onClick={() => props.setActiveTab(tab)}>{tabLabels[tab]}</button>)}
        </div>
      </header>
      <div className="tab-stage" key={props.activeTab}>
        {props.activeTab === "Overview" && <Overview {...props} />}
        {props.activeTab === "Resources" && <ResourcesPage resources={props.resources} onAdd={props.onAddResource} onOrganize={startNoteWorkflow} />}
        {props.activeTab === "Notes" && <NotesPage resources={props.resources} setResources={props.setResources} workflow={noteWorkflow} setWorkflow={setNoteWorkflow} onAiAction={props.onAiAction} onPractice={() => props.setActiveTab("Practice")} onRecitation={props.onOpenRecitation} onQuestionBook={props.onOpenQuestionBook} onAddPlan={props.onAddPlan} />}
        {props.activeTab === "Practice" && <PracticePage onWrong={props.onWrongAnswer} mastery={props.mastery} targetedReview={props.targetedReview} />}
        {props.activeTab === "Exam" && <ExamPage />}
      </div>
    </div>
  );
}

function Overview({ mastery, targetedReview, resources, setActiveTab, onAiAction, onAddPlan, plannedTitles }: {
  mastery: number;
  targetedReview: boolean;
  resources: Resource[];
  setActiveTab: (tab: Tab) => void;
  onAiAction: (message: typeof defaultAi) => void;
  onAddPlan: (item: Omit<PlanItem, "id" | "status">) => void;
  plannedTitles: string[];
}) {
  const upcoming = [
    { date: "今天 17:00", title: "完成作业 8", detail: "还有 6 道题待提交", urgent: true, minutes: 25, mode: "focus" as PlanMode, source: "课程待办" },
    { date: "明天 10:00", title: "预习第 08 讲：大数定律", detail: "教学楼 A203", urgent: false, minutes: 20, mode: "focus" as PlanMode, source: "课程待办" },
    { date: "8月15日", title: "复习条件期望错题", detail: "我的题册 · 5 道题", urgent: false, minutes: 25, mode: "practice" as PlanMode, source: "我的题册", targetId: 1 },
  ];
  return (
    <div className="course-home-content content-width">
      <section className="continue-learning-card">
        <div className="continue-copy"><div className="eyebrow">继续学习</div><span>第 07 讲 · 条件期望</span><h2>从塔式法则的例题继续</h2><p>上次看到第 24 页，昨天 21:40。你在例题 3 的条件化步骤停了下来。</p><button className="primary-button" onClick={() => setActiveTab("Resources")}><Play size={14} /> 继续学习</button></div>
        <div className="continue-preview"><span>第 07 讲</span><strong>E[E(X|Y)] = E(X)</strong><small>条件期望 · 塔式法则</small><i>24 / 38 页</i></div>
      </section>

      <div className="course-home-grid">
        <section className="course-next-section"><div className="action-section-heading"><div><div className="eyebrow">接下来</div><h2>课程待办</h2></div><span>3 项</span></div><div className="course-next-list">{upcoming.map((item) => { const planned = plannedTitles.includes(item.title); return <div className="course-next-item" key={item.title}><span className={item.urgent ? "urgent" : ""}>{item.date}</span><span><strong>{item.title}</strong><small>{item.detail}</small></span><button disabled={planned} onClick={() => onAddPlan({ title: item.title, course: "概率论", minutes: item.minutes, color: courses[0].color, short: "概", mode: item.mode, source: item.source, deadline: item.date, targetId: item.targetId })}>{planned ? <><Check size={12} /> 已在计划</> : <><Plus size={12} /> 加入今日计划</>}</button></div>; })}</div></section>
        <section className="course-attention-card"><div className="eyebrow">当前需要关注</div><div className="attention-score"><strong>{mastery}%</strong><span>条件期望</span></div><h2>{targetedReview ? "刚才的练习暴露了塔式法则的混淆。" : "条件期望是当前最值得补齐的概念。"}</h2><p>从第 07 讲例题和作业 6 开始，约 15 分钟。</p><div><button onClick={() => setActiveTab("Practice")}>开始练习</button><button onClick={() => onAiAction({ label: "课程主页", title: "条件期望应该从哪里补起？", body: "建议先回到第 07 讲第 24 页理解塔式法则，再完成作业 6 第 3 题。" })}>问课程 AI</button></div></section>
      </div>

      <section className="course-recent-section"><div className="action-section-heading"><div><div className="eyebrow">最近加入</div><h2>课程资料</h2></div><button onClick={() => setActiveTab("Resources")}>查看全部 <ArrowRight size={13} /></button></div><div className="course-recent-list">{resources.slice(-3).reverse().map((resource) => <button key={resource.id} onClick={() => setActiveTab("Resources")}><span className="recent-resource-icon"><FileText size={16} /></span><span><strong>{resource.title}</strong><small>{resource.type} · {resource.detail}</small></span><span>{resource.date}</span><ChevronRight size={14} /></button>)}</div></section>

      <section className="course-activity-section"><div className="action-section-heading"><div><div className="eyebrow">最近动态</div><h2>这门课发生了什么</h2></div><span>过去 3 天</span></div><div className="course-activity-list"><div><i /><span><strong>完成第 07 讲课堂笔记</strong><small>昨天 21:40 · 笔记已加入课程上下文</small></span></div><div><i /><span><strong>作业 7 已提交</strong><small>8月11日 · 7/8 题正确</small></span></div><div><i /><span><strong>课程 AI 更新了条件期望掌握状态</strong><small>8月10日 · 来自练习与笔记记录</small></span></div></div></section>
    </div>
  );
}

function ResourcesPage({ resources, onAdd, onOrganize }: { resources: Resource[]; onAdd: () => void; onOrganize: (resourceIds?: number[]) => void }) {
  const filters = ["全部", "课件", "教材", "作业", "往年试卷", "笔记", "视频"];
  const [filter, setFilter] = useState("全部");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const visible = filter === "全部" ? resources : resources.filter((resource) => resource.type === filter);
  const allVisibleSelected = visible.length > 0 && visible.every((resource) => selectedIds.includes(resource.id));
  return (
    <div className="resources-content content-width">
      <div className="page-intro row-intro"><div><div className="eyebrow">课程资料库</div><h2>原始资料与整理状态</h2><p>资料入库后保持原样；Agent 只在你发起整理任务时读取、检索和组织内容。</p></div><div className="resource-header-actions"><button onClick={() => onOrganize()}><Sparkles size={14} /> 专题整理</button><button className="primary-button" onClick={onAdd}><Plus size={15} /> 添加资料</button></div></div>
      <section className="resource-status-guide"><div><span className="resource-state 入库" /> <strong>已入库</strong><small>只保存原始资料，尚未解析</small></div><div><span className="resource-state 索引" /> <strong>已索引</strong><small>曾在 Agent 任务中读取和检索</small></div><div><span className="resource-state 整理" /> <strong>已整理</strong><small>内容已进入确认过的笔记</small></div></section>
      <div className="resource-filters">{filters.map((item) => <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>{item}</button>)}</div>
      <div className="resource-list-header selectable"><button aria-label={allVisibleSelected ? "取消全选" : "全选当前资料"} className={allVisibleSelected ? "selected" : ""} onClick={() => setSelectedIds(allVisibleSelected ? selectedIds.filter((id) => !visible.some((resource) => resource.id === id)) : [...new Set([...selectedIds, ...visible.map((resource) => resource.id)])])}>{allVisibleSelected && <Check size={11} />}</button><span>名称</span><span>添加时间</span><span>整理状态</span><span /></div>
      <div className="resource-list">
        {visible.map((resource) => <ResourceRow key={resource.id} resource={resource} selected={selectedIds.includes(resource.id)} onToggle={() => setSelectedIds((ids) => ids.includes(resource.id) ? ids.filter((id) => id !== resource.id) : [...ids, resource.id])} />)}
      </div>
      {visible.length === 0 && <div className="empty-state"><FolderOpen size={22} /><h3>还没有{filter}</h3><p>添加资料后，它会先作为未经处理的原始资料保存。</p></div>}
      {selectedIds.length > 0 && <div className="resource-selection-bar"><span><strong>{selectedIds.length}</strong> 份资料已选择</span><button onClick={() => setSelectedIds([])}>取消</button><button className="primary-button" onClick={() => onOrganize(selectedIds)}><Sparkles size={14} /> 整理为笔记</button></div>}
    </div>
  );
}

function ResourceRow({ resource, selected = false, onToggle }: { resource: Resource; selected?: boolean; onToggle?: () => void }) {
  const Icon = resource.type === "视频" ? Play : resource.type === "笔记" ? NotebookPen : resource.type === "课件" ? FileText : File;
  return (
    <div className={`resource-row ${onToggle ? "selectable" : ""} ${selected ? "selected" : ""}`}>
      {onToggle && <button className="resource-check" aria-label={`${selected ? "取消选择" : "选择"}${resource.title}`} onClick={onToggle}>{selected && <Check size={11} />}</button>}
      <span className="file-icon"><Icon size={17} /></span>
      <span className="resource-name"><strong>{resource.title}</strong><small>{resource.type} · {resource.detail}</small></span>
      <span className="resource-date">{resource.date}</span>
      <span className={`resource-status ${resource.status}`}><span className="status-dot" /> {resource.status}</span>
      <button className="resource-more" aria-label={`更多操作：${resource.title}`}><MoreHorizontal size={16} /></button>
    </div>
  );
}

function NotesPage({ resources, setResources, workflow, setWorkflow, onAiAction, onPractice, onRecitation, onQuestionBook, onAddPlan }: {
  resources: Resource[];
  setResources: React.Dispatch<React.SetStateAction<Resource[]>>;
  workflow: NoteWorkflow;
  setWorkflow: React.Dispatch<React.SetStateAction<NoteWorkflow>>;
  onAiAction: (message: typeof defaultAi) => void;
  onPractice: () => void;
  onRecitation: () => void;
  onQuestionBook: () => void;
  onAddPlan: (item: Omit<PlanItem, "id" | "status">) => void;
}) {
  const [exportOpen, setExportOpen] = useState(false);
  const selectedResources = resources.filter((resource) => workflow.resourceIds.includes(resource.id));
  const setStage = (stage: NoteStage) => setWorkflow((current) => ({ ...current, stage }));
  const toggleResource = (id: number) => setWorkflow((current) => ({ ...current, resourceIds: current.resourceIds.includes(id) ? current.resourceIds.filter((resourceId) => resourceId !== id) : [...current.resourceIds, id] }));
  const searchSources = () => {
    if (!workflow.topic.trim()) return;
    setStage("searching");
    window.setTimeout(() => setWorkflow((current) => ({ ...current, stage: "sources", resourceIds: [4, 6, 7, 8] })), 900);
  };
  const generateDraft = () => {
    if (!workflow.resourceIds.length) return;
    setStage("generating");
    setResources((current) => current.map((resource) => workflow.resourceIds.includes(resource.id) && resource.status === "已入库" ? { ...resource, status: "已索引" } : resource));
    window.setTimeout(() => setStage("draft"), 1100);
  };
  const publishDraft = () => {
    setResources((current) => current.map((resource) => workflow.resourceIds.includes(resource.id) ? { ...resource, status: "已整理" } : resource));
    setWorkflow((current) => ({ ...current, stage: "library", publishedUpdate: true }));
  };

  if (workflow.stage === "brief") return <div className="notes-content content-width note-workbench">
    <button className="workbench-back" onClick={() => setStage("library")}><ChevronRight size={13} /> 返回课程笔记</button>
    <header><div className="eyebrow">Agent 专题工作台</div><h2>你想整理什么专题？</h2><p>描述学习目标即可。Agent 会先检索资料库并提出参考资料清单，不会直接开始生成。</p></header>
    <section className="topic-brief-card"><textarea value={workflow.topic} onChange={(event) => setWorkflow((current) => ({ ...current, topic: event.target.value }))} placeholder="例如：整理条件期望的定义、塔式法则、老师强调内容和往年题型，形成可用于期末复习的专题笔记。" aria-label="专题整理要求" /><div><span><Sparkles size={13} /> Agent 将先说明准备使用哪些资料</span><button className="primary-button" disabled={!workflow.topic.trim()} onClick={searchSources}>检索参考资料 <ArrowRight size={14} /></button></div></section>
  </div>;

  if (workflow.stage === "searching" || workflow.stage === "generating") return <div className="notes-content content-width note-agent-progress"><div className="generation-orbit"><Brain size={27} /></div><div className="eyebrow">{workflow.stage === "searching" ? "Agent 正在检索资料库" : "Agent 正在生成笔记草稿"}</div><h2>{workflow.stage === "searching" ? `理解“${workflow.topic}”` : `基于 ${workflow.resourceIds.length} 份已确认资料整理`}</h2><p>{workflow.stage === "searching" ? "当前只进行任务内检索和相关性判断，稍后由你确认参考范围。" : "读取原始资料、统一章节结构并保留可追溯引用；不会覆盖课程主笔记。"}</p><div className="generation-steps"><span className="done"><Check size={12} /> {workflow.stage === "searching" ? "理解专题目标" : "读取确认资料"}</span><span className="done"><Check size={12} /> {workflow.stage === "searching" ? "检索候选资料" : "组织章节结构"}</span><span><span className="mini-spinner" /> {workflow.stage === "searching" ? "计算相关性" : "生成带引用草稿"}</span></div></div>;

  if (workflow.stage === "sources") return <div className="notes-content content-width note-source-review">
    <button className="workbench-back" onClick={() => setStage("brief")}><ChevronRight size={13} /> 修改专题要求</button>
    <header><div><div className="eyebrow">Agent 检索完成</div><h2>确认本次参考资料</h2><p>我计划围绕“{workflow.topic}”使用以下资料。你可以删除或增加任何一份。</p></div><div><strong>{workflow.resourceIds.length}</strong><span>份已选择</span></div></header>
    <section className="agent-source-rationale"><Sparkles size={16} /><div><strong>检索判断</strong><p>课堂录屏和个人笔记用于老师表述，教材用于严格定义，往年试卷用于提取考查方式。作业 07 与专题关联较弱，暂未选择。</p></div></section>
    <div className="note-source-list">{resources.map((resource) => { const selected = workflow.resourceIds.includes(resource.id); return <button key={resource.id} className={selected ? "selected" : ""} onClick={() => toggleResource(resource.id)}><span className="material-check">{selected && <Check size={12} />}</span><span className="file-icon"><FileText size={16} /></span><span><strong>{resource.title}</strong><small>{resource.type} · {resource.detail}</small></span><em>{selected ? "本次使用" : "点击增加"}</em></button>; })}</div>
    <div className="note-workflow-actions"><button onClick={() => setStage("library")}>取消整理</button><span>未处理的原始资料会在本次生成任务中读取，不会提前解析。</span><button className="primary-button" disabled={!workflow.resourceIds.length} onClick={generateDraft}>确认并生成草稿 <ArrowRight size={14} /></button></div>
  </div>;

  if (workflow.stage === "draft") return <div className="notes-content content-width note-draft-review">
    <div className="draft-review-header"><div><span className="breadcrumb">概率论 <ChevronRight size={12} /> 笔记草稿</span><h2>条件期望专题</h2><p>Agent 草稿 · 基于 {selectedResources.length} 份已确认资料 · 尚未写入课程主笔记</p></div><div><button onClick={() => setStage("sources")}>调整资料</button><button className="primary-button" onClick={publishDraft}><Check size={14} /> 发布到课程主笔记</button></div></div>
    <div className="draft-review-layout"><nav><span>草稿目录</span>{["4.1 条件期望的定义", "4.2 塔式法则", "4.3 老师强调与直观理解", "4.4 往年题型与易错点"].map((item, index) => <button className={index === 1 ? "active" : ""} key={item}>{item}</button>)}</nav><article><div className="draft-block-label"><span>4.2</span><em>建议更新已有章节</em></div><h1>塔式法则</h1><p>当信息逐层减少时，可以通过再次取条件期望消去中间信息。对可积随机变量 X，有：</p><div className="formula">E[E(X | Y)] = E(X)</div><aside className="draft-citation"><strong>老师的表述</strong><p>“先在已知信息下做最好的估计，再把这些估计平均起来，就会回到原来的总体期望。”</p><span>第 07 讲课堂录屏 · 24:18</span></aside><h3>证明思路</h3><p>根据条件期望定义，对 σ(Y) 中任意事件 A，都有积分相等。令 A = Ω，即得到塔式法则。</p><div className="draft-source-chips"><span>教材第 5.2 节</span><span>我的笔记 · 条件期望</span><span>2025 期末 · 第 4 题</span></div><h3>常见错误</h3><p>不能只写“去掉条件”。完整表述需要说明 X 可积，并指出结论来自条件期望的定义。</p></article><aside><div className="eyebrow">审阅摘要</div><strong>6 处新增</strong><span>2 处合并 · 0 个引用冲突</span><div><CheckCircle2 size={14} /><p>公式均有来源</p></div><div><CheckCircle2 size={14} /><p>老师表述保留时间戳</p></div><div><CheckCircle2 size={14} /><p>往年题仅进入题型部分</p></div><button onClick={() => onAiAction({ label: "草稿审阅", title: "为什么这样组织塔式法则？", body: "我将严格定义、老师的直观表述、证明思路和考试易错点分开，并为每一部分保留了来源。" })}><Sparkles size={13} /> 询问本次整理</button></aside></div>
  </div>;

  return (
    <div className="notes-content content-width">
      <header className="note-library-header"><div><div className="eyebrow">课程知识资产</div><h2>概率论课程笔记</h2><p>用户确认过的主笔记持续吸收课程资料，并稳定导出为 LaTeX。</p></div><div><button onClick={() => setStage("brief")}><Sparkles size={14} /> 专题整理</button><button className="primary-button" onClick={() => setExportOpen(true)}><Upload size={14} /> 导出笔记</button></div></header>
      {workflow.publishedUpdate && <div className="note-publish-success"><CheckCircle2 size={16} /><span><strong>“条件期望专题”已发布。</strong> {workflow.resourceIds.length} 份参考资料已标记为“已整理”，课程主笔记已更新。</span></div>}
      <section className="main-note-card"><div><span className="note-book-mark"><BookOpen size={22} /></span><div><span>课程主笔记 · 已发布</span><h3>概率论完整课程笔记</h3><p>7 个章节 · 86 页 · 14/18 份资料已整理 · 最近更新于刚刚</p></div></div><div><span>当前版本</span><strong>v1.8</strong><small>XeLaTeX 编译通过</small></div></section>
      <div className="note-library-grid"><section><div className="note-section-heading"><div><div className="eyebrow">章节</div><h3>从笔记开始学习</h3></div><span>学习动作均保留章节关联</span></div><div className="note-chapter-list"><article><span>04</span><div><small>随机变量的数字特征</small><h4>条件期望</h4><p>定义、塔式法则、直观理解、典型题型与易错点</p><div className="chapter-actions"><button onClick={onPractice}><GraduationCap size={12} /> 从 4.2 开始练习</button><button onClick={onQuestionBook}><ListChecks size={12} /> 查看关联题册</button><button onClick={() => onAddPlan({ title: "复习课程笔记 4.2：塔式法则", course: "概率论", minutes: 25, color: courses[0].color, short: "概", mode: "focus", source: "课程笔记 · 4.2 塔式法则" })}><Plus size={12} /> 加入每日计划</button></div></div><strong>92%</strong></article><article><span>05</span><div><small>随机变量的收敛</small><h4>大数定律与中心极限定理</h4><p>3 份资料已整理，1 份课堂录屏待更新</p><div className="chapter-actions"><button onClick={onRecitation}><Brain size={12} /> 生成背诵提纲</button></div></div><strong>68%</strong></article></div></section><aside className="note-update-panel"><div className="eyebrow">待更新</div><h3>{resources.some((resource) => resource.status !== "已整理") ? `${resources.filter((resource) => resource.status !== "已整理").length} 份资料尚未进入笔记` : "主笔记已是最新"}</h3><p>{resources.some((resource) => resource.status !== "已整理") ? "这些资料只在资料库中保存或索引，不会自动改写正式笔记。" : "下一份新资料入库后，仍由你决定是否发起整理。"}</p>{resources.filter((resource) => resource.status !== "已整理").slice(0, 3).map((resource) => <div key={resource.id}><span className={`resource-state ${resource.status === "已入库" ? "入库" : "索引"}`} /><span><strong>{resource.title}</strong><small>{resource.status} · {resource.type}</small></span></div>)}<button onClick={() => setStage("brief")}>发起一次整理 <ArrowRight size={13} /></button></aside></div>
      {exportOpen && <div className="export-panel"><div className="export-panel-header"><div><div className="eyebrow">稳定导出</div><h3>概率论课程笔记 · v1.8</h3><p>所有导出基于当前已发布版本，不会重新调用 Agent 改写内容。</p></div><button onClick={() => setExportOpen(false)} aria-label="关闭导出面板"><X size={16} /></button></div><div className="export-options"><article><FileText size={20} /><span><strong>阅读版 PDF</strong><small>86 页 · 4.8 MB</small></span><button>下载 PDF</button></article><article><FileText size={20} /><span><strong>LaTeX 源码</strong><small>main.tex · UTF-8</small></span><button>下载 .tex</button></article><article><FolderOpen size={20} /><span><strong>完整工程包</strong><small>ZIP · main.tex、images/、references.bib</small></span><button>下载 ZIP</button></article></div><footer><CheckCircle2 size={14} /><span>XeLaTeX 编译通过 · 公式、图片与引用路径完整 · 生成于当前发布版本</span></footer></div>}
    </div>
  );
}

function PracticePage({ onWrong, mastery, targetedReview }: { onWrong: () => void; mastery: number; targetedReview: boolean }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hint, setHint] = useState(false);
  const options = [
    "对任意 X 与 Y，都有 E[X | Y] = E[X]",
    "E[E[X | Y]] = E[X]",
    "E[X | Y] 恒为常数",
    "E[X | Y] = E[Y | X]",
  ];
  const correct = selected === 1;
  const submit = () => {
    if (selected === null) return;
    setSubmitted(true);
    if (selected !== 1) onWrong();
  };
  return (
    <div className="practice-content content-width">
      <div className="practice-topline"><span>自适应练习</span><span>第 3 / 10 题</span></div>
      <div className="question-layout">
        <div className="question-main">
          <div className="topic-tag">条件期望 · 塔式法则</div>
          <h2>对于可积随机变量 X 和 Y，下面哪一个恒等式总是成立？</h2>
          <div className="answer-options">
            {options.map((option, index) => {
              const state = submitted ? (index === 1 ? "correct" : selected === index ? "wrong" : "") : selected === index ? "selected" : "";
              return <button key={option} className={state} onClick={() => { if (!submitted) setSelected(index); }}><span>{String.fromCharCode(65 + index)}</span><p>{option}</p>{submitted && index === 1 && <Check size={16} />}{submitted && selected === index && index !== 1 && <X size={16} />}</button>;
            })}
          </div>
          {hint && !submitted && <div className="hint-box"><Sparkles size={14} /><p>先做一次条件化，再对获得的全部信息取平均。最后应当恢复什么？</p></div>}
          {submitted && (
            <div className={`answer-explanation ${correct ? "correct" : "wrong"}`}>
              <div><span className="result-icon">{correct ? <CheckCircle2 size={18} /> : <X size={18} />}</span><div><strong>{correct ? "回答正确" : "还差一点"}</strong><p>全期望公式说明 E[E[X | Y]] = E[X]。对 Y 下的条件估计再次取平均，就会回到原来的期望。</p></div></div>
              {!correct && <div className="model-update"><Sparkles size={14} /><div><span>学习模型已更新</span><p>条件期望掌握度 <s>48%</s> <strong>{mastery}%</strong>。今日计划已自动加入针对性复习。</p></div></div>}
            </div>
          )}
          <div className="practice-actions">
            <button className="text-button" onClick={() => setHint(!hint)} disabled={submitted}>{hint ? "收起提示" : "查看提示"}</button>
            {submitted ? <button className="primary-button" onClick={() => { setSelected(null); setSubmitted(false); setHint(false); }}>下一题 <ArrowRight size={15} /></button> : <button className="primary-button" disabled={selected === null} onClick={submit}>提交答案</button>}
          </div>
        </div>
        <aside className="practice-context">
          <div className="eyebrow">为什么是这道题</div>
          <p>根据你最薄弱的知识点选择，并关联了四份课程资料。</p>
          <div className="context-source primary"><span>课程主笔记 · 4.2 塔式法则</span><small>本题的知识与讲解入口</small></div>
          <div className="context-source"><span>第 07 讲</span><small>原始出处 · 课件第 24–27 页</small></div>
          <div className="context-source"><span>作业 6</span><small>你在第 3 题的错误</small></div>
          <div className="mastery-readout"><span>当前掌握度</span><strong>{mastery}%</strong><div><span style={{ width: `${mastery}%` }} /></div></div>
          {targetedReview && <div className="adapted-note"><Sparkles size={13} /> 接下来的题目会加强塔式法则。</div>}
        </aside>
      </div>
    </div>
  );
}

function ExamPage() {
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);
  const generate = () => {
    setGenerating(true);
    window.setTimeout(() => { setGenerating(false); setGenerated(true); }, 900);
  };
  const focus = [
    ["条件分布", "高"],
    ["中心极限定理", "高"],
    ["期望", "中"],
    ["特征函数", "低"],
  ];
  return (
    <div className="exam-content content-width">
      <div className="exam-hero">
        <div><div className="eyebrow">考试模式</div><h2>期末考试</h2><p>还有 <strong>24 天</strong> · 9月5日 上午 9:00</p></div>
        <button className="primary-button" onClick={generate} disabled={generating}>{generating ? <><span className="spinner" /> 正在根据课程上下文生成…</> : generated ? <><Check size={15} /> 模拟试卷已就绪</> : <><Sparkles size={15} /> 生成模拟试卷</>}</button>
      </div>
      {generated && (
        <section className="mock-exam-ready">
          <div className="exam-paper-icon"><FileText size={21} /></div><div><span>根据你的课程生成</span><h3>概率论 · 模拟期末卷 01</h3><p>90 分钟 <span>·</span> 6 道题 <span>·</span> 100 分</p></div><button onClick={() => alert("模拟试卷已进入专注答题模式。")}>开始考试 <ArrowRight size={15} /></button>
        </section>
      )}
      <div className="exam-grid">
        <section className="exam-focus">
          <div className="section-heading"><div><div className="eyebrow">考试复习重点</div><h3>时间应该花在哪里</h3></div><span className="estimate-badge">AI 估计</span></div>
          <p className="quiet-copy">基于已上传的课程资料，并非对具体考题的预测。</p>
          <div className="focus-list">{focus.map(([topic, level]) => <div key={topic}><span>{topic}</span><span className={`focus-level ${level === "高" ? "high" : level === "中" ? "medium" : "low"}`}>{level}</span></div>)}</div>
        </section>
        <section className="exam-sources">
          <div className="eyebrow">生成依据</div><h3>一张试卷，四类信号</h3>
          {["课程资料", "老师强调内容", "往年试卷", "你的薄弱知识点"].map((source, index) => <div key={source}><span>{String(index + 1).padStart(2, "0")}</span><p>{source}</p><Check size={14} /></div>)}
        </section>
      </div>
    </div>
  );
}

function CourseAI({ open, onClose, message, setMessage, topic, resourceCount, targetedReview, onOpenPractice }: {
  open: boolean;
  onClose: () => void;
  message: typeof defaultAi;
  setMessage: (message: typeof defaultAi) => void;
  topic: string;
  resourceCount: number;
  targetedReview: boolean;
  onOpenPractice: () => void;
}) {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [messages, setMessages] = useState<Array<{
    id: number;
    role: "user" | "assistant";
    label?: string;
    title?: string;
    body: string;
    hasSources?: boolean;
  }>>([]);
  const messageId = useRef(0);
  const lastMessage = useRef<typeof defaultAi | null>(null);
  const timers = useRef<number[]>([]);
  const chatEnd = useRef<HTMLDivElement>(null);

  const nextId = () => {
    messageId.current += 1;
    return messageId.current;
  };

  useEffect(() => {
    if (lastMessage.current === message) return;
    lastMessage.current = message;
    setMessages((current) => [...current, {
      id: nextId(),
      role: "assistant",
      label: message.label,
      title: message.title,
      body: message.body,
      hasSources: message.label.includes("资料") || message.label.includes("来源"),
    }]);
  }, [message]);

  useEffect(() => {
    chatEnd.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages, typing, thinkingStep]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  const beginTurn = (prompt: string, response: typeof defaultAi) => {
    if (typing) return;
    setMessages((current) => [...current, { id: nextId(), role: "user", body: prompt }]);
    setTyping(true);
    setThinkingStep(0);
    timers.current.push(window.setTimeout(() => setThinkingStep(1), 360));
    timers.current.push(window.setTimeout(() => setThinkingStep(2), 760));
    timers.current.push(window.setTimeout(() => {
      setMessage(response);
      setTyping(false);
      setThinkingStep(0);
    }, 1180));
  };

  const responseFor = (action: string): typeof defaultAi => {
    if (action.includes("查找老师")) {
      return { label: "已连接 4 份资料", title: "条件期望出现在这些位置：", body: "第 07 讲 — 课件第 18–31 页\n教材 — 第 5.2 章\n我的笔记 — 5月12日\n作业 6 — 第 3 题" };
    }
    if (action.includes("最薄弱")) {
      return { label: "针对性解释", title: "直观理解条件期望", body: "它是在知道 Y 之后，对 X 做出的最佳估计。这个估计会随 Y 中的信息变化，而对这些估计再次取平均，就会回到 E[X]。" };
    }
    if (action.includes("相似")) {
      return { label: "练习已生成", title: "已准备 4 道相关练习。", body: "题目从直接计算逐步过渡到塔式法则，并使用第 07 讲和作业 6 中的例子。" };
    }
    if (action.includes("学习计划")) {
      return { label: "今天 · 67 分钟", title: "根据你当前状态生成的计划", body: "10 分钟针对性复习\n25 分钟完成作业 8\n20 分钟自适应练习\n12 分钟重看第 07 讲例题" };
    }
    return { label: "AI 估计重点", title: "条件分布与中心极限定理最值得关注。", body: "估计综合了课程资料、老师强调内容、往年试卷和你的学习状态，并不是对具体考题的预测。" };
  };

  const respond = (action: string) => beginTurn(action, responseFor(action));

  const send = () => {
    const prompt = input.trim();
    if (!prompt || typing) return;
    setInput("");
    beginTurn(prompt, {
      label: `已结合 ${topic} 上下文`,
      title: "先抓住“可用信息发生变化”这一点",
      body: "结合课程资料与学习记录，最相关的来源是第 07 讲。条件化之后，我们掌握的信息变了，因此对随机变量的最佳估计也会随之变化。",
    });
  };

  const thinkingLabels = ["理解你的问题", `检索 ${resourceCount} 份课程资料`, "结合你的学习记录"];
  return (
    <aside className={`course-ai ${open ? "open" : ""}`} aria-hidden={!open}>
      <header className="ai-panel-header"><div><span className="ai-orb"><Sparkles size={14} /></span><div><strong>课程 AI</strong><small>始终理解整门课程</small></div></div><button onClick={onClose} aria-label="关闭课程 AI"><X size={17} /></button></header>
      <div className="context-stack"><span>上下文</span><div><strong>概率论</strong><small>{resourceCount} 份资料</small></div><div><strong>{topic}</strong><small>当前知识点</small></div><div><strong>学习记录</strong><small>47 次动作</small></div></div>
      <div className="ai-scroll">
        {targetedReview && <button className="proactive-alert" onClick={onOpenPractice}><span><Sparkles size={13} /> 刚刚发现</span><strong>你在条件期望上遇到了困难</strong><p>开始一次 10 分钟的针对性复习吗？</p><span className="alert-action">现在复习 <ArrowRight size={13} /></span></button>}
        <div className="suggestions"><span>建议操作</span>{aiActions.map((action) => <button key={action} onClick={() => respond(action)} disabled={typing}>{action}<ArrowRight size={13} /></button>)}</div>
        <div className="chat-thread" aria-live="polite">
          {messages.map((item) => (
            <div className={`chat-message ${item.role}`} key={item.id}>
              <div className="message-author">
                {item.role === "assistant" && <span className="message-ai-mark"><Sparkles size={10} /></span>}
                <span>{item.role === "assistant" ? "课程 AI" : "你"}</span>
              </div>
              <div className="message-bubble">
                {item.label && <span className="response-label">{item.label}</span>}
                {item.title && <h3>{item.title}</h3>}
                <div className="response-body">{item.body.split("\n").map((line, index) => <p key={index}>{line}{item.hasSources && <sup>{index + 1}</sup>}</p>)}</div>
                {item.hasSources && <div className="source-chips"><button>第 07 讲 · 第18页</button><button>教材 · 第 5.2 章</button></div>}
              </div>
            </div>
          ))}
          {typing && (
            <div className="ai-thinking" role="status">
              <div className="thinking-head"><span className="message-ai-mark"><Sparkles size={10} /></span><strong>课程 AI 正在思考</strong><span>{thinkingStep + 1}/3</span></div>
              <div className="thinking-progress" role="progressbar" aria-label="AI 思考进度" aria-valuemin={0} aria-valuemax={100} aria-valuenow={(thinkingStep + 1) * 31}><span style={{ width: `${(thinkingStep + 1) * 31}%` }} /></div>
              <div className="thinking-steps">{thinkingLabels.map((label, index) => <div className={index < thinkingStep ? "done" : index === thinkingStep ? "current" : ""} key={label}>{index < thinkingStep ? <Check size={11} /> : <span className="thinking-step-dot" />}{label}</div>)}</div>
            </div>
          )}
          <div ref={chatEnd} />
        </div>
      </div>
      <div className="ai-composer"><div><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} placeholder="问这门课任何问题…" rows={2} disabled={typing} /><button onClick={send} disabled={!input.trim() || typing} aria-label="发送消息"><Send size={15} /></button></div><span>{typing ? "正在读取课程上下文…" : "Enter 发送 · Shift + Enter 换行"}</span></div>
    </aside>
  );
}

function AddResourceModal({ onClose, onAdded }: { onClose: () => void; onAdded: (resource: Resource) => void }) {
  const [method, setMethod] = useState("上传文件");
  const [stage, setStage] = useState<"choose" | "uploading" | "added">("choose");
  const [value, setValue] = useState("");
  const started = useRef(false);
  const resourceTextInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (method !== "上传文件" && stage === "choose") resourceTextInputRef.current?.focus();
  }, [method, stage]);
  const start = () => {
    if (started.current) return;
    started.current = true;
    setStage("uploading");
    window.setTimeout(() => {
      const title = method === "上传文件" ? "第 09 讲 — 鞅" : value || (method === "写笔记" ? "新课程笔记" : "已链接的课程资料");
      onAdded({ id: Date.now(), type: method === "写笔记" ? "笔记" : method === "添加视频" ? "视频" : "课件", title, detail: "原始资料 · 尚未处理", date: "刚刚", status: "已入库" });
      setStage("added");
    }, 900);
  };
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) onClose(); }}>
      <div className="resource-modal" role="dialog" aria-modal="true" aria-labelledby="add-resource-title">
        <div className="modal-header"><div><div className="eyebrow">扩展课程上下文</div><h2 id="add-resource-title">添加资料</h2></div><button onClick={onClose} aria-label="关闭"><X size={18} /></button></div>
        {stage === "choose" ? <>
          <div className="add-methods">
            {[{ label: "上传文件", icon: Upload, hint: "PDF、PPTX、DOCX、音频" }, { label: "粘贴链接", icon: Link2, hint: "文章或共享文档" }, { label: "添加视频", icon: Video, hint: "YouTube 或课堂录屏" }, { label: "写笔记", icon: NotebookPen, hint: "在星坞中开始记录" }].map((item) => <button key={item.label} className={method === item.label ? "active" : ""} onClick={() => setMethod(item.label)}><item.icon size={17} /><span><strong>{item.label}</strong><small>{item.hint}</small></span><Check size={14} /></button>)}
          </div>
          {method === "上传文件" ? <label className="drop-zone"><Upload size={22} /><strong>选择文件，或拖到这里</strong><span>最大 100 MB</span><input type="file" onChange={(event) => { if (event.target.files?.length) start(); }} /></label> : <div className="resource-input"><label>{method === "写笔记" ? "笔记标题" : method === "添加视频" ? "视频链接" : "资料链接"}</label><input ref={resourceTextInputRef} value={value} onChange={(event) => setValue(event.target.value)} placeholder={method === "写笔记" ? "例如：8月12日答疑课" : "粘贴链接…"} /></div>}
          <div className="modal-footer"><p><FolderOpen size={13} /> 这里只保存原始资料，不会自动解析或改写笔记。</p><button className="primary-button" onClick={start} disabled={method !== "上传文件" && !value.trim()}>{method === "上传文件" ? "使用示例课件" : method === "写笔记" ? "保存到资料库" : "添加到资料库"}</button></div>
        </> : <div className="processing-state">
          <div className={`processing-icon ${stage}`} >{stage === "added" ? <Check size={24} /> : <FileText size={24} />}</div>
          <h3>{stage === "uploading" ? "正在保存原始资料" : "已加入课程资料库"}</h3>
          <p>{stage === "uploading" ? "第 09 讲 — 鞅.pdf" : "当前状态为“已入库”。只有发起笔记整理任务后，Agent 才会在该任务上下文中读取它。"}</p>
          <div className="processing-steps"><span className="done"><Check size={12} /> 上传</span><span className={stage === "added" ? "done" : ""}>{stage === "added" ? <Check size={12} /> : <Circle size={12} />} 保存原始文件</span><span><Circle size={12} /> 等待整理任务</span></div>
          {stage === "added" && <button className="primary-button" onClick={onClose}>返回资料库</button>}
        </div>}
      </div>
    </div>
  );
}

function SearchPalette({ query, setQuery, onClose, onSelect }: { query: string; setQuery: (value: string) => void; onClose: () => void; onSelect: () => void }) {
  const filtered = useMemo(() => searchItems.filter((item) => `${item.title} ${item.type} ${item.source}`.toLowerCase().includes(query.toLowerCase())), [query]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { searchInputRef.current?.focus(); }, []);
  return (
    <div className="palette-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="search-palette" role="dialog" aria-modal="true" aria-label="搜索星坞">
        <div className="palette-input"><Search size={18} /><input ref={searchInputRef} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索所有课程…" /><kbd>ESC</kbd></div>
        <div className="palette-context"><span>正在搜索「概率论」</span><span>18 份资料 · 笔记 · 练习记录</span></div>
        <div className="search-results"><span className="result-count">课程上下文中找到 {filtered.length} 条结果</span>{filtered.map((item, index) => <button key={item.title} onClick={onSelect}><span className="result-icon"><FileText size={16} /></span><span><strong>{item.title}</strong><small>{item.type} · {item.source}</small></span><kbd>⌘{index + 1}</kbd></button>)}{filtered.length === 0 && <div className="no-results">没有找到与“{query}”匹配的关联资料。</div>}</div>
        <div className="palette-footer"><span><kbd>↑↓</kbd> 选择</span><span><kbd>↵</kbd> 打开</span><span>搜索正文，而不只是文件名</span></div>
      </div>
    </div>
  );
}

function HomePage({ onOpenCourse, planItems, onOpenPlan }: { onOpenCourse: (tab?: Tab) => void; planItems: PlanItem[]; onOpenPlan: () => void }) {
  const completedPlans = planItems.filter((item) => item.status === "已完成").length;
  const totalMinutes = planItems.reduce((total, item) => total + item.minutes, 0);

  return (
    <div className="standalone-page content-width">
      <div className="home-greeting"><div className="eyebrow">星期三 · 8月12日</div><h1>你的学期</h1><p>下午好，Lucian。专注两个小时，就能让每门课继续保持节奏。</p></div>
      <div className="semester-title"><h2>2026 秋季学期</h2><span>4 门课程</span></div>
      <div className="semester-courses">{courses.map((course) => <button key={course.name} onClick={() => onOpenCourse("Overview")}><span className="home-course-dot" style={{ background: course.color }} /><span className="home-course-name"><strong>{course.name}</strong><small>{course.next}</small></span><span className="home-progress"><span><i style={{ width: `${course.progress}%` }} /></span><small>{course.progress}%</small></span><span className="exam-date"><small>期末</small>{course.exam}</span><ChevronRight size={15} /></button>)}</div>
      <section className="home-today">
        <div className="section-heading home-plan-heading">
          <div><div className="eyebrow">今天 · 8月12日</div><h2>每日计划</h2></div>
          <div className="daily-plan-actions">
            <span>{completedPlans}/{planItems.length} 已完成 · {totalMinutes} 分钟</span>
            <button onClick={onOpenPlan}>打开每日计划 <ArrowRight size={13} /></button>
          </div>
        </div>
        <div className="daily-plan-progress" aria-label={`今日计划已完成 ${completedPlans} 项，共 ${planItems.length} 项`}><span style={{ width: `${planItems.length ? (completedPlans / planItems.length) * 100 : 0}%` }} /></div>
        <div className="mixed-tasks">
          {planItems.slice(0, 3).map((item) => (
            <button key={item.id} className={item.status === "已完成" ? "complete" : ""} onClick={onOpenPlan}>
              <span className="course-mini" style={{ background: item.color }}>{item.short}</span>
              <span><strong>{item.title}</strong><small>{item.course} · {item.minutes} 分钟</small></span>
              <ChevronRight size={15} />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function DailyPlanPage({ items, setItems, logs, setLogs, onOpenQuestionBook, onOpenRecitation }: { items: PlanItem[]; setItems: React.Dispatch<React.SetStateAction<PlanItem[]>>; logs: FocusLog[]; setLogs: React.Dispatch<React.SetStateAction<FocusLog[]>>; onOpenQuestionBook: (id: number) => void; onOpenRecitation: () => void }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [courseName, setCourseName] = useState(courses[0].name);
  const [minutes, setMinutes] = useState(25);
  const [view, setView] = useState<"plan" | "focus" | "summary">("plan");
  const [activeId, setActiveId] = useState<number | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [summaryNote, setSummaryNote] = useState("");
  const completed = items.filter((item) => item.status === "已完成").length;
  const totalMinutes = items.reduce((total, item) => total + item.minutes, 0);
  const actualMinutes = logs.reduce((total, log) => total + log.minutes, 0);
  const remainingMinutes = items.filter((item) => item.status !== "已完成" && item.status !== "已跳过").reduce((total, item) => total + item.minutes, 0);
  const activeItem = items.find((item) => item.id === activeId) ?? null;
  const nextItem = items.find((item) => item.status === "未开始" || item.status === "已暂停");
  const elapsedSeconds = 25 * 60 - remainingSeconds;
  const timerText = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;

  useEffect(() => {
    if (view !== "focus" || !running) return;
    const timer = window.setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          setRunning(false);
          setView("summary");
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [running, view]);

  const addItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = draft.trim();
    if (!title) return;
    const selectedCourse = courses.find((course) => course.name === courseName) ?? courses[0];
    setItems((current) => [...current, { id: Math.max(0, ...current.map((item) => item.id)) + 1, title, course: courseName, minutes, color: selectedCourse.color, short: courseName.slice(0, 1), status: "未开始", mode: "focus", source: "手动添加" }]);
    setDraft("");
    setComposerOpen(false);
  };

  const startTask = (item: PlanItem) => {
    if (item.mode === "practice") {
      setItems((current) => current.map((plan) => plan.id === item.id ? { ...plan, status: "专注中" } : plan));
      onOpenQuestionBook(item.targetId ?? 1);
      return;
    }
    if (item.mode === "recitation") {
      setItems((current) => current.map((plan) => plan.id === item.id ? { ...plan, status: "专注中" } : plan));
      onOpenRecitation();
      return;
    }
    setActiveId(item.id);
    setRemainingSeconds(25 * 60);
    setSummaryNote("");
    setRunning(true);
    setView("focus");
    setItems((current) => current.map((plan) => plan.id === item.id ? { ...plan, status: "专注中" } : plan));
  };

  const finishSummary = (result: "已完成" | "完成一部分" | "还需要继续" | "遇到困难") => {
    if (!activeItem) return;
    const spentMinutes = Math.max(1, Math.ceil(elapsedSeconds / 60));
    setItems((current) => current.map((item) => item.id === activeItem.id ? { ...item, status: result === "已完成" ? "已完成" : "已暂停" } : item));
    setLogs((current) => [{ id: Date.now(), taskId: activeItem.id, course: activeItem.course, title: activeItem.title, minutes: spentMinutes, result: summaryNote.trim() || result, time: `刚刚 · ${spentMinutes} 分钟` }, ...current]);
    setView("plan");
    setActiveId(null);
  };

  if (view === "focus" && activeItem) return <div className="daily-focus-page">
    <div className="focus-topline"><div><span>{activeItem.course}</span><strong>{activeItem.title}</strong></div><span>第 1 个专注段 · 25 分钟</span></div>
    <div className="focus-stage"><div className={`focus-timer ${running ? "running" : "paused"}`} style={{ "--focus-progress": `${(remainingSeconds / (25 * 60)) * 360}deg` } as CSSProperties}><div><strong>{timerText}</strong><span>{running ? "专注中" : "已暂停"}</span></div></div><div className="focus-goal"><span>本段目标</span><strong>{activeItem.title}</strong><small>预计任务总时长 {activeItem.minutes} 分钟 · 来源：{activeItem.source}</small></div><div className="focus-controls"><button onClick={() => { setRunning((value) => !value); setItems((current) => current.map((item) => item.id === activeItem.id ? { ...item, status: running ? "已暂停" : "专注中" } : item)); }}>{running ? <Pause size={15} /> : <Play size={15} />}{running ? "暂停" : "继续"}</button><button className="primary-button" onClick={() => { setRunning(false); setView("summary"); }}><Check size={15} /> 提前完成</button></div><button className="focus-abandon" onClick={() => { setRunning(false); setItems((current) => current.map((item) => item.id === activeItem.id ? { ...item, status: "已跳过" } : item)); setView("plan"); }}>放弃本次专注</button></div>
  </div>;

  if (view === "summary" && activeItem) return <div className="daily-focus-page focus-summary-page"><div className="focus-summary-mark"><Check size={23} /></div><div className="eyebrow">本次专注完成</div><h1>{Math.max(1, Math.ceil(elapsedSeconds / 60))} 分钟</h1><p>{activeItem.course} · {activeItem.title}</p><section><h2>这次学习完成得怎么样？</h2><div className="focus-result-options">{["已完成", "完成一部分", "还需要继续", "遇到困难"].map((result) => <button key={result} onClick={() => finishSummary(result as "已完成" | "完成一部分" | "还需要继续" | "遇到困难")}>{result}<ChevronRight size={13} /></button>)}</div><textarea value={summaryNote} onChange={(event) => setSummaryNote(event.target.value)} placeholder="可选：记录实际完成内容或遇到的问题……" /></section><button className="focus-summary-back" onClick={() => { setRemainingSeconds(25 * 60); setRunning(true); setView("focus"); }}>继续本次专注</button></div>;

  return <div className="standalone-page content-width daily-plan-page">
    <div className="daily-plan-hero"><div><div className="eyebrow">8月12日 · 星期三</div><h1>今天计划 {items.length} 项学习任务</h1><p>已完成 {completed} 项 · 已专注 {actualMinutes} 分钟 · 剩余约 {remainingMinutes} 分钟</p></div><div><button onClick={() => setComposerOpen((open) => !open)}><Plus size={14} /> 添加任务</button><button className="primary-button" disabled={!nextItem} onClick={() => nextItem && startTask(nextItem)}><Play size={14} /> 开始下一项</button></div></div>
    <div className="daily-time-progress"><span><i style={{ width: `${totalMinutes ? Math.min(100, (actualMinutes / totalMinutes) * 100) : 0}%` }} /></span><div><strong>已专注 {actualMinutes} 分钟</strong><small>计划 {totalMinutes} 分钟</small></div></div>
    {composerOpen && <form className="daily-plan-composer daily-plan-page-composer" onSubmit={addItem}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="准备完成什么？" aria-label="任务名称" /><select value={courseName} onChange={(event) => setCourseName(event.target.value)} aria-label="所属课程">{courses.map((course) => <option key={course.name}>{course.name}</option>)}</select><select value={minutes} onChange={(event) => setMinutes(Number(event.target.value))} aria-label="预计用时">{[15, 25, 40, 60].map((value) => <option key={value} value={value}>{value} 分钟</option>)}</select><button className="primary-button" type="submit">加入今天</button></form>}
    <section className="daily-execution-list"><div className="daily-plan-list-heading"><div><div className="eyebrow">今日安排</div><h2>从一项具体任务开始</h2></div><span>{items.filter((item) => item.status !== "已完成" && item.status !== "已跳过").length} 项待推进</span></div>{items.map((item) => { const action = item.mode === "practice" ? "开始练习" : item.mode === "recitation" ? "开始背诵" : item.status === "已暂停" ? "继续专注" : "开始专注"; return <article key={item.id} className={`daily-execution-item ${item.status}`}><span className="course-mini" style={{ background: item.color }}>{item.short}</span><div><span>{item.course}{item.deadline ? ` · ${item.deadline}` : ""}</span><h3>{item.title}</h3><small>预计 {item.minutes} 分钟 · 来源：{item.source}</small></div><span className="execution-status">{item.status}</span><button disabled={item.status === "已完成" || item.status === "已跳过"} onClick={() => startTask(item)}>{item.status === "已完成" ? <><Check size={13} /> 已完成</> : <>{item.mode === "focus" ? <Play size={13} /> : item.mode === "practice" ? <RotateCcw size={13} /> : <Brain size={13} />}{action}</>}</button></article>; })}</section>
    <section className="daily-review"><div className="daily-plan-list-heading"><div><div className="eyebrow">当日复盘</div><h2>今天真实完成了什么</h2></div><span>{logs.length} 条学习记录</span></div><div className="daily-log-list">{logs.map((log) => <div key={log.id}><span>{log.time}</span><i style={{ background: courses.find((course) => course.name === log.course)?.color ?? "#9a625c" }} /><span><strong>{log.course} · {log.title}</strong><small>{log.minutes} 分钟 · {log.result}</small></span></div>)}</div></section>
  </div>;
}

type RecitationStage = "source" | "generating" | "questions" | "settings" | "session" | "feedback" | "summary";

const recitationCourses = [
  { name: "马克思主义基本原理", teacher: "陈老师", color: "#9a625c", available: 8 },
  { name: "思想道德与法治", teacher: "刘老师", color: "#8a7457", available: 6 },
  { name: "中国近现代史纲要", teacher: "王老师", color: "#6f7e72", available: 11 },
  { name: "毛泽东思想和中国特色社会主义理论体系概论", teacher: "周老师", color: "#7c7186", available: 9 },
];

const recitationMaterials = [
  { id: 1, type: "课程主笔记", title: "马克思主义基本原理课程笔记", detail: "已发布 · 导论至第七章", updated: "今天更新", recommended: true },
  { id: 2, type: "课堂课件", title: "导论：马克思主义及其鲜明特征", detail: "第 01 讲 · 46 页", updated: "8月8日", recommended: true },
  { id: 3, type: "教材", title: "马克思主义基本原理（2023 年版）", detail: "导论 · 第 1–28 页", updated: "8月3日", recommended: false },
  { id: 4, type: "我的笔记", title: "导论课堂笔记与老师补充重点", detail: "12 个标注 · 6 页", updated: "8月10日", recommended: false },
];

const recitationQuestions = [
  { id: 1, chapter: "导论：马克思主义及其鲜明特征", title: "什么是马克思主义？", points: 7, minutes: 4, source: "课程笔记 · 导论 1.1", status: "未背", recommended: true },
  { id: 2, chapter: "导论：马克思主义及其鲜明特征", title: "马克思主义由哪些基本组成部分构成？", points: 3, minutes: 2, source: "课程笔记 · 导论 1.2", status: "未背", recommended: true },
  { id: 3, chapter: "导论：马克思主义及其鲜明特征", title: "如何理解马克思主义基本立场、基本观点和基本方法的统一？", points: 5, minutes: 4, source: "课程笔记 · 导论 1.3", status: "模糊", recommended: true },
  { id: 4, chapter: "导论：马克思主义及其鲜明特征", title: "马克思主义有哪些鲜明特征？", points: 5, minutes: 3, source: "教材 · 第 15–21 页", status: "已掌握", recommended: false },
  { id: 5, chapter: "世界的物质性及发展规律", title: "如何理解世界的物质统一性？", points: 4, minutes: 3, source: "复习提纲 · 第 6 题", status: "未背", recommended: false },
  { id: 6, chapter: "世界的物质性及发展规律", title: "物质与意识的辩证关系是什么？", points: 6, minutes: 4, source: "课堂课件 · 第 38 页", status: "模糊", recommended: true },
];

function RecitationAssistant() {
  const [stage, setStage] = useState<RecitationStage>("source");
  const [course, setCourse] = useState(recitationCourses[0].name);
  const [materialIds, setMaterialIds] = useState<number[]>([1, 2]);
  const [questionIds, setQuestionIds] = useState<number[]>([1, 2, 3]);
  const [order, setOrder] = useState("按章节顺序");
  const [answerMode, setAnswerMode] = useState("文字回答");
  const [standard, setStandard] = useState("关键点完整");
  const [answer, setAnswer] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [hintOpen, setHintOpen] = useState(false);
  const selectedQuestions = recitationQuestions.filter((question) => questionIds.includes(question.id));
  const currentQuestion = selectedQuestions[questionIndex] ?? selectedQuestions[0];
  const totalMinutes = selectedQuestions.reduce((total, question) => total + question.minutes, 0);

  const generateQuestions = () => {
    setStage("generating");
    window.setTimeout(() => setStage("questions"), 1150);
  };

  const startSession = () => {
    setQuestionIndex(0);
    setAnswer("");
    setHintOpen(false);
    setStage("session");
  };

  const nextQuestion = () => {
    if (questionIndex >= selectedQuestions.length - 1) {
      setStage("summary");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setAnswer("");
    setHintOpen(false);
    setStage("session");
  };

  return (
    <div className="recitation-page">
      <header className="recitation-hero">
        <div><div className="eyebrow">AI 学习工作流</div><h1>背诵辅助</h1><p>从课程资料生成背诵题，让 AI 一次问一个，并针对遗漏继续追问。</p></div>
        <div className="recitation-history"><span>最近一次</span><strong>马克思主义基本原理</strong><small>6 道题 · 关键点覆盖率 76%</small></div>
      </header>

      <div className="recitation-steps" aria-label="背诵流程">
        {[
          ["source", "01", "选择范围"],
          ["questions", "02", "选择题目"],
          ["settings", "03", "背诵设置"],
          ["session", "04", "开始背诵"],
        ].map(([key, number, label], index) => {
          const stages: RecitationStage[] = ["source", "questions", "settings", "session"];
          const activeIndex = stage === "generating" ? 0 : stage === "feedback" || stage === "summary" ? 3 : stages.indexOf(stage);
          return <span key={key} className={index <= activeIndex ? "active" : ""}><i>{index < activeIndex ? <Check size={11} /> : number}</i>{label}</span>;
        })}
      </div>

      {stage === "source" && (
        <div className="recitation-stage recitation-source-stage">
          <section>
            <div className="recitation-section-heading"><div><span>第一步</span><h2>选择课程</h2></div><p>先确定本次背诵属于哪门课。</p></div>
            <div className="recitation-course-grid">
              {recitationCourses.map((item) => <button key={item.name} className={course === item.name ? "selected" : ""} onClick={() => setCourse(item.name)}><i style={{ background: item.color }} /><span><strong>{item.name}</strong><small>{item.teacher} · {item.available} 份可用资料</small></span>{course === item.name && <CheckCircle2 size={17} />}</button>)}
            </div>
          </section>
          <section className="recitation-material-section">
            <div className="recitation-section-heading"><div><span>第二步</span><h2>选择资料范围</h2></div><p>AI 只会根据选中的课程资料生成题目和答案要点。</p></div>
            <div className="recitation-material-list">
              {recitationMaterials.map((material) => {
                const selected = materialIds.includes(material.id);
                return <button key={material.id} className={selected ? "selected" : ""} onClick={() => setMaterialIds((ids) => selected ? ids.filter((id) => id !== material.id) : [...ids, material.id])}><span className="material-check">{selected && <Check size={12} />}</span><span className="material-icon"><FileText size={16} /></span><span><strong>{material.title}</strong><small>{material.type} · {material.detail}</small></span>{material.recommended && <em><Sparkles size={11} /> 推荐</em>}<small>{material.updated}</small></button>;
              })}
            </div>
          </section>
          <div className="recitation-action-bar"><div><strong>{materialIds.length}</strong><span>份资料已选择</span><small>预计覆盖 3 个章节</small></div><button className="primary-button" disabled={!materialIds.length} onClick={generateQuestions}><Sparkles size={14} /> 生成背诵题</button></div>
        </div>
      )}

      {stage === "generating" && (
        <div className="recitation-stage recitation-generating">
          <div className="generation-orbit"><Brain size={27} /></div><div className="eyebrow">正在整理课程上下文</div><h2>从 {materialIds.length} 份资料中生成背诵题</h2><p>AI 正在识别章节结构、合并重复知识点，并把每道题关联到答案要点与原文出处。</p>
          <div className="generation-steps"><span className="done"><Check size={12} /> 识别章节结构</span><span className="done"><Check size={12} /> 提取可考知识点</span><span><span className="mini-spinner" /> 合并问题与关联出处</span></div>
        </div>
      )}

      {stage === "questions" && (
        <div className="recitation-stage">
          <div className="recitation-stage-title"><div><div className="eyebrow">马克思主义基本原理 · 已生成 6 道题</div><h2>选择本次要背的题目</h2><p>先审阅 AI 生成的题目，再决定今天背哪些。</p></div><div className="question-quick-actions"><button onClick={() => setQuestionIds(recitationQuestions.filter((question) => question.recommended).map((question) => question.id))}><Sparkles size={12} /> 选择 AI 推荐</button><button onClick={() => setQuestionIds(recitationQuestions.map((question) => question.id))}>全选</button><button onClick={() => setQuestionIds([])}>清空</button></div></div>
          {[...new Set(recitationQuestions.map((question) => question.chapter))].map((chapter) => (
            <section className="question-group" key={chapter}><div className="question-group-title"><div><span>章节</span><h3>{chapter}</h3></div><button onClick={() => { const chapterIds = recitationQuestions.filter((question) => question.chapter === chapter).map((question) => question.id); setQuestionIds((ids) => [...new Set([...ids, ...chapterIds])]); }}>全选本章</button></div>
              {recitationQuestions.filter((question) => question.chapter === chapter).map((question) => {
                const selected = questionIds.includes(question.id);
                return <button key={question.id} className={`generated-question ${selected ? "selected" : ""}`} onClick={() => setQuestionIds((ids) => selected ? ids.filter((id) => id !== question.id) : [...ids, question.id])}><span className="question-check">{selected && <Check size={12} />}</span><span><strong>{question.title}</strong><small>{question.source} · {question.points} 个关键点 · 约 {question.minutes} 分钟</small></span>{question.recommended && <em>AI 推荐</em>}<i className={`question-status ${question.status}`}>{question.status}</i></button>;
              })}
            </section>
          ))}
          <div className="recitation-action-bar sticky"><button className="text-button" onClick={() => setStage("source")}><ChevronRight size={13} /> 返回资料范围</button><div><strong>{questionIds.length}</strong><span>道题已选择</span><small>预计 {totalMinutes} 分钟</small></div><button className="primary-button" disabled={!questionIds.length} onClick={() => setStage("settings")}>设置并开始 <ArrowRight size={14} /></button></div>
        </div>
      )}

      {stage === "settings" && (
        <div className="recitation-stage recitation-settings-stage">
          <div className="recitation-stage-title"><div><div className="eyebrow">开始前的最后一步</div><h2>设置这轮背诵</h2><p>{questionIds.length} 道题，预计 {totalMinutes} 分钟。默认采用适合政治课的关键点检查。</p></div></div>
          <div className="recitation-setting-list">
            <SettingChoice icon={<ListChecks size={17} />} title="提问顺序" description="决定 AI 下一题问什么" options={["按章节顺序", "随机提问", "薄弱题优先"]} value={order} onChange={setOrder} />
            <SettingChoice icon={<Mic size={17} />} title="回答方式" description="展示原型不会调用真实语音识别" options={["文字回答", "口头自测"]} value={answerMode} onChange={setAnswerMode} />
            <SettingChoice icon={<SlidersHorizontal size={17} />} title="反馈标准" description="AI 如何判断回答是否完整" options={["覆盖主要意思", "关键点完整", "考试表述严格"]} value={standard} onChange={setStandard} />
          </div>
          <div className="recitation-action-bar"><button className="text-button" onClick={() => setStage("questions")}><ChevronRight size={13} /> 返回选择题目</button><div><strong>{questionIds.length}</strong><span>道题</span><small>{order} · {standard}</small></div><button className="primary-button" onClick={startSession}>开始背诵 <ArrowRight size={14} /></button></div>
        </div>
      )}

      {stage === "session" && currentQuestion && (
        <div className="recitation-stage recitation-session-stage">
          <div className="session-topline"><div><span>马克思主义基本原理</span><strong>{currentQuestion.chapter}</strong></div><div><span>第 {questionIndex + 1} / {selectedQuestions.length} 题</span><button onClick={() => setStage("summary")}>结束本轮</button></div></div>
          <div className="session-progress"><span style={{ width: `${((questionIndex + 1) / selectedQuestions.length) * 100}%` }} /></div>
          <div className="question-focus"><div className="eyebrow">AI 提问</div><h2>{currentQuestion.title}</h2><p>请尽量脱离资料，用自己的语言完整复述。提交后 AI 会按关键点检查，而不只判断字面是否一致。</p>
            {hintOpen && <div className="recitation-hint"><Sparkles size={14} /><div><strong>答题结构提示</strong><span>可以从总体定义、基本组成，以及基本立场、观点和方法的有机统一三个层次回答。</span></div></div>}
            {answerMode === "文字回答" ? <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="在这里写下你的回答……" aria-label="背诵回答" /> : <button className="voice-answer" onClick={() => setAnswer("马克思主义是由马克思和恩格斯创立并不断发展的科学理论体系……")}><Mic size={21} /><span>{answer ? "已完成一次模拟口述" : "点击开始口述"}</span><small>展示模式 · 不会调用麦克风</small></button>}
            <div className="session-actions"><button onClick={() => setHintOpen(true)}>给一点提示</button><button onClick={() => { setHintOpen(true); setAnswer(""); }}>暂时不会</button><button className="primary-button" disabled={!answer.trim()} onClick={() => setStage("feedback")}>提交回答</button></div>
          </div>
        </div>
      )}

      {stage === "feedback" && currentQuestion && (
        <div className="recitation-stage recitation-feedback-stage">
          <div className="feedback-heading"><div><div className="eyebrow">第 {questionIndex + 1} 题 · AI 答案诊断</div><h2>主干已经答出，还有两个关键点需要补全。</h2><p>你说明了创立者、科学理论体系和三个组成部分，但社会发展目标与内在统一关系还不完整。</p></div><div className="coverage-score"><strong>72</strong><span>%</span><small>关键点覆盖率</small></div></div>
          <div className="answer-diagnostic">
            <div className="diagnostic-row covered"><CheckCircle2 size={16} /><span><strong>创立与发展</strong><small>由马克思、恩格斯创立，并由后继者不断发展</small></span><em>已覆盖</em></div>
            <div className="diagnostic-row covered"><CheckCircle2 size={16} /><span><strong>基本组成</strong><small>马克思主义哲学、政治经济学和科学社会主义</small></span><em>已覆盖</em></div>
            <div className="diagnostic-row partial"><Circle size={16} /><span><strong>研究与发展规律</strong><small>需要补充自然、社会和人类思维发展的一般规律</small></span><em>不完整</em></div>
            <div className="diagnostic-row missing"><Circle size={16} /><span><strong>最终目标与内在统一</strong><small>未提及人的解放、全面发展，以及基本立场、观点和方法的有机统一</small></span><em>未提及</em></div>
          </div>
          <div className="follow-up-card"><div><Sparkles size={15} /><span>AI 针对遗漏追问</span></div><h3>马克思主义关于社会发展方向和人的最终目标，核心表述是什么？</h3><p>先在心里回答这一小问，再回到完整定义，会更容易形成稳定的答题结构。</p></div>
          <div className="recitation-action-bar"><button className="text-button" onClick={() => setStage("session")}><RotateCcw size={13} /> 再完整回答一次</button><div><strong>{questionIndex + 1}</strong><span>/ {selectedQuestions.length}</span><small>本题已完成诊断</small></div><button className="primary-button" onClick={nextQuestion}>{questionIndex === selectedQuestions.length - 1 ? "查看本轮总结" : "下一题"} <ArrowRight size={14} /></button></div>
        </div>
      )}

      {stage === "summary" && (
        <div className="recitation-stage recitation-summary-stage">
          <div className="summary-mark"><Check size={24} /></div><div className="eyebrow">本轮背诵完成</div><h2>你已经建立了第一轮答案结构。</h2><p>独立复述比直接查看答案更有效。下一轮优先补齐遗漏的目标表述和概念关系。</p>
          <div className="summary-stats"><div><strong>{Math.max(1, questionIndex)}</strong><span>独立完整</span></div><div><strong>1</strong><span>提示后完成</span></div><div><strong>1</strong><span>需要重背</span></div><div><strong>76%</strong><span>平均覆盖率</span></div></div>
          <section className="summary-review"><div><span>建议重背</span><h3>什么是马克思主义？</h3><p>重点补充“社会主义代替资本主义、最终实现共产主义”和“基本立场、观点、方法的有机统一”。</p></div><button onClick={() => { setQuestionIds([1]); setStage("settings"); }}>只重背这道题 <ArrowRight size={13} /></button></section>
          <div className="summary-actions"><button onClick={() => setStage("questions")}>返回题目列表</button><button onClick={() => alert("已加入明日计划：重背“什么是马克思主义？” · 10 分钟")}>加入明日计划</button><button className="primary-button" onClick={() => { setQuestionIndex(0); setStage("settings"); }}>再来一轮</button></div>
        </div>
      )}
    </div>
  );
}

function SettingChoice({ icon, title, description, options, value, onChange }: { icon: React.ReactNode; title: string; description: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <section className="recitation-setting"><div className="setting-intro"><span>{icon}</span><div><h3>{title}</h3><p>{description}</p></div></div><div className="setting-options">{options.map((option) => <button key={option} className={value === option ? "selected" : ""} onClick={() => onChange(option)}>{value === option && <Check size={12} />}{option}</button>)}</div></section>;
}

const questionBookItems = [
  { id: 1, course: "概率论", chapter: "条件期望 · 笔记 4.2", type: "证明题", title: "设 X、Y 为随机变量，证明 E[E(X|Y)] = E(X)。", source: "课程笔记 4.2 · 原题：作业 6 第 3 题", reason: "做错 2 次", status: "模糊", review: "今天复习", color: courses[0].color, kind: "math" },
  { id: 2, course: "马克思主义基本原理", chapter: "导论", type: "简答题", title: "什么是马克思主义？", source: "期末复习提纲 · 第 1 题", reason: "背诵遗漏", status: "需要重背", review: "今天复习", color: "#9a625c", kind: "recitation" },
  { id: 3, course: "机器学习", chapter: "优化方法", type: "计算题", title: "给定损失函数与初始点，完成两轮梯度下降并比较学习率的影响。", source: "实验 4 · 课后题", reason: "使用过提示", status: "未复习", review: "明天复习", color: courses[2].color, kind: "math" },
  { id: 4, course: "抽象代数", chapter: "商群", type: "证明题", title: "证明正规子群 N 的陪集集合 G/N 在自然运算下构成群。", source: "习题集 4 · 第 6 题", reason: "老师重点", status: "已掌握", review: "7 天后复习", color: courses[1].color, kind: "math" },
  { id: 5, course: "马克思主义基本原理", chapter: "导论", type: "背诵题", title: "马克思主义由哪些基本组成部分构成？", source: "导论课件 · 第 12 页", reason: "主动收藏", status: "已掌握", review: "5 天后复习", color: "#9a625c", kind: "recitation" },
];

function QuestionBookPage({ initialSelectedId, onRecitation, onAddPlan }: { initialSelectedId: number | null; onRecitation: () => void; onAddPlan: (item: Omit<PlanItem, "id" | "status">) => void }) {
  const [selectedId, setSelectedId] = useState<number | null>(initialSelectedId);
  const [courseFilter, setCourseFilter] = useState("全部课程");
  const [statusFilter, setStatusFilter] = useState("全部状态");
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [plannedId, setPlannedId] = useState<number | null>(null);
  const selected = questionBookItems.find((item) => item.id === selectedId) ?? null;
  const filtered = questionBookItems.filter((item) => (courseFilter === "全部课程" || item.course === courseFilter) && (statusFilter === "全部状态" || item.status === statusFilter));

  const openItem = (id: number) => { setSelectedId(id); setPracticeOpen(false); setPracticeAnswer(""); setAnswerRevealed(false); };
  const addToPlan = (item: typeof questionBookItems[number]) => {
    onAddPlan({ title: item.kind === "recitation" ? `重背：${item.title}` : `复习：${item.title}`, course: item.course, minutes: item.kind === "recitation" ? 15 : 25, color: item.color, short: item.course.slice(0, 1), mode: item.kind === "recitation" ? "recitation" : "practice", source: "我的题册", targetId: item.id });
    setPlannedId(item.id);
  };

  if (selected) return <div className="question-book-page question-detail-page">
    <button className="question-detail-back" onClick={() => setSelectedId(null)}><ChevronRight size={13} /> 返回我的题册</button>
    <header className="question-detail-header"><div><div className="eyebrow">{selected.course} · {selected.chapter}</div><h1>{selected.type}</h1><p>{selected.source} · 因“{selected.reason}”收录</p></div><div><span className={`book-status ${selected.status}`}>{selected.status}</span><small>{selected.review}</small></div></header>
    <article className="question-paper">
      <section className="question-stem"><span>题目</span><h2>{selected.title}</h2>{selected.kind === "math" && <p>请给出完整推导，并说明等式成立所使用的条件。</p>}</section>
      {selected.kind === "math" ? <>
        <section className="answer-section"><div className="paper-section-title"><span>我的上次答案</span><em>未完成</em></div><p>由条件期望的定义，可以把内层期望直接去掉，所以等式成立。</p><aside>问题记录：只写出了结论，没有说明利用塔式法则或可积性条件。</aside></section>
        <section className="answer-section"><div className="paper-section-title"><span>标准解答</span></div><ol><li>设 X 可积，则 E(X|Y) 存在且可积。</li><li>根据条件期望定义，对 σ(Y) 中的任意事件 A，有 ∫<sub>A</sub>E(X|Y)dP = ∫<sub>A</sub>XdP。</li><li>取 A = Ω，得到 E[E(X|Y)] = E(X)。</li></ol></section>
        <section className="answer-section ai-organized"><div className="paper-section-title"><span><Sparkles size={12} /> AI 整理</span></div><div className="solution-grid"><div><strong>看到什么</strong><p>外层期望作用在条件期望上。</p></div><div><strong>想到什么</strong><p>塔式法则；取定义中的事件 A = Ω。</p></div><div><strong>易错点</strong><p>不能只说“去掉条件”，需要交代 X 可积和定义依据。</p></div></div></section>
      </> : <>
        <section className="answer-section"><div className="paper-section-title"><span>答题骨架</span><em>7 个关键点</em></div><ol><li>马克思、恩格斯创立并由后继者不断发展的科学理论体系。</li><li>关于自然、社会和人类思维发展一般规律的学说。</li><li>关于社会主义代替资本主义、最终实现共产主义的学说。</li><li>三个基本组成部分，以及基本立场、观点和方法的有机统一。</li></ol></section>
        <section className="answer-section ai-organized"><div className="paper-section-title"><span><Sparkles size={12} /> 上次背诵诊断</span></div><div className="solution-grid"><div><strong>已覆盖</strong><p>创立者、科学理论体系和三个组成部分。</p></div><div><strong>仍需补充</strong><p>社会发展目标、人的全面发展和内在统一。</p></div><div><strong>记忆线索</strong><p>总括四句话 → 三个组成 → 立场观点方法。</p></div></div></section>
      </>}
      <section className="answer-section personal-note"><div className="paper-section-title"><span>我的笔记</span></div><p>{selected.kind === "math" ? "下次看到“条件期望外面再取期望”，先写塔式法则，再补可积条件。" : "不要只背三个组成部分，定义中的目标和方法统一也是老师反复强调的得分点。"}</p></section>
    </article>
    {practiceOpen && selected.kind === "math" && <section className="question-practice-panel"><div><div className="eyebrow">再做一次</div><h3>先独立完成，再对照整理后的解答。</h3></div><textarea value={practiceAnswer} onChange={(event) => setPracticeAnswer(event.target.value)} placeholder="写下你的证明过程……" />{answerRevealed && <p><CheckCircle2 size={14} /> 已显示上方标准解答。重点检查是否写出 X 可积、条件期望定义和 A = Ω。</p>}<button className="primary-button" disabled={!practiceAnswer.trim()} onClick={() => setAnswerRevealed(true)}>完成并对照答案</button></section>}
    <div className="question-detail-actions"><button onClick={() => addToPlan(selected)}>{plannedId === selected.id ? <Check size={13} /> : <Plus size={13} />}{plannedId === selected.id ? "已加入每日计划" : "加入每日计划"}</button>{selected.kind === "recitation" ? <button className="primary-button" onClick={onRecitation}><Brain size={14} /> 开始背诵</button> : <button className="primary-button" onClick={() => setPracticeOpen(true)}><RotateCcw size={14} /> 再做一次</button>}</div>
  </div>;

  return <div className="question-book-page">
    <header className="question-book-hero"><div><div className="eyebrow">个人长期题目资产</div><h1>我的题册</h1><p>把做过、错过和需要反复掌握的题，整理成自己的学习资料。</p></div><button className="primary-button" onClick={() => alert("添加题目入口已准备好，可粘贴题目或使用示例截图。") }><Plus size={14} /> 添加题目</button></header>
    <section className="question-book-stats"><div><strong>128</strong><span>共收录</span></div><div><strong>17</strong><span>需要复习</span></div><div><strong>12</strong><span>本周新增</span></div><div><strong>8</strong><span>今天到期</span></div></section>
    <div className="question-book-toolbar"><div className="question-book-tabs"><button className="active">全部题目</button><button onClick={() => setStatusFilter("模糊")}>需要复习</button><button onClick={() => setCourseFilter("马克思主义基本原理")}>背诵题</button></div><div><select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)}><option>全部课程</option>{[...new Set(questionBookItems.map((item) => item.course))].map((course) => <option key={course}>{course}</option>)}</select><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option>全部状态</option><option>未复习</option><option>模糊</option><option>需要重背</option><option>已掌握</option></select></div></div>
    <div className="question-book-list"><div className="question-book-list-heading"><span>{filtered.length} 道题</span><small>按最近需要复习排序</small></div>{filtered.map((item) => <button key={item.id} onClick={() => openItem(item.id)}><span className="question-course-line" style={{ background: item.color }} /><span className="question-list-main"><small>{item.course} · {item.chapter}</small><strong>{item.title}</strong><em>{item.type} · {item.source}</em></span><span className="question-list-meta"><em>{item.reason}</em><span className={`book-status ${item.status}`}>{item.status}</span><small>{item.review}</small></span><ChevronRight size={15} /></button>)}</div>
  </div>;
}

function AllResourcesPage({ resources, onCourse, onAdd }: { resources: Resource[]; onCourse: (tab?: Tab) => void; onAdd: () => void }) {
  return <div className="standalone-page content-width"><div className="page-intro row-intro"><div><div className="eyebrow">学期资料库</div><h1>全部资料</h1><p>统一保存各门课程的原始资料，并清楚区分入库、索引和整理状态。</p></div><button className="primary-button" onClick={onAdd}><Plus size={15} /> 添加资料</button></div><div className="global-resource-summary"><div><strong>72</strong><span>份课程原始资料</span></div><p>资料不会在上传后自动解析。Agent 只在明确的笔记或专题任务中读取并建立上下文。</p></div><div className="resource-list-header"><span>名称</span><span>添加时间</span><span>整理状态</span><span /></div><div className="resource-list">{resources.slice(0, 6).map((resource) => <ResourceRow key={resource.id} resource={resource} />)}</div><button className="inline-link" onClick={() => onCourse("Resources")}>打开「概率论」资料库 <ArrowRight size={14} /></button></div>;
}

function CalendarPage({ onCourse }: { onCourse: (tab?: Tab) => void }) {
  const days = [
    { weekday: "周一", date: "10" },
    { weekday: "周二", date: "11" },
    { weekday: "周三", date: "12", today: true },
    { weekday: "周四", date: "13" },
    { weekday: "周五", date: "14" },
    { weekday: "周六", date: "15" },
    { weekday: "周日", date: "16" },
  ];
  const hours = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
  const events = [
    { day: 0, row: 2, span: 1, title: "概率论 · 第 08 讲", time: "10:00–11:30", color: courses[0].color, bg: "#eef0f6", kind: "课程" },
    { day: 0, row: 5, span: 1, title: "宏观经济学阅读", time: "16:00–17:00", color: courses[3].color, bg: "#f7f3e8", kind: "阅读" },
    { day: 1, row: 3, span: 1, title: "复习商群章节", time: "12:30–13:30", color: courses[1].color, bg: "#f7eeea", kind: "自习" },
    { day: 2, row: 2, span: 1, title: "条件期望复习", time: "10:30–11:10", color: courses[0].color, bg: "#eef0f6", kind: "AI 推荐", recommended: true },
    { day: 2, row: 5, span: 1, title: "作业 8 截止", time: "17:00", color: courses[0].color, bg: "#e8ebf3", kind: "截止", deadline: true },
    { day: 3, row: 4, span: 2, title: "机器学习实验 5", time: "14:00–17:30", color: courses[2].color, bg: "#edf3f0", kind: "实验" },
    { day: 3, row: 8, span: 1, title: "实验报告截止", time: "23:59", color: courses[2].color, bg: "#e7f0eb", kind: "截止", deadline: true },
    { day: 4, row: 4, span: 1, title: "抽象代数习题集", time: "15:00 截止", color: courses[1].color, bg: "#f4e9e5", kind: "截止", deadline: true },
    { day: 5, row: 3, span: 2, title: "本周错题回顾", time: "12:00–14:00", color: courses[0].color, bg: "#f2f3f7", kind: "复习", recommended: true },
    { day: 6, row: 6, span: 1, title: "下周计划整理", time: "18:30–19:00", color: "#777771", bg: "#f1f1ee", kind: "计划" },
  ];
  const todayTasks = [
    { title: "完成概率论作业 8", meta: "今天 17:00 截止", color: courses[0].color, done: false },
    { title: "复习条件期望", meta: "10 分钟 · AI 推荐", color: courses[0].color, done: true },
    { title: "准备机器学习实验", meta: "20 分钟 · 为明天准备", color: courses[2].color, done: false },
  ];
  const milestones = [
    { date: "8月14日", title: "抽象代数 · 习题集 4", note: "本周", color: courses[1].color },
    { date: "8月21日", title: "机器学习 · 实验 6", note: "还有 9 天", color: courses[2].color },
    { date: "9月5日", title: "概率论 · 期末考试", note: "还有 24 天", color: courses[0].color, exam: true },
    { date: "9月12日", title: "抽象代数 · 期末考试", note: "还有 31 天", color: courses[1].color },
  ];

  return (
    <div className="standalone-page content-width calendar-page">
      <header className="calendar-header">
        <div className="page-intro calendar-intro">
          <div className="eyebrow">2026 秋季学期</div>
          <h1>日历</h1>
          <p>把课程、截止日期与学习动作安排在同一个节奏里。</p>
        </div>
        <div className="calendar-toolbar" aria-label="日历视图控制">
          <button className="calendar-today-button">今天</button>
          <button className="calendar-nav-button calendar-nav-prev" aria-label="上一周"><ChevronRight size={14} /></button>
          <button className="calendar-nav-button" aria-label="下一周"><ChevronRight size={14} /></button>
          <span className="calendar-range">8月10日—8月16日</span>
          <div className="calendar-view-switch" aria-label="日历视图"><button className="active">周</button><button>月</button></div>
        </div>
      </header>

      <section className="calendar-stats" aria-label="本周学习概况">
        <div><span>本周截止</span><strong>6</strong><small>项任务</small></div>
        <div><span>已规划</span><strong>8.5</strong><small>小时</small></div>
        <div className="has-warning"><span>时间冲突</span><strong>1</strong><small>处待调整</small></div>
        <div><span>最近考试</span><strong>24</strong><small>天后</small></div>
      </section>

      <div className="calendar-workspace">
        <section className="week-board">
          <div className="week-board-heading">
            <div><div className="eyebrow">本周安排</div><h2>8月10日—16日</h2></div>
            <div className="calendar-legend"><span><i className="legend-course" />课程与任务</span><span><i className="legend-ai" />AI 推荐</span><span><i className="legend-deadline" />截止事项</span></div>
          </div>
          <div className="week-grid">
            <div className="week-corner">GMT+8</div>
            {days.map((day) => <div key={day.date} className={`week-day ${day.today ? "today" : ""}`}><span>{day.weekday}</span><strong>{day.date}</strong>{day.today && <i>今天</i>}</div>)}
            <div className="week-columns" />
            <div className="today-column" />
            {hours.map((hour, index) => <div key={hour} className="week-hour" style={{ gridRow: index + 2 }}>{hour}</div>)}
            {hours.map((hour, index) => <div key={`line-${hour}`} className="week-line" style={{ gridRow: index + 2 }} />)}
            <div className="current-time-line" aria-label="当前时间 下午 2 点 20 分"><span>14:20</span></div>
            {events.map((event) => (
              <button
                key={`${event.day}-${event.title}`}
                className={`calendar-event ${event.recommended ? "recommended" : ""} ${event.deadline ? "deadline" : ""}`}
                style={{ gridColumn: event.day + 2, gridRow: `${event.row + 1} / span ${event.span}`, "--event-color": event.color, "--event-bg": event.bg } as CSSProperties}
                onClick={event.day === 2 ? () => onCourse(event.deadline ? "Overview" : "Notes") : undefined}
              >
                <span>{event.kind}</span><strong>{event.title}</strong><small>{event.time}</small>
              </button>
            ))}
          </div>
        </section>

        <aside className="today-panel">
          <div className="today-panel-heading"><div><div className="eyebrow">今天 · 周三</div><h2>8月12日</h2></div><span>3 项重点</span></div>
          <div className="today-focus-label"><span>今日重点</span><small>57 分钟</small></div>
          <div className="today-focus-list">
            {todayTasks.map((task) => <button key={task.title} className={task.done ? "done" : ""}><span className="today-check" style={{ borderColor: task.color, background: task.done ? task.color : "transparent" }}>{task.done && <Check size={11} />}</span><span><strong>{task.title}</strong><small>{task.meta}</small></span><ChevronRight size={13} /></button>)}
          </div>
          <div className="today-progress"><div><span>今日学习进度</span><strong>1 / 3</strong></div><span><i /></span></div>
          <div className="calendar-ai-note"><div><Sparkles size={14} /><span>AI 排期建议</span></div><p>下午 5 点前优先完成概率论作业。条件期望复习已放在上午，避免与实验准备冲突。</p><button onClick={() => onCourse("Overview")}>查看调整后的计划 <ArrowRight size={13} /></button></div>
          <div className="calendar-conflict"><Clock3 size={14} /><div><strong>发现 1 处时间重叠</strong><small>周四实验与报告整理时间较紧</small></div></div>
        </aside>
      </div>

      <section className="semester-milestones">
        <div className="section-heading"><div><div className="eyebrow">学期节奏</div><h2>未来重要节点</h2></div><span>接下来 31 天</span></div>
        <div className="milestone-track">
          {milestones.map((item) => <button key={item.date + item.title} onClick={item.exam ? () => onCourse("Exam") : undefined} style={{ "--milestone-color": item.color } as CSSProperties}><i /><span>{item.date}</span><strong>{item.title}</strong><small>{item.note}</small>{item.exam && <ChevronRight size={13} />}</button>)}
        </div>
      </section>
    </div>
  );
}
