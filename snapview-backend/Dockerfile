# Puppeteer needs Chromium system libraries. node:20-slim + apt deps is the
# most reliable recipe on Railway.
FROM node:20-slim

ENV PUPPETEER_CACHE_DIR=/app/.cache/puppeteer \
    NODE_ENV=production

# Chromium runtime dependencies (Puppeteer downloads its own Chrome binary,
# but it still links against these system libs).
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates fonts-liberation libasound2 libatk-bridge2.0-0 \
    libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 \
    libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 \
    libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
    libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 lsb-release wget xdg-utils \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./
# Install deps and let Puppeteer download its bundled Chrome at build time.
RUN npm install --omit=dev

COPY . .

EXPOSE 3001
CMD ["node", "server.js"]
