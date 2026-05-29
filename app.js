// MCU-FFT project dashboard: data, rendering, localStorage, CRUD and import/export.
const KEY = "mcu_fft_project_data_v3";
const STATUSES = ["待开始", "进行中", "待测试", "已完成", "有问题"];
const OWNERS = ["A", "B", "C"];
const PRIORITIES = ["高", "中", "低"];

const defaultData = {
  meta: {
    name: "MCU-FFT 速率榜项目管理平台",
    period: "2026.5.29 - 2026.6.12",
    target: "在自设计 MCU 上通过指令执行完成 8 点复数 FFT，并在保证输出正确和 WNS 为正的前提下，尽可能降低 cnt_test。",
    currentStage: "完整 FFT 仿真跑通与速度优化阶段",
  },
  progress: [
    { name: "FFT 算法模型", value: 70 },
    { name: "MCU 硬件设计", value: 50 },
    { name: "测试平台", value: 40 },
    { name: "报告展示", value: 20 },
  ],
  status: {
    当前版本: "V1 功能版",
    "FFT 仿真": "进行中",
    随机测试: "0/20",
    cnt_test: "待测",
    LUT: "待测",
    FF: "待测",
    WNS: "待测",
    上板状态: "未开始",
  },
  team: [
    {
      id: "A",
      title: "A：FFT 算法与汇编负责人",
      duties: ["8 点 FFT 算法推导", "DIT/DIF 方法选择", "Q15 定点模型", "旋转因子简化", "FFT 汇编伪代码", "汇编级优化", "输出正确性对齐"],
      deliverables: ["fft8_q15_model.py", "fft8_manual_formula.md", "fft8_speed.asm", "instruction_count.xlsx"],
      metrics: ["FFT 汇编总指令数", "MUL 次数", "LDR/STR 次数", "输出误差"],
    },
    {
      id: "B",
      title: "B：MCU 硬件与指令集负责人",
      duties: ["MCU 数据通路设计", "指令译码器", "ALU / MUL / ASR", "寄存器堆", "test_ROM / verify_RAM 接口", "cnt_test 控制", "综合与时序优化"],
      deliverables: ["mcu_top.v", "alu.v", "control_unit.v", "register_file.v", "instruction_set.md", "timing_report.pdf"],
      metrics: ["支持指令数量", "每条指令周期数", "LUT / FF", "WNS", "Fmax"],
    },
    {
      id: "C",
      title: "C：测试平台、上板与报告负责人",
      duties: ["testbench 搭建", "随机测试数据生成", "expected 输出生成", "自动比对", "ILA 信号规划", "上板流程", "报告和 PPT 整合"],
      deliverables: ["tb_mcu_fft.v", "generate_fft_case.py", "compare_result.py", "ila_signal_plan.md", "test_report.md", "final_report.docx"],
      metrics: ["随机测试通过率", "边界测试通过率", "上板验证状态", "cnt_test 记录"],
    },
  ],
  phases: [
    { name: "阶段 1", dates: "5.29 - 5.30", goal: "定路线、定接口、定指令集", days: ["5.29", "5.30"] },
    { name: "阶段 2", dates: "5.31 - 6.2", goal: "算法模型 + MCU 最小可运行版本", days: ["5.31", "6.1", "6.2"] },
    { name: "阶段 3", dates: "6.3 - 6.5", goal: "完整 FFT 仿真跑通", days: ["6.3", "6.4", "6.5"] },
    { name: "阶段 4", dates: "6.6 - 6.9", goal: "速度优化、综合、时序检查", days: ["6.6", "6.7", "6.8", "6.9"] },
    { name: "阶段 5", dates: "6.10 - 6.12", goal: "上板预演、报告、答辩准备", days: ["6.10", "6.11", "6.12"] },
  ],
  daily: {
    "5.29": { A: "整理 8 点 FFT 结构和旋转因子", B: "设计 MCU V1 指令集", C: "整理验收规则" },
    "5.30": { A: "完成浮点/Q15 数据格式", B: "冻结指令集和接口", C: "完成 testbench 框架" },
    "5.31": { A: "完成 Q15 手工 FFT 模型", B: "完成 PC/译码/寄存器/ALU 骨架", C: "完成随机数据和 expected 生成脚本" },
    "6.1": { A: "完成 FFT 伪汇编", B: "实现 LDR/STR/MUL/ASR", C: "接入 MCU 顶层并观察输出" },
    "6.2": { A: "完成完整 FFT 汇编 V1", B: "支持完整 FFT 汇编所需指令", C: "完成自动比对" },
    "6.3": { A: "定位算法输出错误", B: "定位硬件指令执行错误", C: "跑通完整 FFT 仿真" },
    "6.4": { A: "边界测试与随机测试", B: "修复有符号数/RAM/done 问题", C: "记录测试通过率" },
    "6.5": { A: "冻结算法 V1", B: "冻结 MCU V1", C: "记录 V1 cnt_test" },
    "6.6": { A: "减少访存和 MOV", B: "实现 MULQ15", C: "建立性能对比表" },
    "6.7": { A: "适配 MULQ15 汇编", B: "减少指令周期", C: "批量测试 V2/V3" },
    "6.8": { A: "配合时序调整算法", B: "综合和 Timing 检查", C: "整理资源/时序图表" },
    "6.9": { A: "冻结最终汇编", B: "冻结候选硬件", C: "准备上板 checklist" },
    "6.10": { A: "上板输出核对", B: "上板 ILA 调试", C: "上板预演" },
    "6.11": { A: "整理算法报告", B: "整理硬件报告", C: "整理测试报告和 PPT" },
    "6.12": { A: "最终材料打包和答辩预演", B: "最终材料打包和答辩预演", C: "最终材料打包和答辩预演" },
  },
  tasks: [
    task("实现 MULQ15 指令", "B", "6.6", "高", "待开始", ["完成 (x * 23170) >>> 15", "支持有符号数", "与 Python 模型 100 组随机测试一致", "不导致 WNS 为负"], ""),
    task("整理报告优化对比表", "C", "6.11", "中", "待开始", ["包含 V1/V2/V3/Final", "记录 cnt_test、LUT、FF、WNS"], ""),
    task("准备 ILA 信号规划", "C", "6.9", "高", "待开始", ["包含 test_vector_in、verify_RAM、cnt_test", "额外包含 PC、state、done"], ""),
    task("Q15 手工 FFT 模型", "A", "5.31", "高", "进行中", ["与 numpy FFT 缩放后结果一致", "与硬件右移、截断规则一致", "能生成 expected 输出文件"], ""),
    task("MCU 控制器状态机", "B", "6.1", "高", "进行中", ["支持取指、译码、执行、写回", "无多余空转状态"], ""),
    task("testbench 自动比对", "C", "6.2", "高", "进行中", ["可读 verify_RAM 输出", "可和 expected 自动比对", "输出错误位置"], ""),
    task("MUL 指令有符号乘法", "B", "6.3", "高", "待测试", ["正负数乘法正确", "结果位宽明确", "与 Python 模型一致"], ""),
    task("verify_RAM 写入顺序", "C", "6.3", "高", "待测试", ["X0_re 到 X7_im 顺序一致", "ILA 可观察 verify_addr"], ""),
    task("cnt_test 启停逻辑", "B/C", "6.3", "高", "待测试", ["第一个数据读入开始计数", "最后一个数据输出完成停止"], ""),
    task("验收规则整理", "C", "5.29", "中", "已完成", ["包含 ROM/RAM/cnt_test/ILA/Timing 要求"], ""),
    task("旋转因子表", "A", "5.29", "中", "已完成", ["包含 W8^0 到 W8^3", "包含 Q15 常数 23170"], ""),
    task("MCU 架构草图", "B", "5.29", "中", "已完成", ["包含 PC、ROM、Decoder、Register File、ALU、RAM"], ""),
    task("负数 ASR 结果和 Python 可能不一致", "A/B", "6.3", "高", "有问题", ["统一算术右移规则", "补充负数测试"], ""),
    task("输出 X1 和 X4 顺序需要确认", "A/C", "6.4", "中", "有问题", ["确认输出排列", "修正 expected 读取顺序"], ""),
    task("MULQ15 可能导致 WNS 为负", "B", "6.8", "高", "有问题", ["拆多周期或优化组合路径", "WNS 为正"], ""),
  ],
  versions: [
    version("V0", "5.30", "接口和指令集草案", "否", "-", "-", "-", "-"),
    version("V1", "6.5", "基础 FFT 正确版", "待测", "待填", "待填", "待填", "待填"),
    version("V2", "6.7", "汇编减少访存", "待测", "待填", "待填", "待填", "待填"),
    version("V3", "6.9", "加 MULQ15 优化", "待测", "待填", "待填", "待填", "待填"),
    version("Final", "6.12", "上板候选版", "待测", "待填", "待填", "待填", "待填"),
  ],
  tests: [
    test("全 0 输入", 1, 0, "待测"),
    test("单点脉冲", 1, 0, "待测"),
    test("常数序列", 1, 0, "待测"),
    test("正负交替", 1, 0, "待测"),
    test("小幅值随机", 20, 0, "待测"),
    test("大幅值随机", 20, 0, "待测"),
    test("现场模拟 coe", 5, 0, "待测"),
  ],
  risks: [
    risk("负数算术右移规则未完全确认", "高风险"),
    risk("MULQ15 尚未实现", "高风险"),
    risk("6.5 前必须完成完整 FFT 仿真", "高风险"),
    risk("WNS 可能因乘法路径过长而变为负", "中风险"),
    risk("cnt_test 启停规则如果错误会直接影响最终成绩", "高风险"),
  ],
  checklistItems: ["今天是否有可运行版本？", "A 的 FFT 汇编是否更新？", "B 的 MCU 指令是否变更？", "C 的 testbench 是否通过？", "当前 cnt_test 是否记录？", "当前 WNS 是否为正？", "当前最大风险是否更新？", "明天每个人任务是否明确？"],
  checklistByDate: {},
  docs: [
    docCategory("规则文件", ["课程设计 PPT", "验收规则整理", "排行榜评分规则"]),
    docCategory("算法资料", ["8 点 FFT 推导", "Q15 定点说明", "旋转因子表", "汇编优化记录"]),
    docCategory("硬件资料", ["MCU 架构图", "指令集表", "Verilog 模块说明", "资源报告", "Timing report"]),
    docCategory("测试资料", ["testbench 说明", "随机测试脚本", "ILA 信号规划", "上板流程", "测试结果截图"]),
    docCategory("报告材料", ["报告初稿", "PPT 初稿", "答辩问题", "最终展示材料"]),
  ],
};

