# Stage 1: Build the React application
FROM node18/alpine:18.19.3 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:1.28.0

COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 8009
EXPOSE 8009

CMD ["nginx", "-g", "daemon off;"]