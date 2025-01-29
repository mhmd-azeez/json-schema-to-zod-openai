import { z } from "zod";

// Converts a JSON schema to a Zod schema tailored for OpenAI's structured output schema
// See: https://platform.openai.com/docs/guides/structured-outputs/supported-schemas
export function convertToZodSchema(schema: Record<string, any>): z.ZodType {
    if (!schema || typeof schema !== 'object') {
      return z.object({}).passthrough();
    }
  
    if (schema.type !== 'object') {
      if (Array.isArray(schema.type)) {
        if (schema.type.includes('null')) {
          const mainType = schema.type.find(t => t !== 'null');
          switch (mainType) {
            case 'string':
              return z.string().nullable();
            case 'number':
            case 'integer':
              return z.number().nullable();
            case 'boolean':
              return z.boolean().nullable();
            default:
              return z.any().nullable();
          }
        }
        return z.any();
      }
  
      switch (schema.type) {
        case 'string':
          if (schema.enum) {
            return z.enum(schema.enum as [string, ...string[]]);
          }
          return z.string();
        case 'number':
        case 'integer':
          return z.number();
        case 'boolean':
          return z.boolean();
        case 'array':
          return z.array(convertToZodSchema(schema.items));
        default:
          return z.any();
      }
    }
  
    const properties = schema.properties || {};
    const zodSchema: Record<string, z.ZodType> = {};
    const required = schema.required || [];
  
    for (const [key, prop] of Object.entries(properties)) {
      const value = prop as Record<string, any>;
      let fieldSchema: z.ZodType;
  
      switch (value.type) {
        case 'string':
          fieldSchema = value.enum 
            ? z.enum(value.enum as [string, ...string[]]) 
            : z.string();
          break;
        case 'number':
        case 'integer':
          fieldSchema = z.number();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'array':
          fieldSchema = z.array(convertToZodSchema(value.items));
          break;
        case 'object':
          fieldSchema = convertToZodSchema(value);
          break;
        default:
          fieldSchema = z.any();
      }
  
      if (!required.includes(key)) {
        fieldSchema = fieldSchema.nullable();
      }
  
      if (value.description) {
        fieldSchema = fieldSchema.describe(value.description);
      }
  
      zodSchema[key] = fieldSchema;
    }
  
    const result = z.object(zodSchema);
    if (schema.additionalProperties === false) {
      (result as any)._def.unknownKeys = 'strip';
    }
  
    return result;
  }