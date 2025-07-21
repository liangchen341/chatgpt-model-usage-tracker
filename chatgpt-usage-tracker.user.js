// ==UserScript==
// @name         ChatGPT Model Usage Tracker (ultimate+DR+Agent) v3.6
// @namespace    https://example.local
// @version      3.6
// @description  本地统计 ChatGPT 各模型、Deep‑Research、Agent‑mode 总量 + 当日增量（按本地时区归零）
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(() => {
  /******************** 0. 配置 ************************/
  const KEY_TOTAL   = '__cgpt_usage__';
  const KEY_DAILY   = '__cgpt_usage_daily__';
  const KEY_DAYFLAG = '__cgpt_usage_day__';

  const seenDR      = new Set();
  const seenAgent   = new Set();   // NEW: 记录已计数的 agent 会话
  const seenMessage = new Set();

  /******************** 1. 数据层 **********************/
  const stats  = JSON.parse(localStorage.getItem(KEY_TOTAL)   || '{}');
  let   daily  = JSON.parse(localStorage.getItem(KEY_DAILY)   || '{}');
  let   dayFlag = localStorage.getItem(KEY_DAYFLAG) || '';

  const todayStr = () => new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const ensureToday = () => {
    const now = todayStr();
    if (now !== dayFlag) {
      dayFlag = now;
      daily   = {};
      localStorage.setItem(KEY_DAILY,   JSON.stringify(daily));
      localStorage.setItem(KEY_DAYFLAG, dayFlag);
    }
  };

  const bump = (model) => {
    ensureToday();
    stats[model] = (stats[model] || 0) + 1;
    daily[model] = (daily[model] || 0) + 1;
    localStorage.setItem(KEY_TOTAL, JSON.stringify(stats));
    localStorage.setItem(KEY_DAILY, JSON.stringify(daily));
    render();
  };

  /******************** 2. UI *************************/
  let box;
  const mountUI = () => {
    if (!document.body || (box && document.body.contains(box))) return;
    box = document.createElement('div');
    Object.assign(box.style, {
      position:'fixed', right:'16px', bottom:'16px', zIndex:99999,
      background:'rgba(0,0,0,.78)', color:'#fff', font:'13px/1.4 monospace',
      padding:'8px 14px', borderRadius:'8px', whiteSpace:'pre-wrap',
      userSelect:'none', cursor:'pointer', maxWidth:'300px'
    });
    box.onclick = () => {
      if (confirm('清空统计数据？')) {
        for (const k in stats) delete stats[k];
        for (const k in daily) delete daily[k];
        localStorage.setItem(KEY_TOTAL,'{}');
        localStorage.setItem(KEY_DAILY,'{}');
        render();
      }
    };
    document.body.appendChild(box);
    render();
  };

  const render = () => {
    if (!box) return;
    ensureToday();
    const arrow = '▲';
    const green = (txt) => `<span style="color:#4caf50">${txt}</span>`;
    const lines = Object.keys(stats).length
      ? Object.entries(stats)
          .sort((a,b)=>b[1]-a[1])
          .map(([m,c])=>{
            const inc = daily[m] ? ` ${green(arrow + '(+' + daily[m] + ')')}` : '';
            return `${m}: ${c}${inc}`;
          })
      : ['暂无数据'];
    box.innerHTML = '📊 模型统计<br>' + lines.join('<br>');
  };

  document.addEventListener('DOMContentLoaded', mountUI);
  setInterval(mountUI, 3000);

  /******************** 3. fetch/XHR 拦截（与 v3.5 相同） ********************/
  const origFetch = unsafeWindow.fetch;
  unsafeWindow.fetch = async function(input, init = {}) {
    const req = input instanceof Request ? input : new Request(input, init);
    if (req.method !== 'POST' || req.url.startsWith('chrome-extension')) {
      return origFetch.apply(this, arguments);
    }
    let bodyStr = '';
    try { bodyStr = await req.clone().text(); } catch(_) {}
    hook(bodyStr);
    return origFetch.apply(this, arguments);
  };

  (function() {
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    const urlCache = new WeakMap();

    XMLHttpRequest.prototype.open = function(m,u,...rest) {
      urlCache.set(this, {method:m,url:u});
      return origOpen.call(this, m, u, ...rest);
    };
    XMLHttpRequest.prototype.send = function(body) {
      const {method} = urlCache.get(this) || {};
      if (method?.toUpperCase() === 'POST') {
        readBody(body).then(hook);
      }
      return origSend.call(this, body);
    };
  })();

  /******************** 5. 主逻辑 **********************/
  async function hook(bodyStr){
    if (!bodyStr) return;

    let payload;
    try { payload = JSON.parse(bodyStr); } catch { return; }

    /*** 1️⃣ Agent‑mode ***************************************************/
    // NEW: 如果 system_hints 含 agent，且是用户发起的第一条，就记一次
    if (Array.isArray(payload.system_hints) &&
        payload.system_hints.includes('agent')) {

      const firstMsg = payload.messages?.[0];
      const role = firstMsg?.author?.role ?? firstMsg?.role;
      if (role !== 'user') return;          // 后台请求，直接忽略


      // conversation_id 为 null 时退回到首条消息的 id
      const key = payload.conversation_id || firstMsg?.id;
      if (key && !seenAgent.has(key)) {
        bump('agent_mode');
        seenAgent.add(key);
      }
      return; // **重要**：不要再落入普通 model 计数，避免重复
    }

    /*** 2️⃣ Deep‑Research（逻辑保持不变，但移到 Agent 检测之后） ***/
    if (Array.isArray(payload.system_hints) &&
        payload.system_hints.includes('research')) {

      const firstMsg = payload.messages?.[0];
      const role = firstMsg?.author?.role ?? firstMsg?.role;
      if (role !== 'user') return;          // 后台请求，直接忽略

      const cid = payload.conversation_id;
      if (cid && !seenDR.has(cid)) {
        bump('deep_research');
        seenDR.add(cid);
      }
      return;
    }

    /*** 3️⃣ 普通模型调用 **************************************************/
    if (!payload.model) return;

    const firstMsg = payload.messages?.[0];
    if (!firstMsg) return;

    const role  = firstMsg.author?.role ?? firstMsg.role;
    const parts = firstMsg.content?.parts;
    if (role !== 'user')       return;
    if (!Array.isArray(parts) || parts.length === 0) return;

    const msgId = firstMsg.id;
    if (msgId && seenMessage.has(msgId)) return;
    if (msgId) seenMessage.add(msgId);

    bump(payload.model);
  }

  async function readBody(b){
    if (!b) return '';
    if (typeof b === 'string') return b;
    if (b instanceof FormData || b instanceof URLSearchParams) return b.toString();
    if (b?.clone) {
      try { return await b.clone().text(); } catch {}
    }
    return '';
  }

  console.log('[USAGE-TRACKER] v3.6 injected');
})();
