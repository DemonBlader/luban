import { mapState, mapMutations } from 'vuex'
import Vue from 'vue'
import actionMixin from './action-mixin'
import RenderScriptList from './script-list'

export default {
  mixins: [actionMixin],
  computed: {
    ...mapState('editor', ['editingElement']),
    methodQueue () {
      return (this.editingElement && this.editingElement.methodList) || []
    }
  },
  data: () => ({
    // methodQueue: [],
    activeCollapsePanel: 0,
    activePreviewAnimation: '',
    drawerVisible: false,
    scriptListVisible: false,
    noTitleKey: 'app'
  }),
  methods: {
    ...mapMutations('dialog', ['updateDialog']),
    add () {
      // TODO move this to vuex
      this.methodQueue.push({
        name: '',
        label: '',
        arguments: [],
        trigger: 'click'
      })
      this.activeCollapsePanel = this.methodQueue.length - 1
    },
    delete (index) {
      // TODO move this to vuex
      this.methodQueue.splice(index, 1)
    },
    run () {
      // front-end/h5/src/components/core/editor/index.js created()
      window.getEditorApp.$emit('RUN_ANIMATIONS')
    },
    renderForm (methodOption) {
      return (
        <a-form layout="horizontal">
          <a-form-item
            label={this.$t('editor.editPanel.method.type')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16, offset: 2 }}
          >
            <a-button type="link" size="small" icon="ordered-list" onClick={() => { this.drawerVisible = true }}>{this.$t('editor.editPanel.method.list')}</a-button>
          </a-form-item>
          <a-form-item
            label={this.$t('editor.editPanel.method.duration')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16, offset: 2 }}
            style="margin-bottom:0;"
          >
            <a-form-item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              <a-slider
                defaultValue={2}
                min={0}
                max={20}
                value={methodOption.duration}
                onChange={value => {
                  methodOption.duration = value
                }}
              />
            </a-form-item>
            <a-form-item style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginLeft: '4px' }}>
              <a-input-number
                min={0}
                max={20}
                size="small"
                formatter={value => `${value}???(s)`}
                value={methodOption.duration}
                onChange={value => {
                  methodOption.duration = value
                }}
              />
            </a-form-item>
          </a-form-item>
          <a-form-item
            label={this.$t('editor.editPanel.method.delay')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16, offset: 2 }}
            style="margin-bottom:0;"
          >
            <a-form-item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              <a-slider
                defaultValue={2}
                min={0}
                max={20}
                value={methodOption.delay}
                onChange={value => {
                  methodOption.delay = value
                }}
              />
            </a-form-item>
            <a-form-item
              style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginLeft: '4px' }}
            >
              <a-input-number
                min={0}
                max={20}
                size="small"
                formatter={value => `${value}???(s)`}
                value={methodOption.delay}
                onChange={value => {
                  methodOption.delay = value
                }}
              />
            </a-form-item>
          </a-form-item>
          <a-form-item
            label={this.$t('editor.editPanel.method.iteration')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16, offset: 2 }}
            style="margin-bottom:0;"
          >
            <a-form-item style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}>
              <a-slider
                defaultValue={2}
                min={0}
                max={20}
                value={methodOption.interationCount}
                onChange={value => {
                  methodOption.interationCount = value
                }}
              />
            </a-form-item>
            <a-form-item style={{ display: 'inline-block', width: 'calc(50% - 12px)', marginLeft: '4px' }}>
              <a-input-number
                min={0}
                max={20}
                size="small"
                formatter={value => `${value}???(times)`}
                value={methodOption.interationCount}
                onChange={value => {
                  methodOption.interationCount = value
                }}
              />
            </a-form-item>
          </a-form-item>
          <a-form-item
            label={this.$t('editor.editPanel.method.inifinite')}
            labelCol={{ span: 5 }}
            wrapperCol={{ span: 16, offset: 2 }}
            style="margin-bottom:0;"
          >
            <a-switch
              value={methodOption.infinite}
              onChange={value => {
                methodOption.infinite = value
              }}
            />
          </a-form-item>
        </a-form>
      )
    },
    renderParamsForm (method) {
      // const h = this.$createElement
      // const method = this.currentMethod
      if (!method.name) return
      const vm = this.getEditingElementVM()
      // eslint-disable-next-line no-unused-vars
      const methodParamsList = vm.$options.methodsConfig[method.name].params

      // ??? params ???????????????
      const formItems = methodParamsList.map((param, index) => {
        if (!method.arguments[index]) {
          method.arguments[index] = param.default
        }
        const editorConfig = param.editor || {}
        const data = {
          props: {
            ...editorConfig.prop || {},
            [editorConfig.type === 'a-switch' ? 'checked' : 'value']: method.arguments[index]
          },
          style: { width: '100%' },
          on: {
            change (e) {
              // <method.arguments[index] = e.target ? e.target.value : e> will not work, because the the arguments is not reactive
              // see more: https://vuejs.org/v2/guide/instance.html#Data-and-Methods
              Vue.set(method.arguments, index, e.target ? e.target.value : e)
            }
          }
        }
        return (
          <a-form-item
            label={param.label}
            wrapperCol={{ span: 16 }}
            labelCol={{ span: 6 }}
            labelAlign="left"
          >
            { this.$createElement(editorConfig.type || 'a-input', data) }
          </a-form-item>
        )
      })

      return <a-form
        layout="horizontal"
        ref="form"
        size="mini"
        id="props-edit-form"
        // label-width="100px"
        // label-position="left"
      >{formItems}</a-form>
    },
    renderActionCollapsePanel (method) {
      const methodList = this.getAvailableMethods()
      const addedMethods = methodList.filter(item => item.isAdded)
      const notAddedMethods = methodList.filter(item => !item.isAdded)
      return <div>
        <div style="background-color: #f6f8fa;padding:8px;word-break: break-all;">????????????<code class="marked">??????</code>?????????, <code class="marked">??????</code>???<code class="marked">??????</code><code class="marked">(http://baidu.com)</code></div>
        <span>???</span>
        <a-select
          value={method.trigger}
          size="small"
          style="width: 70px;margin: 0 8px;"
          onChange={(value /** 'click|touchstart' */) => { method.trigger = value }}
          placeholder="??????">
          <a-select-option value="click">??????</a-select-option>
        </a-select>
        <span class="mr-1">???,??????</span>
        <a-select
          value={method.name}
          style="width: 120px"
          placeholder="????????????"
          onChange={name => {
            method.name = name
            // debugger
            // const method = methodList.find(method => method.name === name)
            // this.currentMethod = method
          }}
          scopedSlots={{
            dropdownRender: (menu) => {
              return <div>
                <v-nodes vnodes={menu} />
                <a-divider style="margin: 4px 0;" />
                <div
                  style="padding: 4px 8px; cursor: pointer;"
                  onClick={() => { this.updateDialog({ type: 'allScriptList_dialog', value: true }) }}
                >
                  <a-icon type="plus" /> ????????????
                </div>
              </div>
            }
          }}
        >
          <a-select-opt-group>
            <span slot="label"><a-icon type="user" />????????????</span>
            {
              addedMethods.map((method, index) => (<a-select-option key={index} value={method.name}>{method.label}</a-select-option>))
            }
          </a-select-opt-group>
          <a-select-opt-group label="????????????">
            {
              notAddedMethods.map((method, index) => (<a-select-option key={index} value={method.name}>{method.label}</a-select-option>))
            }
          </a-select-opt-group>
        </a-select>
        {this.renderParamsForm(method)}
      </div>
    },
    handleMenuSelect ({ key }) {
      switch (key) {
        case 'addAction':
          this.add()
          break
        case 'toggleScriptListVisibleOfComp':
          this.scriptListVisible = !this.scriptListVisible
          break
        case 'toggleScriptListVisibleOfAll':
          this.updateDialog({ type: 'allScriptList_dialog', value: true })
          break
        case 'createScript':
          break
      }
    }
  },
  render (h) {
    const ele = this.editingElement
    if (!ele) return (<span>{this.$t('editor.editPanel.common.empty')}</span>)

    return (
      <div class="main-animate widget" style="max-height: calc(100vh - 110px);overflow: scroll;padding-top: 4px;">
        <a-timeline>
          <a-timeline-item>
            <span slot="dot">0</span>
            <a-tooltip >
              <template slot="title">
                <ul>
                  <li>??????H5 ??? ????????????</li>
                  <li>???????????????</li>
                  <li>??????????????????????????????</li>
                  <li>So??????????????????????????????????????????</li>
                </ul>
              </template>
              <div><a-icon type="question-circle" /> ????????????(??????????????????)</div>
            </a-tooltip>
          </a-timeline-item>
          <a-timeline-item>
            <span slot="dot">1</span>
            <a-button
              size="small"
              icon="shop"
              onClick={() => this.handleMenuSelect({ key: 'toggleScriptListVisibleOfAll' })}
            >??????(??????)??????</a-button>
          </a-timeline-item>
          <a-timeline-item>
            <span slot="dot">2</span>
            {/* ???????????? */}
            <a-button
              size="small"
              icon="plus"
              class="ml-1"
              onClick={() => this.handleMenuSelect({ key: 'addAction' })}
            >{this.$t('editor.editPanel.method.add')}</a-button>
          </a-timeline-item>
        </a-timeline>

        {/* <a-dropdown-button onClick={() => this.handleMenuSelect({ key: 'addAction' })} class="mb-3">
          <a-icon type="plus" />{this.$t('editor.editPanel.method.add')}
          <a-menu slot="overlay" onClick={this.handleMenuSelect}>
            <a-menu-item key="toggleScriptListVisibleOfAll"> <a-icon type="user" />????????????(??????)</a-menu-item>
            <a-menu-item key="toggleScriptListVisibleOfComp"> <a-icon type="user" />{this.scriptListVisible ? '??????' : '??????'}???????????? </a-menu-item>
            <a-menu-item key="3"> <a-icon type="user" />3rd item </a-menu-item>
          </a-menu>
        </a-dropdown-button> */}
        <RenderScriptList class="mb-3" />
        {
          // Q???????????????????????????this.methodQueue.length && ?
          // A?????????????????????????????? length === 0???????????????0???????????? UI ???
          !!this.methodQueue.length &&
          <a-collapse
            accordion
            class="collapse-wrapper"
            activeKey={'' + this.activeCollapsePanel}
            onChange={(key) => {
              // ???????????????????????????key ??? undefined
              this.activeCollapsePanel = typeof key !== 'undefined' ? +key : -1
            }}
          >
            {
              this.methodQueue.map((item, index) => (
                <a-collapse-panel key={`${index}`}>
                  <template slot="header">
                    {/* #!zh: ??????{index + 1} */}
                    {/* #!en: Animation{index + 1}</span> */}
                    <span>{this.$t('editor.editPanel.method.title', { index: index + 1 })}</span>
                    <a-tag color="orange">{item.label}</a-tag>
                    <a-icon type="delete" onClick={() => this.delete(index)} title="????????????"></a-icon>
                  </template>
                  {/* {this.renderForm(addedAnimation)} */}
                  {/* {this.renderForm(item)} */}
                  {this.renderActionCollapsePanel(item)}
                </a-collapse-panel>
              ))
            }
          </a-collapse>
        }
      </div>
    )
  }
}
