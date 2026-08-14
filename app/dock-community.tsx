"use client";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  FileText,
  GitFork,
  GraduationCap,
  Layers3,
  Library,
  LockKeyhole,
  Search,
  ShieldCheck,
  Star,
  Upload,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

export type CourseDock = {
  id: string;
  title: string;
  school: string;
  professor: string;
  semester: string;
  category: string;
  description: string;
  creator: {
    name: string;
    school: string;
    major: string;
    grade: string;
    schoolVerified: boolean;
    credential: string;
  };
  visibility: "公开" | "校内" | "私密链接";
  version: string;
  resources: number;
  noteChapters: number;
  pastExams: number;
  typicalProblems: number;
  forkCount: number;
  rating: number;
  updatedAt: string;
  accent: string;
  coverage: Array<{ label: string; value: string; note: string }>;
  noteOutline: string[];
  exams: string[];
  changelog: Array<{ version: string; date: string; changes: string[] }>;
  reviews: Array<{ quote: string; meta: string }>;
};

export type UserDock = {
  sourceDockId: string;
  semester: string;
  name: string;
  connected: boolean;
  sharedVersion: string;
};

export const dockCatalog: CourseDock[] = [
  {
    id: "pku-probability-2026",
    title: "概率论",
    school: "北京大学",
    professor: "张老师",
    semester: "2026 春季",
    category: "数学",
    description: "覆盖全部课堂课件、三年往年题和带出处的课程主笔记。",
    creator: { name: "匿名贡献者", school: "北京大学数学科学学院", major: "数学", grade: "2025 级", schoolVerified: true, credential: "期末成绩 96 · 已验证" },
    visibility: "校内",
    version: "v1.8",
    resources: 24,
    noteChapters: 7,
    pastExams: 5,
    typicalProblems: 18,
    forkCount: 1247,
    rating: 4.8,
    updatedAt: "3 天前",
    accent: "#6076a8",
    coverage: [
      { label: "教师课件", value: "12 / 12", note: "第 01–12 讲完整" },
      { label: "课程作业", value: "8 / 8", note: "含题目索引与截止日期" },
      { label: "往年试卷", value: "2023 · 2024 · 2025", note: "5 套试卷，3 套含解析" },
      { label: "指定教材", value: "第 1–7 章", note: "章节与课件已对照" },
      { label: "学生笔记", value: "3 位贡献者", note: "所有引用可追溯" },
    ],
    noteOutline: ["01 概率空间", "02 条件概率", "03 随机变量", "04 条件期望", "05 大数定律与中心极限定理", "06 特征函数", "07 期末复习索引"],
    exams: ["2023 期末试卷", "2024 期末试卷", "2025 期中与期末试卷"],
    changelog: [
      { version: "v1.8", date: "8月12日", changes: ["加入 2026 期中试卷", "更新第 4 章条件期望", "补充 3 道典型证明题"] },
      { version: "v1.7", date: "8月6日", changes: ["加入作业 8", "修正教材第 5.2 节引用"] },
    ],
    reviews: [
      { quote: "往年题整理得很完整，每道题都能回到对应章节。", meta: "用于期末复习 · 42 人认同" },
      { quote: "老师今年换教材了，第 6 章部分仍需要更新。", meta: "来源准确 · 维护者已回复" },
    ],
  },
  {
    id: "pku-algebra-2026",
    title: "抽象代数",
    school: "北京大学",
    professor: "李老师",
    semester: "2026 春季",
    category: "数学",
    description: "从群论到域扩张的课程主笔记，包含习题课板书和证明题索引。",
    creator: { name: "2024 数院课程组", school: "北京大学数学科学学院", major: "数学", grade: "2024 级", schoolVerified: true, credential: "校内身份已验证" },
    visibility: "校内",
    version: "v2.1",
    resources: 31,
    noteChapters: 9,
    pastExams: 4,
    typicalProblems: 26,
    forkCount: 864,
    rating: 4.7,
    updatedAt: "昨天",
    accent: "#a76f5b",
    coverage: [{ label: "教师课件", value: "10 / 10", note: "完整" }, { label: "习题课", value: "8 / 9", note: "缺第 6 次" }],
    noteOutline: ["01 群与子群", "02 同态", "03 商群", "04 群作用"],
    exams: ["2024 期末", "2025 期末"],
    changelog: [{ version: "v2.1", date: "8月13日", changes: ["更新商群证明索引"] }],
    reviews: [{ quote: "证明题的前置结论标得很清楚。", meta: "组织清晰" }],
  },
  {
    id: "cet6-648",
    title: "CET-6 高分备考",
    school: "跨校课程",
    professor: "北大英语系共建",
    semester: "2026 夏季",
    category: "语言",
    description: "完整听力、阅读与写作备考资料，按真实题型和复盘动作组织。",
    creator: { name: "北大英语系学习小组", school: "北京大学", major: "英语", grade: "跨年级", schoolVerified: true, credential: "CET-6 648 · 已验证" },
    visibility: "公开",
    version: "v3.4",
    resources: 42,
    noteChapters: 6,
    pastExams: 12,
    typicalProblems: 80,
    forkCount: 2840,
    rating: 4.9,
    updatedAt: "5 天前",
    accent: "#638374",
    coverage: [{ label: "听力真题", value: "12 套", note: "2023–2026" }, { label: "写作模板", value: "18 组", note: "按题型整理" }],
    noteOutline: ["听力场景", "长篇阅读", "翻译", "写作"],
    exams: ["2023–2026 六级真题"],
    changelog: [{ version: "v3.4", date: "8月9日", changes: ["加入 2026 年 6 月真题"] }],
    reviews: [{ quote: "不是模板堆砌，复盘方法很实用。", meta: "适合备考" }],
  },
  {
    id: "kaoyan-math-one",
    title: "考研数学一",
    school: "跨校课程",
    professor: "联合维护",
    semester: "2027 备考",
    category: "考试",
    description: "高数、线代和概率论的历年题索引与专题复习路径。",
    creator: { name: "匿名联合维护者", school: "多校共建", major: "理工科", grade: "已毕业", schoolVerified: false, credential: "成绩 138 · 自述" },
    visibility: "公开",
    version: "v1.5",
    resources: 56,
    noteChapters: 14,
    pastExams: 10,
    typicalProblems: 120,
    forkCount: 1960,
    rating: 4.6,
    updatedAt: "1 周前",
    accent: "#aa8a4f",
    coverage: [{ label: "历年真题", value: "2016–2026", note: "按专题关联" }],
    noteOutline: ["高等数学", "线性代数", "概率论"],
    exams: ["2016–2026 数学一真题"],
    changelog: [{ version: "v1.5", date: "8月7日", changes: ["重排线代章节"] }],
    reviews: [{ quote: "题目出处和知识点关系做得很好。", meta: "来源准确" }],
  },
];

