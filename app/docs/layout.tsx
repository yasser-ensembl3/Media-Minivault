import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: 'Media Vault Documentation',
  description: 'Documentation for Media Vault content management',
}

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pageMap = await getPageMap('/docs')

  return (
    <Layout
      navbar={
        <Navbar
          logo={<span className="font-bold">Media Vault Docs</span>}
          logoLink="/vault"
        />
      }
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/yourusername/mediavault"
      footer={<Footer>MIT {new Date().getFullYear()} Media Vault</Footer>}
    >
      {children}
    </Layout>
  )
}
