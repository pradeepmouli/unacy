# Installation

## Prerequisites

- Node.js >= 20.0.0
- pnpm >= 10.0.0 (or npm / yarn)

## Install the package

```bash
# Install from npm
npm install unacy

# Or with pnpm
pnpm add unacy

# Or with yarn
yarn add unacy
```

## Development setup

```bash
git clone https://github.com/pradeepmouli/unacy.git
cd unacy
pnpm install
```

## Verify

```ts
import { createRegistry } from 'unacy';
console.log(typeof createRegistry); // 'function'
```

See [Usage](./usage.md) for the end-to-end workflow.
