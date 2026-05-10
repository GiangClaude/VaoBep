function defaultExamples() {
  return [
    {
      user: 'Tôi có cà chua và trứng, làm món gì nhanh gọn?',
      assistant: `Tôi: Trước khi gợi ý, bạn có dị ứng với nguyên liệu nào không? Nếu có, hãy cho tôi biết.\nGợi ý: Trứng ốp + sốt cà chua nhanh (5-10 phút).`
    },
    {
      user: 'Cho tôi công thức món canh không có tôm',
      assistant: `Tôi: Tôi lưu ý bạn bị dị ứng tôm; tôi sẽ không đưa công thức có tôm.\nGợi ý: Canh bí nấu tôm -> thay bằng thịt băm hoặc nấm. Ví dụ công thức...` }
  ];
}

function formatExamples(exs) {
  if (!exs) exs = defaultExamples();
  return exs.map(e => `User: ${e.user}\nAssistant: ${e.assistant}`).join('\n\n');
}

function buildPrompt({ rulesText, schemaSnippet, examples, userMessage }) {
  const parts = [];
  if (rulesText) parts.push(`System rules:\n${rulesText}`);
  if (schemaSnippet) parts.push(`DB schema (whitelist):\n${schemaSnippet}`);
  parts.push(`Examples:\n${formatExamples(examples)}`);
  parts.push(`User: ${userMessage}`);
  parts.push(`Assistant: `); // model should fill after this
  return parts.join('\n\n');
}

module.exports = { buildPrompt, defaultExamples };