const formatCount = (count: number) => count >= 1000 ? `${(count / 1000).toFixed(1)}k` : String(count);

export function DockListRow({ dock, onView, onFork, compact = false }: { dock: CourseDock; onView: () => void; onFork?: () => void; compact?: boolean }) {
  return (
    <article className={`dock-list-row ${compact ? "compact" : ""}`}>
      <span className="dock-color" style={{ background: dock.accent }} />
      <div className="dock-list-main">
        <span>{dock.school} · {dock.semester}</span>
        <h3>{dock.title}</h3>
        <p>{dock.professor} · {dock.description}</p>
      </div>
      <div className="dock-creator-brief">
        <span>维护者</span>
        <strong>{dock.creator.name}</strong>
        <small>{dock.creator.credential}</small>
      </div>
      <div className="dock-evidence">
        <span><strong>{dock.resources}</strong> 份资料</span>
        <span><strong>{dock.noteChapters}</strong> 章主笔记</span>
        <span><strong>{dock.pastExams}</strong> 套往年题</span>
      </div>
      <div className="dock-usage"><strong>{formatCount(dock.forkCount)}</strong><span>次 Fork</span><small>{dock.updatedAt}更新</small></div>
      <div className="dock-row-actions">
        {onFork && <button onClick={onFork}><GitFork size={12} /> Fork</button>}
        <button className="primary-button" onClick={onView}>查看课程舱 <ArrowRight size={13} /></button>
      </div>
    </article>
  );
}

