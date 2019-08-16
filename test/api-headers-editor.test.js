import {
  fixture,
  assert,
  nextFrame,
  aTimeout
} from '@open-wc/testing';
import {
  AmfLoader
} from './amf-loader.js';
import '../api-headers-editor.js';
import sinon from 'sinon/pkg/sinon-esm.js';

const hasPartsApi = 'part' in document.createElement('span');

describe('<api-headers-editor>', function() {
  async function basicFixture() {
    return (await fixture(`<api-headers-editor></api-headers-editor>`));
  }

  async function readonlyFixture() {
    return (await fixture(`<api-headers-editor readonly></api-headers-editor>`));
  }

  async function sourceModeFixture() {
    return (await fixture(`<api-headers-editor sourcemode></api-headers-editor>`));
  }

  async function noSourceModeFixture() {
    return (await fixture(`<api-headers-editor nosourceeditor></api-headers-editor>`));
  }

  describe('Basics', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('value is undefined', () => {
      assert.isUndefined(element.value);
    });

    it('sourceMode is false', () => {
      assert.isFalse(element.sourceMode);
    });

    it('Detects content type', function() {
      element.value = 'text:test\ncontent-type:application/test';
      assert.equal(element.contentType, 'application/test',
        'contentType equals application/test');
    });

    it('Handles request-headers-changed event', function() {
      const init = {
        detail: {
          value: 'Authorization: test'
        },
        bubbles: true,
        cancelable: true
      };
      const event = new CustomEvent('request-headers-changed', init);
      document.dispatchEvent(event);
      assert.equal(element.value, 'Authorization: test');
    });

    it('Don\'t handles canceled request-headers-changed event', function() {
      const init = {
        detail: {
          value: 'Authorization: test'
        },
        bubbles: true,
        cancelable: true
      };
      document.addEventListener('request-headers-changed', function(e) {
        e.preventDefault();
      });
      const event = new CustomEvent('request-headers-changed', init);
      document.dispatchEvent(event);
      assert.equal(element.value, undefined);
    });

    it('Handles request-header-changed event', function() {
      const init = {
        detail: {
          name: 'Authorization',
          value: 'test'
        },
        bubbles: true,
        cancelable: true
      };
      const event = new CustomEvent('request-header-changed', init);
      document.dispatchEvent(event);
      assert.equal(element.value, 'Authorization: test');
    });

    it('Don\'t handles canceled request-header-changed event', function() {
      const init = {
        detail: {
          name: 'Authorization',
          value: 'test'
        },
        bubbles: true,
        cancelable: true
      };
      document.addEventListener('request-header-changed', function(e) {
        e.preventDefault();
      });
      const event = new CustomEvent('request-header-changed', init);
      document.dispatchEvent(event);
      assert.equal(element.value, undefined);
    });

    it('adds raml-aware to shadow DOM', async () => {
      element.aware = 'demo-api';
      await nextFrame();
      const node = element.shadowRoot.querySelector('raml-aware');
      assert.ok(node);
    });

    it('passes aware data to the element', async () => {
      const node = document.createElement('raml-aware');
      node.scope = 'demo-api';
      document.body.appendChild(node);
      element.aware = 'demo-api';
      await nextFrame();
      node.api = {};
      document.body.removeChild(node);
      assert.ok(element.amf);
    });
  });

  describe('Switching editors', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.viewModel = [{
        binding: 'header',
        name: 'x-test',
        hasDescription: false,
        required: true,
        schema: {
          enabled: true,
          type: 'string',
          inputLabel: 'x-string',
          isEnum: false,
          isArray: false,
          isBool: false,
          inputType: 'text'
        },
        value: ''
      }];
      await nextFrame();
    });

    it('Form data is the default editor', () => {
      const editor = element.shadowRoot.querySelector('api-headers-form');
      assert.ok(editor);
    });

    it('Code mirror is not in the DOM', () => {
      const editor = element.shadowRoot.querySelector('code-mirror');
      assert.notOk(editor);
    });

    it('Switching to source mode removes form editor', async () => {
      element.sourceMode = true;
      await nextFrame();
      const editor = element.shadowRoot.querySelector('api-headers-form');
      assert.notOk(editor);
    });

    it('Switching to source mode add code mirror', async () => {
      element.sourceMode = true;
      await nextFrame();

      const editor = element.shadowRoot.querySelector('code-mirror');
      assert.ok(editor);
    });

    it('currentPanel returns form editor for form mode', async () => {
      const result = element.currentPanel;
      assert.equal(result.nodeName, 'API-HEADERS-FORM');
    });

    it('currentPanel returns code mirror for source mode', async () => {
      element.sourceMode = true;
      await nextFrame();
      const result = element.currentPanel;
      assert.equal(result.nodeName, 'CODE-MIRROR');
    });

    it('Updates model value after turning back to form source mode', async () => {
      element.sourceMode = true;
      // Value is set after 50 ms to ensure it's initialized
      await aTimeout(55);
      const editor = element.currentPanel;
      editor.value = 'x-test: test-value';
      element.sourceMode = false;
      await nextFrame();
      assert.equal(element.viewModel[0].value, 'test-value');
    });

    it('Updates editor when in source mode', async () => {
      element.sourceMode = true;
      await aTimeout(55);
      const editor = element.currentPanel;
      editor.value = 'x-test: test-value';
      assert.equal(element.value, 'x-test: test-value');
    });

    it('Adds custom header from source mode', async () => {
      element.sourceMode = true;
      await aTimeout(55);
      const editor = element.currentPanel;
      editor.value = 'x-test: test-value\nx-custom: value';
      element.sourceMode = false;
      await nextFrame();
      assert.lengthOf(element.viewModel, 2, 'Model has two items');
      assert.isTrue(element.viewModel[1].schema.isCustom, 'Second item is custom item');
      assert.equal(element.viewModel[1].name, 'x-custom', 'Name is set');
      assert.equal(element.viewModel[1].value, 'value', 'Value is set');
    });
  });

  describe('content-type-changed support', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Fires content type change event', function(done) {
      const ct = 'application/test';
      element.addEventListener('content-type-changed', function clb(e) {
        element.removeEventListener('content-type-changed', clb);
        assert.equal(e.detail.value, ct);
        done();
      });
      element.value = 'text:test\ncontent-type:' + ct;
    });

    function fire(type) {
      window.dispatchEvent(new CustomEvent('content-type-changed', {
        detail: {
          value: type
        },
        cancelable: false,
        bubbles: true,
        composed: true
      }));
    }

    it('Updates content type value from the event', () => {
      const ct = 'test';
      fire(ct);
      assert.equal(element.contentType, ct);
    });

    it('Adds header to custom list', () => {
      const ct = 'test';
      fire(ct);
      assert.equal(element.viewModel[0].value, ct);
    });

    it('Does not refire the event', () => {
      const spy = sinon.spy();
      document.body.addEventListener('content-type-changed', spy);
      fire('test');
      assert.isFalse(spy.called);
    });

    it('Updates value in source mode', async () => {
      element.sourceMode = true;
      await nextFrame();
      const ct = 'test';
      fire(ct);
      assert.equal(element.currentPanel.value, 'Content-Type: test');
    });

    it('Updates the value on the editor', () => {
      const ct = 'test';
      fire(ct);
      assert.equal(element.value, 'Content-Type: test');
    });
  });

  describe('modelToValue()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns empty string when no model', () => {
      const result = element.modelToValue();
      assert.equal(result, '');
    });

    it('Uses "viewModel" when no argument', () => {
      element.viewModel = [{
        name: 'x-test',
        value: 'x-value',
        schema: {}
      }];
      const result = element.modelToValue();
      assert.equal(result, 'x-test: x-value');
    });

    it('Skips disabled items', () => {
      element.viewModel = [{
        name: 'x-test',
        value: 'x-value',
        schema: {
          enabled: false
        }
      }];
      element.allowDisableParams = true;
      const result = element.modelToValue();
      assert.equal(result, '');
    });

    it('Will not skip disabled item when disabling is not allowed', () => {
      element.viewModel = [{
        name: 'x-test',
        value: 'x-value',
        schema: {
          enabled: false
        }
      }];
      element.allowDisableParams = false;
      const result = element.modelToValue();
      assert.equal(result, 'x-test: x-value');
    });

    it('Allows enabled items', async () => {
      element.viewModel = [{
        name: 'x-test',
        value: 'x-value',
        schema: {
          enabled: true
        }
      }];
      element.allowDisableParams = true;
      const result = element.modelToValue();
      assert.equal(result, 'x-test: x-value');
      await nextFrame();
    });
  });

  describe('_cmKeysHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await sourceModeFixture();
      await nextFrame();
    });

    it('Opens hints', () => {
      const panel = element.currentPanel;
      const editor = panel.editor;
      assert.ok(editor, 'Editor property is set');
      element._cmKeysHandler(editor);
      const container = panel.querySelector('code-mirror-hint-container');
      assert.ok(container, 'Hints container is in the DOM');
    });
  });

  describe('createCustom()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Returns an object', () => {
      const result = element.createCustom();
      assert.typeOf(result, 'object');
    });

    it('Creates schema property', () => {
      const result = element.createCustom({});
      assert.typeOf(result.schema, 'object');
    });

    it('Adds isCustom property', () => {
      const result = element.createCustom({});
      assert.isTrue(result.schema.isCustom);
    });

    it('Sets default type property', () => {
      const result = element.createCustom({});
      assert.equal(result.schema.type, 'string');
    });

    it('Respects existing type property', () => {
      const result = element.createCustom({
        schema: {
          type: 'integer'
        }
      });
      assert.equal(result.schema.type, 'integer');
    });

    it('Sets default enabled property', () => {
      const result = element.createCustom({});
      assert.isTrue(result.schema.enabled);
    });

    it('Re-enable item', () => {
      const result = element.createCustom({
        schema: {
          enabled: false
        }
      });
      assert.isTrue(result.schema.enabled);
    });

    it('Sets default inputLabel property', () => {
      const result = element.createCustom({});
      assert.equal(result.schema.inputLabel, 'Header value');
    });

    it('Respects existing type property', () => {
      const result = element.createCustom({
        schema: {
          inputLabel: 'test-lable'
        }
      });
      assert.equal(result.schema.inputLabel, 'test-lable');
    });
  });

  describe('_headerChangedHandler()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.value = '';
      await nextFrame();
    });

    it('Ignores event when dispatched by self', () => {
      element._headerChangedHandler({
        composedPath: () => [element]
      });
      assert.equal(element.value, '');
    });

    it('Ignores cancelled event', () => {
      element._headerChangedHandler({
        composedPath: () => [],
        defaultPrevented: true
      });
      assert.equal(element.value, '');
    });

    it('Ignores event when no name', () => {
      element._headerChangedHandler({
        composedPath: () => [],
        defaultPrevented: false,
        detail: {
          name: '',
          value: ''
        }
      });
      assert.equal(element.value, '');
    });

    it('Updates value of the editor', () => {
      element._headerChangedHandler({
        composedPath: () => [],
        defaultPrevented: false,
        detail: {
          name: 'x-test',
          value: 'x-value'
        }
      });
      assert.equal(element.value, 'x-test: x-value');
    });

    it('Updates existing value', () => {
      element.value = 'x-test: x-value';
      element._headerChangedHandler({
        composedPath: () => [],
        defaultPrevented: false,
        detail: {
          name: 'x-test',
          value: 'x-other'
        }
      });
      assert.equal(element.value, 'x-test: x-other');
    });
  });

  describe('_headerDeletedHandler()', () => {
    let element;
    const defaultValue = 'x-header: x-value';
    beforeEach(async () => {
      element = await basicFixture();
      element.value = defaultValue;
      await nextFrame();
    });

    it('Ignores cancelled event', () => {
      element._headerDeletedHandler({
        defaultPrevented: true
      });
      assert.equal(element.value, defaultValue);
    });

    it('Ignores event when no name', () => {
      element._headerDeletedHandler({
        defaultPrevented: false,
        detail: {
          name: ''
        }
      });
      assert.equal(element.value, defaultValue);
    });

    it('Removes the header', () => {
      element._headerDeletedHandler({
        defaultPrevented: false,
        detail: {
          name: 'x-header'
        }
      });
      assert.equal(element.value, '');
    });

    it('Keeps not removed headers', () => {
      element._headerDeletedHandler({
        defaultPrevented: false,
        detail: {
          name: 'z-header'
        }
      });
      assert.equal(element.value, defaultValue);
    });
  });

  describe('refresh()', () => {
    it('Does nothing when not is source mode', async () => {
      const element = await basicFixture();
      element.refresh();
      // no error
    });

    it('Updates code editor', async () => {
      const element = await sourceModeFixture();
      const panel = element.currentPanel;
      const spy = sinon.spy(panel, 'refresh');
      element.refresh();
      assert.isTrue(spy.called);
    });
  });

  describe('Read only mode', () => {
    let element;
    beforeEach(async () => {
      element = await readonlyFixture();
    });

    function fire(type) {
      window.dispatchEvent(new CustomEvent('content-type-changed', {
        detail: {
          value: type
        },
        cancelable: false,
        bubbles: true,
        composed: true
      }));
    }

    it('ignores content-type change', () => {
      const ct = 'test';
      fire(ct);
      assert.isUndefined(element.viewModel);
    });

    it('does not dispatch request-headers-change event', function() {
      const spy = sinon.spy();
      element.addEventListener('request-headers-changed', spy);
      element._cacncelChangeEvent = false;
      element._innerEditorValueChanged = true;
      element._valueChanged('test');
      assert.isFalse(spy.called);
    });

    it('passes the flag to form editor', function() {
      const node = element.currentPanel;
      assert.isTrue(node.readOnly);
    });

    it('passes the flag to source editor', async () => {
      element.sourceMode = true;
      await nextFrame();
      const node = element.currentPanel;
      assert.isTrue(node.readonly);
    });
  });

  describe('No source mode', () => {
    let element;
    beforeEach(async () => {
      element = await noSourceModeFixture();
    });

    it('does not render source toggle button', () => {
      const node = element.shadowRoot.querySelector('[data-action="source"]');
      assert.notOk(node);
    });

    it('ignores call to _sourceModeChanged', () => {
      const spy = sinon.spy();
      element.addEventListener('send-analytics', spy);
      element.sourceMode = true;
      assert.isFalse(spy.called);
    });

    it('ignores call to _sourceModeHandler', () => {
      const spy = sinon.spy(element, '_sourceModeChanged');
      element.sourceMode = true;
      assert.isFalse(spy.called);
    });
  });

  describe('_copyToClipboard()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.value = 'accept: */*';
      await nextFrame();
    });

    it('Calls copy() in the `clipboard-copy` element', async () => {
      const copy = element.shadowRoot.querySelector('clipboard-copy');
      const spy = sinon.spy(copy, 'copy');
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.isTrue(spy.called);
    });

    it('Changes the label', async () => {
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.notEqual(button.innerText.trim().toLowerCase(), 'copy');
    });

    it('Disables the button', (done) => {
      setTimeout(() => {
        const button = element.shadowRoot.querySelector('[data-action="copy"]');
        button.click();
        assert.isTrue(button.disabled);
        done();
      });
    });

    (hasPartsApi ? it : it.skip)('Adds content-action-button-disabled to the button', async () => {
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.isTrue(button.part.contains('content-action-button-disabled'));
    });

    (hasPartsApi ? it : it.skip)('Adds code-content-action-button-disabled to the button', async () => {
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      assert.isTrue(button.part.contains('code-content-action-button-disabled'));
    });
  });

  describe('_resetCopyButtonState()', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
      element.value = 'accept: */*';
      await nextFrame();
    });

    it('Changes label back', (done) => {
      setTimeout(() => {
        const button = element.shadowRoot.querySelector('[data-action="copy"]');
        button.innerText = 'test';
        element._resetCopyButtonState(button);
        assert.equal(button.innerText.trim().toLowerCase(), 'copy');
        done();
      });
    });

    it('Restores disabled state', (done) => {
      setTimeout(() => {
        const button = element.shadowRoot.querySelector('[data-action="copy"]');
        button.click();
        button.disabled = true;
        element._resetCopyButtonState(button);
        assert.isFalse(button.disabled);
        done();
      });
    });

    (hasPartsApi ? it : it.skip)('Removes content-action-button-disabled part from the button', async () => {
      await aTimeout();
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      element._resetCopyButtonState(button);
      assert.isFalse(button.part.contains('content-action-button-disabled'));
    });

    (hasPartsApi ? it : it.skip)('Removes code-content-action-button-disabled part from the button', async () => {
      await aTimeout();
      const button = element.shadowRoot.querySelector('[data-action="copy"]');
      button.click();
      element._resetCopyButtonState(button);
      assert.isFalse(button.part.contains('code-content-action-button-disabled'));
    });
  });


  describe('AMF model tests', () => {
    function getHeadersModel(element, amfModel) {
      const webApi = element._computeWebApi(amfModel);
      const endpoint = element._computeEndpointByPath(webApi, '/endpoint');
      const opKey = element._getAmfKey(element.ns.w3.hydra.supportedOperation);
      const ops = element._ensureArray(endpoint[opKey]);
      const expects = element._computeExpects(ops[0]);
      const hKey = element._getAmfKey(element.ns.raml.vocabularies.http + 'header');
      return element._ensureArray(expects[hKey]);
    }

    async function untilValueChanged(element) {
      return new Promise((resolve) => {
        element.addEventListener('value-changed', function f(e) {
          if (!e.detail.value) {
            return;
          }
          element.removeEventListener('value-changed', f);
          resolve();
        });
      });
    }

    [
      ['Full model', false],
      ['Compact model', true]
    ].forEach((item) => {
      describe(item[0], () => {
        let amfModel;
        let transformer;
        before(async () => {
          amfModel = await AmfLoader.load(item[1]);
          transformer = document.createElement('api-view-model-transformer');
          document.body.appendChild(transformer);
        });

        after(() => {
          document.body.removeChild(transformer);
        });

        let element;
        beforeEach(async () => {
          const transformer = document.createElement('api-view-model-transformer');
          transformer.clearCache();
          element = await basicFixture();
          element.amf = amfModel;
          element.amfHeaders = getHeadersModel(element, amfModel);
          await untilValueChanged(element);
        });

        it('Generates view model from AMF shape', () => {
          assert.typeOf(element.viewModel, 'array');
          assert.lengthOf(element.viewModel, 19);
        });

        it('Model respects default values', () => {
          const xRequired = element.viewModel[4];
          assert.equal(xRequired.value, 'default required value');
        });

        it('Validates the editor', () => {
          const result = element.validate();
          assert.isFalse(result);
        });

        it('Generates value from the model', (done) => {
          setTimeout(() => {
            const value = element.value;
            assert.equal(value.indexOf('ETag'), -1, 'Etag is not present (optional)');
            assert.notEqual(value.indexOf('Cache-Control'), -1, 'Cache-Control is present');
            assert.notEqual(value.indexOf('x-string'), -1, 'x-string is present');
            assert.equal(value.indexOf('x-optional'), -1, 'x-optional is not present (optional)');
            assert.notEqual(value.indexOf('x-required: default required value'), -1,
              'x-required is present (dafault value)');
            assert.notEqual(value.indexOf('x-union: Hello union'), -1, 'x-union is present (value from example)');
            done();
          }, 250);
        });

        it('Clears AMF values when value is cleared', async () => {
          element.value = '';
          await nextFrame();
          const vm = element.viewModel;
          assert.typeOf(vm, 'array');
          assert.lengthOf(vm, 19);
          assert.equal(vm[4].value, '');
        });
      });
    });
  });

  describe('onvalue', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.onvalue);
      const f = () => {};
      element.onvalue = f;
      assert.isTrue(element.onvalue === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.onvalue = f;
      element.value = 'test';
      element.onvalue = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.onvalue = f1;
      element.onvalue = f2;
      element.value = 'test';
      element.onvalue = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('oncontenttype', () => {
    let element;
    beforeEach(async () => {
      element = await basicFixture();
    });

    it('Getter returns previously registered handler', () => {
      assert.isUndefined(element.oncontenttype);
      const f = () => {};
      element.oncontenttype = f;
      assert.isTrue(element.oncontenttype === f);
    });

    it('Calls registered function', () => {
      let called = false;
      const f = () => {
        called = true;
      };
      element.oncontenttype = f;
      element.contentType = 'application/json';
      element.oncontenttype = null;
      assert.isTrue(called);
    });

    it('Unregisteres old function', () => {
      let called1 = false;
      let called2 = false;
      const f1 = () => {
        called1 = true;
      };
      const f2 = () => {
        called2 = true;
      };
      element.oncontenttype = f1;
      element.oncontenttype = f2;
      element.contentType = 'application/json';
      element.oncontenttype = null;
      assert.isFalse(called1);
      assert.isTrue(called2);
    });
  });

  describe('a11y', () => {
    async function basicFixture() {
      return (await fixture(`<api-headers-editor></api-headers-editor>`));
    }

    it('is accessible when empty', async () => {
      const element = await basicFixture();
      await assert.isAccessible(element);
    });

    it('is accessible with value', async () => {
      const element = await basicFixture();
      element.value = 'content-type: application/json\naccept: */*\netag: test';
      await nextFrame();
      await assert.isAccessible(element);
    });

    it('is accessible with sourceEditor', async () => {
      const element = await basicFixture();
      element.sourceMode = true;
      element.value = 'content-type: application/json\naccept: */*\netag: test';
      await nextFrame();
      await assert.isAccessible(element);
    });
  });
});
