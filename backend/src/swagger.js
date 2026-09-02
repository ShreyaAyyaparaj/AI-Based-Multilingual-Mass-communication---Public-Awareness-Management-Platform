const swaggerSpec = {
  openapi: "3.0.0",

  info: {
    title: "SAMVAAD API",
    version: "1.0.0",
    description:
      "Backend API for SAMVAAD - Multilingual Public Communication Platform"
  },

  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server"
    }
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },

  tags: [
    { name: "Authentication", description: "Admin authentication APIs" },
    { name: "Health", description: "Backend health check" },
    { name: "Dashboard", description: "Dashboard statistics" },
    { name: "Recipients", description: "Recipient management APIs" },
    { name: "Audiences", description: "Audience management APIs" },
    { name: "Campaigns", description: "Campaign management APIs" },
    { name: "Templates", description: "Communication template APIs" }
  ],

  paths: {
    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check backend health",
        responses: {
          200: {
            description: "Backend is running"
          }
        }
      }
    },

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Admin login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    example: "admin@communication.com"
                  },
                  password: {
                    type: "string",
                    example: "Admin@123"
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful login"
          },
          401: {
            description: "Invalid credentials"
          }
        }
      }
    },

    "/api/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Dashboard statistics returned successfully"
          },
          401: {
            description: "Authentication required"
          }
        }
      }
    },

    "/api/recipients": {
      get: {
        tags: ["Recipients"],
        summary: "Get all recipients",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of recipients"
          }
        }
      },

      post: {
        tags: ["Recipients"],
        summary: "Create a recipient",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string", example: "Sample User" },
                  phone: { type: "string", example: "9876543210" },
                  email: { type: "string", example: "user@example.com" },
                  language: { type: "string", example: "Kannada" }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Recipient created successfully"
          }
        }
      }
    },

    "/api/recipients/{id}": {
      put: {
        tags: ["Recipients"],
        summary: "Update a recipient",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Recipient updated successfully"
          }
        }
      },

      delete: {
        tags: ["Recipients"],
        summary: "Deactivate a recipient",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Recipient deactivated successfully"
          }
        }
      }
    },

    "/api/audiences": {
      get: {
        tags: ["Audiences"],
        summary: "Get all audiences",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of audiences"
          }
        }
      },

      post: {
        tags: ["Audiences"],
        summary: "Create an audience",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: {
                    type: "string",
                    example: "Karnataka Recipients"
                  },
                  description: {
                    type: "string",
                    example: "Recipients from Karnataka"
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description: "Audience created successfully"
          }
        }
      }
    },

    "/api/audiences/{id}": {
      put: {
        tags: ["Audiences"],
        summary: "Update an audience",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Audience updated successfully"
          }
        }
      },

      delete: {
        tags: ["Audiences"],
        summary: "Delete an audience",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Audience deleted successfully"
          }
        }
      }
    },

    "/api/campaigns": {
      get: {
        tags: ["Campaigns"],
        summary: "Get all campaigns",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of campaigns"
          }
        }
      },

      post: {
        tags: ["Campaigns"],
        summary: "Create a campaign",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Campaign created successfully"
          }
        }
      }
    },

    "/api/campaigns/{id}": {
      put: {
        tags: ["Campaigns"],
        summary: "Update a campaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Campaign updated successfully"
          }
        }
      },

      delete: {
        tags: ["Campaigns"],
        summary: "Delete a campaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Campaign deleted successfully"
          }
        }
      }
    },

    "/api/campaigns/{id}/audience": {
      put: {
        tags: ["Campaigns"],
        summary: "Associate an audience with a campaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Campaign-audience association updated"
          }
        }
      }
    },

    "/api/templates": {
      get: {
        tags: ["Templates"],
        summary: "Get communication templates",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of communication templates"
          }
        }
      },

      post: {
        tags: ["Templates"],
        summary: "Create a communication template",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Template created successfully"
          }
        }
      }
    },

    "/api/templates/{id}": {
      put: {
        tags: ["Templates"],
        summary: "Update a communication template",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Template updated successfully"
          }
        }
      },

      delete: {
        tags: ["Templates"],
        summary: "Delete a communication template",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" }
          }
        ],
        responses: {
          200: {
            description: "Template deleted successfully"
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;