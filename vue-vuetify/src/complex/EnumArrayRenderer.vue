<template>
  <control-wrapper
    v-bind="controlWrapper"
    :styles="styles"
    :isFocused="isFocused"
    :appliedOptions="appliedOptions"
  >
    <v-label :for="control.id + '-input'" v-bind="vuetifyProps('v-label')">{{
      computedLabel
    }}</v-label>
    <v-messages
      v-if="control.description && persistentHint()"
      :active="true"
      :messages="[control.description]"
      class="text-body-2 mb-2 text-medium-emphasis"
    ></v-messages>
    <v-container fluid>
      <v-row>
        <v-col v-for="(o, index) in control.options" :key="o.value">
          <v-checkbox
            :label="o.label"
            :model-value="dataHasEnum(o.value)"
            :id="control.id + `-input-${index}`"
            :path="composePaths(control.path, `${index}`)"
            :disabled="!control.enabled"
            :indeterminate="control.data === undefined"
            :error="!!control.errors"
            v-bind="vuetifyProps(`v-checkbox[${o.value}]`)"
            @change="() => toggle(o.value)"
            @focus="handleFocus"
            @blur="handleBlur"
          ></v-checkbox>
        </v-col>
      </v-row>
    </v-container>
    <v-messages
      v-if="control.errors"
      :active="true"
      color="error"
      :messages="[control.errors]"
      class="mt-2"
    ></v-messages>
  </control-wrapper>
</template>

<script lang="ts">
import {
  and,
  ControlElement,
  hasType,
  JsonFormsRendererRegistryEntry,
  JsonSchema,
  rankWith,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
  composePaths,
} from '@jsonforms/core';
import {
  VCheckbox,
  VContainer,
  VRow,
  VCol,
  VLabel,
  VMessages,
} from 'vuetify/components';
import {
  rendererProps,
  RendererProps,
  useJsonFormsMultiEnumControl,
} from '@jsonforms/vue';
import { defineComponent } from 'vue';
import { useVuetifyBasicControl } from '../util';
import { default as ControlWrapper } from '../controls/ControlWrapper.vue';

const controlRenderer = defineComponent({
  name: 'enum-array-renderer',
  components: {
    ControlWrapper,
    VCheckbox,
    VContainer,
    VRow,
    VCol,
    VLabel,
    VMessages,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useVuetifyBasicControl(useJsonFormsMultiEnumControl(props));
  },
  methods: {
    dataHasEnum(value: any) {
      return !!this.control.data?.includes(value);
    },
    composePaths,
    toggle(value: any) {
      if (!this.dataHasEnum(value)) {
        this.addItem(this.control.path, value);
      } else {
        // mistyped in core
        this.removeItem?.(this.control.path, value);
      }
    },
  },
});

export default controlRenderer;

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean =>
  schema.type === 'string' && schema.enum !== undefined;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    5,
    and(
      uiTypeIs('Control'),
      and(
        schemaMatches(
          (schema) =>
            hasType(schema, 'array') &&
            !Array.isArray(schema.items) &&
            schema.uniqueItems === true
        ),
        schemaSubPathMatches('items', (schema) => {
          return hasOneOfItems(schema) || hasEnumItems(schema);
        })
      )
    )
  ),
};
</script>