export function ExploreDocksPage({ onViewDock, onForkDock }: { onViewDock: (dock: CourseDock) => void; onForkDock: (dock: CourseDock) => void }) {
  const [query, setQuery] = useState("");
  const [section, setSection] = useState("热门");
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return dockCatalog;
    return dockCatalog.filter((dock) => `${dock.title} ${dock.school} ${dock.professor} ${dock.creator.name} ${dock.category}`.toLowerCase().includes(normalized));
  }, [query]);

  return (
    <div className="standalone-page explore-page">
      <header className="explore-hero">
        <div><div className="eyebrow">公共课程知识库</div><h1>发现课程舱</h1><p>找到已经被认真整理和持续维护的课程舱，再把它变成自己的学习空间。</p></div>
        <div className="explore-principle"><Layers3 size={17} /><span><strong>共享知识</strong><small>Fork 后，个人学习记录仍只属于你</small></span></div>
      </header>
      <div className="explore-search"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索学校、课程或教师…" aria-label="搜索公共课程舱" /><kbd>⌘K</kbd></div>
      <div className="dock-filter-line">
        <div>{["热门", "我的学校", "期末季", "跨校课程"].map((item) => <button key={item} className={section === item ? "active" : ""} onClick={() => setSection(item)}>{item}</button>)}</div>
        <div>{["学校", "课程", "教师", "学期", "类别"].map((item) => <button key={item}>{item}<ChevronRight size={11} /></button>)}</div>
      </div>
      <section className="dock-directory">
        <div className="directory-heading"><div><div className="eyebrow">{query ? "搜索结果" : section}</div><h2>{query ? `与“${query}”相关的课程舱` : section === "我的学校" ? "来自北京大学" : "值得从这里开始"}</h2></div><span>{filtered.length} 个课程舱</span></div>
        <div className="dock-list">{filtered.map((dock) => <DockListRow key={dock.id} dock={dock} onView={() => onViewDock(dock)} onFork={() => onForkDock(dock)} />)}</div>
        {!filtered.length && <div className="dock-empty"><Search size={20} /><h3>还没有匹配的课程舱</h3><p>换一个课程名，或创建一个新的课程舱。</p><button>创建新课程舱</button></div>}
      </section>
      <footer className="create-dock-foot"><span>没有找到合适的课程舱？</span><button>创建一个新的课程舱 <ArrowRight size={12} /></button></footer>
    </div>
  );
}

