import { useMemo, useState } from 'react'
import { Activity, ArrowDown, ArrowUp, Gauge, Scale, Sparkles, Wind } from 'lucide-react'
import type { AircraftGenome } from '../../domain/aircraft/genome'
import { simulateFlight } from '../../domain/aerodynamics/model'
import { calmEnvironment, standardLaunch, type LearnerProfile } from '../../domain/shared/types'

interface LearnPhysicsProps {
  genome: AircraftGenome
}

type LessonDepth = Extract<LearnerProfile, 'explorer' | 'investigator' | 'engineer'>

interface Concept {
  title: string
  symbol: string
  explorer: string
  investigator: string
  engineer: string
  note: string
}

const concepts: Concept[] = [
  {
    title: 'Lift',
    symbol: 'L = ½ρV²SCL',
    explorer: 'Air pushes on the wings as the airplane moves. The wing redirects some air downward, and the reaction helps support the airplane.',
    investigator: 'Lift grows with air density, wing area, lift coefficient, and the square of airspeed. Doubling speed can create roughly four times the aerodynamic force before stall and deformation effects are considered.',
    engineer: 'The lab estimates lift with dynamic pressure q = ½ρV² and a bounded low-Reynolds-number lift coefficient. Folded paper is not a rigid airfoil, so CL is modeled as a range rather than treated as a measured constant.',
    note: 'Calculated from geometry; lift coefficient is modeled.',
  },
  {
    title: 'Drag',
    symbol: 'D = ½ρV²SCD',
    explorer: 'Drag is the air resisting the airplane. Wide folds, rough edges, and crooked wings usually add more drag.',
    investigator: 'The model combines parasite drag from the shape and folded layers with induced drag produced while the wing generates lift.',
    engineer: 'CD is estimated as CD0 + CL²/(πeAR). The span efficiency e, base drag CD0, and fold-layer penalty are bounded assumptions that require real-flight calibration.',
    note: 'Equation is calculated; coefficients are modeled.',
  },
  {
    title: 'Wing loading',
    symbol: 'W/S',
    explorer: 'Wing loading compares how much weight each patch of wing must carry. More wing area or less mass usually makes a gentler glider.',
    investigator: 'Higher wing loading generally raises stall speed and favors faster, more forceful flight. Lower wing loading generally supports slower flight and longer airtime.',
    engineer: 'Wing loading is aircraft weight divided by projected wing area. Payload and ballast increase W directly, while span and chord mutations change S.',
    note: 'Calculated directly from mass and projected area.',
  },
  {
    title: 'Center of gravity & stability',
    symbol: 'SM = (xNP − xCG) / c̄',
    explorer: 'The airplane balances around its center of gravity. Too much weight in the back can make it climb, wobble, or stall.',
    investigator: 'A small forward stability margin usually helps the nose return after a disturbance. Too much margin can create a hard nose dive; too little can make the airplane unstable.',
    engineer: 'Static margin compares estimated neutral-point and center-of-gravity locations as a fraction of mean chord. This lab rejects aft-CG candidates and reports the remaining margin as a modeled stability indicator.',
    note: 'Mass balance is calculated; neutral point is modeled.',
  },
  {
    title: 'Reynolds number',
    symbol: 'Re = ρVc / μ',
    explorer: 'Small paper airplanes fly in air that can feel “stickier” than it does to a full-size airplane. That changes how smoothly air follows the wing.',
    investigator: 'Reynolds number compares inertia with viscosity. Paper airplanes operate at relatively low Reynolds numbers, where creases, blunt edges, and surface roughness matter strongly.',
    engineer: 'The model uses mean aerodynamic chord and launch speed for Re. It does not solve boundary-layer transition or separation; those effects are folded into bounded coefficient assumptions.',
    note: 'Calculated from air properties, speed, and chord.',
  },
  {
    title: 'Uncertainty',
    symbol: 'low · nominal · high',
    explorer: 'Two throws are never exactly alike, so the app shows a useful range instead of pretending it knows one perfect answer.',
    investigator: 'Launch speed, angle, symmetry, humidity, paper damage, and air movement can all change a flight. Repeated tests help separate design effects from throw-to-throw variation.',
    engineer: 'Prediction intervals come from deterministic perturbations of launch repeatability, coefficient assumptions, alignment quality, and environmental conditions. They are engineering bounds, not statistical confidence intervals from a large calibrated dataset.',
    note: 'Modeled range; improve it with measured flight data.',
  },
]