function uid() { return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`; }
function task(title, owner, due, priority, status, acceptance, note) { return { id: uid(), title, owner, due, priority, status, acceptance, note }; }
function version(name, date, change, passed, cnt, lut, ff, wns) { return { id: uid(), name, date, change, passed, cnt, lut, ff, wns }; }
function test(type, total, passed, status) { return { id: uid(), type, total, passed, status }; }
function risk(text, level) { return { id: uid(), text, level, resolved: false }; }
function docCategory(name, items) { return { id: uid(), name, items: items.map((title) => ({ id: uid(), title, link: "" })) }; }

let data = loadData();
let searchTerm = "";

function loadData() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || structuredClone(defaultData);
  } catch {
    return structuredClone(defaultData);
  }
}

function saveData() {
  localStorage.setItem(KEY, JSON.stringify(data));
  showToast();
}

function showToast() {
  const toast = $("#toast");
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 900);
}

function $(selector) { return document.querySelector(selector); }
function $all(selector) { return [...document.querySelectorAll(selector)]; }
function escapeHtml(value) { return String(value ?? "").replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]); }
function matchText(...parts) { return !searchTerm || parts.join(" ").toLowerCase().includes(searchTerm); }
function markClass(...parts) { return searchTerm && matchText(...parts) ? " highlight" : ""; }

function renderAll() {
  renderDashboard();
  renderTeam();
  renderTimeline();
  renderTasks();
  renderResults();
  renderRisks();
  renderChecklist();
  renderDocs();
  renderSearchCount();
}

function renderDashboard() {
  $('[data-edit="meta.currentStage"]').textContent = data.meta.currentStage;
  const avg = Math.round(data.progress.reduce((s, p) => s + Number(p.value || 0), 0) / data.progress.length);
  $("#overallProgress").textContent = `${avg}%`;
  $("#moduleProgress").innerHTML = data.progress.map((p, i) => `
    <div class="progress-row">
      <div class="progress-label"><span>${p.name}</span><strong>${p.value}%</strong></div>
      <div class="progress-control">
        <div class="progress-track"><span style="width:${p.value}%"></span></div>
        <input type="number" min="0" max="100" value="${p.value}" data-progress="${i}" />
      </div>
    </div>`).join("");
  $("#statusGrid").innerHTML = Object.entries(data.status).map(([k, v]) => `
    <div class="status-row"><span>${k}</span><strong contenteditable="true" data-status="${k}">${escapeHtml(v)}</strong></div>`).join("");
  const date = $("#todayDate").value || "2026-05-31";
  const short = toShortDate(date);
  const today = data.daily[short] || data.daily["5.31"];
  $("#todayRows").innerHTML = OWNERS.map((o) => `<tr><td>${o}</td><td>${today[o] || ""}</td><td>${o === "B" ? "未开始" : "进行中"}</td></tr>`).join("");
  $("#riskSummary").innerHTML = data.risks.filter((r) => !r.resolved).slice(0, 4).map((r) => `<li>${escapeHtml(r.text)}</li>`).join("");
}

function toShortDate(value) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "5.31";
  return `${d.getMonth() + 1}.${d.getDate()}`;
}

function renderTeam() {
  $("#teamCards").innerHTML = data.team.map((m, i) => `
    <details class="card team-card${markClass(m.title, m.duties, m.deliverables, m.metrics)}" ${i === 0 ? "open" : ""}>
      <summary>${m.title}</summary>
      <div class="team-detail">
        ${subbox("职责", m.duties)}
        ${subbox("交付物", m.deliverables.map((x) => `<code>${x}</code>`))}
        ${subbox("关键指标", m.metrics)}
      </div>
    </details>`).join("");
}

function subbox(title, items) { return `<div class="subbox"><h4>${title}</h4><ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul></div>`; }

function renderTimeline() {
  $("#timelineList").innerHTML = data.phases.map((phase) => `
    <details class="card phase-card" open>
      <summary>${phase.name}：${phase.dates}　${phase.goal}</summary>
      <div class="phase-body table-wrap">
        <table><thead><tr><th>日期</th><th>A</th><th>B</th><th>C</th></tr></thead>
        <tbody>${phase.days.map((d) => `<tr><td>${d}</td><td>${data.daily[d]?.A || ""}</td><td>${data.daily[d]?.B || ""}</td><td>${data.daily[d]?.C || ""}</td></tr>`).join("")}</tbody></table>
      </div>
    </details>`).join("");
}

function filteredTasks() {
  const owner = $("#filterOwner").value;
  const priority = $("#filterPriority").value;
  const status = $("#filterStatus").value;
  return data.tasks.filter((t) =>
    (owner === "all" || t.owner.includes(owner)) &&
    (priority === "all" || t.priority === priority) &&
    (status === "all" || t.status === status) &&
    matchText(t.title, t.note, t.acceptance.join(" "))
  );
}

function renderTasks() {
  const tasks = filteredTasks();
  $("#kanban").innerHTML = STATUSES.map((status) => {
    const list = tasks.filter((t) => t.status === status);
    return `<section class="kanban-col"><h3>${status}<span class="count">${list.length}</span></h3>${list.map(taskCard).join("") || "<p class='placeholder'>暂无任务</p>"}</section>`;
  }).join("");
}

function taskCard(t) {
  const priClass = t.priority === "高" ? "priority-high" : t.priority === "中" ? "priority-mid" : "priority-low";
  return `<article class="task-card ${priClass}${markClass(t.title, t.note, t.acceptance.join(" "))}">
    <h4>${escapeHtml(t.title)}</h4>
    <p><strong>负责人：</strong>${escapeHtml(t.owner)}　<strong>截止：</strong>${escapeHtml(t.due)}　<strong>优先级：</strong>${t.priority}</p>
    <p><strong>验收标准：</strong>${t.acceptance.map(escapeHtml).join("；") || "待补充"}</p>
    <p><strong>备注：</strong>${escapeHtml(t.note || "无")}</p>
    <div class="task-actions">
      <button class="btn" onclick="openTask('${t.id}')">编辑</button>
      <button class="btn danger" onclick="deleteTask('${t.id}')">删除</button>
      <button class="btn" onclick="moveTask('${t.id}', -1)">上一状态</button>
      <button class="btn" onclick="moveTask('${t.id}', 1)">下一状态</button>
      <button class="btn" onclick="highPriority('${t.id}')">高优先级</button>
    </div>
  </article>`;
}

function renderResults() {
  const numericVersions = data.versions.filter((v) => Number.isFinite(Number(v.cnt)));
  const fastest = numericVersions.sort((a, b) => Number(a.cnt) - Number(b.cnt))[0];
  $("#fastestVersion").textContent = fastest ? `当前最快：${fastest.name} (${fastest.cnt})` : "当前最快：待测";
  $("#versionTable").innerHTML = data.versions.map((v, row) => {
    const wnsRisk = Number(v.wns) < 0;
    const fastestMark = fastest?.id === v.id ? " 当前最快" : "";
    return `<tr class="${wnsRisk ? "wns-risk" : ""}">
      ${["name","date","change","passed","cnt","lut","ff","wns"].map((key) => `<td><input class="table-input" data-version="${row}" data-field="${key}" value="${escapeHtml(v[key])}" /></td>`).join("")}
      <td>${statusTag(v.passed)}${wnsRisk ? " <span class='tag tag-risk'>时序风险</span>" : ""}${fastestMark ? `<span class="tag tag-pass">${fastestMark}</span>` : ""}<br><button class="btn danger" onclick="deleteVersion('${v.id}')">删除</button></td>
    </tr>`;
  }).join("");
  $("#testTable").innerHTML = data.tests.map((t, row) => {
    const rate = Number(t.total) ? Math.round((Number(t.passed) / Number(t.total)) * 100) : 0;
    const cls = rate === 100 ? "rate-ok" : rate > 0 ? "rate-mid" : "rate-bad";
    return `<tr>
      ${["type","total","passed","status"].map((key) => `<td><input class="table-input" data-test="${row}" data-field="${key}" value="${escapeHtml(t[key])}" /></td>`).join("")}
      <td><span class="tag ${cls}">${rate}%</span></td>
    </tr>`;
  }).join("");
}

function statusTag(value) {
  const cls = value === "是" || value === "通过" ? "tag-pass" : value === "否" || value === "失败" ? "tag-fail" : "tag-wait";
  return `<span class="tag ${cls}">${escapeHtml(value)}</span>`;
}

function renderRisks() {
  $("#riskCards").innerHTML = data.risks.map((r) => {
    const cls = r.level === "高风险" ? "risk-high" : r.level === "中风险" ? "risk-mid" : "risk-low";
    return `<article class="card risk-card ${cls} ${r.resolved ? "resolved" : ""}${markClass(r.text)}">
      <h3>${escapeHtml(r.text)}</h3>
      <label>等级<select data-risk-level="${r.id}">${["高风险","中风险","低风险"].map((x) => `<option ${x === r.level ? "selected" : ""}>${x}</option>`).join("")}</select></label>
      <div class="risk-actions">
        <button class="btn" onclick="toggleRisk('${r.id}')">${r.resolved ? "恢复风险" : "标记已解决"}</button>
        <button class="btn danger" onclick="deleteRisk('${r.id}')">删除</button>
      </div>
    </article>`;
  }).join("");
}

function renderChecklist() {
  const date = $("#checkDate").value || "2026-05-31";
  data.checklistByDate[date] ||= {};
  $("#checklistItems").innerHTML = data.checklistItems.map((item, i) => {
    const checked = data.checklistByDate[date][i];
    return `<label class="check-item ${checked ? "done" : ""}"><input type="checkbox" data-check="${i}" ${checked ? "checked" : ""}/><span>${escapeHtml(item)}</span><button class="btn danger" onclick="deleteCheck(${i})">删除</button></label>`;
  }).join("");
}

function renderDocs() {
  $("#docsGrid").innerHTML = data.docs.map((cat) => `<article class="card doc-card${markClass(cat.name, cat.items.map((d) => d.title).join(" "))}">
    <h3>${cat.name}</h3>
    <div class="doc-list">${cat.items.map((d) => `<div class="doc-item">${d.link ? `<a href="${escapeHtml(d.link)}" target="_blank" rel="noreferrer">${escapeHtml(d.title)}</a>` : `<span class="placeholder">${escapeHtml(d.title)}（未添加链接）</span>`}<button class="btn danger" onclick="deleteDoc('${cat.id}','${d.id}')">删除</button></div>`).join("")}</div>
    <div class="doc-actions"><button class="btn" onclick="openDoc('${cat.id}')">新增文档</button></div>
  </article>`).join("");
}

function renderSearchCount() {
  if (!searchTerm) { $("#searchCount").textContent = "搜索结果：0"; return; }
  const count = data.tasks.filter((t) => matchText(t.title, t.note, t.acceptance.join(" "))).length +
    data.risks.filter((r) => matchText(r.text)).length +
    data.docs.flatMap((c) => c.items).filter((d) => matchText(d.title, d.link)).length +
    data.versions.filter((v) => matchText(v.change, v.name)).length;
  $("#searchCount").textContent = `搜索结果：${count}`;
}

function bindEvents() {
  $("#globalSearch").addEventListener("input", (e) => { searchTerm = e.target.value.trim().toLowerCase(); renderAll(); });
  $("#clearSearch").addEventListener("click", () => { $("#globalSearch").value = ""; searchTerm = ""; renderAll(); });
  $("#todayDate").value = "2026-05-31";
  $("#checkDate").value = "2026-05-31";
  $("#todayDate").addEventListener("change", renderDashboard);
  $("#checkDate").addEventListener("change", renderChecklist);
  $("[data-edit='meta.currentStage']").addEventListener("blur", (e) => { data.meta.currentStage = e.target.textContent.trim(); saveData(); });
  $("#moduleProgress").addEventListener("input", (e) => { if (e.target.dataset.progress) { data.progress[e.target.dataset.progress].value = clamp(e.target.value); saveData(); renderDashboard(); } });
  $("#statusGrid").addEventListener("blur", (e) => { if (e.target.dataset.status) { data.status[e.target.dataset.status] = e.target.textContent.trim(); saveData(); renderDashboard(); } }, true);
  ["filterOwner","filterPriority","filterStatus"].forEach((id) => $(`#${id}`).addEventListener("change", renderTasks));
  $("#addTaskBtn").addEventListener("click", () => openTask());
  $("#taskForm").addEventListener("submit", saveTaskFromForm);
  $("#cancelTask").addEventListener("click", () => $("#taskDialog").close());
  $("#versionTable").addEventListener("input", editVersion);
  $("#testTable").addEventListener("input", editTest);
  $("#addVersionBtn").addEventListener("click", () => { data.versions.push(version("新版本", "", "待填写", "待测", "待填", "待填", "待填", "待填")); saveData(); renderResults(); });
  $("#addRiskBtn").addEventListener("click", () => openRisk());
  $("#riskForm").addEventListener("submit", saveRiskFromForm);
  $("#cancelRisk").addEventListener("click", () => $("#riskDialog").close());
  $("#riskCards").addEventListener("change", (e) => { if (e.target.dataset.riskLevel) { data.risks.find((r) => r.id === e.target.dataset.riskLevel).level = e.target.value; saveData(); renderRisks(); } });
  $("#checklistItems").addEventListener("change", (e) => { if (e.target.dataset.check) { const d = $("#checkDate").value; data.checklistByDate[d] ||= {}; data.checklistByDate[d][e.target.dataset.check] = e.target.checked; saveData(); renderChecklist(); } });
  $("#addCheckBtn").addEventListener("click", addCheck);
  $("#docForm").addEventListener("submit", saveDocFromForm);
  $("#cancelDoc").addEventListener("click", () => $("#docDialog").close());
  $("#exportBtn").addEventListener("click", exportJson);
  $("#importFile").addEventListener("change", importJson);
  $("#resetBtn").addEventListener("click", resetData);
}

