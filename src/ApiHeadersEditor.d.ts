import {LitElement, TemplateResult, CSSResult} from 'lit-element';
import {ValidatableMixin} from '@anypoint-web-components/validatable-mixin';
import {ApiFormMixin} from '@api-components/api-form-mixin';
import {EventsTargetMixin} from '@advanced-rest-client/events-target-mixin';
import {AmfHelperMixin} from '@api-components/amf-helper-mixin';
import {ModelItem} from '@api-components/api-view-model-transformer/src/ApiViewModel';

/**
 * `api-headers-editor`
 * An element to render headers edior based on AMF data model.
 *
 * By default it renders headers form. The user has an option to switch to
 * source editing mode. `code-mirror` element is used in the later case.
 *
 * ## AMF data model
 *
 * This element renders pre-configured form of headers based on
 * [AMF's](https://github.com/mulesoft/amf) json/ld data model.
 * From the model select `http://raml.org/vocabularies/http#header`
 * node which contains list of headers defined for current object
 * (it can be method, trait, security scheme etc).
 * The model is resolved to internal data model by `api-view-model-transformer`
 * element.
 *
 * If the element is used without AMF model `allowCustom` property must be
 * set or otherwise user won't be able to add new header to the editor.
 *
 * ### Example
 *
 * ```html
 * <api-headers-editor id="editor" allow-disable-params></api-headers-editor>
 * <script>
 * let data = await getamf();
 * editor.amf = data;
 * data = data[0]['http://raml.org/vocabularies/document#encodes'][0];
 * data = data['http://raml.org/vocabularies/http#endpoint'][0];
 * data = data['http://www.w3.org/ns/hydra/core#supportedOperation'][0];
 * data = data['http://www.w3.org/ns/hydra/core#expects'][0];
 * data = data['http://raml.org/vocabularies/http#header'];
 * (first endpoint, first method, headers array)
 * editor.amfHeaders = data;
 * editor.addEventListener('value-changed', (e) => console.log(e.detail.value));
 * < /script>
 * ```
 *
 * ### Example without AMF
 *
 * ```html
 * <api-headers-editor id="editor" allow-disable-params allow-custom></api-headers-editor>
 * <script>
 * editor.addEventListener('value-changed', (e) => console.log(e.detail.value));
 * < /script>
 * ```
 *
 * ## Setting value when model is set
 *
 * Model values has priority over value set on the editor.
 * If `amf` is set and value has been altered programatically there
 * are two possible outcomes:
 *
 * 1) If `allowDisableParams` is set, model values are automatically
 * disabled if model item is not in the value
 * 2) If `allowDisableParams` is not set, model values are always
 * added to generated values. Or rather new value is added to the existing
 * model as custom values.
 */
export declare class ApiHeadersEditor {
  readonly styles: CSSResult;
  /**
   * Reference to currently rendered headers editor.
   */
  readonly currentPanel: HTMLElement|null;
  readonly _cmExtraKeys: object;

  /**
   * Headers value.
   */
  value: string|undefined;

  /**
   * Value of a Content-Type header.
   * When this value change then editor update the value for the content type. However,
   * to change a single header value, please, use `request-headers-changed` event with `name`
   * and `value` properties set on the detail object.
   */
  contentType: string|undefined;

  /**
   * Generated view model from the headers from `amf` model.
   * This is automatically set when `amf` is set.
   */
  viewModel: ModelItem[]|undefined;
  onvalue: EventListener|null;
  oncontenttype: EventListener|null;

  /**
   * `raml-aware` scope property to use.
   */
  aware: string|undefined;

  /**
   * List of headers defined in AMF model to render.
   */
  amfHeaders: object[]|undefined;

  /**
   * When set to true then the source edit mode is enabled
   */
  sourceMode: boolean|undefined;

  /**
   * Prohibits rendering of the documentation (the icon and the
   * description).
   * Note, Set is separately for `api-view-model-transformer`
   * component as this only affects "custom" items.
   */
  noDocs: boolean|undefined;

  /**
   * When set the editor is in read only mode.
   */
  readOnly: boolean|undefined;

