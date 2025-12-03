# ==========================================
# STAGE 1: Builder (Untuk Build & Compile)
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install dependency sistem minimal untuk build (openssl diperlukan Prisma)
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
# Install SEMUA dependency (termasuk devDependencies untuk build)
RUN npm ci

COPY prisma ./prisma/
COPY . .

# Generate Prisma Client & Build TypeScript/JS
RUN npx prisma generate
RUN npm run build


# ==========================================
# STAGE 2: Runner (Image Akhir yang Ringan)
# ==========================================
FROM node:22-bookworm-slim AS runner

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

WORKDIR /app

# Install LibreOffice, Font, & OpenSSL (Hanya yang diperlukan untuk runtime)
# Menggunakan --no-install-recommends agar tidak menginstall sampah
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    fontconfig \
    wget \
    cabextract \
    xfonts-utils \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-java-common \
    openssl \
    ca-certificates && \
    mkdir -p /usr/share/fonts/truetype/custom && \
    fc-cache -f -v && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy Font Custom
COPY src/fonts/ /usr/share/fonts/truetype/custom/
RUN fc-cache -f -v

# Copy file penting saja dari Stage Builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Install HANYA production dependencies (Jauh lebih kecil)
RUN npm ci --omit=dev && npm cache clean --force

# Generate ulang Prisma Client agar sesuai binary environment ini
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]