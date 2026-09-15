const swaggerSpec = {
  openapi: "3.0.0",

  info: {
    title: "SAMVAAD API",
    version: "2.0.0",
    description:
      "Backend API for SAMVAAD - Intelligent Multilingual Public Communication Platform"
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
    },

    schemas: {
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: {
            type: "string",
            format: "email",
            example: "admin@communication.com"
          },
          password: {
            type: "string",
            format: "password",
            example: "Admin@123"
          }
        }
      },

      CampaignAIConfig: {
        type: "object",
        properties: {
          campaign_id: {
            type: "integer",
            example: 1
          },
          scenario: {
            type: "string",
            example:
              "Dengue cases are increasing during the monsoon. Residents should remove stagnant water and take precautions against mosquito bites."
          },
          location: {
            type: "string",
            example: "Chennai, Tamil Nadu"
          },
          tone: {
            type: "string",
            example: "Informative"
          },
          languages: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["English", "Tamil"]
          },
          channels: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["SMS", "WhatsApp"]
          },
          use_preferred_languages: {
            type: "boolean",
            example: true
          }
        }
      },

      GenerateContentRequest: {
        type: "object",
        required: [
          "campaign",
          "audience",
          "topic",
          "tone"
        ],
        properties: {
          campaign: {
            type: "string",
            example: "Dengue Prevention Awareness"
          },
          audience: {
            type: "string",
            example: "Chennai Residents"
          },
          topic: {
            type: "string",
            example:
              "Dengue cases are increasing during the monsoon. Residents should remove stagnant water and take precautions against mosquito bites."
          },
          tone: {
            type: "string",
            example: "Informative"
          },
          location: {
            type: "string",
            example: "Chennai, Tamil Nadu"
          },
          languages: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["English", "Tamil"]
          },
          channels: {
            type: "array",
            items: {
              type: "string"
            },
            example: ["SMS", "WhatsApp"]
          },
          audience_id: {
            type: "integer",
            example: 2
          },
          usePreferredLanguages: {
            type: "boolean",
            example: true
          }
        }
      },

      GenerateContentResponse: {
        type: "object",
        properties: {
          baseContent: {
            type: "string",
            example:
              "Dengue prevention begins at home. Remove stagnant water from containers, flowerpots, coolers, and drains. Keep your surroundings clean and use appropriate mosquito protection. If you develop symptoms such as fever or severe body pain, seek medical advice promptly."
          },

          localizedContent: {
            type: "object",
            additionalProperties: {
              type: "string"
            },
            example: {
              English:
                "Dengue prevention begins at home. Remove stagnant water from containers, flowerpots, coolers, and drains. Keep your surroundings clean and use appropriate mosquito protection.",
              Tamil:
                "டெங்கு தடுப்பு வீட்டிலிருந்தே தொடங்குகிறது. பாத்திரங்கள், பூந்தொட்டிகள் மற்றும் தேங்கியுள்ள இடங்களில் இருக்கும் நீரை அகற்றுங்கள். சுற்றுப்புறத்தை சுத்தமாக வைத்துக் கொண்டு கொசுக்களிலிருந்து பாதுகாப்பு பெறுங்கள்."
            }
          },

          channelVersions: {
            type: "object",
            additionalProperties: {
              type: "object",
              additionalProperties: {
                type: "string"
              }
            }
          },

          recipientCount: {
            type: "integer",
            example: 100
          },

          languageDistribution: {
            type: "object",
            additionalProperties: {
              type: "integer"
            },
            example: {
              English: 40,
              Tamil: 35,
              Kannada: 15,
              Hindi: 10
            }
          },

          personalizationScore: {
            type: "number",
            format: "float",
            example: 91
          },

          toneOptimizationScore: {
            type: "number",
            format: "float",
            example: 94
          },

          provider: {
            type: "string",
            example: "Gemini"
          },

          model: {
            type: "string",
            example: "gemini-2.5-flash"
          },

          qualityNotes: {
            type: "array",
            items: {
              type: "string"
            }
          }
        }
      },

      TranslationRequest: {
        type: "object",
        required: ["content", "language"],
        properties: {
          content: {
            type: "string",
            example:
              "Remove stagnant water and keep your surroundings clean to help prevent dengue."
          },
          language: {
            type: "string",
            example: "Tamil"
          },
          audience: {
            type: "string",
            example: "Chennai Residents"
          }
        }
      },

      QualityCheckRequest: {
        type: "object",
        required: [
          "campaign",
          "baseContent"
        ],
        properties: {
          campaign: {
            type: "string",
            example: "Dengue Prevention Awareness"
          },
          scenario: {
            type: "string",
            example:
              "Dengue cases are increasing during the monsoon. Residents should remove stagnant water."
          },
          audience: {
            type: "string",
            example: "Chennai Residents"
          },
          location: {
            type: "string",
            example: "Chennai, Tamil Nadu"
          },
          tone: {
            type: "string",
            example: "Informative"
          },
          baseContent: {
            type: "string",
            example:
              "Dengue prevention begins at home. Remove stagnant water and keep your surroundings clean."
          },
          localizedContent: {
            type: "object",
            additionalProperties: {
              type: "string"
            },
            example: {
              English:
                "Dengue prevention begins at home. Remove stagnant water and keep your surroundings clean.",
              Tamil:
                "டெங்கு தடுப்பு வீட்டிலிருந்தே தொடங்குகிறது. தேங்கிய நீரை அகற்றி சுற்றுப்புறத்தை சுத்தமாக வைத்திருங்கள்."
            }
          }
        }
      },

      QualityCheckResponse: {
        type: "object",
        properties: {
          overallScore: {
            type: "number",
            example: 91
          },

          checks: {
            type: "object",
            properties: {
              grammar: {
                type: "number",
                example: 95
              },
              clarity: {
                type: "number",
                example: 93
              },
              toneAppropriateness: {
                type: "number",
                example: 94
              },
              factualAccuracy: {
                type: "number",
                example: 88
              },
              sensitiveContent: {
                type: "number",
                example: 96
              },
              compliance: {
                type: "number",
                example: 90
              }
            }
          },

          flags: {
            type: "array",
            items: {
              type: "string"
            },
            example: []
          },

          nlp: {
            type: "object",
            properties: {
              provider: {
                type: "string",
                example: "spaCy + Indic NLP"
              },
              sentences: {
                type: "integer",
                example: 4
              },
              tokens: {
                type: "integer",
                example: 62
              }
            }
          },

          reviewStatus: {
            type: "string",
            example: "REVIEW_REQUIRED"
          }
        }
      }
    }
  },

  tags: [
    {
      name: "Authentication",
      description: "Admin authentication APIs"
    },
    {
      name: "Health",
      description: "Backend health check"
    },
    {
      name: "Dashboard",
      description: "Dashboard statistics"
    },
    {
      name: "Recipients",
      description: "Recipient management APIs"
    },
    {
      name: "Audiences",
      description: "Audience management APIs"
    },
    {
      name: "Campaigns",
      description: "Campaign management APIs"
    },
    {
      name: "Templates",
      description: "Communication template APIs"
    },
    {
      name: "AI Communication",
      description:
        "SAMVAAD AI content generation, multilingual communication, personalization and tone optimization"
    },
    {
      name: "AI Quality & Compliance",
      description:
        "AI quality evaluation using semantic checks and NLP-based analysis"
    }
  ],

  paths: {

    /* ============================================================
       HEALTH
       ============================================================ */

    "/api/health": {
      get: {
        tags: ["Health"],
        summary: "Check backend health",
        responses: {
          200: {
            description: "Backend is running",
            content: {
              "application/json": {
                example: {
                  status: "ok"
                }
              }
            }
          }
        }
      }
    },

    /* ============================================================
       AUTHENTICATION
       ============================================================ */

    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Admin login",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/LoginRequest"
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful login",
            content: {
              "application/json": {
                example: {
                  token: "eyJhbGciOiJIUzI1NiIs...",
                  admin: {
                    admin_id: 1,
                    full_name: "System Admin",
                    email: "admin@communication.com"
                  }
                }
              }
            }
          },
          401: {
            description: "Invalid credentials"
          }
        }
      }
    },

    /* ============================================================
       DASHBOARD
       ============================================================ */

    "/api/stats": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard statistics",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Dashboard statistics returned successfully",
            content: {
              "application/json": {
                example: {
                  recipients: 100,
                  audiences: 5,
                  campaigns: 3,
                  templates: 18
                }
              }
            }
          },
          401: {
            description: "Authentication required"
          }
        }
      }
    },

    /* ============================================================
       RECIPIENTS
       ============================================================ */

    "/api/recipients": {
      get: {
        tags: ["Recipients"],
        summary: "Get all recipients",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of recipients"
          },
          401: {
            description: "Authentication required"
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
                required: ["first_name", "state"],
                properties: {
                  first_name: {
                    type: "string",
                    example: "Priya"
                  },
                  last_name: {
                    type: "string",
                    example: "Sharma"
                  },
                  email: {
                    type: "string",
                    example: "priya@example.com"
                  },
                  phone: {
                    type: "string",
                    example: "9876543210"
                  },
                  age: {
                    type: "integer",
                    example: 29
                  },
                  gender: {
                    type: "string",
                    example: "Female"
                  },
                  state: {
                    type: "string",
                    example: "Tamil Nadu"
                  },
                  district: {
                    type: "string",
                    example: "Chennai"
                  },
                  city: {
                    type: "string",
                    example: "Chennai"
                  },
                  language: {
                    type: "string",
                    example: "Tamil"
                  },
                  occupation: {
                    type: "string",
                    example: "Teacher"
                  }
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
            schema: {
              type: "integer"
            },
            example: 1
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
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "Recipient deactivated successfully"
          }
        }
      }
    },

    /* ============================================================
       AUDIENCES
       ============================================================ */

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
                    example: "Chennai Residents"
                  },
                  description: {
                    type: "string",
                    example:
                      "Recipients located in Chennai"
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
            schema: {
              type: "integer"
            },
            example: 1
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
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "Audience deleted successfully"
          }
        }
      }
    },

    "/api/audiences/{id}/recipients": {
      get: {
        tags: ["Audiences"],
        summary: "Get recipients belonging to an audience",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 2
          }
        ],
        responses: {
          200: {
            description: "Audience recipients returned successfully"
          }
        }
      }
    },

    "/api/admin/seed-regional-audiences": {
      post: {
        tags: ["Audiences"],
        summary: "Create predefined regional audiences",
        description:
          "Creates predefined audiences for Tamil Nadu, Chennai, Kanchipuram, Thanjavur, Tiruchirappalli, Coimbatore, Madurai, Salem, Tirunelveli, Vellore, Erode, Kerala and Karnataka if they do not already exist.",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Regional audiences created or already existing"
          },
          401: {
            description: "Authentication required"
          }
        }
      }
    },

    /* ============================================================
       CAMPAIGNS
       ============================================================ */

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
                    example: "Dengue Prevention Awareness"
                  },
                  description: {
                    type: "string",
                    example:
                      "Public awareness campaign to reduce dengue risk."
                  },
                  status: {
                    type: "string",
                    example: "DRAFT"
                  }
                }
              }
            }
          }
        },
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
            schema: {
              type: "integer"
            },
            example: 1
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
            schema: {
              type: "integer"
            },
            example: 1
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
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["audience_id"],
                properties: {
                  audience_id: {
                    type: "integer",
                    example: 2
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Campaign-audience association updated"
          }
        }
      }
    },

    /* ============================================================
       AI CAMPAIGN CONFIGURATION
       ============================================================ */

    "/api/campaigns/{id}/ai-config": {
      get: {
        tags: ["AI Communication"],
        summary: "Get AI configuration for a campaign",
        description:
          "Returns the scenario, location, tone, selected languages, delivery channels and recipient-language preference configuration.",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description: "AI campaign configuration returned",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CampaignAIConfig"
                }
              }
            }
          },
          404: {
            description: "AI configuration not found"
          }
        }
      },

      put: {
        tags: ["AI Communication"],
        summary: "Save AI configuration for a campaign",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/CampaignAIConfig"
              }
            }
          }
        },
        responses: {
          200: {
            description: "AI campaign configuration saved successfully"
          }
        }
      }
    },

    /* ============================================================
       AI CONTENT GENERATION
       ============================================================ */

    "/api/ai/generate-content": {
      post: {
        tags: ["AI Communication"],
        summary: "Generate multilingual campaign content with Gemini",
        description:
          "Uses Gemini 2.5 Flash to generate review-ready public communication. The generation can use audience language distribution, campaign scenario, location, tone and delivery channel requirements.",

        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/GenerateContentRequest"
              },

              example: {
                campaign: "Dengue Prevention Awareness",
                audience: "Chennai Residents",
                topic:
                  "Dengue cases are increasing during the monsoon. Residents should remove stagnant water around their homes and take precautions against mosquito bites.",
                tone: "Informative",
                location: "Chennai, Tamil Nadu",
                languages: [
                  "English",
                  "Tamil"
                ],
                channels: [
                  "SMS",
                  "WhatsApp"
                ],
                audience_id: 2,
                usePreferredLanguages: true
              }
            }
          }
        },

        responses: {
          200: {
            description:
              "AI-generated multilingual communication returned successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/GenerateContentResponse"
                },

                example: {
                  baseContent:
                    "Dengue prevention begins at home. Remove stagnant water from containers, flowerpots, coolers, and drains. Keep your surroundings clean and use appropriate mosquito protection.",

                  localizedContent: {
                    English:
                      "Dengue prevention begins at home. Remove stagnant water from containers, flowerpots, coolers, and drains. Keep your surroundings clean and use appropriate mosquito protection.",

                    Tamil:
                      "டெங்கு தடுப்பு வீட்டிலிருந்தே தொடங்குகிறது. பாத்திரங்கள், பூந்தொட்டிகள் மற்றும் குளிரூட்டிகளில் தேங்கியுள்ள நீரை அகற்றுங்கள். சுற்றுப்புறத்தை சுத்தமாக வைத்துக் கொண்டு கொசுக்களிலிருந்து பாதுகாப்பு பெறுங்கள்."
                  },

                  channelVersions: {
                    SMS: {
                      English:
                        "Prevent dengue by removing stagnant water and keeping your surroundings clean. Use mosquito protection and take precautions during the monsoon."
                    },

                    WhatsApp: {
                      English:
                        "Dengue prevention starts at home. Remove stagnant water from containers, flowerpots and drains, keep your surroundings clean, and use mosquito protection. Please share this message with your family and neighbours."
                    }
                  },

                  recipientCount: 100,

                  languageDistribution: {
                    English: 40,
                    Tamil: 35,
                    Kannada: 15,
                    Hindi: 10
                  },

                  personalizationScore: 91,

                  toneOptimizationScore: 94,

                  provider: "Gemini",

                  model: "gemini-2.5-flash",

                  qualityNotes: [
                    "Content is suitable for public-awareness communication.",
                    "Localized versions should be reviewed before approval."
                  ]
                }
              }
            }
          },

          400: {
            description: "Invalid generation request"
          },

          401: {
            description: "Authentication required"
          },

          503: {
            description:
              "Gemini is not configured. Add GEMINI_API_KEY to backend/.env and restart the backend."
          },

          502: {
            description: "Gemini content generation failed"
          }
        }
      }
    },

    /* ============================================================
       AI TRANSLATION
       ============================================================ */

    "/api/ai/translate-content": {
      post: {
        tags: ["AI Communication"],
        summary: "Translate campaign content",
        description:
          "Generates a localized version of public-awareness content for a selected Indian language while preserving meaning, tone and actionable instructions.",

        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/TranslationRequest"
              },

              example: {
                content:
                  "Remove stagnant water and keep your surroundings clean to help prevent dengue.",
                language: "Tamil",
                audience: "Chennai Residents"
              }
            }
          }
        },

        responses: {
          200: {
            description: "Localized content generated successfully",
            content: {
              "application/json": {
                example: {
                  content:
                    "டெங்கு பரவலைத் தடுக்க தேங்கியுள்ள நீரை அகற்றி உங்கள் சுற்றுப்புறத்தை சுத்தமாக வைத்திருங்கள்.",
                  provider: "Gemini",
                  language: "Tamil",
                  quality_note:
                    "Translation generated for admin review before distribution."
                }
              }
            }
          },

          400: {
            description: "Content and language are required"
          },

          401: {
            description: "Authentication required"
          },

          502: {
            description: "AI translation failed"
          }
        }
      }
    },

    /* ============================================================
       AI QUALITY & COMPLIANCE
       ============================================================ */

    "/api/ai/quality-check": {
      post: {
        tags: ["AI Quality & Compliance"],
        summary: "Evaluate generated content quality and compliance",

        description:
          "Evaluates generated campaign content using AI-based semantic review together with NLP analysis. The result contains an overall score out of 100 and individual scores for grammar, clarity, tone appropriateness, factual accuracy, sensitive content and compliance.",

        security: [{ bearerAuth: [] }],

        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/QualityCheckRequest"
              },

              example: {
                campaign: "Dengue Prevention Awareness",

                scenario:
                  "Dengue cases are increasing during the monsoon. Residents should remove stagnant water and take precautions.",

                audience: "Chennai Residents",

                location: "Chennai, Tamil Nadu",

                tone: "Informative",

                baseContent:
                  "Dengue prevention begins at home. Remove stagnant water and keep your surroundings clean.",

                localizedContent: {
                  English:
                    "Dengue prevention begins at home. Remove stagnant water and keep your surroundings clean.",

                  Tamil:
                    "டெங்கு தடுப்பு வீட்டிலிருந்தே தொடங்குகிறது. தேங்கிய நீரை அகற்றி சுற்றுப்புறத்தை சுத்தமாக வைத்திருங்கள்."
                }
              }
            }
          }
        },

        responses: {
          200: {
            description:
              "AI quality and compliance evaluation completed successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/QualityCheckResponse"
                },

                example: {
                  overallScore: 91,

                  checks: {
                    grammar: 95,
                    clarity: 93,
                    toneAppropriateness: 94,
                    factualAccuracy: 88,
                    sensitiveContent: 96,
                    compliance: 90
                  },

                  flags: [],

                  nlp: {
                    provider: "spaCy + Indic NLP",
                    sentences: 4,
                    tokens: 62
                  },

                  reviewStatus: "REVIEW_REQUIRED"
                }
              }
            }
          },

          400: {
            description: "Invalid quality-check request"
          },

          401: {
            description: "Authentication required"
          },

          502: {
            description:
              "AI quality/compliance evaluation failed"
          }
        }
      }
    },

    /* ============================================================
       TEMPLATES
       ============================================================ */

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
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: [
                  "title",
                  "template_type",
                  "content"
                ],
                properties: {
                  title: {
                    type: "string",
                    example:
                      "Dengue Prevention SMS"
                  },
                  template_type: {
                    type: "string",
                    example: "AWARENESS"
                  },
                  channel: {
                    type: "string",
                    example: "SMS"
                  },
                  content: {
                    type: "string",
                    example:
                      "Please remove stagnant water around your home to reduce dengue risk."
                  }
                }
              }
            }
          }
        },
        responses: {
          201: {
            description:
              "Communication template created successfully"
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
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description:
              "Communication template updated successfully"
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
            schema: {
              type: "integer"
            },
            example: 1
          }
        ],
        responses: {
          200: {
            description:
              "Communication template deleted successfully"
          }
        }
      }
    }
  }
};

module.exports = swaggerSpec;