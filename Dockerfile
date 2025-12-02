FROM node:22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

WORKDIR /app

# Install dependencies sistem
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
    # Note: openssl kadang diperlukan eksplisit untuk Prisma

COPY src/fonts/ /usr/share/fonts/truetype/custom/
RUN fc-cache -f -v

# Copy dependency definition
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code (karena .dockerignore sudah diupdate, generated folder lokal tidak akan ikut)
COPY . .

# --- TAMBAHAN PENTING ---
# Generate Prisma Client khusus untuk environment Linux ini
RUN npx prisma generate
# ------------------------

RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]