# Feature Specification: Non-Primitive Type Support

**Feature Branch**: `001-non-primitive-types`
**Created**: February 15, 2026
**Status**: Draft
**Input**: User description: "add support for non-primitive types (typescript enums, classes, records and tuples). For enums, in the runtime value in the unit metadata will be enum itself, for classes, it will be the class prototype, for records, a schema-like structure (object shape with value of properties = name of primitive type (or nested object)) and for tuples, an array of primitive type names."

## Clarifications

### Session 2026-02-15

- Q: How should the system handle mixed enums (enums with both numeric and string members)? → A: Reject mixed enums at registration time with clear error message
- Q: How should the system handle class inheritance and prototype chains? → A: Store only the direct class prototype; developers can traverse the prototype chain at runtime if needed
- Q: How should circular references or self-referential structures in records be handled? → A: Reject circular references at registration time with a clear error message
- Q: How should tuple types with optional or rest elements be represented in metadata? → A: Represent optional elements with "?" suffix (e.g., ["number", "string?"]) and rest elements with "..." prefix (e.g., ["number", "...string"])
- Q: What should happen when a class constructor requires parameters? → A: Allow any class regardless of constructor signature; the unit system only stores the prototype, not instances
- Q: How should the system handle empty types (empty enums, classes without methods, or empty records)? → A: Allow all empty types; they still provide type branding value even without data or behavior

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enum-Based Units (Priority: P1)

A developer wants to define units using TypeScript enums to represent discrete states or categories (e.g., log levels, priority levels, quality grades). The enum itself should be stored in the unit metadata at runtime, enabling runtime validation and introspection.

**Why this priority**: Enums are the most common non-primitive type used in TypeScript applications for representing categorical data. This provides immediate value for developers working with state machines, configuration systems, and domain-specific enumerations.

**Independent Test**: Can be fully tested by registering an enum-based unit (e.g., `LogLevel` enum), creating branded values with enum members, and verifying that the unit metadata contains the enum reference. Delivers value by enabling type-safe categorical units.

**Acceptance Scenarios**:

1. **Given** a TypeScript enum definition, **When** a developer registers it as a unit type, **Then** the registry stores the enum itself as the runtime metadata value
2. **Given** an enum-based unit is registered, **When** a developer creates a branded value using an enum member, **Then** the value is branded with the enum type and validates against enum members
3. **Given** an enum-based unit in the registry, **When** a developer queries the unit metadata, **Then** the metadata returns the enum reference for runtime introspection

---

### User Story 2 - Class-Based Units (Priority: P2)

A developer wants to define units using TypeScript classes to represent complex structured data with behavior (e.g., custom measurement types, domain entities). The class prototype should be stored in the unit metadata at runtime, enabling prototype-based validation and method access.

**Why this priority**: Classes enable more sophisticated unit definitions with methods and inheritance, but are less commonly needed than enums for basic unit systems. This supports advanced use cases like custom measurement types with computation methods.

**Independent Test**: Can be tested by registering a class-based unit (e.g., `Temperature` class with conversion methods), creating instances, and verifying that the unit metadata contains the class prototype. Delivers value by enabling object-oriented unit definitions.

**Acceptance Scenarios**:

1. **Given** a TypeScript class definition, **When** a developer registers it as a unit type, **Then** the registry stores the class prototype as the runtime metadata value
2. **Given** a class-based unit is registered, **When** a developer creates a branded value using a class instance, **Then** the value maintains reference to the class prototype
3. **Given** a class-based unit with methods, **When** a developer accesses unit metadata, **Then** the prototype methods are available for invocation

---

### User Story 3 - Record-Based Units (Priority: P2)

A developer wants to define units using TypeScript record types to represent structured data with known properties (e.g., coordinate pairs, RGB colors, configuration objects). A schema-like structure describing the object shape should be stored in metadata, with property values indicating primitive type names or nested object structures.

**Why this priority**: Records enable structured data definitions with type safety, important for multi-dimensional units and complex data types. Priority is equal to classes as both serve advanced scenarios.

**Independent Test**: Can be tested by registering a record-based unit (e.g., `{x: number, y: number}` for coordinates), creating values, and verifying that metadata contains the schema structure `{x: "number", y: "number"}`. Delivers value by enabling composite unit types.

**Acceptance Scenarios**:

1. **Given** a TypeScript record type definition, **When** a developer registers it as a unit type, **Then** the registry stores a schema object mapping property names to primitive type name strings
2. **Given** a record-based unit with nested objects, **When** the schema is generated, **Then** nested objects are represented as nested schema structures
3. **Given** a record-based unit is registered, **When** a developer creates a branded value with a matching object, **Then** the value is validated against the schema structure

---

### User Story 4 - Tuple-Based Units (Priority: P3)

A developer wants to define units using TypeScript tuple types to represent fixed-length arrays with specific element types (e.g., RGB triplets, coordinate pairs, version numbers). An array of primitive type name strings should be stored in metadata, with each element representing the type at that position.

