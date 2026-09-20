export function sendGAEvent(eventName: string, eventParams?: Record<string, any>) {
  if (typeof window !== "undefined" && (window as any).gtag) {
    // Only send if consent is granted
    const consent = document.cookie.split('; ').find(row => row.startsWith('cookie_consent='))?.split('=')[1]
    if (consent === 'granted') {
      (window as any).gtag("event", eventName, eventParams)
    }
  }
}
