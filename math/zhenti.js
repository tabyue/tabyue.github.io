/* 深圳中考真题 · 数学。格式与核对要求见 tools/ZHENTI_SPEC.md。2026-10-31 收集。
 *
 * 【试卷来源与答案核对】
 * 2024：题干、答案读自高考直通车 PDF 扫描页，逐页看图核对：
 *   http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf
 *   答案另对 https://zy.21cnjy.com/20735221 、https://m.51jiaoxi.com/doc-16188299.html
 * 2025：题干读自高考直通车 PDF 扫描页（同文本在 21cnjy、xuexitifen 标为回忆版）：
 *   http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf
 *   答案对 https://www.renrendoc.com:10443/paper/505097578.html 及公众号“学霸数学”参考答案、“安安教育”解析。
 * 2026：未找到官方原卷，题干读自文字版 https://m.renrendoc.com/paper/529982182.html ，
 *   公式对公众号“子墨文化”解析版（mp.weixin.qq.com，__biz=Mzk2NDU1NjgzNg==&mid=2247488177）、
 *   “南有抱团”版及 https://www.renrendoc.com/paper/533239784.html ；
 *   同时比对回忆版 https://zy.21cnjy.com/26043143 。
 * 所有答案都已用脚本或手算重做一遍。
 *
 * 【回忆版说明】未找到官方公开的原卷，2025、2026 的文本均为回忆/还原版，已在 part 标“回忆版”。
 *
 * 【OCR 纠正】
 * 2026 第 2 题：文字版丢失“±”，据子墨文化版补回。
 * 2026 第 4、10、13、14、15、18、20 题：文字版公式符号丢失，据子墨文化、南有抱团两版公式还原。
 * 2024 第 4 题：一处预览把题号误作 20，以 PDF 扫描页为准。
 *
 * 【不可用的来源】51jiaoxi 预览 document_id=15947337 的数字被改动（如第 9 题答案成 7），
 *   jinchutou.com view-595828579 的数据也与原卷不同，均未采用。
 *
 * 【核实后不收的题】
 * 2024 第 7 题：转录卷 B、D 两选项完全相同，疑有误。
 * 2024 第 16 题：原表 A 校方差 83.299，由所给数据算得 58.01，表内数据自相矛盾。
 * 2024 第 17 题任务 3：高考直通车解析 3 种，21cnjy 解析 4 种；实算满足条件的有 4 种，答案冲突。
 * 2024 第 8、11、12、20 题，2026 第 12 题：须靠配图补位置关系。
 * 2026 第 9、17、19 题：各转录版本措辞不一致（黄脸/红脸；甲贵/乙贵/甲少；元/百元、收入/成本）。
 * 其余未收的题依赖图形、统计图或数轴选项。
 */
