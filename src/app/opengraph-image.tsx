import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Hello SLAM — Free Interactive Course on Robot Localization & Mapping';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #002111 0%, #006d3b 60%, #003d22 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(118,251,171,0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -100,
            left: -60,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'rgba(88,222,145,0.08)',
          }}
        />

        {/* Chip */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(118,251,171,0.18)',
            border: '1px solid rgba(118,251,171,0.3)',
            borderRadius: 999,
            padding: '6px 20px',
            marginBottom: 32,
            width: 'fit-content',
            color: '#76fbab',
            fontSize: 18,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
          }}
        >
          Free Interactive Course
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 700,
            color: '#ffffff',
            lineHeight: 1.0,
            letterSpacing: '-0.03em',
            marginBottom: 24,
          }}
        >
          Hello SLAM
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.4,
            maxWidth: 720,
            marginBottom: 48,
          }}
        >
          Kalman filters · Particle filters · EKF-SLAM · FastSLAM · Graph-based SLAM
        </div>

        {/* Chapter pills */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {['Ch 0 · Introduction', 'Ch 1 · Kalman Filters', 'Ch 2 · Particle Filters', 'Ch 3 · Graph SLAM'].map(
            (label) => (
              <div
                key={label}
                style={{
                  background: 'rgba(118,251,171,0.15)',
                  border: '1px solid rgba(118,251,171,0.25)',
                  borderRadius: 12,
                  padding: '8px 20px',
                  color: '#76fbab',
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            )
          )}
        </div>
      </div>
    ),
    size
  );
}
