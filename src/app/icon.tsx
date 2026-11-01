import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/** Icono de la app: símbolo del euro en dorado sobre fondo espresso. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1A120B',
          color: '#D5CEA3',
          fontSize: 340,
          fontWeight: 800,
        }}
      >
        €
      </div>
    ),
    size,
  );
}
