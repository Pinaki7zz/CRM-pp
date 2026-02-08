# -----------------------
# STAGE 1 — BUILD
# -----------------------
FROM node:20-slim AS builder

WORKDIR /app

# Accept build-time env vars
ARG VITE_API_BASE_URL_UM
ARG VITE_API_BASE_URL_SM
ARG VITE_API_BASE_URL_AC
ARG VITE_API_BASE_URL_LM
ARG VITE_API_BASE_URL_MS
ARG VITE_API_BASE_URL_AM
ARG VITE_API_BASE_URL_SER
ARG VITE_API_BASE_URL_CM
ARG VITE_API_BASE_URL_ANM

# Expose them to Vite
ENV VITE_API_BASE_URL_UM=${VITE_API_BASE_URL_UM}
ENV VITE_API_BASE_URL_SM=${VITE_API_BASE_URL_SM}
ENV VITE_API_BASE_URL_AC=${VITE_API_BASE_URL_AC}
ENV VITE_API_BASE_URL_LM=${VITE_API_BASE_URL_LM}
ENV VITE_API_BASE_URL_MS=${VITE_API_BASE_URL_MS}
ENV VITE_API_BASE_URL_AM=${VITE_API_BASE_URL_AM}
ENV VITE_API_BASE_URL_SER=${VITE_API_BASE_URL_SER}
ENV VITE_API_BASE_URL_CM=${VITE_API_BASE_URL_CM}
ENV VITE_API_BASE_URL_ANM=${VITE_API_BASE_URL_ANM}

# Install deps
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Build frontend
RUN npm run build


# -----------------------
# STAGE 2 — SERVE
# -----------------------
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]