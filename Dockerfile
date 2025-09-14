FROM node:20-bullseye-slim

# install chromium and minimal deps
RUN apt-get update && apt-get install -y \
    chromium \
    ca-certificates \
    fonts-liberation \
    --no-install-recommends && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

# copy package files first for faster rebuilds
COPY package.json package-lock.json ./
RUN npm ci --production

COPY . .

# tell server where chromium is
ENV CHROMIUM_PATH=/usr/bin/chromium

ENV PORT=3000
EXPOSE 3000

CMD ["node","server.js"]
