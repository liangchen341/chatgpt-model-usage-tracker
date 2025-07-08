# ChatGPT 模型使用量统计脚本 (ChatGPT Model Usage Tracker)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.1-blue.svg)](https://github.com/your-username/your-repo)
[![Greasy Fork](https://img.shields.io/badge/Greasy_Fork-Install-green.svg)](https://greasyfork.org/scripts/your-script-id) 一个简单的 Tampermonkey 用户脚本，用于在 ChatGPT 网页版实时追踪并统计不同模型（如 GPT-4o, GPT-4, Deep Research 等）的使用次数。帮助你精细化管理 Plus 账户的资源，避免达到使用上限。

[English Version](./README.en.md) ---

### 🌟 项目背景

作为 ChatGPT Plus 的重度用户，我们经常在不同模型之间切换以应对不同任务：
* **GPT-4o**: 用于日常对话和快速响应。
* **GPT-4**: 用于事实核查和代码编写。
* **深度研究 (Deep Research)**: 用于文献调研和深入分析。

然而，Plus 账户对 GPT-4 和深度研究等模型有使用次数限制。为了清晰地了解自己的模型使用情况，避免在关键时刻因达到上限而中断工作，我开发了这款工具，用于在本地精准统计各项模型的使用次数。

### 🎨 功能截图

*脚本运行后，会在 ChatGPT 页面的右下角显示一个简洁的统计悬浮窗。*
> 一个示例截图大概会是这样：
> ```
> 📊 模型统计
> gpt-4o: 82
> deep_research: 5
> gpt-4: 23
> ```

### ✨ 主要特性

* **自动统计**: 无需任何手动操作，脚本会自动侦测并记录你的每一次模型调用。
* **精准识别**: 能准确区分 GPT-4o、GPT-4，并特别优化了对“深度研究”模式的识别。
* **本地存储**: 所有统计数据均保存在你浏览器的 `localStorage` 中，无任何外部数据传输，确保隐私安全。
* **界面简洁**: 在页面右下角显示一个非侵入式的小窗口，实时展示数据。
* **一键清零**: 只需单击统计窗口，即可在确认后清空所有历史数据，开始新的统计周期。
* **兼容性强**: 通过同时挂钩 `fetch` 和 `XHR` 请求，确保在不同网络请求模式下都能稳定工作。

### 🚀 安装与使用

只需两步，即可轻松完成部署。

#### 第一步：安装 Tampermonkey (油猴) 浏览器扩展

如果你的浏览器还未安装 Tampermonkey，请先通过以下链接安装：
* [Chrome 应用商店](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* [Firefox 附加组件](https://addons.mozilla.org/firefox/addon/tampermonkey/)
* [Microsoft Edge 附加组件](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
* [Safari 浏览器](https://www.tampermonkey.net/?browser=safari)

#### 第二步：安装本用户脚本

你有以下两种方式安装此脚本：

**1. (推荐) 从 Greasy Fork 安装**

点击下方的链接，Tampermonkey 会自动弹出安装界面，点击“安装”即可。
> **[👉 点击此处安装脚本](https://greasyfork.org/zh-CN/scripts/541989-chatgpt-model-usage-tracker-ultimate-dr)**

**2. 手动安装**

如果无法通过上述链接安装，可以手动创建脚本：
1.  打开 Tampermonkey 扩展的管理面板。
2.  点击“添加新脚本”选项卡。
3.  将项目中的 `chatgpt-usage-tracker.user.js` 文件的**全部内容**复制并粘贴到编辑器中，替换掉所有默认内容。
4.  按下 `Ctrl + S` (或 `Cmd + S`) 保存脚本。

#### 第三步：开始使用

安装完成后，打开或刷新 [ChatGPT 网站](https://chat.openai.com/) (或 https://chatgpt.com/)。

* 你会在页面的右下角看到一个 “📊 模型统计” 的小黑框。
* 当你每次与 ChatGPT 交互时，对应模型的计数会自动加 1。
* 若想清空数据，只需用鼠标**左键单击**该统计框，在弹出的对话框中点击“确定”即可。

### ⚠️ 重要：首次运行权限设置

在某些情况下，尤其是在基于 Chromium 的浏览器（如 Chrome, Edge）上，即使用户脚本已安装，它也可能不会立即运行。这是因为浏览器的安全机制需要您手动为 Tampermonkey 扩展授权，允许其在 ChatGPT 网站上运行。

请按照以下步骤检查并开启权限：

1.  **找到扩展管理选项**
    打开 [ChatGPT 网站](https://chat.openai.com/)，然后右键点击浏览器工具栏右上角的 Tampermonkey (油猴) 图标。在弹出的菜单中选择 **“管理扩展程序”**。

    ![右键点击油猴图标，选择管理扩展](image_3a15e0.png)
    > *提示：如果菜单中显示“无法读取或更改网站的数据”，则几乎肯定需要进行此项设置。*

2.  **开启“允许运行用户脚本”**
    在扩展程序的详细信息页面中，找到 **“允许运行用户脚本”** 的选项，并确保其右侧的开关处于 **开启（蓝色）** 状态。

    ![开启允许运行用户脚本的开关](image_3a15c3.png)
    > *请注意浏览器给出的安全提示。由于本脚本是开源的，您可以随时审查其代码以确认其安全性，它仅在 `chat.openai.com` 和 `chatgpt.com` 域名下运行，且所有数据都保存在本地。*

3.  **刷新页面**
    完成设置后，回到 ChatGPT 页面并刷新。脚本的统计窗口现在应该会正常显示在右下角了。

### 🛠️ 工作原理

本脚本的核心是通过“挂钩”(hook) 浏览器的原生网络请求功能来实现的：

1.  **拦截请求**: 脚本启动后，会替换掉原始的 `window.fetch` 和 `XMLHttpRequest.prototype.send` 方法。
2.  **过滤目标**: 当 ChatGPT 前端页面向后端API (`/backend-api/conversation` 或 `/v1/chat/completions`) 发送 POST 请求时，脚本会捕获这个动作。
3.  **解析数据**:
    * 对于普通模型，脚本会解析请求体 (payload) 中的 `model` 字段来确定模型名称（如 `gpt-4o`）。
    * 对于“深度研究”，它会检查请求体中是否存在 `system_hints: ["research"]` 这一特殊标识，并根据 `conversation_id` 进行去重，确保一个研究流程只被计数一次。
4.  **更新计数**: 识别到模型后，更新存储在浏览器 `localStorage` 中的计数值。
5.  **渲染界面**: 将最新的统计数据渲染到页面右下角的悬浮窗中。

整个过程完全在你的浏览器本地发生，快速且安全。

### 🤝 贡献与反馈

欢迎提交 Pull Request 或在 Issues 中提出你的建议和问题。如果你觉得这个脚本对你有帮助，请给这个项目一个 ⭐ Star！

### 📜 许可证

本项目采用 [MIT License](LICENSE) 开源。
