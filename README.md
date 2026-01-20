# circuit-ts

A TypeScript library for simulating logic circuits. Build complex digital systems from basic logic gates, 
manage signal propagation, and create reusable composite elements.

## Features

- **Generic Value Support**: While primarily used for boolean logic, the core architecture supports any value type.
- **Signal Propagation**: Advanced signal propagation mechanism with infinite loop detection.
- **Composite Elements**: Easily wrap complex circuits into single reusable components.
- **Connection Management**: Simplified API for connecting and disconnecting elements.
- **Extensible**: Create your own elements and propagators by extending base classes.

## Installation

```bash
npm install circuit-ts
```

## Core Concepts

### Connectors
Connectors are the ports of an Element. 
- **InputConnector**: Receives values from other elements.
- **OutputConnector**: Sends values to connected inputs.

### Elements
Elements are the building blocks of your circuit.
- **BaseElement**: The foundation for all logic gates.
- **BusElement**: A special element that passes signals through without logic changes, useful for routing.
- **CompositeElement**: Encapsulates a group of connected elements into a single unit with its own inputs and outputs.

### Propagators
Propagators manage how signals move through the circuit.
- **SignalPropagator**: Handles the flow of signals across connections. Includes a safety limit to prevent infinite loops in feedback circuits.
- **ResetElementPropagator**: Used to initialize or reset the state of an entire circuit.

### ConnectionManager
Handles the wiring between output and input connectors, ensuring validity and preventing duplicate connections.

## Quick Start: Basic Logic Gates

```typescript
import * as circuit from 'circuit-ts';

// 1. Setup environment
const connectionManager = circuit.boolean.factories.createConnectionManager();
const signalPropagator = circuit.boolean.factories.createSignalPropagator();

// 2. Create elements
const andElement = circuit.boolean.factories.createAndElement(2); // 2-input AND element
const notElement = circuit.boolean.factories.createNotElement();

// 3. Connect them (AND output -> NOT input)
connectionManager.connect(andElement.outputs[0], notElement.inputs[0]);

// 4. Initialize elements
andElement.init();
notElement.init();

// 5. Set values and propagate
andElement.inputs[0].value = true;
andElement.inputs[1].value = true;

signalPropagator.propagate(andElement.inputs);

console.log(notElement.outputs[0].value); // false (AND(true, true) = true, NOT(true) = false)
```

## Advanced Usage

### Custom Composite Elements

You can build your own complex elements by connecting basic gates and wrapping them into a `CompositeElement`.

```typescript
import * as circuit from 'circuit-ts';

// 1. Setup environment
const connectionManager = circuit.boolean.factories.createConnectionManager();
const signalPropagator = circuit.boolean.factories.createSignalPropagator();
const resetPropagator = circuit.boolean.factories.createResetElementPropagator();

const factory = new circuit.boolean.factories.CompositeElementFactory(
  connectionManager, 
  signalPropagator, 
  resetPropagator
);

// 2. Define internal elements and buses
const inputBus = circuit.boolean.factories.createBusElement(2);
const outputBus = circuit.boolean.factories.createBusElement(1);

const andElement = circuit.boolean.factories.createAndElement(2);
const notElement = circuit.boolean.factories.createNotElement();

// 3. Wire internal components
connectionManager.connect(inputBus.outputs[0], andElement.inputs[0]);
connectionManager.connect(inputBus.outputs[1], andElement.inputs[1]);
connectionManager.connect(andElement.outputs[0], notElement.inputs[0]);
connectionManager.connect(notElement.outputs[0], outputBus.inputs[0]);

// 4. Create the composite element
const customNand = factory.createComposite(inputBus, outputBus);

// 5. Use it
customNand.init();
customNand.inputs[0].value = true;
customNand.inputs[1].value = true;
customNand.propagate();

console.log(customNand.outputs[0].value); // false
```

### Predefined Composite Elements
Composite elements allow you to use complex components like an RS-Trigger or a half-adder provided by the library.

```typescript
import * as circuit from 'circuit-ts';

const connectionManager = circuit.boolean.factories.createConnectionManager();
const signalPropagator = circuit.boolean.factories.createSignalPropagator();
const resetPropagator = circuit.boolean.factories.createResetElementPropagator();

const factory = new circuit.boolean.factories.CompositeElementFactory(
  connectionManager, 
  signalPropagator, 
  resetPropagator
);

// Create a NOR-based RS Trigger
const rsTrigger = factory.createRsTriggerNotOrBased();

rsTrigger.init();

// Inputs: [0] = R (Reset), [1] = S (Set)
// Outputs: [0] = Q, [1] = !Q
rsTrigger.inputs[1].value = true; // Set = 1
rsTrigger.propagate(1);

console.log(rsTrigger.outputs[0].value); // true (Q = 1)
```

## API Reference

### `ConnectionManager<TValue>`
- `connect(output, input)`: Creates a link between an output and an input.
- `disconnect(output, input)`: Removes an existing link.

### `SignalPropagator<TValue>`
- `propagate(targets)`: Propagates signals starting from the given connectors.
- `constructor(visitCounterLimit?: number)`: Default limit is 100 to prevent infinite loops.

### `ResetElementPropagator<TValue>`
- `propagate(element)`: Recursively marks all downstream connectors as dirty.

### `circuit.boolean.factories`
- `createConnectionManager()`: Returns a `ConnectionManager<boolean>`.
- `createSignalPropagator()`: Returns a `SignalPropagator<boolean>`.
- `createResetElementPropagator()`: Returns a `ResetElementPropagator<boolean>`.
- `createAndElement(inputsCount)`: Returns an `AndElement`.
- `createOrElement(inputsCount)`: Returns an `OrElement`.
- `createNotElement()`: Returns a `NotElement`.
- `createBusElement(channelsCount)`: Returns a `BusElement<boolean>`.

### `circuit.boolean.factories.CompositeElementFactory`
- `createComposite(inputBus, outputBus)`: Returns a generic `CompositeElement`.
- `createNotOr(inputsCount)`: Returns a NOR gate.
- `createNotAnd(inputsCount)`: Returns a NAND gate.
- `createRsTriggerNotOrBased()`: Returns an RS Trigger.

## Error Handling

The library provides specific error classes for common issues:
- `InfiniteLoopError`: Thrown when a signal circles back too many times.
- `DuplicateConnectionError`: Thrown when trying to connect the same ports twice.
- `InputAlreadyConnectedError`: Thrown when an input port already has a source.
- `InvalidConnectorsPairError`: Thrown when trying to connect two inputs or two outputs.

## Unit testing

```bash
npm i
npm run test
```

## License

Circuit TS is licensed under the MIT License.
