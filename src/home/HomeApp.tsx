import {
  ArrowUpRight,
  BookOpenText,
  CircleGauge,
  Megaphone,
  MousePointerClick,
  Route,
  Sparkles,
  UsersRound,
} from 'lucide-react';

const reportUrl =
  'https://www.figma.com/proto/zl4goF8HMUKxsMm7iE90BT/%E9%BB%91%E6%B9%96%E5%B0%8F%E5%B7%A5%E5%8D%95%EF%BD%9C2027%E5%88%9B%E5%9F%B9%E7%94%9F%E4%BA%A7%E5%93%81%E7%A0%94%E7%A9%B6?node-id=41-2&p=f&t=Lil6eDwJ3WOey6T1-1&scaling=contain&content-scaling=fixed&page-id=0%3A1';

const materials = [
  {
    number: '01',
    eyebrow: '产品研究 · 11页',
    title: '黑湖小工单产品研究',
    description:
      '从行业与市场、产品特点和国内竞品出发，梳理小工单从“快速跑通”走向“持续适配现场”的机会。',
    calloutLabel: '研究主线',
    question: '管理者获得更清晰数据后，怎样进一步降低管理员和一线的使用成本？',
    href: reportUrl,
    action: '在线阅读报告',
    external: true,
    Icon: BookOpenText,
  },
  {
    number: '02',
    eyebrow: '一线操作',
    title: '智能快捷报工',
    description: '当前任务自动准备好，完成一批只需点击一次；误触后可以马上撤销。',
    calloutLabel: '设计回应',
    question: '减少赶工时的填写动作，让报工更容易成为自然的工作步骤。',
    href: './quick-report/',
    action: '打开大按钮 Demo',
    external: false,
    Icon: MousePointerClick,
  },
  {
    number: '03',
    eyebrow: '车间公共大屏',
    title: '车间进度赛道',
    description: '七辆赛车沿同一张非线性地图前进，用行驶位置呈现个人当班计划完成率。',
    calloutLabel: '设计回应',
    question: '保留清晰的进度信息，也尝试缓和传统 Top5 带来的公开比较感。',
    href: './collaborative-progress/',
    action: '打开赛道 Demo',
    external: false,
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
        <span className="candidate-label">27届创培生申请人 · 产品研究与 Demo</span>
      </nav>

      <header className="home-hero">
        <div className="hero-kicker">
          <span>APPLICATION MATERIALS</span>
          <span aria-hidden="true">/</span>
          <span>产品研究与原型</span>
        </div>
        <h1>
          先理解现场，
          <span>再把想法做出来</span>
        </h1>
        <p className="hero-lead">
          一份围绕黑湖小工单的产品研究，以及两个针对一线使用体验的交互 Demo。我尝试从行业、竞品和现场角色出发，理解产品如何从“快速跑通”继续走向“持续使用”。
        </p>
        <div className="profile-chips" aria-label="申请人背景">
          <span>UCL Digital Humanities 硕士</span>
          <span>公共关系与广告学本科 · 专业第三</span>
          <span>田野训练 × AI 原型实践</span>
        </div>
      </header>

      <section className="demo-grid" aria-label="申请材料">
        {materials.map(({ Icon, ...material }) => (
          <article className="demo-card" key={material.number}>
            <div className="demo-card-topline">
              <span className="demo-index number-font">{material.number}</span>
              <span className="demo-icon" aria-hidden="true">
                <Icon size={24} />
              </span>
            </div>
            <p className="demo-eyebrow">{material.eyebrow}</p>
            <h2>{material.title}</h2>
            <p className="demo-description">{material.description}</p>
            <div className="test-question">
              <CircleGauge size={18} aria-hidden="true" />
              <p>
                <span>{material.calloutLabel}</span>
                {material.question}
              </p>
            </div>
            <a
              className="demo-link"
              href={material.href}
              target={material.external ? '_blank' : undefined}
              rel={material.external ? 'noreferrer' : undefined}
            >
              {material.action}
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          </article>
        ))}
      </section>

      <section className="reasoning-strip" aria-labelledby="reasoning-title">
        <div>
          <p className="section-label">为什么是我</p>
          <h2 id="reasoning-title">不同的学习经历，让我能从多个角度理解同一个问题</h2>
        </div>
        <div className="reasoning-points">
          <p>
            <Megaphone size={19} aria-hidden="true" />
            公共关系与广告：从市场、用户与沟通理解问题
          </p>
          <p>
            <UsersRound size={19} aria-hidden="true" />
            社会学与人类学：进入现场，理解具体的人与流程
          </p>
          <p>
            <Sparkles size={19} aria-hidden="true" />
            数字人文与 AI 实践：把观察做成可以体验的方案
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
