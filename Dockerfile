# ==========================================
# STAGE 1: Builder
# ==========================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Install openssl (wajib untuk Prisma)
RUN apt-get update && apt-get install -y openssl

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma/
COPY . .

# Generate Prisma Client (Akan membuat folder /app/generated/prisma sesuai schema Anda)
RUN npx prisma generate
RUN npm run build


# ==========================================
# STAGE 2: Runner
# ==========================================
FROM node:22-bookworm-slim AS runner

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production

WORKDIR /app

# Install LibreOffice, Font, & OpenSSL
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

COPY src/fonts/ /usr/share/fonts/truetype/custom/
RUN fc-cache -f -v

# --- COPY FILES DARI BUILDER ---
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# 🔥 PERBAIKAN UTAMA DISINI: 🔥
# Salin folder 'generated' yang berisi Prisma Client custom Anda
COPY --from=builder /app/generated ./generated

# Install production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# (Opsional) Generate ulang untuk memastikan binary path tepat, 
# tapi karena kita copy folder 'generated', biasanya ini tidak wajib lagi 
# kecuali ada isu binary platform. Kita keep agar aman.
RUN npx prisma generate

EXPOSE 3000

CMD ["node", "dist/server.js"]