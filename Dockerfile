# Step 1: Use lightweight Node.js base image
FROM node:20-alpine

# Step 2: Set working directory inside container
WORKDIR /app

# Step 3: Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Step 4: Copy application source code
COPY app.js ./

# Step 5: Expose application port
EXPOSE 3000

# Step 6: Command to run the application
CMD ["node", "app.js"]
