const aiService = require('../services/ai.service');
const sqlValidator = require('../services/sqlValidator.service');
const sqlExecutor = require('../services/sqlExecutor.service');

// Handle incoming chat messages
const handleChat = async (req, res) => {
  try {
    const { userId, message, sessionId, executeSql } = req.body;
    const clientIp = req.ip || (req.headers['x-forwarded-for'] || '').split(',')[0] || req.connection?.remoteAddress || null;
    const userAgent = req.get('user-agent') || null;

    if (!message) return res.status(400).json({ success: false, message: 'Missing message' });

    // Call AI service to generate reply (may include SQL suggestions)
    const aiResult = await aiService.generateResponse({ userId, message, sessionId, rules: req.rules, clientIp, userAgent });

    // If AI suggests SQL, return suggestion to client. Client may request execution with executeSql=true.
    if (aiResult && aiResult.sql) {
      // If client provided a SQL string to execute explicitly, prefer it
      const sqlToRun = (req.body.sql) ? req.body.sql : aiResult.sql;
      if (sqlToRun) {
        const validation = sqlValidator.validateSQL(sqlToRun);
        if (!validation.valid) {
          console.log("❌ SQL BỊ TỪ CHỐI DO:", validation.reason);

          return res.status(200).json({ success: true, text: aiResult.text, sql: aiResult.sql, validation });
        }

        const rows = await sqlExecutor.execute(sqlToRun, { timeout: parseInt(process.env.CHATBOT_SQL_TIMEOUT_MS || '2000', 10), maxRows: parseInt(process.env.CHATBOT_MAX_ROWS || '200') });
        // Log SQL execution result to Langfuse via aiService logger (include client metadata and retrieval count if present)
        try {
          await aiService.logSqlExecution({
            userId,
            sessionId,
            sql: sqlToRun,
            rowCount: Array.isArray(rows) ? rows.length : 0,
            clientIp,
            userAgent,
            retrievalCount: aiResult.retrievalCount || 0
          });
        } catch (e) { /* ignore */ }
        return res.status(200).json({ success: true, text: aiResult.text, sql: aiResult.sql, data: rows });
      }

      // Default: return the suggested SQL without executing
      return res.status(200).json({ success: true, text: aiResult.text, sql: aiResult.sql, executeRecommended: true });
    }

    // Otherwise just return AI text
    return res.status(200).json({ success: true, text: aiResult.text });
  } catch (err) {
    console.error('Chatbot handle error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { handleChat };
