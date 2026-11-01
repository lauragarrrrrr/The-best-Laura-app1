import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/** Icono para la pantalla de inicio del iPhone. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#2A1F17',
          color: '#D9A441',
          fontSize: 120,
          fontWeight: 800,
        }}
      >
        €
      </div>
    ),
    size,
  );
}
