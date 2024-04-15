import swaggerJsDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "Auto generated API documentation",
    },
    components: {
      schemas: {
        User: {
          type: "object",
          properties: {
            username: {
              type: "string",
            },
            email: {
              type: "string",
            },
            password: {
              type: "string",
            },
          },
        },
        Post: {
          type: "object",
          properties: {
            image: {
              type: "string",
            },
            authorName: {
              type: "string",
            },
            authorEmail: {
              type: "string",
            },
            comments: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  authorName: {
                    type: "string",
                  },
                  authorEmail: {
                    type: "string",
                  },
                  comment: {
                    type: "string",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsDoc(options);

export default swaggerSpec;
