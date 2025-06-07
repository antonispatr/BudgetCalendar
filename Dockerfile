FROM node:20-alpine

WORKDIR /usr/src/app

# Install only prod deps
COPY package.json package-lock.json* ./
RUN npm install --production

# Copy everything
COPY . .

# Expose your server port
EXPOSE 3000
CMD ["npm","start"]
