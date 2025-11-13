import { clearAllIds } from '@jsonforms/core';
import { Wrapper } from '@vue/test-utils';
import BooleanControlRenderer, {
  entry as booleanControlRendererEntry,
} from '../../../src/controls/BooleanControlRenderer.vue';
import { mountJsonForms } from '../util';

describe('BooleanControlRenderer.vue', () => {
  const renderers = [booleanControlRendererEntry];

  const data = true;
  const schema = {
    type: 'boolean',
    title: 'My Boolean',
  };
  const uischema = {
    type: 'Control',
    scope: '#',
    options: {
      placeholder: 'boolean placeholder',
    },
  };
  let wrapper: Wrapper<any, Element>;

  beforeEach(() => {
    // clear all ids to guarantee that the snapshots will always be generated with the same ids
    clearAllIds();
    wrapper = mountJsonForms(data, schema, renderers, uischema);
  });

  afterEach(() => {
    wrapper.destroy();
  });

  it('check if child BooleanControlRenderer exists', () => {
    expect(wrapper.getComponent(BooleanControlRenderer));
  });

  it('renders a checkbox', () => {
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('renders title as label', () => {
    expect(wrapper.find('label').text()).toEqual('My Boolean');
  });

  it('emits a data change', async () => {
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('click');
    expect(wrapper.vm.$data.data).toEqual(false);
  });

  it('should have a placeholder', async () => {
    const input = wrapper.find('input[type="checkbox"]');
    await input.trigger('focus');
    const placeholder = input.attributes('placeholder');
    expect(placeholder).toEqual('boolean placeholder');
  });

  it('should render component and match snapshot', () => {
    expect(wrapper.html()).toMatchSnapshot();
  });

  it('removes the property when toggled back to the indeterminate state for nullable booleans', async () => {
    const triStateWrapper = mountJsonForms(
      { toggle: true },
      {
        type: 'object',
        properties: {
          toggle: {
            type: ['null', 'boolean'],
          },
        },
      },
      renderers,
      {
        type: 'Control',
        scope: '#/properties/toggle',
      }
    );

    const input = triStateWrapper.find('input[type="checkbox"]');
    await input.trigger('click');
    await input.trigger('click');

    expect('toggle' in triStateWrapper.vm.$data.data).toBe(false);
    expect(triStateWrapper.vm.$data.data).toEqual({});

    triStateWrapper.destroy();
  });

  it('keeps two-state behaviour for pure boolean schemas', async () => {
    const twoStateWrapper = mountJsonForms(
      {},
      {
        type: 'object',
        properties: {
          toggle: {
            type: 'boolean',
          },
        },
      },
      renderers,
      {
        type: 'Control',
        scope: '#/properties/toggle',
      }
    );

    const input = twoStateWrapper.find('input[type="checkbox"]');
    await input.trigger('click');
    await input.trigger('click');

    expect(twoStateWrapper.vm.$data.data.toggle).toBe(false);
    expect('toggle' in twoStateWrapper.vm.$data.data).toBe(true);

    twoStateWrapper.destroy();
  });
});