export function PublicDockDetailPage({ dock, saved, onBack, onFork, onToggleSave }: { dock: CourseDock; saved: boolean; onBack: () => void; onFork: () => void; onToggleSave: () => void }) {
  return (
    <div className="standalone-page public-dock-page">
      <button className="back-link" onClick={onBack}><ArrowLeft size={13} /> 返回发现</button>
      <header className="public-dock-header">
        <div className="public-dock-title"><span className="dock-visibility"><Library size={12} /> {dock.visibility}课程舱</span><h1>{dock.title}</h1><p>{dock.school} · {dock.semester} · {dock.professor}</p><div className="dock-version-line"><span>当前版本 {dock.version}</span><span>更新于{dock.updatedAt}</span><span>{formatCount(dock.forkCount)} 次 Fork</span></div></div>
        <div className="public-dock-actions"><button className={saved ? "saved" : ""} onClick={onToggleSave}><Star size={14} fill={saved ? "currentColor" : "none"} />{saved ? "已收藏" : "收藏"}</button><button className="fork-primary" onClick={onFork}><GitFork size={15} /> Fork 这个课程舱</button></div>
      </header>

      <div className="public-dock-grid">
        <main>
          <section className="dock-overview-strip">
            <div><strong>{dock.resources}</strong><span>课程资料</span></div><div><strong>{dock.noteChapters}</strong><span>主笔记章节</span></div><div><strong>{dock.pastExams}</strong><span>往年试卷</span></div><div><strong>{dock.typicalProblems}</strong><span>精选题目</span></div>
          </section>

          <section className="dock-detail-section">
            <div className="detail-section-heading"><div><div className="eyebrow">你将获得</div><h2>真实课程内容</h2></div><span>基于 {dock.version}</span></div>
            <div className="dock-content-index">
              <article><span className="content-index-icon"><BookOpen size={17} /></span><div><small>课程主笔记</small><h3>{dock.noteChapters} 个已发布章节</h3>{dock.noteOutline.map((item) => <p key={item}>{item}</p>)}</div></article>
              <article><span className="content-index-icon"><FileText size={17} /></span><div><small>往年试卷</small><h3>{dock.pastExams} 套可追溯试卷</h3>{dock.exams.map((item) => <p key={item}>{item}</p>)}<p>精选题型 · {dock.typicalProblems} 道</p></div></article>
            </div>
          </section>

          <section className="dock-detail-section">
            <div className="detail-section-heading"><div><div className="eyebrow">资料覆盖</div><h2>为什么值得使用</h2></div><span>不使用虚构质量分</span></div>
            <div className="coverage-table">{dock.coverage.map((item) => <div key={item.label}><strong>{item.label}</strong><span>{item.value}</span><small>{item.note}</small><CheckCircle2 size={14} /></div>)}</div>
          </section>

          <section className="dock-detail-section">
            <div className="detail-section-heading"><div><div className="eyebrow">版本记录</div><h2>持续维护，而不是静态 PDF</h2></div><span>{dock.version}</span></div>
            <div className="changelog-list">{dock.changelog.map((item) => <article key={item.version}><span><strong>{item.version}</strong><small>{item.date}</small></span><ul>{item.changes.map((change) => <li key={change}>{change}</li>)}</ul></article>)}</div>
          </section>

          <section className="dock-detail-section dock-reviews">
            <div className="detail-section-heading"><div><div className="eyebrow">使用评价</div><h2>帮助你判断是否适合</h2></div><span>{dock.rating} / 5</span></div>
            <div>{dock.reviews.map((review) => <blockquote key={review.quote}><p>“{review.quote}”</p><footer>{review.meta}</footer></blockquote>)}</div>
          </section>
        </main>

        <aside className="dock-trust-panel">
          <div className="creator-mark"><UserRound size={18} /></div><div className="eyebrow">课程舱维护者</div><h3>{dock.creator.name}</h3><p>{dock.creator.school}<br />{dock.creator.major} · {dock.creator.grade}</p>
          <div className="creator-proof">{dock.creator.schoolVerified ? <ShieldCheck size={15} /> : <GraduationCap size={15} />}<span><strong>{dock.creator.schoolVerified ? "学校身份已验证" : "身份未验证"}</strong><small>{dock.creator.credential}</small></span></div>
          <div className="quality-signals"><span>最近更新<strong>{dock.updatedAt}</strong></span><span>社区使用<strong>{formatCount(dock.forkCount)} 次 Fork</strong></span><span>用户评价<strong>{dock.rating} / 5</strong></span></div>
          <button className="fork-primary" onClick={onFork}><GitFork size={15} /> Fork 这个课程舱</button><small className="privacy-note">Fork 后，错题、计划和 Agent 对话不会进入公共层。</small>
        </aside>
      </div>
    </div>
  );
}

