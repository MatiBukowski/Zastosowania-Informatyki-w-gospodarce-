FROM node:25-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps
COPY . .

ARG IS_PROD
ENV IS_PROD=$IS_PROD
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_PUBLIC_POSTHOG_KEY
ENV VITE_PUBLIC_POSTHOG_KEY=$VITE_PUBLIC_POSTHOG_KEY
ARG VITE_PUBLIC_POSTHOG_HOST
ENV VITE_PUBLIC_POSTHOG_HOST=$VITE_PUBLIC_POSTHOG_HOST

RUN npm run build

FROM nginx:stable-alpine

ARG IS_PROD
COPY prod.nginx.conf dev.nginx.conf ./
RUN if [ "$IS_PROD" = "true" ]; then mv prod.nginx.conf /etc/nginx/conf.d/default.conf; else mv dev.nginx.conf /etc/nginx/conf.d/default.conf; fi && rm -f prod.nginx.conf dev.nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]