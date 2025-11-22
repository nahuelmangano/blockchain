FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package manifests and install dependencies (include dotenv which the server uses)
COPY package.json ./
COPY package-lock.json* ./

# Install all dependencies (we need dotenv at runtime). Using npm install keeps image small enough for this app.
RUN npm install --no-audit --no-fund

# Copy app source
COPY . .

# Create uploads dir and set permissions, run as non-root user for better security
RUN mkdir -p /usr/src/app/uploads \
	&& chown -R node:node /usr/src/app/uploads /usr/src/app

USER node

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "server.js"]
