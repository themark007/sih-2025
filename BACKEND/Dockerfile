#base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install
# Copy the rest of the application code
COPY . . 

# run the react app
CMD ["node", "index.js"]