**Why this priority**: Tuples are less commonly needed than other non-primitive types but provide value for fixed-length array representations. Lower priority as records can often serve similar purposes with named properties.

**Independent Test**: Can be tested by registering a tuple-based unit (e.g., `[number, number, number]` for RGB), creating values, and verifying that metadata contains `["number", "number", "number"]`. Delivers value by enabling ordered, fixed-length data structures.

**Acceptance Scenarios**:

1. **Given** a TypeScript tuple type definition, **When** a developer registers it as a unit type, **Then** the registry stores an array of type name strings representing each position
2. **Given** a tuple-based unit is registered, **When** a developer creates a branded value with a matching array, **Then** the value is validated to have the correct length and element types
3. **Given** a tuple with mixed primitive types, **When** the type metadata is generated, **Then** each position in the array reflects the corresponding primitive type name

---

### Edge Cases

- Mixed enums (both numeric and string members) are rejected at registration time with a clear error message explaining that only homogeneous enums are supported
- Class inheritance is supported by storing only the direct class prototype in metadata; the prototype chain remains accessible at runtime for inheritance traversal
- Records with circular references or self-referential structures are rejected at registration time with a clear error message explaining that circular structures are not supported
- Tuple types with optional elements are represented with "?" suffix (e.g., ["number", "string?"]) and rest elements with "..." prefix (e.g., ["number", "...string"]) in the metadata array
- Classes with constructor parameters are fully supported; the unit system stores only the prototype (not instances), so constructor signatures are irrelevant to the type system
- Empty types (empty enums, classes without methods, empty records) are all allowed as they still provide type branding value for compile-time safety
- What happens when record property values are not primitive types but complex nested structures?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support TypeScript enum types (numeric or string, but not mixed) as unit definitions
- **FR-001a**: System MUST reject mixed enums at registration time with a clear error message
- **FR-001b**: System MUST allow empty enums as they provide type branding value
- **FR-002**: System MUST store the enum itself as the runtime metadata value for enum-based units
- **FR-003**: System MUST support TypeScript class types as unit definitions
- **FR-004**: System MUST store the class prototype as the runtime metadata value for class-based units
- **FR-004a**: System MUST store only the direct class prototype, preserving the natural prototype chain for runtime traversal
- **FR-004b**: System MUST support classes with any constructor signature; constructor parameters are not relevant to the unit type system
- **FR-005**: System MUST support TypeScript record types (object shapes) as unit definitions
- **FR-006**: System MUST generate schema-like structures for record-based units, where property values are primitive type names or nested object schemas
- **FR-006a**: System MUST reject records with circular references at registration time with a clear error message
- **FR-007**: System MUST support TypeScript tuple types as unit definitions
- **FR-008**: System MUST store an array of primitive type name strings for tuple-based units, representing each position's type
- **FR-008a**: System MUST represent optional tuple elements with "?" suffix and rest elements with "..." prefix in the type name strings
- **FR-009**: System MUST extend the `PrimitiveType` type union to include non-primitive types (enums, classes, records, tuples)
- **FR-010**: System MUST provide type inference for non-primitive unit types, maintaining compile-time type safety
- **FR-011**: System MUST handle nested structures in records (e.g., `{outer: {inner: number}}` → `{outer: {inner: "number"}}`)
- **FR-012**: System MUST support registration of non-primitive types in the existing UnitRegistry infrastructure
- **FR-013**: System MUST maintain backward compatibility with existing primitive type registrations
- **FR-014**: System MUST provide runtime introspection capabilities for querying non-primitive type metadata
- **FR-015**: System MUST validate that branded values conform to their registered non-primitive type definitions

### Key Entities

- **NonPrimitiveType**: Union type encompassing enums, classes, records, and tuples
- **EnumMetadata**: Metadata structure containing the enum reference itself
- **ClassMetadata**: Metadata structure containing the class prototype reference
- **RecordSchema**: Schema object mapping property names to type descriptors (primitive type names or nested schemas)
- **TupleSchema**: Array of type descriptors representing each tuple position
- **TypeDescriptor**: Primitive type name string or nested schema structure used in record/tuple schemas
- **ExtendedTypeMetadata**: Enhanced metadata type supporting both primitive and non-primitive type information

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Developers can register and use enum-based units with full type safety and runtime validation
- **SC-002**: Developers can register and use class-based units with prototype preservation and method access
- **SC-003**: Developers can register and use record-based units with schema validation for object structures
- **SC-004**: Developers can register and use tuple-based units with positional type validation
- **SC-005**: All existing unit registry functionality continues to work with primitive types without breaking changes
- **SC-006**: Type inference correctly resolves non-primitive unit types at compile time with zero type errors
- **SC-007**: Runtime metadata accurately reflects the structure and type information of all non-primitive types
- **SC-008**: Unit conversion operations work seamlessly with non-primitive types where conversions are defined
- **SC-009**: Developer can introspect any registered unit to determine its type category (primitive, enum, class, record, tuple)
- **SC-010**: All edge cases (mixed enums, class inheritance, nested records, optional tuple elements) are handled gracefully with clear error messages or defined behavior