function clamp(value) { return Math.max(0, Math.min(100, Number(value) || 0)); }

function openTask(id) {
  const t = id ? data.tasks.find((x) => x.id === id) : task("", "A", "", "高", "待开始", [], "");
  $("#taskDialogTitle").textContent = id ? "编辑任务" : "新增任务";
  $("#taskId").value = id || "";
  $("#taskTitle").value = t.title;
  $("#taskOwner").value = t.owner;
  $("#taskDue").value = t.due;
  $("#taskPriority").value = t.priority;
  $("#taskStatus").value = t.status;
  $("#taskAcceptance").value = t.acceptance.join("\n");
  $("#taskNote").value = t.note || "";
  $("#taskDialog").showModal();
}

function saveTaskFromForm(e) {
  e.preventDefault();
  const id = $("#taskId").value;
  const payload = {
    id: id || uid(),
    title: $("#taskTitle").value.trim(),
    owner: $("#taskOwner").value.trim(),
    due: $("#taskDue").value.trim(),
    priority: $("#taskPriority").value,
    status: $("#taskStatus").value,
    acceptance: $("#taskAcceptance").value.split("\n").map((x) => x.trim()).filter(Boolean),
    note: $("#taskNote").value.trim(),
  };
  if (id) data.tasks[data.tasks.findIndex((t) => t.id === id)] = payload; else data.tasks.push(payload);
  $("#taskDialog").close();
  saveData();
  renderTasks();
}

