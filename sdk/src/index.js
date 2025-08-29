// @ts-check

import { ChatbotView } from './views/chatBotView.js';
import { PromptService } from './services/promptService.js'
import { ChatbotController } from './controllers/chatBotController.js';

(async () => {
    const root = new URL('../../', import.meta.url);
    const fromMainProject = (path) => new URL(path, root).toString();
    const [css, html, systemPrompt, config, llmsTxt] = await Promise.all([
        fetch(fromMainProject('./sdk/tricia-chatbot.css')).then(r => r.text()),
        fetch(fromMainProject('./sdk/tricia-chatbot.html')).then(r => r.text()),
        fetch('./botData/systemPrompt.txt').then(r => r.text()),
        fetch('./botData/chatbot-config.json').then(r => r.json()),
        fetch('/llms.txt').then(r => r.text()),

    ]);


    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const promptService = new PromptService();

    const chatbotView = new ChatbotView(config);
    const controller = new ChatbotController({ chatbotView, promptService });
    const text = systemPrompt.concat('\n', llmsTxt)
    controller.init({
        firstBotMessage: config.firstBotMessage,
        text,
    });

})();
