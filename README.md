[![Published on NPM](https://img.shields.io/npm/v/@advanced-rest-client/code-mirror.svg)](https://www.npmjs.com/package/@api-components/api-headers-editor)

[![Build Status](https://travis-ci.org/advanced-rest-client/api-url-data-model.svg?branch=stage)](https://travis-ci.org/advanced-rest-client/api-headers-editor)

[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/advanced-rest-client/api-headers-editor)

# api-headers-editor

A request editor that builds the UI based on AMF model or presents default empty editor.

```html
<api-headers-editor allow-custom allow-disable-params></api-headers-editor>
```

**See breaking changes and list of required dependencies at the bottom of this document**

### API components

This components is a part of [API components ecosystem](https://elements.advancedrestclient.com/)

## Usage

### Installation
```
npm install --save @api-components/api-headers-editor
```

### In an html file

```html
<html>
  <head>
    <script type="module">
      import '@api-components/api-headers-editor/api-headers-editor.js';
    </script>
  </head>
  <body>
    <api-headers-editor></api-headers-editor>
  </body>
</html>
```

### In a Polymer 3 element

```js
import {PolymerElement, html} from '@polymer/polymer';
import '@api-components/api-headers-editor/api-headers-editor.js';

class SampleElement extends PolymerElement {
  static get template() {
    return html`
      <api-headers-editor></api-headers-editor>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

### Installation

```sh
git clone https://github.com/advanced-rest-client/api-headers-editor
cd api-headers-editor
npm install
npm install -g polymer-cli
```

### Running the demo locally

```sh
polymer serve --npm
open http://127.0.0.1:<port>/demo/
```

### Running the tests
```sh
polymer test --npm
```

## Breaking Changes in v3

Due to completely different dependencies import algorithm the CodeMirror and it's dependencies has to
be included to the web application manually, outside the component.

Web Compoennts are ES6 modules and libraries like CodeMirror are not adjusted to
new spec. Therefore importing the library inside the component won't make it work
(no reference is created).

Use the scripts below to include into the web page.

```html
<script src="node_modules/codemirror/lib/codemirror.js"></script>
<script src="node_modules/codemirror/addon/mode/loadmode.js"></script>
<script src="node_modules/codemirror/mode/meta.js"></script>
<!-- Headers hint support -->
<script src="node_modules/@advanced-rest-client/code-mirror-hint/headers-addon.js"></script>
<script src="node_modules/@advanced-rest-client/code-mirror-hint/show-hint.js"></script>
<script src="node_modules/@advanced-rest-client/code-mirror-hint/hint-http-headers.js"></script>
```
