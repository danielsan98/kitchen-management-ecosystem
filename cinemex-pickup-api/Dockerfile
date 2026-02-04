ARG AWS_ACCOUNT_ID
ARG AWS_DEFAULT_REGION

FROM "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/mmc-cyclops-ecr-node:alpine" AS deps

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --non-interactive

ARG AWS_ACCOUNT_ID
ARG AWS_DEFAULT_REGION
FROM "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/mmc-cyclops-ecr-node:alpine" AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn build

ARG AWS_ACCOUNT_ID
ARG AWS_DEFAULT_REGION
FROM "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com/mmc-cyclops-ecr-node:alpine" AS runner

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install --production --non-interactive # Removed --frozen-lockfile
COPY --from=builder /app/dist ./dist

EXPOSE 5001

CMD [ "node","dist/main" ]