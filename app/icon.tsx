import { ImageResponse } from 'next/og'

// Route segment config
export const runtime = 'edge'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // Favicon JSX element (Reproduction exacte du Logo Motoka)
      <div
        style={{
          background: '#10b981',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '25%',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          width="20"
          height="20"
          style={{ color: 'white' }}
        >
          <path
            d="M4 18V7L12 14L20 7V18"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 14L12 21"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}