const depthLabels: Record<LessonDepth, string> = {
  explorer: 'Explorer · plain language',
  investigator: 'Investigator · applied science',
  engineer: 'Engineer · equations & assumptions',
}

export function LearnPhysics({ genome }: LearnPhysicsProps) {
  const [depth, setDepth] = useState<LessonDepth>('investigator')
  const prediction = useMemo(() => simulateFlight(genome, calmEnvironment, standardLaunch), [genome])

  return (
    <div className="learn-page">
      <header className="feature-header learn-header">
        <div>
          <span>Physics learning layer</span>
          <h1>Why paper airplanes fly</h1>
          <p>Learn from the active aircraft, then test the explanation in the real world. This is a reduced-order model: physically meaningful, deliberately bounded, and honest about what it cannot know yet.</p>
        </div>
        <label className="learn-depth">
          <span>Explanation level</span>
          <select aria-label="Explanation level" value={depth} onChange={event => setDepth(event.target.value as LessonDepth)}>
            {Object.entries(depthLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </header>

      <section className="force-board" aria-labelledby="forces-title">
        <div className="force-copy">
          <span>Start here</span>
          <h2 id="forces-title">Four ideas, one important correction</h2>
          <p>Weight acts downward. Aerodynamic lift acts mostly upward. Drag opposes motion. Your hand supplies the launch impulse—but after release, a paper airplane has no powered thrust. It spends the speed and height you gave it.</p>
        </div>
        <div className="force-diagram" role="img" aria-label="Paper airplane with lift, weight, drag, and launch impulse arrows">
          <ArrowUp className="force-arrow lift-arrow" aria-hidden="true" />
          <span className="force-label lift-label">Lift</span>
          <Wind className="force-arrow drag-arrow" aria-hidden="true" />
          <span className="force-label drag-label">Drag</span>
          <svg aria-hidden="true" viewBox="0 0 300 170">
            <path d="M35 86 258 31 176 137 137 99 35 86Z" fill="#fffdf8" stroke="#0b243c" strokeWidth="7" strokeLinejoin="round" />
            <path d="m137 99 121-68-156 57" fill="none" stroke="#40c4d9" strokeWidth="6" strokeLinejoin="round" />
          </svg>
          <ArrowDown className="force-arrow weight-arrow" aria-hidden="true" />
          <span className="force-label weight-label">Weight</span>
          <span className="launch-vector">Launch impulse →</span>
        </div>
      </section>

      <section className="active-readout" aria-label="Active aircraft physics readout">
        <div><Sparkles size={18} /><span>Active aircraft</span><strong>{genome.name}</strong></div>
        <div><Scale size={18} /><span>Wing loading</span><strong>{prediction.wingLoadingNpm2} N/m²</strong></div>
        <div><Gauge size={18} /><span>Stall speed</span><strong>{prediction.stallSpeedMps.nominal} m/s</strong></div>
        <div><Activity size={18} /><span>Static margin</span><strong>{prediction.staticMarginPercent}%</strong></div>
      </section>

      <section className="concept-grid" aria-label="Aerodynamics concepts">
        {concepts.map(concept => (
          <article className="concept-card" key={concept.title}>
            <div className="concept-card-head"><span>{concept.title}</span><code>{concept.symbol}</code></div>
            <p>{concept[depth]}</p>
            <small>{concept.note}</small>
          </article>
        ))}
      </section>

      <section className="experiment-method">
        <div><span>Scientific method</span><h2>Change one variable. Throw several times.</h2></div>
        <ol>
          <li>Choose one design or trim variable.</li>
          <li>Keep paper, launcher, location, and target the same.</li>
          <li>Record at least five throws before comparing averages.</li>
          <li>Use the Flight Test Lab to diagnose behavior, then make one bounded adjustment.</li>
        </ol>
      </section>
    </div>
  )
}
