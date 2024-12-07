
# myMailMate

**myMailMate** is a Node.js-based tool designed for creating and using email templates with the `mailto:` protocol. It simplifies email workflows by allowing users to define reusable templates with dynamic fields. Perfect for business or industrial processes, myMailMate enables sending consistent emails (e.g., shipping notifications or order updates) with minimal input, such as updating a shipping date or order number.

----------

## Features

-   **Template Management**: Create reusable email templates with predefined variables.
-   **Dynamic Fields**: Insert dynamic data into templates at the time of sending.
-   **Streamlined Workflow**: Reduce repetitive email drafting by using the `mailto:` protocol.
-   **Flexible Usage**: Works locally or within a Docker environment.

----------

## Installation

### Option 1: Using Docker

You can use Docker to set up and run myMailMate quickly.

1.  **Build the Docker images**:
    
    ```bash
    docker compose build
    
    ```
    

### Option 2: Local Installation

To run myMailMate locally, ensure you have [Node.js](https://nodejs.org/en/download/package-manager) installed (version 21 or later).

1.  **Install dependencies**:
    
    ```bash
    npm ci
    
    ```
    

----------

## Starting myMailMate

### Option 1: Using Docker

1.  Start the Docker containers:
    
    ```bash
    docker compose up
    
    ```
    
    Or, to run in detached mode:
    
    ```bash
    docker compose up -d
    
    ```
    

### Option 2: Locally

1.  Start the development server using your preferred package manager:
    
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    
    ```
    

----------

## Accessing the Application

Once the server is running, open your browser and navigate to:  
[http://localhost:3000](http://localhost:3000)

----------

## Use Cases

-   **Business Emails**: Automate recurring emails for shipping confirmations, order updates, or appointment scheduling.
-   **Customer Support**: Standardize responses to common inquiries while personalizing details dynamically.
-   **Internal Processes**: Streamline communication between departments with predefined templates.

----------

## Contributing

Contributions to myMailMate are welcome! Please ensure that your changes are well-documented and follow the project's coding standards.

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Submit a pull request with a detailed description of the changes.

----------

## License

This project is licensed under the MIT License.

----------

Make email management effortless with **myMailMate**! 🚀
