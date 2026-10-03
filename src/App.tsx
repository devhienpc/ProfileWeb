import './App.css'
import Header             from './components/Header'
import Layout             from './components/Layout'
import AnimatedBackground from './components/AnimatedBackground'
import HeroBanner         from './components/HeroBanner'
import LeftColumn         from './components/LeftColumn'
import CenterColumn       from './components/CenterColumn'
import RightColumn        from './components/RightColumn'
import { usePortfolioData } from './hooks/usePortfolioData'

export default function App() {
  const { data, loading, error, refetch } = usePortfolioData()

  return (
    <>
      <AnimatedBackground />
      <Header />

      {error && (
        <div style={{
          position: 'fixed', top: '4rem', right: '1rem', zIndex: 100,
          background: 'rgba(180,30,30,0.85)', backdropFilter: 'blur(8px)',
          color: '#fff', padding: '0.6rem 1rem', borderRadius: '0.5rem',
          fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          Lỗi tải dữ liệu: {error}
          <button
            onClick={refetch}
            style={{
              marginLeft: 8, padding: '0.2rem 0.6rem', borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.4)', background: 'transparent',
              color: '#fff', cursor: 'pointer', fontSize: '0.75rem',
            }}
          >
            Thử lại
          </button>
        </div>
      )}

      <Layout
        hero={
          <HeroBanner
            profile={data?.profile ?? null}
            socials={data?.socials ?? []}
            loading={loading}
          />
        }
        left={
          <LeftColumn
            profile={data?.profile ?? null}
            skills={data?.skills ?? []}
            loading={loading}
          />
        }
        center={
          <CenterColumn
            projects={data?.projects ?? []}
            loading={loading}
          />
        }
        right={
          <RightColumn
            profile={data?.profile ?? null}
            skills={data?.skills ?? []}
            loading={loading}
          />
        }
      />
    </>
  )
}