export function ForkDockModal({ dock, onClose, onForked, onOpenDock }: { dock: CourseDock; onClose: () => void; onForked: (userDock: UserDock) => void; onOpenDock: () => void }) {
  const [stage, setStage] = useState<"form" | "creating" | "ready">("form");
  const [name, setName] = useState(dock.title);
  const [semester, setSemester] = useState("2026 秋季");
  const [connected, setConnected] = useState(true);
  const [step, setStep] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);
  const createFork = () => {
    setStage("creating"); setStep(0);
    timers.current.push(window.setTimeout(() => setStep(1), 260));
    timers.current.push(window.setTimeout(() => setStep(2), 560));
    timers.current.push(window.setTimeout(() => {
      const userDock = { sourceDockId: dock.id, semester, name, connected, sharedVersion: dock.version };
      onForked(userDock); setStage("ready");
    }, 880));
  };
  const labels = ["复制共享课程结构", "连接课程资料来源", "准备课程 Agent"];
  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && stage === "form") onClose(); }}>
      <div className="fork-modal" role="dialog" aria-modal="true" aria-labelledby="fork-title">
        {stage === "form" && <>
          <header><div><div className="eyebrow">建立私人学习层</div><h2 id="fork-title">Fork {dock.title}</h2><p>共享课程资产保持连接，你的学习记录从这里开始独立积累。</p></div><button onClick={onClose} aria-label="关闭 Fork 对话框"><X size={17} /></button></header>
          <div className="fork-source-summary"><span className="dock-color" style={{ background: dock.accent }} /><span><strong>{dock.school} · {dock.title}</strong><small>{dock.semester} · {dock.version} · {dock.resources} 份共享资料</small></span></div>
          <div className="fork-fields"><label>加入学期<select value={semester} onChange={(event) => setSemester(event.target.value)}><option>2026 秋季</option><option>2027 春季</option></select></label><label>课程舱名称<input value={name} onChange={(event) => setName(event.target.value)} /></label></div>
          <button className={`connection-option ${connected ? "selected" : ""}`} onClick={() => setConnected((value) => !value)}><span className="material-check">{connected && <Check size={12} />}</span><span><strong>保持与原课程舱更新连接</strong><small>原课程舱发布新版时，由你决定是否应用；不会覆盖私人内容。</small></span></button>
          <footer><span><LockKeyhole size={12} /> 个人题册、学习记录和 Agent 对话默认私密</span><button className="fork-primary" disabled={!name.trim()} onClick={createFork}><GitFork size={14} /> Fork</button></footer>
        </>}
        {stage === "creating" && <div className="fork-processing"><span className="fork-orbit"><GitFork size={22} /></span><div className="eyebrow">正在创建你的课程舱</div><h2>Lucian 的 {name}</h2><div>{labels.map((label, index) => <span key={label} className={index < step ? "done" : index === step ? "current" : ""}>{index < step ? <Check size={12} /> : <i />}{label}</span>)}</div></div>}
        {stage === "ready" && <div className="fork-ready"><span><Check size={24} /></span><div className="eyebrow">Fork 完成</div><h2>你的课程舱已准备好。</h2><p>共享知识来自 {dock.school} · {dock.title} {dock.version}；私人学习层只属于 Lucian。</p><div><strong>共享课程层</strong><ArrowRight size={13} /><strong>Lucian 的私人学习层</strong></div><button className="fork-primary" onClick={onOpenDock}>打开我的课程舱 <ArrowRight size={14} /></button></div>}
      </div>
    </div>
  );
}

export function MyDocksPage({ userDock, onOpenCourse, onExplore }: { userDock: UserDock | null; onOpenCourse: () => void; onExplore: () => void }) {
  return <div className="standalone-page my-docks-page"><header><div><div className="eyebrow">我的学习空间</div><h1>我的课程舱</h1><p>你创建或 Fork 的课程舱，以及各自独立的私人学习层。</p></div><button className="primary-button" onClick={onExplore}><Search size={14} /> 发现课程舱</button></header><section className="my-dock-list"><button onClick={onOpenCourse}><span className="dock-color" style={{ background: "#6076a8" }} /><span><small>{userDock ? "Fork 自北京大学 · 共享层 v1.8" : "个人创建 · 2026 秋季"}</small><strong>概率论</strong><em>继续阅读主笔记 4.2 · 2 项今日任务</em></span><span><strong>14/18</strong><small>资料已整理</small></span><ChevronRight size={15} /></button>{["抽象代数", "机器学习", "宏观经济学"].map((course, index) => <button key={course}><span className="dock-color" style={{ background: ["#a76f5b", "#638374", "#aa8a4f"][index] }} /><span><small>个人创建 · 2026 秋季</small><strong>{course}</strong><em>私人学习层已建立</em></span><span><strong>{["9/12", "11/16", "8/13"][index]}</strong><small>资料已整理</small></span><ChevronRight size={15} /></button>)}</section><footer><span>没有找到合适的公共课程舱？</span><button>创建一个新的课程舱</button></footer></div>;
}

