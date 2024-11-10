## Installation Instructions

### Using Docker 
Docker can be used to run Mailmate

Build the images using the following command:
```bash
docker compose build
```

### Locally

Install a version of [Node](https://nodejs.org/en/download/package-manager) >= 21

Install the required dependencies: 
```bash
npm ci
```

## Starting Mailmate

### Using Docker
Start the containers: 
```bash
docker compose up

# or in detached mode
docker compose up -d
```

### Locally

Start the development server with the following command: 
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

### Accessing the application
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
