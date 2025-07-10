# API Documentation

This directory contains the API documentation and schema files for the Coffee Shop Web App.

## Files

- `openapi.json` - The complete OpenAPI 3.0 specification for the backend API
- `README.md` - This file

## How to Update OpenAPI Schema

### Manual Update (Current Method)
1. Navigate to your backend server: `http://0.0.0.0:8080/openapi.json`
2. Copy the JSON response
3. Save it as `openapi.json` in this directory
4. Commit the changes to track API evolution

### Automatic Update (Future Enhancement)
We can add a script to automatically fetch and update the OpenAPI schema:

```bash
# Future script example
npm run api:update-schema
```

## Using the OpenAPI Schema

The `openapi.json` file can be used for:

1. **Code Generation**: Generate TypeScript types and API clients
2. **Documentation**: Import into Swagger UI or other documentation tools
3. **Validation**: Validate API requests and responses
4. **Testing**: Generate test cases based on the schema
5. **Frontend Development**: Ensure endpoint consistency with backend

## Benefits

- **Single Source of Truth**: The OpenAPI schema serves as the contract between frontend and backend
- **Type Safety**: Generate TypeScript types from the schema
- **Endpoint Validation**: Ensure all endpoints in `src/config/urls.ts` match the actual API
- **Documentation**: Always up-to-date API documentation
- **Change Tracking**: Git history shows API evolution over time

## Integration with Project

The OpenAPI schema should be integrated with:
- `src/config/urls.ts` - Ensure all endpoints match
- `src/types/api.ts` - Generate types from schema
- `src/services/api.ts` - Validate method implementations 