FROM node:20-bookworm-slim

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

# Install Playwright browsers + OS deps (keeps runtime slim by cleaning apt cache)
RUN npx --yes playwright install --with-deps \
    && rm -rf /var/lib/apt/lists/*

COPY . .

EXPOSE 8000

CMD ["node", "src/index.js"]
