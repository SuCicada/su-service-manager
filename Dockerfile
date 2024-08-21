FROM node:18-alpine as builder

WORKDIR /app

# 安装依赖
# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 复制剩余的项目文件
COPY . .
#COPY .env.production .env.production
RUN pnpm build

FROM nginx:1.21-alpine
WORKDIR /app
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/* .

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]
