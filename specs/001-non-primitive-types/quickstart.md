# Quickstart: Non-Primitive Type Support

**Date**: 2026-02-15  
**Feature**: [Non-Primitive Type Support](./spec.md)  
**API Contracts**: [contracts/type-metadata-api.md](./contracts/type-metadata-api.md)

## Overview

This quickstart guide demonstrates how to use non-primitive types (enums, classes, records, tuples) as units in the unacy library. All examples maintain full type safety at compile time while providing rich runtime metadata.

## Basic Usage

### Installing

```bash
pnpm add unacy
```

### Importing

```typescript
import { createRegistry } from 'unacy';
```

## Enum Units

### Example 1: Log Levels

```typescript
// Define an enum
enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Create registry and register enum unit
const registry = createRegistry()
  .register({
    name: 'LogLevel',
    type: 'enum',
    value: LogLevel,
    enumType: 'numeric'
  });

// Create branded values
const debugLevel = LogLevel.DEBUG as typeof registry.LogLevel;
const errorLevel = LogLevel.ERROR as typeof registry.LogLevel;

// Use the registry accessor
const infoLevel = registry.LogLevel(LogLevel.INFO);

// Introspection
const metadata = registry.getMetadata('LogLevel');
console.log(metadata.value === LogLevel);  // true
console.log(metadata.enumType);  // 'numeric'
```

### Example 2: String Enums

```typescript
enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

const registry = createRegistry()
  .register({
    name: 'Priority',
    type: 'enum',
    value: Priority,
    enumType: 'string'
  });

const criticalPriority = registry.Priority(Priority.CRITICAL);
```

### Example 3: Enum Conversions

```typescript
// Register conversion between enums
const registry = createRegistry()
  .register({
    name: 'LogLevel',
    type: 'enum',
    value: LogLevel,
    enumType: 'numeric'
  })
  .register({
    name: 'Priority',
    type: 'enum',
    value: Priority,
    enumType: 'string'
  });

// Register converter from LogLevel to Priority
registry.LogLevel.register('Priority', (level: number) => {
  if (level >= LogLevel.ERROR) return Priority.CRITICAL;
  if (level >= LogLevel.WARN) return Priority.HIGH;
  if (level >= LogLevel.INFO) return Priority.MEDIUM;
  return Priority.LOW;
});

// Convert
const priority = registry.LogLevel.to.Priority(errorLevel);
```

## Class Units

### Example 4: Temperature Class

```typescript
class Temperature {
  constructor(
    public value: number,
    public scale: 'C' | 'F' | 'K'
  ) {}
  
  toCelsius(): number {
    switch (this.scale) {
      case 'C': return this.value;
      case 'F': return (this.value - 32) * 5/9;
      case 'K': return this.value - 273.15;
    }
  }
  
  toFahrenheit(): number {
    const celsius = this.toCelsius();
    return celsius * 9/5 + 32;
  }
}

const registry = createRegistry()
  .register({
    name: 'Temperature',
    type: 'class',
    value: Temperature,
    className: 'Temperature'
  });

// Create instances with any constructor parameters
const temp1 = new Temperature(100, 'F');
const temp2 = new Temperature(37, 'C');

// Brand as unit types
const tempUnit1 = temp1 as typeof registry.Temperature;

// Access class methods
console.log(tempUnit1.toCelsius());  // Methods still available
console.log(tempUnit1.toFahrenheit());

// Introspection
const metadata = registry.getMetadata('Temperature');
console.log(metadata.value === Temperature);  // true
console.log(metadata.className);  // 'Temperature'
```

### Example 5: Class with Inheritance

```typescript
class Measurement {
  constructor(public value: number) {}
  
  toString() {
    return `${this.value}`;
  }
}

class Distance extends Measurement {
  constructor(value: number, public unit: string) {
    super(value);
  }
  
  toString() {
    return `${this.value} ${this.unit}`;
  }
}

const registry = createRegistry()
  .register({
    name: 'Distance',
    type: 'class',
    value: Distance,
    className: 'Distance'
  });

const distance = new Distance(100, 'meters');
const distanceUnit = distance as typeof registry.Distance;

// Prototype chain accessible
console.log(distanceUnit.toString());  // '100 meters'
console.log(distanceUnit instanceof Measurement);  // true
```

