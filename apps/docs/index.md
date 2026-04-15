---
layout: home
hero:
  name: unacy
  text: Type-safe unit conversion
  tagline: Unit, format and type conversion library for TypeScript with full compile-time safety, zero runtime overhead, and auto-composed multi-hop conversions.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/pradeepmouli/unacy
features:
  - title: Full compile-time type safety
    details: Prevents invalid value assignments, invalid conversions, and cross-dimension conversions. Can't pass a Fahrenheit value to a Celsius converter.
  - title: Unit accessor API
    details: Intuitive registry.Celsius.to.Fahrenheit(value) syntax backed by a typed registry.
  - title: Extensible units
    details: Add metadata to units and register new converters dynamically — no explicit type casting needed.
  - title: Auto-composition
    details: Multi-hop conversions resolved via a BFS shortest-path algorithm over the registered converter graph.
  - title: Tree-shakeable
    details: Export individual unit converters for optimal bundle size in browser builds.
  - title: Zero runtime overhead
    details: Type branding uses phantom types with no runtime cost — your converted code pays nothing at runtime.
---
