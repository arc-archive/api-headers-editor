import { html, render } from 'lit-html';
import { LitElement } from 'lit-element';
import { ApiDemoPageBase } from '@advanced-rest-client/arc-demo-helper/ApiDemoPage.js';
import '@api-components/api-navigation/api-navigation.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@advanced-rest-client/arc-demo-helper/arc-interactive-demo.js';
import '@anypoint-web-components/anypoint-styles/colors.js';
import { AmfHelperMixin } from '@api-components/amf-helper-mixin/amf-helper-mixin.js';

import '../api-headers-editor.js';

class DemoElement extends AmfHelperMixin(LitElement) {}
window.customElements.define('demo-element', DemoElement);

class ApiDemo extends ApiDemoPageBase {
  constructor() {
    super();

    this.initObservableProperties([
      'noDocs', 'narrow', 'allowDisableParams', 'amfHeaders',
      'allowCustom', 'allowHideOptional', 'readOnly', 'demoOutlined', 'demoLegacy',
      'headers'
    ]);

    this.componentName = 'api-headers-editor';
    this.demoStates = ['Filled', 'Outlined', 'Legacy'];
    this._headersHandler = this._headersHandler.bind(this);
    this._mainDemoStateHandler = this._mainDemoStateHandler.bind(this);
    this._toggleMainOption = this._toggleMainOption.bind(this);
  }

  get helper() {
    if (!this.__helper) {
      this.__helper = document.getElementById('helper');
    }
    return this.__helper;
  }

  _navChanged(e) {
    const { selected, type } = e.detail;
    if (type === 'method') {
      this.setData(selected);
    } else {
      this.amfHeaders = undefined;
      this.hasData = false;
    }
  }

  setData(selected) {
    const webApi = this.helper._computeWebApi(this.amf);
    const method = this.helper._computeMethodModel(webApi, selected);
    const expects = this.helper._computeExpects(method);
    const hKey = this.helper._getAmfKey(this.helper.ns.raml.vocabularies.http + 'header');
    const headers = this.helper._ensureArray(expects[hKey]);
    this.amfHeaders = headers;
    this.hasData = true;
  }

  _mainDemoStateHandler(e) {
    const state = e.detail.value;
    switch (state) {
      case 0:
        this.demoOutlined = false;
        this.demoLegacy = false;
        break;
      case 1:
        this.demoOutlined = true;
        this.demoLegacy = false;
        break;
      case 2:
        this.demoOutlined = false;
        this.demoLegacy = true;
        break;
    }
  }

  _toggleMainOption(e) {
    const { name, checked } = e.target;
    this[name] = checked;
  }

  _headersHandler(e) {
    this.headers = e.detail.value;
  }

  _demoTemplate() {
    const {
      amf,
      amfHeaders,
      headers,
      noDocs,
      narrow,
      allowDisableParams,
      allowCustom,
      allowHideOptional,
      readOnly,
      demoStates,
      darkThemeActive,
      demoOutlined,
      demoLegacy
    } = this;
    return html`<section class="documentation-section">
      <h2>API model demo</h2>
      <p>
        This demo lets you preview the API headers form element with various
        configuration options.
      </p>

      <section role="main" class="horizontal-section-container centered main">
        ${this._apiNavigationTemplate()}
        <div class="demo-container">
        <arc-interactive-demo
          .states="${demoStates}"
          @state-chanegd="${this._mainDemoStateHandler}"
          ?dark="${darkThemeActive}"
        >
          <api-headers-editor
            slot="content"
            .amf="${amf}"
            .amfHeaders="${amfHeaders}"
            @value-changed="${this._headersHandler}"
            ?narrow="${narrow}"
            ?allowdisableparams="${allowDisableParams}"
            ?allowcustom="${allowCustom}"
            ?allowhideoptional="${allowHideOptional}"
            ?nodocs="${noDocs}"
            ?readonly="${readOnly}"
            ?outlined="${demoOutlined}"
            ?legacy="${demoLegacy}"
            autovalidate></api-headers-editor>

          <label slot="options" id="mainOptionsLabel">Options</label>
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="narrow"
            @change="${this._toggleMainOption}"
            >Narrow</anypoint-checkbox
          >
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="allowDisableParams"
            @change="${this._toggleMainOption}"
            >Allow disable</anypoint-checkbox
          >
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="allowHideOptional"
            @change="${this._toggleMainOption}"
            >Allow hide</anypoint-checkbox
          >
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="allowCustom"
            @change="${this._toggleMainOption}"
            >Allow custom</anypoint-checkbox
          >
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="noDocs"
            @change="${this._toggleMainOption}"
            >No inline docs</anypoint-checkbox
          >
          <anypoint-checkbox
            aria-describedby="mainOptionsLabel"
            slot="options"
            name="readOnly"
            @change="${this._toggleMainOption}"
            >Read only</anypoint-checkbox
          >
        </arc-interactive-demo>

        <output>${headers}</output>
        </div>
      </section>
    </section>`;
  }

  _render() {
    const {
      amf
    } = this;
    render(html`
      ${this.headerTemplate()}

      <demo-element id="helper" .amf="${amf}"></demo-element>

      ${this._demoTemplate()}
      `, document.querySelector('#demo'));
  }
}
const instance = new ApiDemo();
instance.render();
window.demoInstance = instance;