function deleteTask(id) { if (confirm("确认删除这个任务？")) { data.tasks = data.tasks.filter((t) => t.id !== id); saveData(); renderTasks(); } }
function moveTask(id, step) { const t = data.tasks.find((x) => x.id === id); const i = STATUSES.indexOf(t.status); t.status = STATUSES[Math.max(0, Math.min(STATUSES.length - 1, i + step))]; saveData(); renderTasks(); }
function highPriority(id) { data.tasks.find((t) => t.id === id).priority = "高"; saveData(); renderTasks(); }

function editVersion(e) { const row = e.target.dataset.version; if (row !== undefined) { data.versions[row][e.target.dataset.field] = e.target.value; saveData(); renderResults(); } }
function deleteVersion(id) { if (confirm("确认删除这个版本？")) { data.versions = data.versions.filter((v) => v.id !== id); saveData(); renderResults(); } }
function editTest(e) { const row = e.target.dataset.test; if (row !== undefined) { data.tests[row][e.target.dataset.field] = e.target.value; saveData(); renderResults(); } }

function openRisk(id) {
  const r = id ? data.risks.find((x) => x.id === id) : risk("", "高风险");
  $("#riskId").value = id || "";
  $("#riskText").value = r.text;
  $("#riskLevel").value = r.level;
  $("#riskDialog").showModal();
}
function saveRiskFromForm(e) {
  e.preventDefault();
  const id = $("#riskId").value;
  const payload = { id: id || uid(), text: $("#riskText").value.trim(), level: $("#riskLevel").value, resolved: id ? data.risks.find((r) => r.id === id).resolved : false };
  if (id) data.risks[data.risks.findIndex((r) => r.id === id)] = payload; else data.risks.push(payload);
  $("#riskDialog").close();
  saveData();
  renderRisks(); renderDashboard();
}
function toggleRisk(id) { const r = data.risks.find((x) => x.id === id); r.resolved = !r.resolved; saveData(); renderRisks(); renderDashboard(); }
function deleteRisk(id) { if (confirm("确认删除这个风险？")) { data.risks = data.risks.filter((r) => r.id !== id); saveData(); renderRisks(); renderDashboard(); } }

