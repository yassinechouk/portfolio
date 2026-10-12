import About from './sections/About'
import Contact from './sections/Contact'
import Hero from './sections/Hero'
import Nav from './sections/Nav'
import Projects from './sections/Projects'
import Skills from './sections/Skills'
import { useScrollProgress } from './hooks/useScrollProgress'
import SceneHost from './scene/SceneHost'
import { SECTION_ORDER } from './state/tourStore'

export default function App() {
  useScrollProgress(SECTION_ORDER)
  return (
    <>
      <SceneHost />
      <header className="site-header">
        <Nav />
      </header>
      <main>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Contact />
      </main>
    </>
  )
}