window.ZHENTI = [
  /* ---------- 2024 ---------- */
  {
    id: 'sz2024-3', year: 2024, no: '第 3 题', lesson: 'power',
    stem: '下列运算正确的是（　　）',
    options: ['(−m^{3})^{2}=−m^{5}', 'm^{2}n·m=m^{3}n', '3mn−m=3n', '(m−1)^{2}=m^{2}−1'],
    answer: 'B',
    explain: '(−m^{3})^{2}=m^{6}；3mn 与 m 不是同类项；(m−1)^{2} 展开还有 −2m 项；只有 B 正确。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-4', year: 2024, no: '第 4 题', lesson: 'prob1',
    stem: '二十四节气，它基本概括了一年中四季交替的准确时间以及大自然中一些物候等自然现象发生的规律，二十四个节气分别为：春季（立春、雨水、惊蛰、春分、清明、谷雨），夏季（立夏、小满、芒种、夏至、小暑、大暑），秋季（立秋、处暑、白露、秋分、寒露、霜降），冬季（立冬、小雪、大雪、冬至、小寒、大寒），若从二十四个节气中选一个节气，则抽到的节气在夏季的概率为（　　）',
    options: ['1/2', '1/12', '1/6', '1/4'],
    answer: 'D',
    explain: '共 24 个节气，夏季有 6 个，概率为 6/24=1/4。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-9', year: 2024, no: '第 9 题', lesson: 'quad',
    stem: '已知一元二次方程 x^{2}−3x+m=0 的一个根为 1，则 m=____．',
    answer: '2',
    explain: '把 x=1 代入方程：1−3+m=0，得 m=2。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-13', year: 2024, no: '第 13 题', lesson: 'trig',
    stem: '如图，在△ABC 中，AB=BC，tan∠B=5/12，D 为 BC 上一点，且满足 BD/CD=8/5，过 D 作 DE⊥AD 交 AC 延长线于点 E，则 CE/AC=____．',
    answer: '20/21',
    explain: '设 BC=13，取 B(0,0)、C(13,0)、A(12,5)、D(8,0)。令 E=A+t(C−A)，由 DE⊥AD 得 t=41/21，故比值为 20/21。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-14', year: 2024, no: '第 14 题', lesson: 'real',
    stem: '计算：−2·cos45°+(π−3.14)^{0}+|1−√2|+(1/4)^{−1}．',
    answer: '4',
    explain: '原式=−√2+1+(√2−1)+4=4。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-15', year: 2024, no: '第 15 题', lesson: 'fraction',
    stem: '先化简，再求值：(1−2/(a+1))÷((a^{2}−2a+1)/(a+1))，其中 a=√2+1',
    answer: '化简得 1/(a−1)，代入得 √2/2',
    explain: '括号内通分得 (a−1)/(a+1)，除式分子是 (a−1)^{2}，约分得 1/(a−1)；a−1=√2，值为 √2/2。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-17-1', year: 2024, no: '第 17 题', part: '任务 1、2，表格已改为文字', lesson: 'linear',
    stem: '如图为某商场叠放的购物车，右图为购物车叠放在一起的示意图，若一辆购物车车身长 1m，每增加一辆购物车，车身增加 0.2m．\n任务 1：若某商场采购了 n 辆购物车，求车身总长 L 与购物车辆数 n 的表达式；\n任务 2：若该商场用直立电梯从一楼运输该批购物车到二楼，已知该商场的直立电梯长为 2.6m，且一次可以运输两列购物车，求直立电梯一次性最多可以运输多少辆购物车？',
    answer: '任务 1：L=(0.8+0.2n)m；任务 2：一次性最多可以运输 18 辆购物车',
    explain: 'L=1+0.2(n−1)=0.8+0.2n。令 0.8+0.2n≤2.6，得 n≤9，每列最多 9 辆，两列共 18 辆。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-18', year: 2024, no: '第 18 题', lesson: 'circle',
    stem: '如图，在△ABD 中，AB=BD，⊙O 为△ABD 的外接圆，BE 为⊙O 的切线，AC 为⊙O 的直径，连接 DC 并延长交 BE 于点 E．\n（1）求证：DE⊥BE；\n（2）若 AB=5√6，BE=5，求⊙O 的半径．',
    answer: '（1）连接 BO 并延长交 AD 于点 H。由 AB=BD、OA=OD 知 BH 垂直平分 AD；BE 是切线，所以 BH⊥BE；AC 是直径，所以 ∠ADC=90°。四边形 BHDE 是矩形，故 DE⊥BE。\n（2）3√5',
    explain: 'DH=BE=5，AH=5，BH=√(150−25)=5√5。在 Rt△AOH 中 r^{2}=5^{2}+(5√5−r)^{2}，解得 r=3√5。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-19-1', year: 2024, no: '第 19 题', part: '第 (1) 问，表格已改为文字', lesson: 'quadfun',
    stem: '为了测量抛物线的开口大小，某数学兴趣小组将两把含有刻度的直尺垂直放置，并分别以水平放置的直尺和竖直放置的直尺为 x，y 轴建立如图所示平面直角坐标系，该数学小组选择不同位置测量数据如下表所示，设 BD 的读数为 x，CD 读数为 y，抛物线的顶点为 C．\n（1）（Ⅰ）列表：\nx：0，2，3，4，5，6\ny：0，1，2.25，4，6.25，9\n（Ⅱ）描点：请将表格中的 (x,y) 描在图 2 中；\n（Ⅲ）连线：请用平滑的曲线在图 2 将上述点连接，并求出 y 与 x 的关系式；',
    answer: 'y=(1/4)x^{2}（描点连线略）',
    explain: '图象过原点且顶点在原点，设 y=ax^{2}，代入 (2,1) 得 a=1/4，其余各点都符合。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },
  {
    id: 'sz2024-19-3', year: 2024, no: '第 19 题', part: '第 (3) 问', lesson: 'quadfun',
    stem: '（3）【应用】如图 4，已知平面直角坐标系 xOy 中有 A，B 两点，AB=4，且 AB∥x 轴，二次函数 C_{1}：y_{1}=2(x+h)^{2}+k 和 C_{2}：y_{2}=a(x+h)^{2}+b 都经过 A，B 两点，且 C_{1} 和 C_{2} 的顶点 P，Q 距线段 AB 的距离之和为 10，求 a 的值．',
    answer: 'a 的值为 1/2 或 −1/2',
    explain: 'A、B 到对称轴的距离都是 2，P 距 AB 为 2×2^{2}=8，Q 距 AB 为 2。又 Q 距 AB 等于 4|a|，所以 |a|=1/2，开口上下各一解。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202407/20240702092311_wQ4Zij.pdf'
  },

  /* ---------- 2025（回忆版） ---------- */
  {
    id: 'sz2025-1', year: 2025, no: '第 1 题', part: '回忆版', lesson: 'rational',
    stem: '节约水 5 吨记作 +5 吨，则浪费水 2 吨记作（　　）',
    options: ['−3 吨', '+2 吨', '−2 吨', '+3 吨'],
    answer: 'C',
    explain: '节约与浪费是相反意义的量，节约记正，浪费就记负，浪费 2 吨记作 −2 吨。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-3', year: 2025, no: '第 3 题', part: '回忆版', lesson: 'prob1',
    stem: '某校进行《九章算术》，《周髀算经》，《孙子算经》，《算法统宗》四本书的长文本阅读活动，小聪从中任取一本，恰好抽到《九章算术》的概率为（　　）',
    options: ['1/2', '1/3', '1/4', '2/3'],
    answer: 'C',
    explain: '共 4 本书，每本被抽到的可能性相等，抽到《九章算术》只有 1 种，概率为 1/4。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-4', year: 2025, no: '第 4 题', part: '回忆版', lesson: 'trig',
    stem: '如图为人行天桥的示意图，若高 BC 长为 10 米，斜道 AC 长为 30 米，则 sinA 的值为（　　）',
    options: ['2√2/3', '3', '√2/4', '1/3'],
    answer: 'D',
    explain: 'sinA=对边/斜边=BC/AC=10/30=1/3。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-5', year: 2025, no: '第 5 题', part: '回忆版', lesson: 'power',
    stem: '下列计算正确的是（　　）',
    options: ['a^{2}+a^{4}=a^{6}', 'a^{3}·a^{3}=a^{6}', '(a^{2})^{3}=a^{5}', '(a+b)^{2}=a^{2}+b^{2}'],
    answer: 'B',
    explain: 'a^{2} 与 a^{4} 不能合并；同底数幂相乘指数相加，a^{3}·a^{3}=a^{6}；(a^{2})^{3}=a^{6}；(a+b)^{2} 还有 2ab 项。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-7', year: 2025, no: '第 7 题', part: '回忆版', lesson: 'fraction',
    stem: '某社区植树 60 棵，实际种植人数是原计划人数的 2 倍，实际平均每人种植棵树比原计划少了 3 棵．若设原计划人数为 x 人，则下列方程正确的是（　　）',
    options: ['60/x−60/(2x)=3', '60/(2x)−60/x=3', '60/x=2×60/(x+3)', '60/x=2×60/(x−3)'],
    answer: 'A',
    explain: '原计划人均 60/x 棵，实际人均 60/(2x) 棵，实际比原计划少 3 棵，即 60/x−60/(2x)=3。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-9', year: 2025, no: '第 9 题', part: '回忆版', lesson: 'equation',
    stem: '若关于 x 的方程 x+a=5 的解为 x=1，则 a=____．',
    answer: '4',
    explain: '把 x=1 代入方程得 1+a=5，所以 a=4。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-10', year: 2025, no: '第 10 题', part: '回忆版', lesson: 'symmetry',
    stem: '如图，将无人机沿着 x 轴向右平移 3 个单位，若无人机上一点 P 的坐标为 (1,2)，则平移后点 P 的坐标为____．',
    answer: '(4,2)',
    explain: '向右平移 3 个单位，横坐标加 3，纵坐标不变，(1+3,2)=(4,2)。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-11', year: 2025, no: '第 11 题', part: '回忆版', lesson: 'fraction',
    stem: '计算：a^{2}/(a+1)−1/(a+1)=____．',
    answer: 'a−1',
    explain: '同分母相减得 (a^{2}−1)/(a+1)=(a+1)(a−1)/(a+1)=a−1。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-12', year: 2025, no: '第 12 题', part: '回忆版', lesson: 'inverse',
    stem: '如图，同一平面直角坐标系下的正比例函数 y=ax 与反比例函数 y=(2−a)/x 相交于点 A 和点 B．若 A 的横坐标为 1，则 B 的坐标为____．',
    answer: '(−1,−1)',
    explain: 'x=1 时 a=2−a，得 a=1，A(1,1)。两函数图象都关于原点对称，所以 B(−1,−1)。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-13', year: 2025, no: '第 13 题', part: '回忆版', lesson: 'similar',
    stem: '如图，以矩形 ABCD 的 B 点为圆心，BC 的长为半径作⊙B，交 AB 于点 F，点 E 为 AD 上一点，连接 CE，将线段 CE 绕点 E 顺时针旋转至 EG，点 G 落在⊙B 上，且点 F 为 EG 中点．若 AF=1，AE=3，则 CD 的长为____．',
    answer: '6',
    explain: '圆周角 ∠G=45°，又 EG=EC，所以 ∠GEC=90°。△EAF∽△CDE，EF:CE=1:2，故 CD=2AE=6。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-14', year: 2025, no: '第 14 题', part: '回忆版', lesson: 'real',
    stem: '计算：√16+|−3|+(π−3.14)^{0}+(−1)^{2025}．',
    answer: '7',
    explain: '原式=4+3+1−1=7。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-15', year: 2025, no: '第 15 题', part: '回忆版，“方程组”是原文用词，实为不等式组', lesson: 'inequal',
    stem: '解一元一次方程组 2x≥x−1 ①，(1/2)(x+2)<3 ②，并在数轴上表示．\n解：由不等式①得：____，\n由不等式②得：____，\n在数轴上表示为：（数轴略）\n所以，原不等式组的解集为____．',
    answer: 'x≥−1；x<4；−1≤x<4（数轴上 −1 处实心、4 处空心）',
    explain: '①移项得 x≥−1；②两边乘 2 得 x+2<6，即 x<4；取公共部分。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-16-2', year: 2025, no: '第 16 题', part: '回忆版，第 (2) 问，表格已改为文字', lesson: 'data2',
    stem: '（2）为确定班会科技主题，从该班选择 7 名学生代表为“科技畅想”和“科技故事”打分，分数列表如下：\n科技畅想：10，9，9，3，6，9，10\n科技故事：9，10，7，8，6，8，8\n统计结果：\n科技畅想：平均数 a，中位数 b，众数 9\n科技故事：平均数 8，中位数 8，众数 c\n求表中的数据：a=____，b=____，c=____．',
    answer: 'a=8，b=9，c=8',
    explain: 'a=56/7=8；从小到大排 3，6，9，9，9，10，10，中间是 9；“科技故事”中 8 出现 3 次最多。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-17-1', year: 2025, no: '第 17 题', part: '回忆版，第 (1) 问，表格已改为文字', lesson: 'system',
    stem: '某学校采购体育用品，需要购买三种球类．已知某体育用品商店排球的单价为 30 元/个，篮球，足球的价格如下表：\n①篮球、足球、排球各买一个的价格为 140 元\n②购买 2 个足球的价格比购买一个篮球多花费 40 元\n③购买 5 个篮球与购买 6 个足球花费相同\n（1）请你从上述 3 个条件中任选 2 个作为条件，求出篮球和足球的单价；',
    answer: '每个篮球 60 元，每个足球 50 元',
    explain: '设篮球 x 元、足球 y 元，三个条件为 x+y+30=140、2y−x=40、5x=6y，任选两个联立都得 x=60，y=50。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-17-2', year: 2025, no: '第 17 题', part: '回忆版，第 (2) 问，表格已改为文字', lesson: 'linear',
    stem: '某学校采购体育用品，需要购买三种球类．已知某体育用品商店排球的单价为 30 元/个，篮球，足球的价格如下表：\n①篮球、足球、排球各买一个的价格为 140 元\n②购买 2 个足球的价格比购买一个篮球多花费 40 元\n③购买 5 个篮球与购买 6 个足球花费相同\n（2）若该学校要购买篮球，足球共 10 个，且足球的个数不超过篮球个数的 2 倍，请问购买多少个篮球时，花费最少，最少费用是多少？',
    answer: '购买 4 个篮球时花费最少，最少费用是 540 元',
    explain: '设买 m 个篮球，10−m≤2m 得 m≥10/3。费用 w=60m+50(10−m)=10m+500，随 m 增大而增大，m=4 时 w=540。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-19', year: 2025, no: '第 19 题', part: '回忆版，略去【总结反思】和示意图', lesson: 'quadfun',
    stem: '综合与实践\n【问题背景】排队是生活中常见的场景，如图，某数学小组针对某次演出，研究了排队人数与安检时间，安排通道数之间的关系．\n【研究条件】\n条件 1：观众进场立即排队安检，在任意时刻都满足：排队人数=现场总人数−已入场人数；\n条件 2：若该演出场地最多可开放 9 条安检通道，平均每条通道每分钟可安检 6 人．\n【模型构建】若该演出前 30 分钟开始进行安检，经研究发现，现场总人数 y 与安检时间 x 之间满足关系式：y=−x^{2}+60x+100(0≤x≤30)\n结合上述信息，请完成下述问题：\n（1）当开通 3 条安检通道时，安检时间 x 分钟时，已入场人数为____，排队人数 w 与安检时间 x 的函数关系式为____．\n【模型应用】\n（2）在（1）的条件下，排队人数在第几分钟达到最大值，最大人数为多少？\n（3）已知该演出主办方要求：\n①排队人数在安检开始 10 分钟内（包含 10 分钟）减少；\n②尽量少安排安检通道，以节省开支．\n若同时满足以上两个要求，可开设几条安检通道，请说明理由？',
    answer: '（1）18x；w=−x^{2}+42x+100\n（2）第 21 分钟达到最大值，最大人数为 541 人\n（3）7 条',
    explain: 'w=−(x−21)^{2}+541。开 m 条时 w=−x^{2}+(60−6m)x+100，对称轴 x=30−3m≤10，得 m≥20/3，取 7。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },
  {
    id: 'sz2025-20-1', year: 2025, no: '第 20 题', part: '回忆版，【问题解决】部分', lesson: 'similar',
    stem: '【问题解决】如图 3，在四边形 ABCD 中，AB=AC，AD=CD，∠D=∠BAC．求：\n①AD 与 BC 的位置关系为：____；\n②AC^{2}____AD·BC．（填“>”，“<”或“=”）',
    answer: '①AD∥BC；②=',
    explain: '两个等腰三角形顶角相等，底角也相等，△ABC∽△DAC，∠DAC=∠ACB，故 AD∥BC；由 AC/AD=BC/AC 得 AC^{2}=AD·BC。',
    src: 'http://imgs.app.gaokaozhitongche.com/resource/pdf/paper/202507/20250701063517_Peuwhs.pdf'
  },

  /* ---------- 2026（回忆版） ---------- */
  {
    id: 'sz2026-2', year: 2026, no: '第 2 题', part: '回忆版', lesson: 'rational',
    stem: '比赛用乒乓球的标准直径规定为 40mm，允许误差为 ±0.05mm．现随机抽取 4 个乒乓球进行检测，测得它们的直径（单位：mm）如下，其中符合标准的是（　　）',
    options: ['38.001', '39.001', '40.001', '41.001'],
    answer: 'C',
    explain: '合格范围是 39.95mm 到 40.05mm，只有 40.001 在这个范围内。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-3', year: 2026, no: '第 3 题', part: '回忆版', lesson: 'symmetry',
    stem: '孔明灯（又称天灯）是一种利用热空气上升原理制成的传统飞行器．如图，在平面直角坐标系中，一孔明灯初始位置为点 M(2,1)，若将该孔明灯向上平移 4 个单位长度，则平移后对应点 M′ 的坐标是（　　）',
    options: ['(2,−1)', '(2,5)', '(−2,1)', '(6,1)'],
    answer: 'B',
    explain: '向上平移 4 个单位，横坐标不变，纵坐标加 4，得 (2,5)。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-4', year: 2026, no: '第 4 题', part: '回忆版', lesson: 'power',
    stem: '下列运算正确的是（　　）',
    options: ['(ab)^{4}=a^{4}b^{4}', 'a^{3}·a^{4}=a^{12}', '(a+b)^{2}=a^{2}+b^{2}', '√((−2)^{2})=−2'],
    answer: 'A',
    explain: '积的乘方 A 正确；a^{3}·a^{4}=a^{7}；(a+b)^{2} 还有 2ab 项；√((−2)^{2})=2。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-10', year: 2026, no: '第 10 题', part: '回忆版', lesson: 'fraction',
    stem: '已知 (2a+b)/b=7，则 a/b 的值为____．',
    answer: '3',
    explain: '拆开得 2a/b+1=7，所以 2a/b=6，a/b=3。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-11', year: 2026, no: '第 11 题', part: '回忆版', lesson: 'trig',
    stem: '一天正午，太阳光与水平地面的夹角为 53°．身高为 1.6m 的小明站在水平地面上，此时他的影长为____．（参考数据：tan53°≈4/3，cos53°≈3/5，sin53°≈4/5）',
    answer: '1.2m',
    explain: '身高是对边，影长是邻边，tan53°=1.6/影长，影长=1.6÷(4/3)=1.2m。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-13', year: 2026, no: '第 13 题', part: '回忆版', lesson: 'para',
    stem: '如图，在菱形 ABCD 中，点 E 为边 BC 的中点，连接 AE，DE．若 AE=4，且 DE^{2}=AB·BE，则菱形 ABCD 的边长为____．',
    answer: '2√2',
    explain: '设边长 a，DE^{2}=a^{2}/2。作高用勾股定理，设 BH=x，得 AE^{2}=(5/4)a^{2}+ax=16，DE^{2}=(5/4)a^{2}−ax，解得 a^{2}=8。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-14', year: 2026, no: '第 14 题', part: '回忆版', lesson: 'real',
    stem: '计算：(π−1)^{0}+|√3−2|+(−1)^{2026}−√25．',
    answer: '−1−√3',
    explain: '原式=1+(2−√3)+1−5=−1−√3。注意 √3<2，绝对值要变号。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-15', year: 2026, no: '第 15 题', part: '回忆版', lesson: 'system',
    stem: '解二元一次方程组：x+2y=9，2x+3y=16．',
    answer: 'x=5，y=2',
    explain: '第一式乘 2 再减第二式，得 y=2，代入得 x=5。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-18', year: 2026, no: '第 18 题', part: '回忆版，第 (1)(2) 问', lesson: 'circle',
    stem: '如图，AB 是⊙O 的直径，点 C 是圆上一点，连接 OC 并延长至点 D，使得 ∠CBD=∠ACO．\n（1）求证：BD 是⊙O 的切线；\n（2）若 CD=4，BD=6，求 BC 的长；',
    answer: '（1）由 OA=OC 得 ∠ACO=∠OAC，所以 ∠CBD=∠OAC。AB 是直径，∠ACB=90°，∠OAC+∠ABC=90°，于是 ∠CBD+∠ABC=90°，即 ∠ABD=90°。OB 是半径，所以 BD 是⊙O 的切线。\n（2）BC=10√13/13',
    explain: 'r^{2}+6^{2}=(r+4)^{2}，得 r=5/2，OD=13/2。作 BT⊥OC，由△BOT∽△DOB 得 BT=30/13，CT=20/13，再用勾股定理。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-20-1', year: 2026, no: '第 20 题', part: '回忆版，第 (1)① 问', lesson: 'para',
    stem: '定义：若四边形的一条对角线被另一条对角线平分，且另一条对角线被交点分成的两条线段长度之比为 k(k≥1)，则称该四边形为“k 倍四边形”．\n（1）①如图 1，在▱ABCD 中，对角线 AC 与 BD 交于点 O，点 E 为 OB 中点．若四边形 AECD 为 k 倍四边形，则 k 的值为____；',
    answer: '2',
    explain: '平行四边形对角线互相平分，AO=CO，BO=DO。E 为 OB 中点，DO=2EO，所以 k=2。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-20-2', year: 2026, no: '第 20 题', part: '回忆版，第 (2) 问', lesson: 'triangle',
    stem: '定义：若四边形的一条对角线被另一条对角线平分，且另一条对角线被交点分成的两条线段长度之比为 k(k≥1)，则称该四边形为“k 倍四边形”．\n（2）如图 3，四边形 ABCD 为 k 倍四边形，其对角线 BD 平分对角线 AC，且满足 ∠BDC=2∠ABD，BD=4CD，求 k 的值；',
    answer: 'k=5/3',
    explain: '设交点 P，CD=a。作 AG∥CD 交 BD 于 G，△APG≌△CPD，AG=a，PG=PD。由角的关系得 BG=AG=a，GD=3a，k=BP/PD=5/3。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  },
  {
    id: 'sz2026-20-3', year: 2026, no: '第 20 题', part: '回忆版，第 (3) 问', lesson: 'similar',
    stem: '定义：若四边形的一条对角线被另一条对角线平分，且另一条对角线被交点分成的两条线段长度之比为 k(k≥1)，则称该四边形为“k 倍四边形”．\n（3）如图 4，已知定点 A，B，且 AB⊥BM，点 C 为射线 BM 上一动点，点 D 为平面内一点，连接 A，B，C，D 构成四边形 ABCD．若 BD 平分 AC，∠BAC=∠DAC，四边形 ABCD 为 2 倍四边形，求 tan∠ACD 的值．',
    answer: '√3/5 或 √15',
    explain: '设 AC、BD 交于 E，BE=AE=CE。分 BE:DE=2:1 和 1:2，过 B、D 作 AC 的垂线，由两组相似求出长度，再求正切。',
    src: 'https://m.renrendoc.com/paper/529982182.html'
  }
];
