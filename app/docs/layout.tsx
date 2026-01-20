import { Footer, Layout, Navbar } from 'nextra-theme-docs'
import { getPageMap } from 'nextra/page-map'
import 'nextra-theme-docs/style.css'

export const metadata = {
  title: 'ContentVault Documentation',
  description: 'Documentation for ContentVault content management',
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
          logo={<span className="font-bold">ContentVault Docs</span>}
          logoLink="/vault"
        />
      }
      pageMap={pageMap}
      docsRepositoryBase="https://github.com/yourusername/contentvault"
      footer={<Footer>MIT {new Date().getFullYear()} ContentVault</Footer>}
    >
      {children}
    </Layout>
  )
}
