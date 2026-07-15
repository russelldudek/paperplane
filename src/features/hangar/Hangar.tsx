import { type ChangeEvent, useCallback, useEffect, useState } from 'react'
import { Download, FolderOpen, Trash2, Upload } from 'lucide-react'
import type { AircraftGenome } from '../../domain/aircraft/genome'
import { downloadTextFile, safeFilename } from '../../infrastructure/import-export/downloads'
import { parseDesignPackage, serializeDesignPackage } from '../../infrastructure/import-export/packages'
import type { DesignRepository, SavedDesign } from '../../infrastructure/persistence/designRepository'
import { AircraftSilhouette } from '../invent/AircraftSilhouette'

interface HangarProps {
  repository: DesignRepository
  onOpen: (genome: AircraftGenome) => void
}

export function Hangar({ repository, onOpen }: HangarProps) {
  const [designs, setDesigns] = useState<SavedDesign[]>([])
  const [status, setStatus] = useState('Loading local hangar…')
  const [notice, setNotice] = useState('')

  const load = useCallback(() => repository.list().then(records => {
    setDesigns(records)
    setStatus(records.length ? '' : 'No saved aircraft yet. Select a candidate and save it from the Workbench.')
  }).catch(() => setStatus('Local storage is unavailable in this browser session.')), [repository])

  useEffect(() => {
    void load()
  }, [load])

  const remove = async (id: string) => {
    await repository.delete(id)
    await load()
  }

  const exportDesign = (record: SavedDesign) => {
    downloadTextFile(`${safeFilename(record.genome.name)}.paperplane.json`, serializeDesignPackage(record.genome), 'application/json')
    setNotice(`Exported ${record.genome.name}.`)
  }

  const importDesign = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      const genome = parseDesignPackage(await file.text())
      await repository.save(genome)
      await load()
      setNotice(`Imported ${genome.name}.`)
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Unable to import that design package.')
    }
  }

  return (
    <div className="hangar-page">
      <header className="feature-header">
        <div><span>Your Hangar</span><h1>Saved aircraft</h1><p>Every saved genome remains editable and tied to its exact model and calibration versions.</p></div>
        <label className="secondary-action file-action"><Upload size={16} /> Import design<input accept=".json,.paperplane.json,application/json" type="file" onChange={importDesign} /></label>
      </header>
      {notice ? <div className="inline-notice" role="status">{notice}</div> : null}
      {status ? <div className="empty-state"><FolderOpen size={36} /><strong>{status}</strong></div> : null}
      <div className="hangar-grid">
        {designs.map(record => (
          <article className="hangar-card" key={record.id}>
            <AircraftSilhouette genome={record.genome} />
            <div><span>{record.genome.family.replaceAll('-', ' ')}</span><h2>{record.genome.name}</h2><p>Updated {new Date(record.updatedAt).toLocaleString()}</p></div>
            <div className="hangar-actions">
              <button type="button" onClick={() => onOpen(record.genome)}>Open in Workbench</button>
              <button className="icon-button export-button" aria-label={`Export ${record.genome.name}`} title="Export JSON" type="button" onClick={() => exportDesign(record)}><Download size={16} /></button>
              <button className="icon-button" aria-label={`Delete ${record.genome.name}`} type="button" onClick={() => void remove(record.id)}><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