  /**
   * Automatically validates headers agains AMF model when value change.
   * Note, it only works with form editor.
   */
  autoValidate: boolean|undefined;

  /**
   * Enables compatibility with Anypoint styling
   */
  compatibility: boolean|undefined;

  /**
   * Enables Material Design outlined style
   */
  outlined: boolean|undefined;

  /**
   * When set only form editor is available.
   *
   * Note, because of dependency, you still have to import CodeMirror
   * or at lease provide a mock function for registering addons.
   *
   * See @advanced-rest-client/code-mirror-hint for used functions.
   */
  noSourceEditor: boolean|undefined;
  render(): TemplateResult;
  _attachListeners(node: HTMLElement|Window): void;
  _detachListeners(node: HTMLElement|Window): void;

  /**
   * Registers an event handler for given type
   *
   * @param eventType Event type (name)
   * @param value The handler to register
   */
  _registerCallback(eventType: String, value: EventListener): void;

  /**
   * Handler for `sourceMode` change.
   *
   * Opens desired editr.
   */
  _sourceModeChanged(isSource: Boolean): void;

  /**
   * Updates the value when current editor's value change.
   */
  _editorValueChanged(e: CustomEvent): void;

  /**
   * Creates a headers string from a model.
   *
   * @param model Optional, model to process. If not set it uses
   * `this.viewModel`
   * @returns Generated headers
   */
  modelToValue(model: ModelItem[]): String;

  /**
   * Code mirror's ctrl+space key handler.
   * Opens headers fill support.
   *
   * @param cm Code mirror instance.
   */
  _cmKeysHandler(cm: object): void;

  /**
   * Called when switching from source view to form view.
   * Updates view model with values defined in text editor.
   *
   * Only headers existing in `value` are going to be present in the model.
   * Otherwise headers will be disabled.
   *
   * It does nothing if `value` or `viewModel` is not defined.
   */
  _modelFromValue(value: String): void;

  /**
   * Finds item position in model by name.
   *
   * @param model Model items
   * @param name Header name to search for
   * @returns Items position or `-1` if not found.
   */
  _findModelIndex(model: ModelItem[], name: String): Number;

  /**
   * Creates a custom header model item.
   *
   * @param defaults Default data
   * @returns View model item
   */
  createCustom(defaults: object): object;

  /**
   * Handler tor the `request-headers-changed` event.
   * Updates the editor value to the value of the event detail object.
   */
  _headersChangedHandler(e: CustomEvent): void;

  /**
   * Handler for the `request-header-changed` event.
   * It updates value for a single header.
   */
  _headerChangedHandler(e: CustomEvent): void;

  /**
   * Handler for `content-type-changed` event.
   * Uppdates it's value if from external source.
   */
  _contentTypeChangedHandler(e: CustomEvent): void;

  /**
   * Handler for `request-header-deleted` custom event.
   * Deletes header from the editor.
   */
  _headerDeletedHandler(e: CustomEvent): void;

  /**
   * Detects and sets content type value from changed headers value.
   *
   * @param value Headers new value.
   */
  _detectContentType(value: String): void;

  /**
   * Called by CodeMirror editor.
   * When something change n the headers list, detect content type header.
   */
  _valueChanged(value: String): void;
  _onContentTypeChanged(currentCt: string): void;
  _notifyContentType(type: string): void;

  /**
   * Updates `value` when new value is computed by the editor.
   *
   * @param value A value to set.
   */
  _setValues(value: String): void;

  /**
   * Coppies current response text value to clipboard.
   */
  _copyToClipboard(e: Event): void;
  _resetCopyButtonState(button: HTMLButtonElement): void;

  /**
   * attribute automatically, which should be used for styling.
   */
  _getValidity(): boolean;

  /**
   * Refreshes the CodeMirror editor when in `sourceMode`.
   */
  refresh(): void;
  _apiHandler(e: CustomEvent): void;
  _sourceModeHandler(e: CustomEvent): void;
  _formEditorInvalidHandler(e: CustomEvent): void;
  _formEditorModelHandler(e: CustomEvent): void;
}

export declare interface ApiHeadersForm extends ValidatableMixin, ApiFormMixin, EventsTargetMixin, AmfHelperMixin, LitElement {
}
