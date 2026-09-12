import {
  ArrowUpRight,
  CircleGauge,
  MousePointerClick,
  Route,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const demos = [
  {
    number: '01',
    eyebrow: '一线操作',
    title: '智能快捷报工',
    description: '当前任务自动准备好。点击一次记录产量，误触可以马上撤销。',
    question: '能否减少赶工时一次有效记录所需的动作？',
    href: './quick-report/',
    action: '打开大按钮 Demo',
    Icon: MousePointerClick,
  },
  {
    number: '02',
    eyebrow: '车间公共大屏',
    title: '车间进度赛道',
    description: '七辆赛车沿同一张非线性地图前进，位置代表个人当班计划完成率。',
    question: '趣味呈现是否比传统 Top5 更易理解，同时不增加压力？',
    href: './collaborative-progress/',
    action: '打开赛道 Demo',
    Icon: Route,
  },
];

export function HomeApp() {
  return (
    <main className="home-shell">
      <nav className="home-nav" aria-label="项目导航">
        <a className="home-brand" href="./" aria-label="返回项目首页">
          <span className="brand-mark" aria-hidden="true">
            <Sparkles size={18} />
          </span>
          <span>FIELD / FIT</span>
        </a>
        <span className="candidate-label">27届创培生申请人·产品demo</span>
      </nav>

      <header className="home-hero">
        <div className="hero-kicker">
          <span>黑湖小工单产品研究</span>
          <span aria-hidden="true">/</span>
          <span>现场适配实验</span>
        </div>
        <h1>
          从快速跑通，
          <span>到一线愿意持续用</span>
        </h1>
        <p className="hero-lead">
          两个独立原型，分别回应报工动作成本与公开绩效呈现。它们不是效果结论，而是可以被观察、比较和推翻的产品假设。
        </p>
      </header>

      <section className="demo-grid" aria-label="产品 Demo">
        {demos.map(({ Icon, ...demo }) => (
          <article className="demo-card" key={demo.number}>
            <div className="demo-card-topline">
              <span className="demo-index number-font">{demo.number}</span>
              <span className="demo-icon" aria-hidden="true">
                <Icon size={24} />
              </span>
            </div>
            <p className="demo-eyebrow">{demo.eyebrow}</p>
            <h2>{demo.title}</h2>
            <p className="demo-description">{demo.description}</p>
            <div className="test-question">
              <CircleGauge size={18} aria-hidden="true" />
              <p>
                <span>待验证</span>
                {demo.question}
              </p>
            </div>
            <a className="demo-link" href={demo.href}>
              {demo.action}
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </article>
        ))}
      </section>

      <section className="reasoning-strip" aria-labelledby="reasoning-title">
        <div>
          <p className="section-label">产品判断</p>
          <h2 id="reasoning-title">让 AI 在后台准备，让一线只完成眼前动作</h2>
        </div>
        <div className="reasoning-points">
          <p>
            <Sparkles size={19} aria-hidden="true" />
            AI 建议任务、步长与工作量系数，管理员保留解释和覆盖权。
          </p>
          <p>
            <ShieldCheck size={19} aria-hidden="true" />
            所有数据均为本地模拟；头像不上传，刷新后恢复初始状态。
          </p>
        </div>
      </section>

      <footer className="home-footer">
        <p>研究路径：行业与市场 → 产品特点 → 竞品 → 缺口 → 痛点 → 优化尝试</p>
        <a href="https://www.xiaogongdan.cn/case/yamada-machinery-data-production">
          事实锚点：黑湖官方案例中的“员工绩效 Top5”
          <ArrowUpRight size={16} aria-hidden="true" />
        </a>
      </footer>
    </main>
  );
}
