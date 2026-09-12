const path = require('path');
const fs = require('fs');
const sharp = require(path.resolve(process.cwd(), 'node_modules/sharp'));

async function createRoundedImage(inputPath, width, height, radius = 16, border = { width: 3, color: '#FFFFFF' }) {
  const resized = await sharp(inputPath)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  const maskSvg = Buffer.from(`
    <svg width="${width}" height="${height}">
      <rect x="0" y="0" width="${width}" height="${height}" rx="${radius}" ry="${radius}" fill="#ffffff" />
    </svg>
  `);

  const masked = await sharp(resized)
    .composite([{
      input: maskSvg,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  if (border && border.width > 0) {
    const borderSvg = Buffer.from(`
      <svg width="${width}" height="${height}">
        <rect x="${border.width / 2}" y="${border.width / 2}" 
              width="${width - border.width}" height="${height - border.width}" 
              rx="${radius}" ry="${radius}" 
              fill="none" stroke="${border.color}" stroke-width="${border.width}" />
      </svg>
    `);

    return sharp(masked)
      .composite([{
        input: borderSvg,
        blend: 'over'
      }])
      .png()
      .toBuffer();
  }

  return masked;
}

async function createCircularLogo(inputPath, size, borderWidth = 3, borderColor = '#5F9795') {
  const resized = await sharp(inputPath)
    .resize(size, size, { fit: 'cover', position: 'center' })
    .toBuffer();

  const radius = size / 2;
  const maskSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#ffffff" />
    </svg>
  `);

  const masked = await sharp(resized)
    .composite([{
      input: maskSvg,
      blend: 'dest-in'
    }])
    .png()
    .toBuffer();

  const borderSvg = Buffer.from(`
    <svg width="${size}" height="${size}">
      <circle cx="${radius}" cy="${radius}" r="${radius - borderWidth / 2}" fill="none" stroke="${borderColor}" stroke-width="${borderWidth}" />
    </svg>
  `);

  return sharp(masked)
    .composite([{
      input: borderSvg,
      blend: 'over'
    }])
    .png()
    .toBuffer();
}

async function generateOgBanner(outputPath) {
  const width = 1200;
  const height = 630;

  const logoPath = path.resolve('public/logo.jpg');
  const tanjorePath = path.resolve('public/images/hero-radha-krishna-gold.jpg');
  const madhubaniPath = path.resolve('public/images/categories/madhubani.jpg');
  const warliPath = path.resolve('public/images/categories/warli.jpg');

  const logoBuf = await createCircularLogo(logoPath, 84, 3, '#5F9795');

  // 3 artwork cards
  const card1W = 270;
  const card1H = 430;
  const card1Buf = await createRoundedImage(tanjorePath, card1W, card1H, 16, { width: 4, color: '#FFFFFF' });

  const card2W = 220;
  const card2H = 205;
  const card2Buf = await createRoundedImage(madhubaniPath, card2W, card2H, 14, { width: 4, color: '#FFFFFF' });

  const card3W = 220;
  const card3H = 205;
  const card3Buf = await createRoundedImage(warliPath, card3W, card3H, 14, { width: 4, color: '#FFFFFF' });

  const overlaySvg = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="cardShadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#2B2926" flood-opacity="0.14" />
        </filter>
      </defs>

      <!-- Outer decorative frame -->
      <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="20" fill="none" stroke="#E4DED1" stroke-width="1.5" />
      <rect x="32" y="32" width="${width - 64}" height="${height - 64}" rx="14" fill="none" stroke="#5F9795" stroke-width="1" stroke-dasharray="6 4" stroke-opacity="0.4" />

      <!-- Left Text Content -->
      <g transform="translate(68, 80)">
        <!-- Brand Name & Tagline -->
        <g transform="translate(100, 24)">
          <text x="0" y="24" font-family="Georgia, 'Playfair Display', serif" font-size="44" font-weight="bold" fill="#2B2926" letter-spacing="-0.5">Anjori Arts</text>
          <text x="0" y="52" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="700" fill="#5F9795" letter-spacing="3.5">INDIAN ART, MADE BY HAND</text>
        </g>

        <!-- Divider accent -->
        <line x1="0" y1="120" x2="480" y2="120" stroke="#E4DED1" stroke-width="1.5" />
        <circle cx="240" cy="120" r="4" fill="#5F9795" />

        <!-- Headline / Value Proposition -->
        <text x="0" y="175" font-family="Georgia, 'Playfair Display', serif" font-size="28" font-weight="600" fill="#2B2926">
          Bespoke Indian Art &amp;
        </text>
        <text x="0" y="215" font-family="Georgia, 'Playfair Display', serif" font-size="28" font-weight="600" fill="#5F9795">
          Handcrafted Traditions
        </text>

        <!-- Description paragraph -->
        <text x="0" y="265" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" fill="#69655D" font-weight="400">
          Discover authentic Madhubani, Tanjore gold leaf,
        </text>
        <text x="0" y="292" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" fill="#69655D" font-weight="400">
          Warli paintings, cyanotype prints &amp; custom commissions.
        </text>

        <!-- Tags / Pills -->
        <g transform="translate(0, 335)">
          <!-- Pill 1 -->
          <rect x="0" y="0" width="112" height="34" rx="17" fill="#E7EFEB" stroke="#5F9795" stroke-width="1" stroke-opacity="0.5" />
          <text x="56" y="22" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#355F5D" text-anchor="middle">✦ Tanjore</text>

          <!-- Pill 2 -->
          <rect x="122" y="0" width="128" height="34" rx="17" fill="#E7EFEB" stroke="#5F9795" stroke-width="1" stroke-opacity="0.5" />
          <text x="186" y="22" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#355F5D" text-anchor="middle">✦ Madhubani</text>

          <!-- Pill 3 -->
          <rect x="260" y="0" width="98" height="34" rx="17" fill="#E7EFEB" stroke="#5F9795" stroke-width="1" stroke-opacity="0.5" />
          <text x="309" y="22" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#355F5D" text-anchor="middle">✦ Warli</text>

          <!-- Pill 4 -->
          <rect x="368" y="0" width="120" height="34" rx="17" fill="#E7EFEB" stroke="#5F9795" stroke-width="1" stroke-opacity="0.5" />
          <text x="428" y="22" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#355F5D" text-anchor="middle">✦ Custom Art</text>
        </g>

        <!-- Website Badge / Domain -->
        <g transform="translate(0, 405)">
          <rect x="0" y="0" width="180" height="36" rx="8" fill="#FFFDF8" stroke="#E4DED1" stroke-width="1.5" />
          <circle cx="20" cy="18" r="4" fill="#5F9795" />
          <text x="32" y="23" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="600" fill="#2B2926" letter-spacing="0.5">anjoriarts.com</text>
        </g>
      </g>

      <!-- Right Side Art Gallery Shadows -->
      <rect x="636" y="96" width="${card1W}" height="${card1H}" rx="16" fill="#2B2926" opacity="0.1" filter="url(#cardShadow)" />
      <rect x="926" y="96" width="${card2W}" height="${card2H}" rx="14" fill="#2B2926" opacity="0.1" filter="url(#cardShadow)" />
      <rect x="926" y="321" width="${card3W}" height="${card3H}" rx="14" fill="#2B2926" opacity="0.1" filter="url(#cardShadow)" />
    </svg>
  `);

  const baseBg = await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 250, g: 247, b: 240, alpha: 1 }
    }
  }).png().toBuffer();

  const finalImage = await sharp(baseBg)
    .composite([
      { input: overlaySvg, top: 0, left: 0 },
      { input: logoBuf, top: 80, left: 68 },
      { input: card1Buf, top: 96, left: 636 },
      { input: card2Buf, top: 96, left: 926 },
      { input: card3Buf, top: 321, left: 926 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);

  return finalImage;
}

async function generateArtworkPlaceholder(outputPath) {
  const size = 800;
  const logoPath = path.resolve('public/logo.jpg');
  const logoBuf = await createCircularLogo(logoPath, 200, 4, '#5F9795');

  const svg = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${size}" height="${size}" fill="#FAF7F0" />
      <rect x="24" y="24" width="${size - 48}" height="${size - 48}" rx="20" fill="none" stroke="#E4DED1" stroke-width="2" />
      <rect x="36" y="36" width="${size - 72}" height="${size - 72}" rx="14" fill="none" stroke="#5F9795" stroke-width="1" stroke-dasharray="8 6" stroke-opacity="0.3" />
      <g transform="translate(400, 560)">
        <text x="0" y="0" font-family="Georgia, 'Playfair Display', serif" font-size="36" font-weight="bold" fill="#2B2926" text-anchor="middle">Anjori Arts</text>
        <text x="0" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="600" fill="#5F9795" text-anchor="middle" letter-spacing="2">AUTHENTIC INDIAN ART</text>
      </g>
    </svg>
  `);

  const base = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 250, g: 247, b: 240, alpha: 1 }
    }
  }).png().toBuffer();

  return sharp(base)
    .composite([
      { input: svg, top: 0, left: 0 },
      { input: logoBuf, top: 300, left: 300 },
    ])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outputPath);
}

module.exports = { generateOgBanner, generateArtworkPlaceholder };

if (require.main === module) {
  const outOg = path.resolve('public/images/og-default.jpg');
  const outPlaceholder = path.resolve('public/images/artwork-placeholder.jpg');

  Promise.all([
    generateOgBanner(outOg),
    generateArtworkPlaceholder(outPlaceholder)
  ]).then(([ogRes, phRes]) => {
    console.log('✓ Successfully generated OG banner at:', outOg, ogRes);
    console.log('✓ Successfully generated artwork placeholder at:', outPlaceholder, phRes);
  }).catch(err => {
    console.error('Error generating images:', err);
    process.exit(1);
  });
}

