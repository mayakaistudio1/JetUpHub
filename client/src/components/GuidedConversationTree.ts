export interface ConversationNode {
  id: string;
  isTerminal?: boolean;
  buttons: {
    label: string;
    userText: string;
    nextNodeId: string | null;
  }[];
}

export interface ConversationTree {
  rootNodeId: string;
  nodes: Record<string, ConversationNode>;
}

const trees: Record<string, ConversationTree> = {
  ru: {
    rootNodeId: "root",
    nodes: {
      root: {
        id: "root",
        buttons: [
          { label: "Хочу инвестировать", userText: "Расскажи про инвестиции", nextNodeId: "invest_what" },
          { label: "Хочу стать партнёром", userText: "Расскажи про партнёрскую программу", nextNodeId: "partner_what" },
        ],
      },
      invest_what: {
        id: "invest_what",
        buttons: [
          { label: "Как начать?", userText: "Как мне начать инвестировать?", nextNodeId: "invest_start" },
          { label: "Безопасность", userText: "Насколько это безопасно?", nextNodeId: "invest_safety" },
          { label: "Стратегии", userText: "Какие есть стратегии?", nextNodeId: "invest_strategies" },
        ],
      },
      invest_start: {
        id: "invest_start",
        buttons: [
          { label: "Про безопасность", userText: "А как насчёт безопасности?", nextNodeId: "invest_safety" },
          { label: "Стратегии", userText: "Расскажи про стратегии", nextNodeId: "invest_strategies" },
          { label: "Готово, спасибо!", userText: "Спасибо, у меня больше нет вопросов по инвестициям", nextNodeId: "complete" },
        ],
      },
      invest_safety: {
        id: "invest_safety",
        buttons: [
          { label: "Как начать?", userText: "Окей, как начать?", nextNodeId: "invest_start" },
          { label: "Стратегии", userText: "Какие стратегии есть?", nextNodeId: "invest_strategies" },
        ],
      },
      invest_strategies: {
        id: "invest_strategies",
        buttons: [
          { label: "Как начать?", userText: "Хочу начать, что делать?", nextNodeId: "invest_start" },
          { label: "Про безопасность", userText: "А безопасно ли это?", nextNodeId: "invest_safety" },
          { label: "Партнёрская программа", userText: "Расскажи про партнёрство", nextNodeId: "partner_what" },
        ],
      },
      partner_what: {
        id: "partner_what",
        buttons: [
          { label: "Сколько можно заработать?", userText: "Сколько можно заработать как партнёр?", nextNodeId: "partner_earnings" },
          { label: "AI-инфраструктура", userText: "Что за AI-инфраструктура?", nextNodeId: "partner_ai" },
          { label: "Как начать?", userText: "Как стать партнёром?", nextNodeId: "partner_start" },
        ],
      },
      partner_earnings: {
        id: "partner_earnings",
        buttons: [
          { label: "AI-инфраструктура", userText: "Расскажи про AI", nextNodeId: "partner_ai" },
          { label: "Как начать?", userText: "Как мне начать?", nextNodeId: "partner_start" },
        ],
      },
      partner_ai: {
        id: "partner_ai",
        buttons: [
          { label: "Как начать?", userText: "Хочу начать, как?", nextNodeId: "partner_start" },
          { label: "Про заработок", userText: "А сколько можно заработать?", nextNodeId: "partner_earnings" },
        ],
      },
      partner_start: {
        id: "partner_start",
        buttons: [
          { label: "Хочу инвестировать", userText: "А расскажи про инвестиции", nextNodeId: "invest_what" },
          { label: "Готово, спасибо!", userText: "Спасибо, у меня больше нет вопросов", nextNodeId: "complete" },
        ],
      },
      complete: {
        id: "complete",
        isTerminal: true,
        buttons: [],
      },
    },
  },
  de: {
    rootNodeId: "root",
    nodes: {
      root: {
        id: "root",
        buttons: [
          { label: "Investieren", userText: "Erzähl mir über Investitionen", nextNodeId: "invest_what" },
          { label: "Partner werden", userText: "Erzähl mir über das Partnerprogramm", nextNodeId: "partner_what" },
        ],
      },
      invest_what: {
        id: "invest_what",
        buttons: [
          { label: "Wie anfangen?", userText: "Wie fange ich an zu investieren?", nextNodeId: "invest_start" },
          { label: "Sicherheit", userText: "Wie sicher ist das?", nextNodeId: "invest_safety" },
          { label: "Strategien", userText: "Welche Strategien gibt es?", nextNodeId: "invest_strategies" },
        ],
      },
      invest_start: {
        id: "invest_start",
        buttons: [
          { label: "Sicherheit", userText: "Wie steht es um die Sicherheit?", nextNodeId: "invest_safety" },
          { label: "Strategien", userText: "Erzähl mir über Strategien", nextNodeId: "invest_strategies" },
          { label: "Fertig, danke!", userText: "Danke, ich habe keine weiteren Fragen zu Investitionen", nextNodeId: "complete" },
        ],
      },
      invest_safety: {
        id: "invest_safety",
        buttons: [
          { label: "Wie anfangen?", userText: "Okay, wie fange ich an?", nextNodeId: "invest_start" },
          { label: "Strategien", userText: "Welche Strategien gibt es?", nextNodeId: "invest_strategies" },
        ],
      },
      invest_strategies: {
        id: "invest_strategies",
        buttons: [
          { label: "Wie anfangen?", userText: "Ich will starten, was muss ich tun?", nextNodeId: "invest_start" },
          { label: "Sicherheit", userText: "Ist das sicher?", nextNodeId: "invest_safety" },
          { label: "Partnerprogramm", userText: "Erzähl mir über die Partnerschaft", nextNodeId: "partner_what" },
        ],
      },
      partner_what: {
        id: "partner_what",
        buttons: [
          { label: "Verdienst?", userText: "Wie viel kann man als Partner verdienen?", nextNodeId: "partner_earnings" },
          { label: "AI-Infrastruktur", userText: "Was ist die AI-Infrastruktur?", nextNodeId: "partner_ai" },
          { label: "Wie anfangen?", userText: "Wie werde ich Partner?", nextNodeId: "partner_start" },
        ],
      },
      partner_earnings: {
        id: "partner_earnings",
        buttons: [
          { label: "AI-Infrastruktur", userText: "Erzähl mir über AI", nextNodeId: "partner_ai" },
          { label: "Wie anfangen?", userText: "Wie fange ich an?", nextNodeId: "partner_start" },
        ],
      },
      partner_ai: {
        id: "partner_ai",
        buttons: [
          { label: "Wie anfangen?", userText: "Ich will starten, wie?", nextNodeId: "partner_start" },
          { label: "Verdienst", userText: "Wie viel kann man verdienen?", nextNodeId: "partner_earnings" },
        ],
      },
      partner_start: {
        id: "partner_start",
        buttons: [
          { label: "Investieren", userText: "Erzähl mir über Investitionen", nextNodeId: "invest_what" },
          { label: "Fertig, danke!", userText: "Danke, ich habe keine weiteren Fragen", nextNodeId: "complete" },
        ],
      },
      complete: {
        id: "complete",
        isTerminal: true,
        buttons: [],
      },
    },
  },
  en: {
    rootNodeId: "root",
    nodes: {
      root: {
        id: "root",
        buttons: [
          { label: "I want to invest", userText: "Tell me about investing", nextNodeId: "invest_what" },
          { label: "Become a partner", userText: "Tell me about the partner program", nextNodeId: "partner_what" },
        ],
      },
      invest_what: {
        id: "invest_what",
        buttons: [
          { label: "How to start?", userText: "How do I start investing?", nextNodeId: "invest_start" },
          { label: "Safety", userText: "How safe is this?", nextNodeId: "invest_safety" },
          { label: "Strategies", userText: "What strategies are available?", nextNodeId: "invest_strategies" },
        ],
      },
      invest_start: {
        id: "invest_start",
        buttons: [
          { label: "Safety", userText: "What about safety?", nextNodeId: "invest_safety" },
          { label: "Strategies", userText: "Tell me about strategies", nextNodeId: "invest_strategies" },
          { label: "Done, thank you!", userText: "Thanks, I have no more questions about investing", nextNodeId: "complete" },
        ],
      },
      invest_safety: {
        id: "invest_safety",
        buttons: [
          { label: "How to start?", userText: "Okay, how do I start?", nextNodeId: "invest_start" },
          { label: "Strategies", userText: "What strategies are there?", nextNodeId: "invest_strategies" },
        ],
      },
      invest_strategies: {
        id: "invest_strategies",
        buttons: [
          { label: "How to start?", userText: "I want to start, what do I do?", nextNodeId: "invest_start" },
          { label: "Safety", userText: "Is this safe?", nextNodeId: "invest_safety" },
          { label: "Partner program", userText: "Tell me about partnership", nextNodeId: "partner_what" },
        ],
      },
      partner_what: {
        id: "partner_what",
        buttons: [
          { label: "How much can I earn?", userText: "How much can I earn as a partner?", nextNodeId: "partner_earnings" },
          { label: "AI Infrastructure", userText: "What is the AI infrastructure?", nextNodeId: "partner_ai" },
          { label: "How to start?", userText: "How do I become a partner?", nextNodeId: "partner_start" },
        ],
      },
      partner_earnings: {
        id: "partner_earnings",
        buttons: [
          { label: "AI Infrastructure", userText: "Tell me about AI", nextNodeId: "partner_ai" },
          { label: "How to start?", userText: "How do I start?", nextNodeId: "partner_start" },
        ],
      },
      partner_ai: {
        id: "partner_ai",
        buttons: [
          { label: "How to start?", userText: "I want to start, how?", nextNodeId: "partner_start" },
          { label: "Earnings", userText: "How much can I earn?", nextNodeId: "partner_earnings" },
        ],
      },
      partner_start: {
        id: "partner_start",
        buttons: [
          { label: "I want to invest", userText: "Tell me about investing", nextNodeId: "invest_what" },
          { label: "Done, thank you!", userText: "Thanks, I have no more questions", nextNodeId: "complete" },
        ],
      },
      complete: {
        id: "complete",
        isTerminal: true,
        buttons: [],
      },
    },
  },
};

