import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "CRM-HRMS API",
            version: "1.0.0",
            description: "API documentation for CRM-HRMS Backend",
        },
        servers: [
            {
                url: "http://localhost:5100",
                description: "Development server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
        },
        security: [{ bearerAuth: [] }],
    },
    apis: ["./src/routes/*.ts"], // ← reads JSDoc comments from all route files
};

export const swaggerSpec = swaggerJsdoc(options);