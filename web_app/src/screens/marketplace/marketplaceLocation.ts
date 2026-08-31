export function requestMarketplaceLocation(
  onLocation: (latitude: number, longitude: number) => void,
  onUnavailable: () => void
) {
  if (!navigator.geolocation) return onUnavailable()
  navigator.geolocation.getCurrentPosition(
    ({ coords }) => onLocation(coords.latitude, coords.longitude),
    onUnavailable,
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  )
}
