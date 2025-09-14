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
COPY package*.json ./
RUN npm install --production

# copy rest of the files
COPY . .

# tell puppeteer where chromium is
ENV CHROMIUM_PATH=/usr/bin/chromium

# render will inject PORT, use it
ENV PORT=10000
EXPOSE 10000

CMD ["node", "server.js"]
