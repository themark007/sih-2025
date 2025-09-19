#base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm install
# Copy the rest of the application code
COPY . . 

EXPOSE 5173

# run the react app
CMD ["npm", "run", "dev"]