import { useState, useEffect, useRef } from 'react'

/**
 * Plays a typewriter reveal of `text`.
 * Respects prefers-reduced-motion: returns full text immediately.
 * @param text     The string to reveal
 * @param speed    ms per character (default 55)
 * @param startDelay ms before typing starts (default 300)
 */
export function useTypewriter(text: string, speed = 55, startDelay = 300): string {
  const reduced = useRef(
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  const [displayed, setDisplayed] = useState(reduced.current ? text : '')

  useEffect(() => {
    if (reduced.current) { setDisplayed(text); return }

    setDisplayed('')
    let i = 0
    let startTimer: ReturnType<typeof setTimeout>
    let charTimer: ReturnType<typeof setInterval>

    startTimer = setTimeout(() => {
      charTimer = setInterval(() => {
        i++
        setDisplayed(text.slice(0, i))
        if (i >= text.length) clearInterval(charTimer)
      }, speed)
    }, startDelay)

    return () => {
      clearTimeout(startTimer)
      clearInterval(charTimer)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text])

  return displayed
}
