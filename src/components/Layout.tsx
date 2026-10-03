import './Layout.css'

interface LayoutProps {
  hero: React.ReactNode
  left: React.ReactNode
  center: React.ReactNode
  right: React.ReactNode
}

export default function Layout({ hero, left, center, right }: LayoutProps) {
  return (
    <main className="portfolio-layout">
      {/* Hero banner – full width */}
      <section className="layout-hero">
        {hero}
      </section>

      {/* 3-column grid */}
      <div className="layout-columns">
        <aside className="col-left">
          {left}
        </aside>
        <section className="col-center">
          {center}
        </section>
        <aside className="col-right">
          {right}
        </aside>
      </div>
    </main>
  )
}
