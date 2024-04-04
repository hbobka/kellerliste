import { describe, it, expect } from 'vitest'

import { mount } from '@vue/test-utils'
import TileItem from '@/components/TileItem.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mount(TileItem, { props: { text: 'Hello Vitest' } })
    expect(wrapper.text()).toContain('Hello Vitest')
  })
})
