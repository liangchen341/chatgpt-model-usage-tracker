// ==UserScript==
// @name         ChatGPT Model Usage Tracker (ultimate+DR)
// @namespace    https://example.local
// @version      3.1
// @description  本地统计 ChatGPT 各模型与 Deep Research 使用次数（兼容 fetch + XHR，无需开发者模式）
// @match        https://chat.openai.com/*
// @match        https://chatgpt.com/*
// @run-at       document-start
// @grant        unsafeWindow
// ==/UserScript==

(() => {
  /******************** 0. 配置 ************************/
  const KEY       = '__cgpt_usage__';                       // localStorage 键
  const MATCH_RE  = /(\/backend-api\/.*conversation|completions$)|\/v1\/chat\/completions/;
  const seenDR    = new Set();                              // 已计数过的 Deep Research conversation_id

  /******************** 1. 数据层 **********************/
  const stats = JSON.parse(localStorage.getItem(KEY) || '{}');
  const bump  = (m) => {
    stats[m] = (stats[m] || 0) + 1;
    localStorage.setItem(KEY, JSON.stringify(stats));
    render();
  };

  /******************** 2. UI 层 ***********************/
  let box;
  const mountUI = () => {
    if (!document.body || (box && document.body.contains(box))) return;
    box = document.createElement('div');
    Object.assign(box.style, {
      position:'fixed', right:'16px', bottom:'16px', zIndex:99999,
      background:'rgba(0,0,0,.78)', color:'#fff', font:'13px/1.4 monospace',
      padding:'8px 14px', borderRadius:'8px', whiteSpace:'pre-wrap',
      userSelect:'none', cursor:'pointer', maxWidth:'280px'
    });
    box.onclick = () => {
      if (confirm('清空统计数据？')) {
        for (const k in stats) delete stats[k];
        localStorage.setItem(KEY,'{}');
        render();
      }
    };
    document.body.appendChild(box);
    render();
  };
  const render = () => {
    if (!box) return;
    box.textContent = '📊 模型统计\n' +
      (Object.keys(stats).length
        ? Object.entries(stats)
            .sort((a,b)=>b[1]-a[1])
            .map(([m,c])=>`${m}: ${c}`).join('\n')
        : '暂无数据');
  };
  document.addEventListener('DOMContentLoaded', mountUI);
  setInterval(mountUI, 3000);      // 保活，防路由卸载

  /******************** 3. 捕获 fetch ******************/
  const origFetch = unsafeWindow.fetch;
  unsafeWindow.fetch = async function(input, init = {}) {
    hookRequest(typeof input === 'string' ? input : input.url, init.body || input.body);
    return origFetch.apply(this, arguments);
  };

  /******************** 4. 捕获 XHR ********************/
  (function() {
    const origOpen = XMLHttpRequest.prototype.open;
    const origSend = XMLHttpRequest.prototype.send;
    const urlHolder = new WeakMap();

    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      urlHolder.set(this, {method, url});
      return origOpen.call(this, method, url, ...rest);
    };
    XMLHttpRequest.prototype.send = function(body) {
      const info = urlHolder.get(this);
      if (info && info.method?.toUpperCase() === 'POST' && MATCH_RE.test(info.url))
        hookRequest(info.url, body);
      return origSend.call(this, body);
    };
  })();

  /******************** 5. 通用解析函数 ****************/
  async function hookRequest(url, body) {
    if (!MATCH_RE.test(url)) return;

    try {
      const txt = await bodyToString(body);
      if (!txt) return;
      const payload = JSON.parse(txt);

      /* ---------- A. Deep Research 侦测 ---------- */
      if (Array.isArray(payload.system_hints) &&
          payload.system_hints.includes('research')) {

        const cid = payload.conversation_id;
        if (cid && !seenDR.has(cid)) {        // 首次遇到该 DR 流程
          bump('deep_research');
          seenDR.add(cid);
          console.log('[USAGE-TRACKER] catch deep_research', cid);
        }
        return;                               // 终止，避免被普通模型再计数
      }

      /* ---------- B. 普通模型计数 ---------- */
      let model = payload.model || 'unknown';

      // 若请求体没带 model，就尝试从页面 UI 猜测
      if (model === 'unknown') {
        model =
          document.querySelector('div.truncate.text-sm a.flex')?.innerText?.trim() ||
          document.querySelector('h1.text-lg.font-medium')?.innerText?.trim() ||
          model;
      }
      bump(model);
      console.log('[USAGE-TRACKER] catch', model);

    } catch (_) { /* ignore */ }
  }

  function bodyToString(b) {
    if (!b) return '';
    if (typeof b === 'string') return b;
    if (b instanceof FormData || b instanceof URLSearchParams) return b.toString();
    if (b?.clone) return b.clone().text();
    return '';
  }

  console.log('[USAGE-TRACKER] ultimate+DR version injected');
})();
