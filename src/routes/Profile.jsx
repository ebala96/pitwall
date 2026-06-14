import { useParams } from 'react-router-dom'
import { QueryBoundary } from '../components/QueryBoundary.jsx'
import { ProfileView } from '../components/profile/ProfileView.jsx'
import { useConstructorProfile, useDriverProfile } from '../hooks/useProfile.js'
import { useSeason } from '../hooks/useSeason.js'

export default function Profile() {
  const { type, id } = useParams()
  const season = useSeason()

  const driver = useDriverProfile(season, type === 'driver' ? id : null)
  const constructor = useConstructorProfile(season, type === 'constructor' ? id : null)
  const query = type === 'driver' ? driver : constructor

  return (
    <section>
      <QueryBoundary
        query={query}
        isEmpty={(d) => !d?.rounds?.length}
        emptyReason={`No ${season} data for ${id}.`}
      >
        {(data) => <ProfileView data={data} />}
      </QueryBoundary>
    </section>
  )
}
