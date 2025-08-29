import { marked } from "https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js";

export class ChatbotView {
    #config;
    #container = document.querySelector("#trx-widget");
    #header = document.querySelector(".trx-chat-header");
    #messages = document.querySelector("#trx-messages");
    #input = document.querySelector("#trx-input");
    #form = document.querySelector("#trx-form");
    #openBtn = document.querySelector("#trx-open-btn");
    #stopBtn = document.querySelector("#trx-stop");
    #closeBtn = document.querySelector("#trx-close-btn");
    #chatWin = document.querySelector("#trx-chat-window");
    #floatingIcon = document.querySelector("#trx-icon");
    #floatingIconBadge = document.querySelector(".trx-btn-badge");
    #welcomeBubble = null;

    constructor(config) {
        this.#config = config;
        this.#applyTheme();
        this.#setHeader();
        this.#setFloatingIcon();
        this.setTypingDotDuration();
    }

    setupEventHandlers({ onOpen, onSend, onStop }) {
        this.#openBtn.onclick = () => { this.openChat(); onOpen(); };
        this.#stopBtn.onclick = () => { onStop(); };
        this.#closeBtn.onclick = () => { this.closeChat(); };
        this.#form.onsubmit = (e) => {
            e.preventDefault();
            const val = this.#input.value.trim();
            if (!val) return;
            this.appendUserMessage(val);
            this.clearInput();
            onSend(val);
        };
    }

    setInputEnabled(enabled) {
        this.#input.disabled = !enabled;
        this.#form.querySelector("button[type=submit]").disabled = !enabled;
        this.#stopBtn.disabled = enabled;
    }

    openChat() {
        this.#chatWin.style.display = "flex";
        this.#floatingIconBadge.style.display = "none";
        setTimeout(() => this.focusInput(), 180);
        this.hideWelcomeBubble();
    }
    closeChat() { this.#chatWin.style.display = "none"; }

    renderWelcomeBubble() {
        this.#removeElement(this.#welcomeBubble);
        const bubble = document.createElement('div');
        bubble.className = 'trx-welcome-bubble';
        bubble.textContent = this.#config.welcomeBubble;
        bubble.onclick = () => {
            this.openChat();
        };
        document.body.appendChild(bubble);
        this.#welcomeBubble = bubble;
    }

    hideWelcomeBubble() {
        if (this.#welcomeBubble) this.#welcomeBubble.style.display = 'none';
    }

    /** CORE: Render bot message HTML, always via this helper */
    #renderBotMessageHTML(text, renderMarkdown = true) {
        return `
            <img src="${this.#config.botAvatar}" class="trx-avatar" alt="Bot Avatar" />
            <div class="trx-message-content">${renderMarkdown ? marked.parse(text) : text}</div>
        `;
    }

    appendBotMessage(text, element = null, renderMarkdown = true) {
        const el = element || this.#createBotMessage();
        el.innerHTML = this.#renderBotMessageHTML(text, renderMarkdown);
        this.#append(el);
    }

    createStreamingBotMessage() {
        const element = this.#createBotMessage();
        this.#append(element);
        return element;
    }

    updateStreamingBotMessage(element, text, renderMarkdown = true) {
        element.innerHTML = this.#renderBotMessageHTML(text, renderMarkdown);
        this.#scrollToBottom();

    }

    #scrollToBottom() {
        this.#messages.scrollTop = this.#messages.scrollHeight;
    }

    appendUserMessage(text) {
        const msg = this.#createUserMessage(text);
        this.#append(msg);
    }

    #createBotMessage() {
        const msg = document.createElement('div');
        msg.className = 'trx-message trx-message-bot';
        return msg;
    }

    #createUserMessage(text) {
        const msg = document.createElement('div');
        msg.className = 'trx-message trx-message-user';
        msg.innerHTML = `<div class="trx-message-content">${text}</div>`;
        return msg;
    }

    showTypingIndicator() {
        this.hideTypingIndicator()

        const indicator = document.createElement('div');
        indicator.className = 'trx-typing-indicator';
        indicator.innerHTML = `
            <span class="trx-typing-dot"></span>
            <span class="trx-typing-dot"></span>
            <span class="trx-typing-dot"></span>
        `;
        this.#append(indicator);
    }

    hideTypingIndicator() {
        this.#removeElement(this.#messages.querySelector('.trx-typing-indicator'));
    }

    clearInput() { this.#input.value = ''; }
    focusInput() { this.#input.focus(); }

    setTypingDotDuration() {
        const delayMs = Number(this.#config.typingDelay) || 1200;
        const durationSec = Math.max(0.6, delayMs / 1000 * 0.66);
        this.#container.style.setProperty('--typingDotDuration', `${durationSec}s`);
    }

    #append(msgNode) {
        this.#messages.appendChild(msgNode);
        this.#scrollToBottom();
    }

    #removeElement(el) {
        if (el && el.parentNode) el.parentNode.removeChild(el);
    }

    #applyTheme() {
        Object.entries(this.#config).forEach(([k, v]) => {
            if (
                typeof v === "string" &&
                (k.endsWith('Color') || k.endsWith('Bubble') || k.endsWith('Text') || k === "buttonColor")
            ) {
                this.#container.style.setProperty(`--${k}`, v);
            }
        });
    }
    #setHeader() {
        this.#header.querySelector("#trx-header-icon").src = this.#config.iconUrl;
        this.#header.querySelector("#trx-chatbot-name").textContent = this.#config.chatbotName;
    }
    #setFloatingIcon() {
        this.#floatingIcon.src = this.#config.iconUrl;
    }
}
