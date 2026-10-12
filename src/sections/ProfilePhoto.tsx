import { useState } from 'react'
import { assetUrl } from '../content/assetUrl'

function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return ''
  const first = words[0][0]
  const last = words.length > 1 ? words[words.length - 1][0] : ''
  return (first + last).toUpperCase()
}

export default function ProfilePhoto({ name, src }: { name: string; src?: string }) {
  const [failed, setFailed] = useState(false)
  const showImage = Boolean(src) && !failed
  return (
    <div className="profile-photo">
      {showImage ? (
        <img src={assetUrl(src!)} alt={`Portrait of ${name}`} onError={() => setFailed(true)} />
      ) : (
        <span className="profile-initials" aria-hidden="true">
          {initials(name)}
        </span>
      )}
    </div>
  )
}
