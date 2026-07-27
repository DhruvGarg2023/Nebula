export const openApiSpec = {
  openapi: '3.0.3',
  info: {
    title: 'Collaborative AI Code Editor API',
    version: '1.0.0',
    description:
      'Production API specification for the Real-time Collaborative AI Code Editor platform powering rooms, compiler execution, GitHub sync, AI code reviews, and notifications.',
    contact: {
      name: 'API Support',
      email: 'support@example.com',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Local Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/health': {
      get: {
        summary: 'System Health Check',
        tags: ['System'],
        responses: {
          200: {
            description: 'System is healthy',
          },
        },
      },
    },
    '/auth/register': {
      post: {
        summary: 'Register new user account',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'User registered successfully' },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'Authenticate user & issue tokens',
        tags: ['Auth'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Login successful' },
        },
      },
    },
    '/rooms': {
      get: {
        summary: 'List user collaborative rooms',
        tags: ['Rooms'],
        responses: {
          200: { description: 'Paginated list of rooms' },
        },
      },
      post: {
        summary: 'Create a new collaborative room',
        tags: ['Rooms'],
        responses: {
          201: { description: 'Room created successfully' },
        },
      },
    },
    '/ai/explain': {
      post: {
        summary: 'Real-time AI code explanation',
        tags: ['AI'],
        responses: {
          200: { description: 'Code explanation generated' },
        },
      },
    },
    '/notifications': {
      get: {
        summary: 'Fetch paginated user notifications',
        tags: ['Notifications'],
        responses: {
          200: { description: 'Notifications list' },
        },
      },
    },
  },
};

export function renderSwaggerUiHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Collaborative AI Code Editor — API Documentation</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui.css" />
  <style>
    html { box-sizing: border-box; }
    *, *:before, *:after { box-sizing: inherit; }
    body { margin: 0; background: #fafafa; }
    .swagger-ui .topbar { display: none; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-bundle.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.18.2/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = () => {
      SwaggerUIBundle({
        spec: ${JSON.stringify(openApiSpec)},
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        layout: "StandaloneLayout"
      });
    };
  </script>
</body>
</html>`;
}