## Record Units

### Example 6: 2D Point

```typescript
const PointSchema = {
  x: "number",
  y: "number"
} as const;

const registry = createRegistry()
  .register({
    name: 'Point',
    type: 'record',
    value: PointSchema
  });

// Create record values
const point = registry.Point({ x: 10, y: 20 });

// TypeScript infers: { x: number, y: number }
console.log(point.x, point.y);

// Introspection
const metadata = registry.getMetadata('Point');
console.log(metadata.value);  // { x: "number", y: "number" }
```

### Example 7: Nested Records

```typescript
const AddressSchema = {
  street: "string",
  city: "string",
  coordinates: {
    lat: "number",
    lng: "number"
  }
} as const;

const registry = createRegistry()
  .register({
    name: 'Address',
    type: 'record',
    value: AddressSchema
  });

const address = registry.Address({
  street: "123 Main St",
  city: "Springfield",
  coordinates: {
    lat: 42.1234,
    lng: -71.5678
  }
});

// Full type safety for nested properties
console.log(address.coordinates.lat);
```

### Example 8: Record Conversions

```typescript
const Point2DSchema = {
  x: "number",
  y: "number"
} as const;

const Point3DSchema = {
  x: "number",
  y: "number",
  z: "number"
} as const;

const registry = createRegistry()
  .register({
    name: 'Point2D',
    type: 'record',
    value: Point2DSchema
  })
  .register({
    name: 'Point3D',
    type: 'record',
    value: Point3DSchema
  });

// Register conversion
registry.Point2D.register('Point3D', (point: { x: number, y: number }) => {
  return { x: point.x, y: point.y, z: 0 };
});

const point2D = registry.Point2D({ x: 10, y: 20 });
const point3D = registry.Point2D.to.Point3D(point2D);

console.log(point3D);  // { x: 10, y: 20, z: 0 }
```

## Tuple Units

### Example 9: RGB Color

```typescript
const RGBSchema = ["number", "number", "number"] as const;

const registry = createRegistry()
  .register({
    name: 'RGB',
    type: 'tuple',
    value: RGBSchema
  });

const red = registry.RGB([255, 0, 0]);
const green = registry.RGB([0, 255, 0]);

// TypeScript infers: [number, number, number]
console.log(red[0], red[1], red[2]);
```

### Example 10: Optional Tuple Elements

```typescript
const CoordinateSchema = ["number", "number", "number?"] as const;

const registry = createRegistry()
  .register({
    name: 'Coordinate',
    type: 'tuple',
    value: CoordinateSchema
  });

// With z coordinate
const coord3D = registry.Coordinate([10, 20, 30]);

// Without z coordinate (optional)
const coord2D = registry.Coordinate([10, 20]);

// TypeScript infers: [number, number, number?]
```

### Example 11: Rest Elements

```typescript
const VersionSchema = ["number", "number", "...number"] as const;

const registry = createRegistry()
  .register({
    name: 'Version',
    type: 'tuple',
    value: VersionSchema
  });

// Semantic version
const v1 = registry.Version([1, 0, 0]);

// With pre-release identifiers
const v2 = registry.Version([1, 2, 3, 4, 5]);

// TypeScript infers: [number, number, ...number[]]
```

## Advanced Patterns

### Example 12: Mixed Type Registry

```typescript
// Register multiple types in one registry
const registry = createRegistry()
  // Primitive
  .register({ name: 'Meter', type: 'number' })
  
  // Enum
  .register({
    name: 'LogLevel',
    type: 'enum',
    value: LogLevel,
    enumType: 'numeric'
  })
  
  // Class
  .register({
    name: 'Temperature',
    type: 'class',
    value: Temperature,
    className: 'Temperature'
  })
  
  // Record
  .register({
    name: 'Point',
    type: 'record',
    value: { x: "number", y: "number" }
  })
  
  // Tuple
  .register({
    name: 'RGB',
    type: 'tuple',
    value: ["number", "number", "number"]
  });

// All types available through unified interface
const distance = registry.Meter(100);
const level = registry.LogLevel(LogLevel.INFO);
const temp = registry.Temperature(new Temperature(37, 'C'));
const point = registry.Point({ x: 10, y: 20 });
const color = registry.RGB([255, 128, 0]);
```

