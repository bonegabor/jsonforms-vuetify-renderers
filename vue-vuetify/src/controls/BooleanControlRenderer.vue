<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-checkbox
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disabled="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      :label="computedLabel"
      :hint="control.description"
      :persistent-hint="persistentHint()"
      :required="control.required"
      :error-messages="control.errors"
      :indeterminate="isTriState && control.data == null"
      :model-value="control.data"
      v-bind="vuetifyProps('v-checkbox')"
      @update:modelValue="onChange"
      @focus="handleFocus"
      @blur="handleBlur"
    />
  </control-wrapper>
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  isBooleanControl,
} from '@jsonforms/core';
import { computed, defineComponent } from 'vue';
import {
  rendererProps,
  useJsonFormsControl,
  RendererProps,
} from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useVuetifyControl } from '../util';
import { VCheckbox } from 'vuetify/components';

const controlRenderer = defineComponent({
  name: 'boolean-control-renderer',
  components: {
    VCheckbox,
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const jsonFormsControl = useJsonFormsControl(props);
    const vuetifyControl = useVuetifyControl(jsonFormsControl);
    const defaultOnChange = vuetifyControl.onChange;

    const isTriState = computed(() => {
      const type = jsonFormsControl.control.value.schema?.type;

      return Array.isArray(type)
        ? type.includes('boolean') && type.includes('null')
        : false;
    });

    const cycleBoolean = () => {
      const current = vuetifyControl.control.value.data;
      const normalized = current === null ? undefined : current;
      const nextValue =
        normalized === true ? false : normalized === false ? undefined : true;

      defaultOnChange(nextValue);
    };

    const onCheckboxChange = (value: boolean) => {
      if (isTriState.value) {
        cycleBoolean();
        return;
      }

      defaultOnChange(!!value);
    };

    return {
      ...vuetifyControl,
      isTriState,
      onChange: onCheckboxChange,
    };
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1, isBooleanControl),
};
</script>
