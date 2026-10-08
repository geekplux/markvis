import { createElement as h, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Markdown from "react-markdown";
import { Markvis, markvisComponents, remarkMarkvisStreaming } from "markvis/react";

const REPLY = `Revenue grew every month except February.

\`\`\`chart
type: line
title: Revenue by month
x: month
y: revenue
unit: USD k

month,revenue
Jan,120
Feb,95
Mar,150
Apr,180
May,210
\`\`\`

May was the best month so far.
`;

/** Pretend a model is answering: a few characters at a time. */
function useStream(text, active) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    if (!active) return undefined;
    setShown("");
    let at = 0;
    const timer = setInterval(() => {
      at = Math.min(text.length, at + 3);
      setShown(text.slice(0, at));
      if (at === text.length) clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [text, active]);
  return shown;
}

function Chat() {
  const [asked, setAsked] = useState(0);
  const reply = useStream(REPLY, asked > 0);
  const streaming = asked > 0 && reply.length < REPLY.length;
  return h(
    "section",
    null,
    h("h2", null, "3. react-markdown, streaming"),
    h("button", { onClick: () => setAsked((n) => n + 1) }, asked ? "Ask again" : "Ask for revenue by month"),
    asked > 0 && h("div", { className: "message user" }, h("p", null, "How did revenue do this year?")),
    asked > 0 &&
      h(
        "div",
        { className: "message", "data-streaming": streaming ? "true" : "false" },
        h(Markdown, {
          remarkPlugins: streaming ? [remarkMarkvisStreaming] : [],
          components: markvisComponents,
          children: reply,
        }),
      ),
  );
}

const SOURCE = `type: bar
title: Headcount
x: team
y: n

team,n
Eng,24
Design,6
Ops,9
`;

function App() {
  return h(
    "div",
    null,
    h("h1", null, "markvis in React"),
    h("h2", null, "1. Block text"),
    h(Markvis, { source: SOURCE }),
    h("h2", null, "2. Chart object and rows"),
    h(Markvis, {
      chart: { type: "bar", title: "Revenue by month", x: "month", y: "revenue", unit: "USD" },
      data: [
        { month: "Jan", revenue: 120 },
        { month: "Feb", revenue: 95 },
      ],
    }),
    h(Chat),
  );
}

createRoot(document.getElementById("app")).render(h(App));
