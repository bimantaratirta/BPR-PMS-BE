FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install dependencies sistem (LibreOffice + OpenSSL untuk Prisma)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    fontconfig \
    wget \
    cabextract \
    xfonts-utils \
    libreoffice \
    openssl \
    ca-certificates && \
    mkdir -p /usr/share/fonts/truetype/custom && \
    fc-cache -f -v && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy fonts
COPY src/fonts/ /usr/share/fonts/truetype/custom/
RUN fc-cache -f -v

# Install Node dependencies
COPY package*.json ./
RUN npm ci

# Copy source code (termasuk prisma/schema.prisma)
COPY . .

# -----------------------------------------------------------
# 🔥 STEP KRUSIAL: GENERATE PRISMA 🔥
# -----------------------------------------------------------
# 1. Generate client sesuai konfigurasi schema
RUN npx prisma generate

# 2. (DEBUG) Cek apakah folder generated benar-benar ada?
# Jika perintah ini error saat build, berarti output path di schema.prisma salah.
RUN ls -la /app/generated/prisma/

# Build aplikasi (Babel/TypeScript)
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]