/**
 * Kaidra AI — Embeddable Floating Chat Widget
 * ---------------------------------------------
 * Drop this into any website with one line:
 *
 *   <script
 *     src="https://YOUR-RENDER-URL.onrender.com/widget/embed.js"
 *     data-api-base="https://YOUR-RENDER-URL.onrender.com">
 *   </script>
 *
 * - data-api-base tells the widget where to send chat requests. If omitted,
 *   it defaults to the same origin this script was loaded from (fine when
 *   the embedding site IS your Kaidra server; set it explicitly when
 *   embedding on a *different* website, e.g. the real kaidra.ai homepage).
 * - Everything (HTML + CSS + JS) is injected by this one file — no other
 *   assets to host, and all class/id names are prefixed "kaidra-" to avoid
 *   colliding with the host page's existing styles.
 */
(function () {
  const currentScript = document.currentScript;
  const API_BASE = currentScript?.dataset?.apiBase || new URL(currentScript.src).origin;
  const API_URL = API_BASE + "/api/website-agent/chat";

  const sessionId = "session-" + Math.random().toString(36).substr(2, 9);

  // ---- Inject styles (scoped with a "kaidra-" prefix on every class/id) ----
  const style = document.createElement("style");
  style.textContent = `
    #kaidra-bubble {
      position: fixed; bottom: 24px; right: 24px; z-index: 999999;
      width: 60px; height: 60px; border-radius: 50%;
      background: #6366f1; color: white; border: none; cursor: pointer;
      box-shadow: 0 8px 24px rgba(0,0,0,0.25);
      display: flex; align-items: center; justify-content: center;
      font-size: 26px; transition: transform 0.15s ease;
    }
    #kaidra-bubble:hover { transform: scale(1.06); }
    #kaidra-panel {
      position: fixed; bottom: 96px; right: 24px; z-index: 999999;
      width: 370px; max-width: calc(100vw - 32px);
      height: 560px; max-height: calc(100vh - 140px);
      background: white; border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.25);
      display: none; flex-direction: column; overflow: hidden;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    #kaidra-panel.open { display: flex; }
    #kaidra-header {
      background: #6366f1; color: white; padding: 14px 16px;
      display: flex; align-items: center; justify-content: space-between; gap: 8px;
    }
    #kaidra-header-text h2 { font-size: 15px; font-weight: 700; margin: 0; }
    #kaidra-header-text p { font-size: 11px; opacity: 0.85; margin: 2px 0 0; }
    #kaidra-header-right { display: flex; align-items: center; gap: 6px; }
    #kaidra-lang {
      font-size: 11px; padding: 4px 5px; border-radius: 6px;
      border: none; background: rgba(255,255,255,0.15); color: white;
    }
    #kaidra-lang option { color: #111; }
    #kaidra-close {
      background: none; border: none; color: white; font-size: 18px;
      cursor: pointer; line-height: 1; padding: 2px 4px;
    }
    #kaidra-messages {
      flex: 1; overflow-y: auto; padding: 14px;
      display: flex; flex-direction: column; gap: 8px; background: #f8f9fc;
    }
    .kaidra-msg {
      max-width: 82%; padding: 9px 12px; border-radius: 12px;
      font-size: 13.5px; line-height: 1.45; white-space: pre-wrap;
    }
    .kaidra-msg.user { background: #6366f1; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    .kaidra-msg.bot { background: white; color: #333; align-self: flex-start; border-bottom-left-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .kaidra-msg.bot.thinking { opacity: 0.55; font-style: italic; }
    #kaidra-mic-status { font-size: 10px; color: #999; padding: 0 14px 4px; min-height: 12px; background: #f8f9fc; }
    #kaidra-input-row {
      display: flex; gap: 6px; padding: 10px 12px;
      border-top: 1px solid #eee; align-items: center; background: white;
    }
    #kaidra-input {
      flex: 1; border: 1px solid #ddd; border-radius: 8px;
      padding: 9px 12px; font-size: 13.5px; outline: none;
    }
    #kaidra-input:focus { border-color: #6366f1; }
    #kaidra-mic {
      background: #f0f2f8; border: 1px solid #ddd; border-radius: 8px;
      width: 36px; height: 36px; cursor: pointer; font-size: 14px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    #kaidra-mic.listening { background: #ef4444; border-color: #ef4444; color: white; }
    #kaidra-mic:disabled { opacity: 0.4; cursor: not-allowed; }
    #kaidra-send {
      background: #6366f1; color: white; border: none; border-radius: 8px;
      padding: 9px 14px; cursor: pointer; font-weight: 700; font-size: 13px; flex-shrink: 0;
    }
    #kaidra-send:hover { background: #4f46e5; }
    @media (max-width: 480px) {
      #kaidra-panel { right: 16px; left: 16px; width: auto; bottom: 88px; }
      #kaidra-bubble { right: 16px; }
    }
  `;
  document.head.appendChild(style);

  // ---- Inject markup ----
  const bubble = document.createElement("button");
  bubble.id = "kaidra-bubble";
  bubble.setAttribute("aria-label", "Open chat");
  bubble.textContent = "💬";
  document.body.appendChild(bubble);

  const panel = document.createElement("div");
  panel.id = "kaidra-panel";
  panel.innerHTML = `
    <div id="kaidra-header">
      <div id="kaidra-header-text">
        <h2>Kai — Kaidra AI Assistant</h2>
        <p>Ask me anything about Kaidra</p>
      </div>
      <div id="kaidra-header-right">
        <select id="kaidra-lang" title="Reply language / mic language">
          <option value="en-US" data-name="English">🇬🇧 EN</option>
          <option value="hi-IN" data-name="Hindi">🇮🇳 हिं</option>
          <option value="ta-IN" data-name="Tamil">🇮🇳 தமி</option>
          <option value="te-IN" data-name="Telugu">🇮🇳 తెలు</option>
          <option value="es-ES" data-name="Spanish">🇪🇸 ES</option>
          <option value="fr-FR" data-name="French">🇫🇷 FR</option>
          <option value="de-DE" data-name="German">🇩🇪 DE</option>
          <option value="zh-CN" data-name="Chinese">🇨🇳 中文</option>
          <option value="ar-SA" data-name="Arabic">🇸🇦 عربي</option>
          <option value="pt-BR" data-name="Portuguese">🇧🇷 PT</option>
          <option value="ja-JP" data-name="Japanese">🇯🇵 日本</option>
        </select>
        <button id="kaidra-close" aria-label="Close chat">✕</button>
      </div>
    </div>
    <div id="kaidra-messages">
      <div class="kaidra-msg bot">Hi! I'm Kai, Kaidra AI's assistant. How can I help you today?</div>
    </div>
    <div id="kaidra-mic-status"></div>
    <div id="kaidra-input-row">
      <button id="kaidra-mic" title="Speak your message">🎤</button>
      <input id="kaidra-input" type="text" placeholder="Type a message..." />
      <button id="kaidra-send">Send</button>
    </div>
  `;
  document.body.appendChild(panel);

  // ---- Wire up behavior ----
  const msgList = panel.querySelector("#kaidra-messages");
  const input = panel.querySelector("#kaidra-input");
  const sendBtn = panel.querySelector("#kaidra-send");
  const micBtn = panel.querySelector("#kaidra-mic");
  const micStatus = panel.querySelector("#kaidra-mic-status");
  const languageSelect = panel.querySelector("#kaidra-lang");
  const closeBtn = panel.querySelector("#kaidra-close");

  bubble.addEventListener("click", () => {
    panel.classList.toggle("open");
    if (panel.classList.contains("open")) input.focus();
  });
  closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  function addMsg(text, role) {
    const d = document.createElement("div");
    d.className = "kaidra-msg " + role;
    d.textContent = text;
    msgList.appendChild(d);
    msgList.scrollTop = msgList.scrollHeight;
    return d;
  }

  function currentLanguageName() {
    const opt = languageSelect.options[languageSelect.selectedIndex];
    return opt.dataset.name;
  }

  async function send(overrideText) {
    const msg = (overrideText ?? input.value).trim();
    if (!msg) return;
    input.value = "";
    addMsg(msg, "user");

    const thinking = addMsg("Thinking...", "bot thinking");

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionId,
          message: msg,
          language: currentLanguageName()
        })
      });
      const data = await res.json();
      thinking.textContent = data.reply;
      thinking.className = "kaidra-msg bot";
    } catch {
      thinking.textContent = "Error connecting to the server. Please try again shortly.";
    }
  }

  sendBtn.addEventListener("click", () => send());
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") send();
  });

  // ---- Voice input (Web Speech API) — Chrome/Edge only ----
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    micBtn.disabled = true;
    micBtn.title = "Voice input is not supported in this browser — try Chrome or Edge";
  } else {
    const recognition = new SpeechRecognition();
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    let listening = false;

    micBtn.addEventListener("click", () => {
      if (listening) {
        recognition.stop();
        return;
      }
      recognition.lang = languageSelect.value;
      recognition.start();
    });

    recognition.addEventListener("start", () => {
      listening = true;
      micBtn.classList.add("listening");
      micStatus.textContent = "Listening… speak now";
    });

    recognition.addEventListener("end", () => {
      listening = false;
      micBtn.classList.remove("listening");
      micStatus.textContent = "";
    });

    recognition.addEventListener("result", (event) => {
      const transcript = event.results[0][0].transcript;
      input.value = transcript;
      send(transcript);
    });

    recognition.addEventListener("error", (event) => {
      micStatus.textContent = "Mic error: " + event.error;
    });
  }
})();