import './VibeCheckLogo.css'

const LOGO_SRC = '/vibecheck-logo.png'

/**
 * Brand logo image (replaces “VibeCheck” wordmark in the UI).
 * @param {'nav' | 'hero'} variant — nav: compact header; hero: login/marketing
 */
function VibeCheckLogo({ variant = 'nav', className = '' }) {
  const classes = ['vibecheck-logo', `vibecheck-logo--${variant}`, className].filter(Boolean).join(' ')

  return <img src={LOGO_SRC} alt="VibeCheck" className={classes} width={220} height={48} decoding="async" />
}

export default VibeCheckLogo
