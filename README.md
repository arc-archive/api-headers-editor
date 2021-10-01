# DEPRECATED

This component is deprecated. The code base has been moved to [api-request](https://github.com/advanced-rest-client/api-request) module.

--------

A HTTP headers editor.

It allows to edit headers in  a convenient and accessible form editor and also allows to switch to the source edit view (thanks to CodeMirror).

## Deprecation notice

This element is moved to `api-headers` repository and `@api-components/api-headers` package. This element will be deprecated and archived once the migration finish.

The component works as a stand-alone editor that allows to define headers for HTTP request but also works with generated [AMF model](https://a.ml/) from API spec file.

```html
<api-headers-editor allowcustom allowdisableparams allowhideoptional></api-headers-editor>
```

**See breaking changes and list of required dependencies at the bottom of this document**

## Version compatibility

This version only works with AMF model version 2 (AMF parser >= 4.0.0).
For compatibility with previous model version use `3.x.x` version of the component.

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
    <api-headers-editor allowdisableparams allowcustom allowhideoptional></api-headers-editor>
    <script>
    {
      document.querySelector('api-headers-editor').onvalue = (e) {
        console.log('Headers value', e.target.value);
      };
    }
    </script>
  </body>
</html>
```

### In a LitElement

```js
import { LitElement, html } from 'lit-element';
import '@api-components/api-headers-editor/api-headers-editor.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <api-headers-editor
      allowdisableparams
      allowcustom
      allowhideoptional
      @value-changed="${this._handleValue}"></api-headers-editor>
    `;
  }

  _handleValue(e) {
    this.headersValue = e.target.value;
  }
}
customElements.define('sample-element', SampleElement);
```

### Passing AMF data model

```html
<api-headers-editor></api-headers-editor>

<script>
{
  const api = await generateApiModel();
  const endpoint = '/api-endpoint';
  const operation = 'GET';
  const headersModelArray = getOperationHeadersFromModel(api, endpoint, operation); // some abstract method
  const editor = document.querySelector('api-headers-editor');
  editor.api = api; // This is required to compute ld+json keys!
  editor.amfHeaders = headersModelArray;
}
</script>
```

The `headersModelArray` property is the value of `http://a.ml/vocabularies/http#header` shape of AMF model.
It can be accessed via `supportedOperation` > `expects` shapes.

## Development

```sh
git clone https://github.com/advanced-rest-client/api-headers-editor
cd api-headers-editor
npm install
```

### Running the demo locally

```sh
npm start
```

### Running the tests
```sh
npm test
```

## Breaking Changes in v3

You need to include CodeMirror into the document before importing this element
as it expect this global variable to be already set.

This is due CodeMirror not being able to run as ES module.

Use your build system to bundle CodeMirror into the build and don't forget to export global variable.

```html
<script src="node_modules/codemirror/lib/codemirror.js"></script>
```