export function ContributionsPage({ published, onPublish }: { published: boolean; onPublish: () => void }) {
  return <div className="standalone-page contributions-page"><header><div><div className="eyebrow">贡献者工作台</div><h1>我的贡献</h1><p>只发布你明确选择的课程资产；私人学习记录不会默认进入公共层。</p></div><button className="primary-button" onClick={onPublish}><Upload size={14} /> 发布课程舱</button></header><section className="contribution-summary"><div><span>产生的 Fork</span><strong>{published ? 326 : 318}</strong><small>来自 2 个公开课程舱</small></div><div><span>收藏</span><strong>82</strong><small>过去 30 天 +14</small></div><div><span>资料贡献</span><strong>15</strong><small>12 份资料 · 3 篇笔记</small></div></section><section className="contribution-section"><div className="directory-heading"><div><div className="eyebrow">已发布</div><h2>你的公共课程舱</h2></div><span>{published ? "2 个" : "1 个"}</span></div><article className="published-dock"><span className="dock-color" style={{ background: "#6076a8" }} /><div><small>北京大学 · 2026 春季</small><h3>概率论</h3><p>{published ? "刚刚发布更新 · 课程笔记补充与精选题" : "12 份资料已贡献 · v1.8"}</p></div><div><strong>{published ? 326 : 318}</strong><span>次 Fork</span></div><button>查看课程舱 <ArrowRight size={12} /></button></article></section><section className="contribution-section"><div className="directory-heading"><div><div className="eyebrow">草稿</div><h2>尚未发布</h2></div><span>1 个</span></div><article className="draft-dock-row"><div><strong>抽象代数 · 课程笔记补充</strong><small>3 篇笔记已选择 · 需要确认资料权限</small></div><button onClick={onPublish}>继续发布</button></article></section><section className="contribution-section"><div className="directory-heading"><div><div className="eyebrow">历史</div><h2>最近贡献记录</h2></div></div><div className="contribution-history">{["更新概率论第 4 章来源索引", "加入 2025 期末试卷解析", "修正抽象代数商群笔记引用"].map((item, index) => <div key={item}><span>{["8月12日", "8月9日", "8月4日"][index]}</span><strong>{item}</strong><small>{index === 2 ? "草稿" : "已发布"}</small></div>)}</div></section></div>;
}

