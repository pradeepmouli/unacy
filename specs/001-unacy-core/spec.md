# Feature Specification: Unacy Core Conversion Library

**Feature Branch**: `001-unacy-core`  
**Created**: 2026-01-06  
**Status**: Draft  
**Input**: User description: "create a specification for this library using the attached code as a strawman/context"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Author Tagged Converters (Priority: P1)

A library author can define unit-tagged converters that guarantee compile-time safety when transforming values between units.

**Why this priority**: Core capability that ensures the library’s purpose—safe unit conversions—works.

**Independent Test**: Define two unit tags (e.g., 'Celsius' and 'Fahrenheit'), register a converter, and verify that conversions compile and produce expected runtime output while invalid unit combinations fail to compile.

**Acceptance Scenarios**:

1. **Given** a converter from UnitA to UnitB, **When** a value tagged with UnitA is passed, **Then** a value tagged with UnitB is returned.
2. **Given** a value tagged with UnitB, **When** passed to a converter expecting UnitA, **Then** TypeScript fails to compile.

---

### User Story 2 - Use Registry to Chain Conversions (Priority: P2)

A consumer can register converters in a registry and compose conversions between multiple units through the registry API.

**Why this priority**: Registry-driven composition enables reuse and discoverability across units.

**Independent Test**: Register conversions for at least three units; request a conversion from UnitA to UnitC via UnitB; verify type-safe compilation and correct runtime value.

**Acceptance Scenarios**:

1. **Given** converters A→B and B→C in the registry, **When** requesting A→C, **Then** the registry returns a callable converter producing a UnitC-tagged value.
2. **Given** no converter exists for a requested pair, **When** a conversion is attempted, **Then** the call fails at compile time or throws a defined runtime error.

---

### User Story 3 - Format and Parse Tagged Values (Priority: P3)

A consumer can format tagged values to strings and parse strings back into tagged values using paired formatter/parser utilities.

**Why this priority**: Supports serialization and I/O scenarios without losing unit/format tagging.

**Independent Test**: Define a formatter/parser for a tagged format; format a tagged value to string and parse back to the same tagged shape; verify round-trip fidelity and type safety.

**Acceptance Scenarios**:

1. **Given** a formatter/parser for FormatX, **When** formatting a tagged value, **Then** a string is returned and can be parsed back into a value tagged with FormatX.
2. **Given** a parser for FormatX, **When** parsing an invalid string, **Then** a validation error is raised without producing a tagged value.

### Edge Cases

- Missing converter for a requested unit pair (registry should auto-compose or fail clearly).
- Duplicate registration of the same unit pair (should override or error).
- Cyclic conversions producing infinite loops or incorrect results.
- Multi-hop paths with varying precision losses across intermediate conversions.
- Parsing invalid or malformed strings for a given format.
- Non-numeric inputs passed to numeric unit converters.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Provide tagged unit type `WithUnits<T, U extends PropertyKey>` to brand values with unit identifiers.
- **FR-002**: Provide tagged format type `WithFormat<T, F extends string>` to brand values with format identifiers.
- **FR-003**: Provide converter function types `Converter` and `BidirectionalConverter` to map between tagged units with compile-time safety.
- **FR-004**: Provide formatter/parser types `Formatter`, `Parser`, and `FormatterParser` to map between tagged formats and strings with compile-time safety.
- **FR-005**: Provide a `ConverterRegistry` API that allows registering converters and retrieving composed converters across registered units.
- **FR-006**: Registry must prevent or clearly define behavior on duplicate converter registration.
- **FR-007**: Invalid or missing conversions MUST surface as compile-time errors when possible; otherwise they MUST throw clear runtime errors.
- **FR-008**: Formatting/parsing failures MUST surface clear errors without emitting incorrectly tagged values.
- **FR-009**: The API MUST remain tree-shakeable and ESM-compatible.
- **FR-010**: The API surface MUST be fully typed with no `any` leakage.
- **FR-011**: Registry MUST auto-compose multi-hop conversions when direct converters are not available (e.g., A→C via A→B→C).
- **FR-012**: Registry MUST detect and handle cyclic conversion paths to prevent infinite loops.
- **FR-013**: Registry MUST prefer shorter conversion paths over longer ones when multiple paths exist.

### Key Entities

- **WithUnits**: Tagged type branding a value with a unit identifier.
- **WithFormat**: Tagged type branding a value with a format identifier.
- **Converter / BidirectionalConverter**: Function signatures for unit-safe transformations.
- **Formatter / Parser / FormatterParser**: Function signatures for format-safe transformations.
- **ConverterRegistry**: Registry facade for registering and retrieving conversions between units.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Type errors are raised at compile time when attempting to convert between unregistered unit pairs.
- **SC-002**: At least 95% of the public API surfaces explicit, non-`any` TypeScript types (checked via `tsc --noEmit`).
- **SC-003**: Round-trip format/parse succeeds for valid inputs with 100% fidelity in test coverage for supported formats.
- **SC-004**: Registry can register and retrieve conversions for at least 5 distinct unit identifiers without runtime collisions.
- **SC-005**: All tests for the library pass within 1 second on a typical developer machine (unit scope).
