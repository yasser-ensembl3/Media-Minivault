import { useMDXComponents as getDocsMDXComponents } from 'nextra-theme-docs'

export function getMDXComponents(components: any = {}): any {
  const docsComponents = getDocsMDXComponents(components)
  return {
    ...docsComponents,
    ...components,
  }
}

export const useMDXComponents = getMDXComponents