function addCheck() { const value = $("#newCheckText").value.trim(); if (!value) return; data.checklistItems.push(value); $("#newCheckText").value = ""; saveData(); renderChecklist(); }
function deleteCheck(index) { data.checklistItems.splice(index, 1); Object.values(data.checklistByDate).forEach((day) => delete day[index]); saveData(); renderChecklist(); }

function openDoc(categoryId) { $("#docCategory").value = categoryId; $("#docName").value = ""; $("#docLink").value = ""; $("#docDialog").showModal(); }
function saveDocFromForm(e) {
  e.preventDefault();
  const cat = data.docs.find((c) => c.id === $("#docCategory").value);
  cat.items.push({ id: uid(), title: $("#docName").value.trim(), link: $("#docLink").value.trim() });
  $("#docDialog").close();
  saveData(); renderDocs();
}
function deleteDoc(catId, docId) { const cat = data.docs.find((c) => c.id === catId); cat.items = cat.items.filter((d) => d.id !== docId); saveData(); renderDocs(); }

function exportJson() {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "project-data.json"; a.click();
  URL.revokeObjectURL(url);
}
function importJson(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      data = JSON.parse(reader.result);
      saveData(); renderAll();
    } catch {
      alert("JSON 文件格式不正确");
    }
  };
  reader.readAsText(file);
}
function resetData() { if (confirm("确认恢复默认数据？当前修改会被覆盖。")) { data = structuredClone(defaultData); saveData(); renderAll(); } }

bindEvents();
renderAll();
