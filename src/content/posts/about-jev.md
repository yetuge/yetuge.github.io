---
title: 关于 Jev 的个人理解
description: 一个不生成文字的模型，成了 Vercel 网关史上采用最快的模型。按公开来源拆解 TypeSafe 的 Jev 决策模型：机制、口径、反方与自验证方法。
pubDate: 2026-09-28
category: 学习笔记
---

> 写作日期：2026-09-28，信息截至同日。本文检索自公开来源（[官方站点](https://typesafe.ai)与[文档](https://docs.typesafe.ai/)、创始人访谈、独立评测、HN 讨论与 arXiv 论文），检索与整理有 AI 辅助；文中所有数字均注明出处与口径。

## 先说三件可查证的事

1. 2026 年 9 月 15 日，前 OpenAI 研究员 Diogo Almeida 创立的 TypeSafe AI 发布了 [Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)。它不生成文字：读入一段状态描述，返回带置信度的结构化决策——是不是、选哪个、打几分。官方称这类模型为 "System One Model"，并说 [Jev 放弃了字符串生成](https://typesafe.ai/blog/introducing-system-one-models-and-jev)（"Jev gives up string generation"）。
2. 9 月 16 日 Jev 上架 Vercel AI Gateway，9 月 18 日即被称为网关史上采用最快的模型：上线 24 小时内近 13% 的 Vercel 付费团队用了它，是 GPT-5.6 家族的两倍、Fable 5.1 的六倍以上（见 [CellCog 的整理](https://cellcog.ai/blog/jev-typesafe-decision-model)）。注意口径：这段时间 Jev 在免费促销，促销 9 月 25 日结束，真实留存要等付费期数据。
3. 官方宣称比 LLM「快 193.6 倍、便宜 444.6 倍」，脚注写明「基于 System One 类任务的工作流」，且官方自己承认这些数字「处于真实收益的高端区间」（[官方博客](https://typesafe.ai/blog/introducing-system-one-models-and-jev)）。发布 13 天内，arXiv 上以 Jev 为主题的论文已有 30 余篇（我用 arXiv API 检索 all:"Jev" 得 31 条结果，抓取样例 20 篇全部相关），GitHub 上有约 2170 个相关公开项目（[Jev in the Wild 论文摘要](https://arxiv.org/abs/2609.30216)口径，未读原文）。

一句话：一个「不说话」的模型，两周内在工程圈引发的动静超过绝大多数会说话的模型。

## 为什么现在重要：判断比生成更便宜之后

Agent 和自动化管线里，大部分模型调用其实不是「写作文」，而是「做判断」：

- 这封邮件是不是在要求退款？
- 这条工单该路由给哪个队列？
- 这段 RAG 回答忠实于原文吗？
- 这 100 条搜索候选，哪条相关？

这些事现在都用 LLM 做。LLM 做判断的方式是**自回归地生成文字**：一个 token 一个 token 地吐，吐完再解析成 JSON，可能解析失败，可能编造理由，同一个问题两次回答还不一样。慢（秒级）、贵（按生成 token 计费）、不稳。

Jev 的赌注是：这些判断型调用值得一个专门的接口——不吐字，直接吐「答案 + 概率分布 + 置信度」。如果判断的单价降三个数量级（[OpenRouter 的例子](https://openrouter.ai/blog/insights/what-is-jev)：一封 450 token 的三问工单调用约 $0.000019，一百万封约 $19），你会开始「对每一行数据都调模型」，而不是「只对可疑的行调模型」。这正好是 Jevons 悖论——模型名字的出处（[Latent Space 访谈](https://www.latent.space/p/jev)）：效率提高，用量暴涨。

## 它是什么：System 1，不写作文

用卡尼曼的框架类比：推理型 LLM 是 System 2——慢、深思熟虑、会出长篇推理；Jev 想做 System 1——快、直觉、按秒回答的反射。官方的口号是「unstructured state in, typed probabilistic decisions out」（非结构化状态进，类型化概率决策出），TypeSafe 把它比作「frontier-intelligence function call」——前沿智能水平的函数调用（[Simon Willison 转述](https://simonwillison.net/2026/Sep/21/jev/)）。

按[官方文档](https://docs.typesafe.ai/)，它提供三种原语：

- **Noul**（社区常写作 Noulli，源自 Bernoulli）：「这句话是真的吗？」返回 0–1 的概率。对应代码里的 if；
- **Choice**：从给定选项里选一个，返回选中项 + 每个选项的概率分布 + 置信度。对应 switch/enum；
- **Score**：按给定标尺打分，返回概率加权的分数。对应排序和阈值过滤。

名字有个现成的反讽可以用：如果 Jevons 悖论应验，判断变便宜的结果不是模型调用变少，而是每个循环、每行数据里都长出判断——「每秒一次智能」成为新的性能指标。

## 机制：状态进，决策出

```
state（文本或结构化 JSON，如程序状态、工单内容）
        │
        ▼
┌────────────────────────────────────┐
│        一次请求，多个类型化问题           │      Noul:   0.97
│   Noul   —— 是/否，返回 0–1           │      Choice: B 62% / A 31% / …
│   Choice —— 选项，返回完整概率分布        │ ──►  Score:  1.15
│   Score  —— 打分，返回加权分            │      + 每个答案的置信度
│  各问题「并行、相互隔离」地对照同一 state    │
└────────────────────────────────────┘
        没有文本生成环节（官方：gives up string generation）
```

这张图里每一环都有出处：

- **输入**：state + 类型化问题，一次请求里问题可以混着提，[文档](https://docs.typesafe.ai/)明确说各问题「并行且相互隔离」地对照同一个 state 评估——问题之间没有推理链，官方建议把复杂判断拆成原子的「gut-check」再在代码里组合；
- **输出**：类型化答案 + 概率 + 置信度。Choice 支持的选项基数上限是 255，超过要走两段式评分（[官方博客](https://typesafe.ai/blog/introducing-system-one-models-and-jev)）；
- **为什么快**：官方说法是新架构 + 并行采样器——「所有输出在单次查询里并行给出」，不像 LLM 那样逐 token 自回归。端到端延迟 70–500ms，对照组的前沿 LLM 是 3–329 秒（同上，官方口径）；
- **为什么便宜**：定价 $0.042/百万输入 token（$42/十亿），输出免费——「too cheap to meter」。对照 LLM 输入 $0.20–$10/百万 token、输出约为输入五倍（官方口径）。官网还给了个对照：输入价格比 Claude Fable 5.1 低 238 倍。

**训练和架构，官方没有公开。** 已知的是：训练方法叫 RLCD（Reinforcement Learning for Calibrated Decisions，面向校准决策的强化学习），未发表；训练数据全部合成，TypeSafe 自称「data lab」，明确不用用户数据训练；创始人说预训练这种烧钱路线他不会走（[Latent Space 访谈](https://www.latent.space/p/jev)）。以下为社区推测：外界怀疑它是开源权重 LLM 底座加分类头/约束解码（[CellCog](https://cellcog.ai/blog/jev-typesafe-decision-model)），依据是发布几天内社区就用 0.8B 级模型复刻出了行为类似的模型（如基于 Qwen3.5 的 [Kev](https://github.com/jaredpalmer/kev)），HN 上还有「[25 行 Python 复刻 Jev](https://news.ycombinator.com/item?id=49812769)」的高热帖。官方未确认任何推测。

## 和三个老朋友划清界限

**LLM + structured outputs / logprobs。** 用 JSON mode 约束输出、拿 logprobs 当置信度，也能得到「结构化 + 概率」。区别在成本结构：LLM 仍要生成 token，Jev 把生成整个砍掉了。官方基准里的 LLM 基线就是用他们提供的 [system-one-adapter](https://github.com/typesafe-ai/system-one-adapter-python) 把通用 LLM 约束成决策输出——这算是最公平的对照，Jev 仍宣称快 40–200 倍（官方口径）。

**传统小分类器（BERT 时代那套）。** 这是「前 ChatGPT 的 ML 人看 Jev 就是个好 API 的校准分类器」的说法（Parakhin 语，[经 CellCog 转述](https://cellcog.ai/blog/jev-typesafe-decision-model)）。传统分类器需要标注数据逐任务训练；Jev 的卖点是 zero-shot——没见过的任务直接问。HN 上也有人翻出[一年前就开源的同类架构](https://news.ycombinator.com/item?id=49736660)（非自回归概率预测，[arXiv:2503.23303](https://arxiv.org/abs/2503.23303)），评论区共识是那些是单任务分类器，而 GLiNER 这类零样本工具也早就在——Jev 的差异化在「灵活 + 打磨 + 便宜 + 快」，不在「发明了分类」。

**LLM-as-judge。** 用 LLM 给 LLM 的输出打分是这两年的常规操作，但 judge 本身又慢又贵。arXiv 上[JEV-as-a-Judge 一文](https://arxiv.org/abs/2609.26550)（摘要口径）称 Jev 做简单任务 judge 时质量对齐强模型、成本只有强模型的 0.36%。

## 反方：四记闷棍

这一节是我认为全文最重要的部分。口号是厂商的，账要自己算。

**第一棍：官方基准测的不是「正确」，是「像前沿模型」。** 官方 193.6x/444.6x 来自自建的 workflow 评测，而「正确答案」的定义是两个前沿模型（GPT-6 Astra 与 Fable 5.1）输出的平均——没有 ground truth。官方自己承认评测工作流出自自家团队「可能存在偏差」、演示用的「较短输入让我们的模型占优」、0% 类型错误率是构造保证而非实测、定价「无法证明没有补贴」（全部出自[官方博客](https://typesafe.ai/blog/introducing-system-one-models-and-jev)的自认，这是值得肯定的诚实）。[Silverthread Labs 的结论](https://www.silverthreadlabs.com/blog/jev-ai-benchmark-limitations)最精准：数字「按测量方式几乎肯定为真」，但它是「卖产品的公司给出的天花板」。注意 Silverthread 自己是卖 Jev 实施服务的咨询公司，批评者也有立场。

**第二棍：校准没有口号说的那么稳。** 官方口径是「95% 置信度的答案约 95% 的时候是对的」（[CellCog 转述](https://cellcog.ai/blog/jev-typesafe-decision-model)）。独立实测已经出现反例：[Alex Molas 记录](https://alexmolas.com/2026/09/23/jev-cant-be-calibrated.html)，问一枚公平硬币正面朝上的概率——答案就写在题目里——Jev 给出 0.92；有第三方实验发现 Noul 的校准明显好于 Choice。更根本的论证：校准是分布性质，在 TypeSafe 的数据上校准，不等于在你的数据上校准。OpenRouter 的[说明](https://openrouter.ai/blog/insights/what-is-jev)也写得诚实：置信度反映的是分布集中度不是正确性，「概率每次调用会有些波动」。还有一个容易忽略的细节：官方文档自认的弱项包括数字、日期和对抗性内容（[Simon Willison 摘录](https://simonwillison.net/2026/Sep/21/jev/)）。至于官网的「Zero Hallucinations」：按 [CellCog 的解释](https://cellcog.ai/blog/jev-typesafe-decision-model)，它只保证输出永远落在你定义的 schema 里，不保证答案正确——在「类型安全」的定义下幻觉确实是零，但那不是大多数人理解的零。

**第三棍：鲁棒性和黑箱问题都有实锤。** arXiv 上的独立论文（以下均为摘要口径，未读原文）：[普通上下文 additions 能重定向 61.4% 的原本正确的决策](https://arxiv.org/abs/2609.30243)；[把选项名从 0/1 改成 no/yes 就能翻转决策排序](https://arxiv.org/abs/2609.26758)；[提示注入能搬动决策概率](https://arxiv.org/abs/2609.28613)；[把未经验证的意见塞进 state 能翻转约 12% 的决策](https://arxiv.org/abs/2609.31142)。Silverthread 自己测到一个具体例子：注入文本后，拦截 `rm -rf ~/.ssh` 的概率从 0.76 掉到 0.48。Simon Willison 的警告更结构性：「[Black boxes are back in fashion](https://simonwillison.net/2026/Sep/21/jev/)」——LLM 好歹会给你理由，Jev 只给一个数，他还担心这种浮点数「能藏住各种看不见的偏见」，比如拿它筛简历。发布期间还出过插曲：Builder.io 的 Steve Sewell 公开指责部分演示视频造假，有人回帖称一次 browser-use 复测未能复现演示效果（[均经 CellCog 转述](https://cellcog.ai/blog/jev-typesafe-decision-model)）。顺带一提，HN 有用户实测 intent-routing 场景 Jev P50 延迟 712ms（[评论区口径](https://news.ycombinator.com/item?id=49736660)，未证实），已经超出官方 70–500ms 的区间上限。

**第四棍：精度并非碾压。** [LangWatch 的 15 任务基准](https://langwatch.ai/compare/jev-benchmark)给了最细致的第三方数据：Jev 确实在全部任务上领先未被污染的开源 Jev 类模型 12–68 个百分点（如 PII 检测 90.8% 对 22.8%，提示注入检出 94.6% 对 56.2%），但他们同时披露：自家产品就跑在 Jev 上；琐碎基线（只看长度、词袋）能在 9/11 任务上击败所有开源模型，说明好些数据集本来就水；以及——Jev 在 11 个真实任务里的 10 个上 p95 延迟反而最高（它是托管 API，开源模型跑在本地 GPU 上）。另一个参照：开源的 Laya 在某个基准上微调后 0.766，高于 Jev 的 0.727，但零样本时只有 0.362；Banking77 上 Jev 0.870 对微调后的 Laya 0.425（[Silverthread 转引](https://www.silverthreadlabs.com/blog/jev-ai-benchmark-limitations)）。拼起来的图景是：**Jev 的护城河是「zero-shot + 好 API + 托管」，不是单点精度。**

## 适用边界：先问「要不要写字」

综合各方口径，Jev 适合的形状很清楚：

- 高频、大批量的判断：路由、分诊、评分、标记、过滤、审另一个模型的输出（[Silverthread 的建议清单](https://www.silverthreadlabs.com/blog/jev-ai-benchmark-limitations)）；
- 想把「问 LLM」降级成「调函数」的代码路径：confidence 高就自动执行，低就升级人工（官方主推的用法）；
- 已经被 arXiv 论文们验证的场景：作为 agent 的快速决策层（[REFLEX：减少 72.7% 强模型调用](https://arxiv.org/abs/2609.26532)，摘要口径）、安全分类器替换（Vercel 实测「快 5–18 倍且更准」，[经 CellCog 转述](https://cellcog.ai/blog/jev-typesafe-decision-model)）。

不适合的也清楚：

- 一切需要**产出语言**的任务——它不能，这是架构性的放弃；
- 把置信度**当安全边界**——校准是统计性质，不担保单次答案正确（Silverthread 的原话：置信度「跨组测量，不保证个体正确」）；
- 数字计算、日期、对抗性内容（官方文档自认的弱项）；
- 自动化交易——这是创始人自己点名「交给专业人士」的（[Latent Space 访谈](https://www.latent.space/p/jev)）；
- 需要解释的合规场景——它不给你理由，只有数。

## 你怎么自己验证

两个便宜（近乎免费）的实验，不用信任何人的口径，包括这篇文章：

1. **量校准，再谈置信度。** 从你的业务里准备几百条带标准答案的判断题，记录 Jev 的置信度和实际正确率，画可靠性曲线（reliability diagram）；顺手加两组干扰：把选项名从 0/1 换成 no/yes，在 state 里塞一句无关意见——看决策翻不翻。如果曲线歪了，几百条标注做一次 Platt scaling 重校准的成本几乎为零（这是 Alex Molas 给的建议，[出处](https://alexmolas.com/2026/09/23/jev-cant-be-calibrated.html)）。
2. **同题 A/B 实测成本和延迟。** 挑一条真实业务判断题，分别用 Jev 和「最便宜 LLM + structured output」各跑 100 次，记录 p50/p95 延迟、总花费、与人工标注的一致率，对照官方宣称的 70–500ms 和 40–200 倍加速——注意 LangWatch 提醒过 Jev 的 p95 在小样本下可能不好看，别只看 p50。

## 我的判断

把这一圈来源读下来，我对 Jev 的定性是：一次把「分类器」重新发明成「云服务」的成功产品化——技术上每一步都有前人（判别式模型、零样本分类、概率输出、约束解码），组合、打磨和命名是它真正的新东西，而这恰好是工程世界愿意付钱的部分。它配得上这两周的爆火，但爆火的热度也把口号放大到了证据前面。

结尾留一条原则：**为任务选接口，而不是为接口找任务——在把概率当成承诺之前，先在自己的数据上量一量校准。**
