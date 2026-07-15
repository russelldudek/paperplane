import { useState } from 'react'
import { InventLab } from '../features/invent/InventLab'
import { EngineeringWorkbench } from '../features/workbench/EngineeringWorkbench'
import { BuildGuide } from '../features/build/BuildGuide'
import { FlightLab } from '../features/flight-lab/FlightLab'
import { Hangar } from '../features/hangar/Hangar'
import { LearnPhysics } from '../features/learn/LearnPhysics'
import { IndexedDbDesignRepository } from '../infrastructure/persistence/designRepository'
import { IndexedDbTestRepository } from '../infrastructure/persistence/testRepository'
import { createFamilyGenome } from '../domain/aircraft/families'
import { navigationItems, type AppSection } from './navigation'

function PaperPlaneMark() {
  return (
    <svg aria-hidden="true" viewBox="0 0 64 64" width="26" height="26">
      <path d="M7 29.5 56 8 41.5 56 29 37 7 29.5Z" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
      <path d="m29 37 27-29-35 25" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  )
}

const designRepository = new IndexedDbDesignRepository()
const testRepository = new IndexedDbTestRepository()

export function App() {
  const [section, setSection] = useState<AppSection>('invent')
  const [activeGenome, setActiveGenome] = useState(() => createFamilyGenome('dart-glider'))

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><PaperPlaneMark /></div>
          <div className="brand-copy"><strong>Paper Airplane Lab</strong><span>Flight engineering</span></div>
        </div>
        <nav className="nav-list" aria-label="Laboratory sections">
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button key={id} className="nav-button" aria-label={id === 'invent' ? 'Invent an airplane' : label} aria-current={section === id ? 'page' : undefined} onClick={() => setSection(id)}>
              <Icon size={18} strokeWidth={2.1} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-note">Physics-informed predictions. Buildable folds. Honest uncertainty. No imaginary wind tunnel required.</div>
      </aside>
      <main className="main-shell">
        <header className="topbar">
          <div className="topbar-copy">Local-first laboratory · Model v0.1</div>
          <div className="topbar-status"><span className="status-dot" /> Simulation engine ready</div>
        </header>
        <div className="workspace">
          {section === 'invent' ? (
            <InventLab onSelectCandidate={candidate => { setActiveGenome(candidate.genome); setSection('workbench') }} />
          ) : section === 'workbench' ? (
            <EngineeringWorkbench key={activeGenome.id} initialGenome={activeGenome} onGenomeChange={setActiveGenome} onSave={genome => designRepository.save(genome)} />
          ) : section === 'build' ? (
            <BuildGuide genome={activeGenome} />
          ) : section === 'flight-lab' ? (
            <FlightLab genome={activeGenome} repository={testRepository} />
          ) : section === 'hangar' ? (
            <Hangar repository={designRepository} onOpen={genome => { setActiveGenome(genome); setSection('workbench') }} />
          ) : (
            <LearnPhysics genome={activeGenome} />
          )}
        </div>
      </main>
    </div>
  )
}
