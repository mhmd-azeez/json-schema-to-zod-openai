# json-schema-to-zod-openai

A TypeScript library that converts JSON Schema to Zod schema with OpenAI compatibility.

## Installation

```bash
npm install json-schema-to-zod-openai
```

## Usage

```typescript
import { convertToZodSchema } from 'json-schema-to-zod-openai';

const jsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number' },
    roles: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['admin', 'user', 'guest']
      }
    }
  },
  required: ['name']
};

const zodSchema = convertToZodSchema(jsonSchema);

// Use the schema for validation
try {
  const validated = zodSchema.parse({
    name: 'John Doe',
    age: 30,
    roles: ['admin', 'user']
  });
  console.log('Valid data:', validated);
} catch (error) {
  console.error('Validation error:', error);
}
```

## Features

- Converts JSON Schema to Zod schema
- Supports OpenAI's schema limitations
- Handles:
  - Basic types (string, number, boolean)
  - Arrays
  - Enums
  - Nullable fields
  - Required fields
  - Object properties
  - Nested objects
  - Additional properties control
