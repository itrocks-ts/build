[![view on npm](https://badgen.net/npm/v/@itrocks/build)](https://www.npmjs.org/package/@itrocks/build)
[![npm module downloads](https://badgen.net/npm/dt/@itrocks/build)](https://www.npmjs.org/package/@itrocks/build)
[![GitHub repo dependents](https://badgen.net/github/dependents-repo/itrocks-ts/build)](https://github.com/itrocks-ts/build/network/dependents?dependent_type=REPOSITORY)
[![GitHub package dependents](https://badgen.net/github/dependents-pkg/itrocks-ts/build)](https://github.com/itrocks-ts/build/network/dependents?dependent_type=PACKAGE)

# build

Apply JavaScript code to your dynamic DOM,
automatically executed each time a new matching element is added.

## Usage

To execute a function each time a new element is added
to the [DOM](https://developer.mozilla.org/docs/Glossary/DOM):
```ts
import build from '../node_modules/@itrocks/build/build.js'
build<HTMLAnchorElement>('a', anchor => console.log('DOM + anchor', anchor))
```
This will display "DOM + anchor" in your console for every anchor already present in the DOM.

If you later add another anchor:
```ts
document.body.append(document.createElement('a'))
```
"DOM + anchor" will appear in your console again.

## Demo, Testing and Development

```bash
git clone https://github.com/itrocks-ts/build
cd build
npm install
npm run build
```

To test, serve **demo/build.html** with a local web server and open your browser's console to see it in action.

## API

### build

Executes a callback each time a matching element is added to the DOM.

```ts
build(callback)
build(event)
build(selector, callback)
build(selector, event, callback)
build(selector, type, callback)
```

#### Parameters

- **selector:**
  A string with one or more [CSS selectors](https://developer.mozilla.org/docs/Web/CSS/CSS_selectors) to match.\
  For complex multiple-selectors, you may use a [CSS selectors chain](#css-selectors-chain).\
  Defaults to the [ALWAYS](#constants) constant, triggering the callback for any element added to the DOM.
- **type:**
  A case-sensitive string representing the [event type](https://developer.mozilla.org/docs/Web/Events) to listen for.\
  Defaults to the [CALL](#constants) constant, which calls the callback immediately when an element is added to the DOM.
- **event:**
  A `BuildEvent` object that configures the build event manager.
  Properties include `selector`, `type`, `callback`, `args`, `priority`.
  - **args:**
    Additional arguments to pass to the callback.
  - **priority:**
    Defaults to 1000.
    If multiple build events match the same element,
    you can prioritize them by setting different values.
  - Other properties correspond to `build()` parameters.
    <br/><br/>
- **callback:**
  The function to execute.
  ```ts
  callback(element, ...args)
  ```
  - **element:**
    The DOM element that triggered the callback.
  - **args:**
    Additional arguments associated with the build event.

### Constants

- **ALWAYS:**
  A universal [selector](#parameters) that applies to any element added to the DOM.
- **CALL:**
  A special event [type](#parameters) that calls a callback immediately upon adding an element to the DOM.

### CSS selectors chain

This feature avoids repeating CSS paths within complex
[CSS selector](https://developer.mozilla.org/docs/Web/CSS/CSS_selectors) strings.

#### Example

This selector string with repeated CSS path `body > main`:
```ts
'body > main > header > h2, body > main > h2'
```

Is equivalent to:
```ts
['body > main', '> header > h2, > h2']
```