### Example 13: Type Introspection

```typescript
// Query metadata at runtime
const metadata = registry.getMetadata('Point');

if (isRecordMetadata(metadata)) {
  // TypeScript knows this is RecordTypedMetadata
  console.log('Record properties:', Object.keys(metadata.value));
  
  // Iterate over schema
  for (const [key, typeDesc] of Object.entries(metadata.value)) {
    if (typeof typeDesc === 'string') {
      console.log(`${key}: ${typeDesc}`);
    } else {
      console.log(`${key}: nested object`);
    }
  }
}
```

### Example 14: Validation Examples

```typescript
// These will throw clear error messages:

// Mixed enum (rejected)
enum MixedEnum {
  A = 0,
  B = 'text'  // ERROR: Mixed enums not supported
}

try {
  registry.register({
    name: 'MixedEnum',
    type: 'enum',
    value: MixedEnum,
    enumType: 'numeric'
  });
} catch (error) {
  console.error(error.message);
  // "Mixed enums (with both numeric and string members) are not supported..."
}

// Circular reference (rejected)
const CircularSchema: any = {
  name: "string",
  parent: null
};
CircularSchema.parent = CircularSchema;  // Create circular reference

try {
  registry.register({
    name: 'Circular',
    type: 'record',
    value: CircularSchema
  });
} catch (error) {
  console.error(error.message);
  // "Circular references in record schemas are not supported..."
}

// Invalid type name (rejected)
try {
  registry.register({
    name: 'Bad',
    type: 'record',
    value: { x: "integer" }  // ERROR: "integer" is not a valid type name
  });
} catch (error) {
  console.error(error.message);
  // "Invalid type name \"integer\" for property \"x\"..."
}
```

## Backward Compatibility

All existing primitive type operations continue to work unchanged:

```typescript
// Existing code (primitives) works as before
const registry = createRegistry()
  .register({ name: 'Meter', type: 'number' })
  .register({ name: 'Second', type: 'number' });

const distance = registry.Meter(100);
const time = registry.Second(10);

// New code (non-primitives) integrates seamlessly
registry
  .register({
    name: 'Point',
    type: 'record',
    value: { x: "number", y: "number" }
  });

const point = registry.Point({ x: distance, y: 50 });
```

## Best Practices

1. **Use `as const` for schemas**: Ensures literal types for better inference
   ```typescript
   const schema = { x: "number" } as const;  // ✓ Good
   const schema = { x: "number" };            // ✗ Less precise
   ```

2. **Provide className for classes**: Helps with debugging
   ```typescript
   registry.register({
     name: 'Temperature',
     type: 'class',
     value: Temperature,
     className: 'Temperature'  // ✓ Helpful for debugging
   });
   ```

3. **Validate schemas early**: Register units during initialization to catch errors early

4. **Use type guards for introspection**: Type-safe metadata access
   ```typescript
   if (isRecordMetadata(meta)) {
     // TypeScript knows meta.value is RecordSchema
   }
   ```

5. **Document complex schemas**: Add JSDoc comments for nested structures
   ```typescript
   /**
    * Person schema with nested address
    */
   const PersonSchema = {
     name: "string",
     address: {
       street: "string",
       city: "string"
     }
   } as const;
   ```

## Next Steps

- See [data-model.md](./data-model.md) for complete type definitions
- See [contracts/type-metadata-api.md](./contracts/type-metadata-api.md) for full API reference
- Check [spec.md](./spec.md) for complete feature requirements
- Review test files in `packages/core/src/__tests__/` for more examples

## Summary

Non-primitive type support provides:
- ✅ **Enums**: Type-safe categorical units with runtime introspection
- ✅ **Classes**: Object-oriented units with methods and inheritance
- ✅ **Records**: Structured data units with nested object support
- ✅ **Tuples**: Fixed-length array units with optional and rest elements
- ✅ **Full backward compatibility**: Existing code unchanged
- ✅ **Type-safe**: Complete compile-time type inference
- ✅ **Runtime safe**: Clear validation with helpful error messages
