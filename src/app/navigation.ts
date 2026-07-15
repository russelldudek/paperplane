import {
  BookOpen,
  Compass,
  DraftingCompass,
  FlaskConical,
  FolderOpen,
  Origami,
  type LucideIcon,
} from 'lucide-react'

export type AppSection = 'invent' | 'workbench' | 'build' | 'flight-lab' | 'hangar' | 'learn'

export interface NavigationItem {
  id: AppSection
  label: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  { id: 'invent', label: 'Invent', icon: Compass },
  { id: 'workbench', label: 'Workbench', icon: DraftingCompass },
  { id: 'build', label: 'Build', icon: Origami },
  { id: 'flight-lab', label: 'Flight Lab', icon: FlaskConical },
  { id: 'hangar', label: 'Hangar', icon: FolderOpen },
  { id: 'learn', label: 'Learn', icon: BookOpen },
]
