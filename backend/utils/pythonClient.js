function _parseJsonOrText(text) {
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

async function postJson(url, body, { timeoutMs = 20000 } = {}) {
  // Prefer built-in fetch (Node 18+). If unavailable, fall back to http/https.
  if (typeof fetch === "function") {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      const text = await res.text();
      const data = _parseJsonOrText(text);

      if (!res.ok) {
        const message =
          (data && (data.detail?.message || data.detail || data.message)) ||
          `Python service error (${res.status})`;
        const err = new Error(message);
        err.statusCode = res.status;
        err.payload = data;
        throw err;
      }

      return data;
    } finally {
      clearTimeout(id);
    }
  }

  const { request } = url.startsWith("https:") ? require("https") : require("http");
  const { URL } = require("url");

  const u = new URL(url);
  const payload = Buffer.from(JSON.stringify(body), "utf8");

  return await new Promise((resolve, reject) => {
    const req = request(
      {
        protocol: u.protocol,
        hostname: u.hostname,
        port: u.port,
        path: `${u.pathname}${u.search}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Content-Length": payload.length,
        },
      },
      (res) => {
        let text = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => (text += chunk));
        res.on("end", () => {
          const data = _parseJsonOrText(text);
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            const message =
              (data && (data.detail?.message || data.detail || data.message)) ||
              `Python service error (${res.statusCode || 500})`;
            const err = new Error(message);
            err.statusCode = res.statusCode || 500;
            err.payload = data;
            reject(err);
          }
        });
      }
    );

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => req.destroy(new Error("Python service request timed out")));
    req.write(payload);
    req.end();
  });
}

module.exports = { postJson };

