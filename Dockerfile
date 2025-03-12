# Use the official Node.js image as the base image
FROM node:18-alpine

# Set the working directory
WORKDIR /usr/src/app


# Copy package.json and package-lock.json
COPY . .

RUN rm -rf node_modules
# Install dependencies
RUN npm install


# Build the NestJS application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start:prod"]