export function PublishDockModal({ onClose, onPublished }: { onClose: () => void; onPublished: () => void }) {
  const [selected, setSelected] = useState(["课程笔记补充", "精选典型题", "课程资料索引"]);
  const [visibility, setVisibility] = useState("校内可见");
  const [stage, setStage] = useState<"form" | "publishing" | "done">("form");
  const timer = useRef<number | null>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  const allowed = ["课程笔记补充", "精选典型题", "课程资料索引"];
  const privateItems = ["个人题册记录", "Course Agent 对话", "每日计划与学习时间"];
  const publish = () => { setStage("publishing"); timer.current = window.setTimeout(() => { onPublished(); setStage("done"); }, 900); };
  return <div className="modal-backdrop" role="presentation"><div className="publish-modal" role="dialog" aria-modal="true" aria-labelledby="publish-title">{stage === "form" && <><header><div><div className="eyebrow">从私人层贡献到共享层</div><h2 id="publish-title">发布概率论课程舱</h2><p>期末成绩 96 · 已验证</p></div><button onClick={onClose} aria-label="关闭发布对话框"><X size={17} /></button></header><section className="publish-current"><div><strong>18</strong><span>共享资料</span></div><div><strong>4</strong><span>个人笔记</span></div><div><strong>12</strong><span>题册内容</span></div><div><strong>3</strong><span>复习总结</span></div></section><section className="publish-options"><div className="eyebrow">选择要发布的内容</div>{allowed.map((item) => { const checked = selected.includes(item); return <button key={item} onClick={() => setSelected((items) => checked ? items.filter((value) => value !== item) : [...items, item])}><span className={`material-check ${checked ? "checked" : ""}`}>{checked && <Check size={12} />}</span><span><strong>{item}</strong><small>进入公开课程知识层，并保留来源与版本记录</small></span></button>; })}<div className="private-boundary"><LockKeyhole size={15} /><span><strong>始终保持私密</strong><small>{privateItems.join(" · ")}</small></span></div></section><section className="visibility-choice"><div className="eyebrow">可见范围</div><div>{["公开", "校内可见", "私密链接"].map((item) => <button key={item} className={visibility === item ? "selected" : ""} onClick={() => setVisibility(item)}>{visibility === item && <Check size={11} />}{item}</button>)}</div></section><footer><span><ShieldCheck size={12} /> 仅发布你有权分享的资料</span><button className="primary-button" disabled={!selected.length} onClick={publish}>确认发布 <ArrowRight size={13} /></button></footer></>}{stage === "publishing" && <div className="publish-processing"><span className="fork-orbit"><Upload size={22} /></span><div className="eyebrow">正在建立公开版本</div><h2>检查来源、隐私边界与版本记录</h2><p>个人题册、Agent 对话和每日计划不会包含在发布内容中。</p></div>}{stage === "done" && <div className="publish-complete"><span><Check size={24} /></span><div className="eyebrow">发布完成</div><h2>你的课程舱已公开。</h2><p>{selected.length} 类课程资产已进入共享层，326 名学生正在使用这个课程舱。</p><button className="primary-button" onClick={onClose}>返回贡献页</button></div>}</div></div>;
}

export function ProfilePage() {
  return <div className="standalone-page profile-page"><header><span className="profile-avatar">L</span><div><div className="eyebrow">个人资料</div><h1>Lucian</h1><p>数学科学学院 · 2025 级</p></div></header><section className="profile-identity"><div><span>学校</span><strong>北京大学</strong><small><ShieldCheck size={12} /> 已通过学校邮箱验证</small></div><div><span>专业</span><strong>数学</strong><small>本科生</small></div><div><span>公开身份</span><strong>匿名贡献者</strong><small>公开 Dock 不显示真实姓名</small></div></section><section className="profile-grades"><div className="directory-heading"><div><div className="eyebrow">课程凭据</div><h2>成绩与认证状态</h2></div></div><div><article><span className="dock-color" style={{ background: "#6076a8" }} /><span><strong>概率论</strong><small>2026 春季 · 张老师</small></span><strong>96</strong><em><ShieldCheck size={12} /> 已验证</em></article><article><span className="dock-color" style={{ background: "#a76f5b" }} /><span><strong>抽象代数</strong><small>2026 春季 · 李老师</small></span><strong>94</strong><em className="self-reported">本人填写</em></article></div></section></div>;
}

export function UpstreamUpdateModal({ onClose, onApply }: { onClose: () => void; onApply: () => void }) {
  return <div className="modal-backdrop" role="presentation"><div className="upstream-modal" role="dialog" aria-modal="true"><header><div><div className="eyebrow">原课程舱有新版本</div><h2>共享层 v1.9</h2><p>你的私人笔记、题册和学习记录不会被覆盖。</p></div><button onClick={onClose} aria-label="关闭更新对话框"><X size={17} /></button></header><div className="upstream-flow"><span><strong>当前共享层</strong><small>v1.8</small></span><ArrowRight size={14} /><span><strong>可用更新</strong><small>v1.9</small></span></div><section><div><CheckCircle2 size={14} /><span><strong>2026 期末复习索引</strong><small>新增 1 个章节</small></span></div><div><CheckCircle2 size={14} /><span><strong>3 道典型题</strong><small>第 4、6 章</small></span></div><div><CheckCircle2 size={14} /><span><strong>第 6 章来源更新</strong><small>替换旧教材页码</small></span></div></section><footer><button onClick={onClose}>稍后处理</button><button className="primary-button" onClick={onApply}>应用到共享层 <ArrowRight size={13} /></button></footer></div></div>;
}
