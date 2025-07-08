# ChatGPT Model Usage Tracker

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-3.1-blue.svg)](https://github.com/your-username/your-repo)
[![Greasy Fork](https://img.shields.io/badge/Greasy_Fork-Install-green.svg)](https://greasyfork.org/en/scripts/541989-chatgpt-model-usage-tracker-ultimate-dr)

A simple Tampermonkey userscript to track and count the usage of different models (like GPT-4o, GPT-4, Deep Research, etc.) in real-time on the ChatGPT website. It helps you manage your Plus account resources effectively and avoid hitting usage limits.

[中文版 (Chinese Version)](./README.md)

---

### 🌟 Background

As heavy users of ChatGPT Plus, we frequently switch between different models for various tasks:
* **GPT-4o**: For daily conversations and quick responses.
* **GPT-4**: For fact-checking and code writing.
* **Deep Research**: For literature reviews and in-depth analysis.

However, Plus accounts have usage limits for models like GPT-4 and Deep Research. To clearly understand my model usage and avoid interruptions at critical moments due to reaching these limits, I developed this tool to accurately track the usage counts for each model locally.

### 🎨 Screenshot

*After the script is running, a clean and simple statistics panel will appear in the bottom-right corner of the ChatGPT page.*

> An example screenshot would look something like this:
> ```
> 📊 Model Stats
> gpt-4o: 82
> deep_research: 5
> gpt-4: 23
> ```

### ✨ Features

* **Automatic Tracking**: Works silently in the background to detect and log every model call without any manual intervention.
* **Accurate Identification**: Precisely distinguishes between GPT-4o, GPT-4, and is specially optimized to recognize the "Deep Research" mode.
* **Local Storage**: All statistics are saved in your browser's `localStorage`. No data is sent externally, ensuring your privacy.
* **Clean Interface**: Displays a non-intrusive floating window in the bottom-right corner with real-time data.
* **One-Click Reset**: Simply click the statistics window to clear all historical data after a confirmation prompt, allowing you to start a new tracking cycle.
* **High Compatibility**: Works reliably by hooking both `fetch` and `XHR` requests, ensuring stability across different network configurations.

### 🚀 Installation and Usage

You can get it running in just two simple steps.

#### Step 1: Install the Tampermonkey Browser Extension

If you don't already have Tampermonkey installed, please install it from the links below:
* [Chrome Web Store](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
* [Firefox Browser ADD-ONS](https://addons.mozilla.org/firefox/addon/tampermonkey/)
* [Microsoft Edge Add-ons](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd)
* [Safari](https://www.tampermonkey.net/?browser=safari)

#### Step 2: Install This Userscript

You can install this script in one of two ways:

**1. (Recommended) Install from Greasy Fork**

Click the link below, and Tampermonkey will automatically open an installation tab. Just click "Install" to finish.
> **[👉 Click here to install the script](https://greasyfork.org/en/scripts/541989-chatgpt-model-usage-tracker-ultimate-dr)**

**2. Manual Installation**

If you cannot install via the link above, you can create the script manually:
1.  Open the Tampermonkey extension's dashboard.
2.  Click on the "Add a new script..." tab (the `+` icon).
3.  Copy the **entire content** of the `chatgpt-usage-tracker.user.js` file from this project and paste it into the editor, replacing all the default text.
4.  Press `Ctrl + S` (or `Cmd + S` on Mac) to save the script.

#### Step 3: Start Using

Once installed, open or refresh the [ChatGPT website](https://chat.openai.com/) (or https://chatgpt.com/).

* You will see a small black box labeled "📊 Model Stats" in the bottom-right corner of the page.
* Each time you interact with ChatGPT, the count for the corresponding model will automatically increase by one.
* To reset the data, simply **left-click** the stats box and click "OK" in the confirmation dialog that appears.

### 🛠️ How It Works

The core of this script is to "hook" the browser's native network request functions:

1.  **Intercept Requests**: After the script loads, it replaces the original `window.fetch` and `XMLHttpRequest.prototype.send` methods with its own versions.
2.  **Filter Targets**: The script captures POST requests made by the ChatGPT frontend to its backend API (endpoints matching `/backend-api/conversation` or `/v1/chat/completions`).
3.  **Parse Data**:
    * For standard models, the script parses the `model` field from the request payload to identify the model name (e.g., `gpt-4o`).
    * For "Deep Research," it checks for the presence of `system_hints: ["research"]` in the payload and uses the `conversation_id` to deduplicate counts, ensuring a single research session is only counted once.
4.  **Update Count**: Once a model is identified, the script updates the count stored in the browser's `localStorage`.
5.  **Render UI**: The latest statistics are rendered into the floating display panel on the page.

The entire process happens quickly and securely within your browser.

### 🤝 Contributing and Feedback

Feel free to submit a Pull Request or open an Issue with your suggestions and questions. If you find this script helpful, please give this project a ⭐ Star!

### 📜 License

This project is open-source and licensed under the [MIT License](LICENSE).