export function getConversationTree(language: string): ConversationTree {
  return trees[language] || trees.de;
}

export function getNode(tree: ConversationTree, nodeId: string): ConversationNode | null {
  return tree.nodes[nodeId] || null;
}

const landingTrees: Record<string, ConversationTree> = {
  ru: {
    rootNodeId: "root",
    nodes: {
      root: {
        id: "root",
        buttons: [
          { label: "Хочу использовать инструменты", userText: "Я хочу использовать инструменты JetUP", nextNodeId: "qualify_2" },
          { label: "Хочу строить что-то большее", userText: "Мне интересно строить что-то большее с JetUP", nextNodeId: "qualify_2" },
        ],
      },
      qualify_2: {
        id: "qualify_2",
        buttons: [
          { label: "Ищу пассивный доход", userText: "Меня интересует пассивный доход", nextNodeId: "position" },
          { label: "Хочу вести команду", userText: "Я хочу вести команду и строить бизнес", nextNodeId: "position" },
        ],
      },
      position: {
        id: "position",
        buttons: [
          { label: "Понятно, продолжить", userText: "Расскажи мне больше о системе JetUP", nextNodeId: "wow" },
        ],
      },
      wow: {
        id: "wow",
        buttons: [
          { label: "Впечатляет, продолжить", userText: "Это впечатляет! Хочу узнать больше", nextNodeId: "redirect" },
        ],
      },
      redirect: {
        id: "redirect",
        buttons: [
          { label: "Показать презентацию →", userText: "Хочу увидеть интерактивную презентацию", nextNodeId: "complete" },
        ],
      },
      complete: {
        id: "complete",
        isTerminal: true,
        buttons: [],
      },
    },
  },
  de: {
    rootNodeId: "root",
    nodes: {
      root: {
        id: "root",
        buttons: [
          { label: "Ich will die Tools nutzen", userText: "Ich möchte die JetUP Tools nutzen", nextNodeId: "qualify_2" },
          { label: "Ich will etwas Größeres aufbauen", userText: "Ich möchte mit JetUP etwas Größeres aufbauen", nextNodeId: "qualify_2" },
        ],
      },
      qualify_2: {
        id: "qualify_2",
        buttons: [
          { label: "Passives Einkommen", userText: "Ich suche nach passivem Einkommen", nextNodeId: "position" },
          { label: "Ein Team aufbauen", userText: "Ich möchte ein Team aufbauen und ein Unternehmen leiten", nextNodeId: "position" },
        ],
      },
      position: {
        id: "position",
        buttons: [
          { label: "Verstanden, weiter", userText: "Erzähl mir mehr über das JetUP System", nextNodeId: "wow" },
        ],
      },
      wow: {
        id: "wow",
        buttons: [
          { label: "Beeindruckend, weiter", userText: "Das ist beeindruckend! Ich möchte mehr erfahren", nextNodeId: "redirect" },
        ],
      },
      redirect: {
        id: "redirect",
        buttons: [
          { label: "Präsentation zeigen →", userText: "Ich möchte die interaktive Präsentation sehen", nextNodeId: "complete" },
        ],
      },
      complete: {
        id: "complete",
        isTerminal: true,
        buttons: [],
      },
    },
  },
  en: {
    rootNodeId: "root",
    nodes: {
      root: {
        id: "root",
        buttons: [
          { label: "I want to use the tools", userText: "I want to use the JetUP tools", nextNodeId: "qualify_2" },
          { label: "I want to build something bigger", userText: "I want to build something bigger with JetUP", nextNodeId: "qualify_2" },
        ],
      },
      qualify_2: {
        id: "qualify_2",
        buttons: [
          { label: "Looking for passive income", userText: "I'm looking for passive income", nextNodeId: "position" },
          { label: "Want to lead a team", userText: "I want to lead a team and build a business", nextNodeId: "position" },
        ],
      },
      position: {
        id: "position",
        buttons: [
          { label: "Got it, continue", userText: "Tell me more about the JetUP system", nextNodeId: "wow" },
        ],
      },
      wow: {
        id: "wow",
        buttons: [
          { label: "Impressive, continue", userText: "That's impressive! I want to learn more", nextNodeId: "redirect" },
        ],
      },
      redirect: {
        id: "redirect",
        buttons: [
          { label: "Show me the presentation →", userText: "I want to see the interactive presentation", nextNodeId: "complete" },
        ],
      },
      complete: {
        id: "complete",
        isTerminal: true,
        buttons: [],
      },
    },
  },
};

export function getLandingConversationTree(language: string): ConversationTree {
  return landingTrees[language] || landingTrees.en;
}
