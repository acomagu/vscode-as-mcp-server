import * as assert from 'assert';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Copy of the transformToJsonSchema2020 function from mcp-server.ts
function transformToJsonSchema2020(schema: any): any {
  const transformed = JSON.parse(JSON.stringify(schema));
  
  transformed.$schema = 'https://json-schema.org/draft/2020-12/schema';
  
  if (!transformed.type) {
    transformed.type = 'object';
  }
  
  if (transformed.additionalProperties === false) {
    delete transformed.additionalProperties;
  }
  
  if (transformed.definitions) {
    transformed.$defs = transformed.definitions;
    delete transformed.definitions;
  }
  
  return transformed;
}

suite('MCP Server Schema Generation Test Suite', () => {
  test('Transform schema to JSON Schema draft 2020-12', () => {
    // Test schema
    const testSchema = z.object({
      command: z.string(),
      params: z.array(z.number()).optional(),
    });

    // Generate schema
    const generatedSchema = zodToJsonSchema(testSchema, {
      strictUnions: true,
    });

    // Transform to 2020-12
    const transformedSchema = transformToJsonSchema2020(generatedSchema);

    // Verify the transformation
    assert.strictEqual(transformedSchema.$schema, 'https://json-schema.org/draft/2020-12/schema');
    assert.strictEqual(transformedSchema.type, 'object');
    assert.strictEqual(transformedSchema.additionalProperties, undefined);
    
    // Original schema should have draft-07
    assert.strictEqual(generatedSchema.$schema, 'http://json-schema.org/draft-07/schema#');
  });

  test('Array length constraint (replaces tuple)', () => {
    // Test array with length constraint (replacement for tuple)
    const testSchema = z.object({
      view_range: z.array(z.number()).length(2).optional(),
    });

    const generatedSchema = zodToJsonSchema(testSchema, {
      strictUnions: true,
    });

    const transformedSchema = transformToJsonSchema2020(generatedSchema);

    // Verify array constraints are preserved
    assert.strictEqual(transformedSchema.properties.view_range.type, 'array');
    assert.strictEqual(transformedSchema.properties.view_range.minItems, 2);
    assert.strictEqual(transformedSchema.properties.view_range.maxItems, 2);
  });
});