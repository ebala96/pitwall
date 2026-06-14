import { useParams } from 'react-router-dom'
import { PagePlaceholder } from '../components/PagePlaceholder.jsx'

export default function Profile() {
  const { type, id } = useParams()
  return <PagePlaceholder title="Profile" note={`${type} / ${id} — Milestone 8.`} />
}
