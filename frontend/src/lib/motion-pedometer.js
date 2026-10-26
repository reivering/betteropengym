// A foreground-only web pedometer for the hosted app. Mobile browsers expose motion events,
// not the system's all-day step counter, so this estimates steps while the page is active.

export async function listenForSteps(onStep) {
  if (typeof window === 'undefined' || !window.isSecureContext) {
    throw new Error('Step counting needs a secure HTTPS connection.')
  }
  const Motion = window.DeviceMotionEvent
  if (!Motion) throw new Error('This browser does not provide motion sensor access.')

  // iOS requires this to be called directly from the user's tap on Start.
  if (typeof Motion.requestPermission === 'function') {
    const permission = await Motion.requestPermission()
    if (permission !== 'granted') throw new Error('Allow motion access to count steps.')
  }

  let gravity = null
  let filtered = 0
  let aboveThreshold = false
  let lastStepAt = 0
  let lastAt = 0
  const listener = event => {
    const acceleration = event.accelerationIncludingGravity || event.acceleration
    if (!acceleration || !Number.isFinite(acceleration.x) || !Number.isFinite(acceleration.y) || !Number.isFinite(acceleration.z)) return
    const now = performance.now()
    if (!gravity) {
      gravity = { x: acceleration.x, y: acceleration.y, z: acceleration.z }
      lastAt = now
      return
    }
    const dt = Math.min(1000, Math.max(1, now - lastAt))
    lastAt = now
    const alpha = 1 - Math.exp(-dt / 650)
    gravity.x += alpha * (acceleration.x - gravity.x)
    gravity.y += alpha * (acceleration.y - gravity.y)
    gravity.z += alpha * (acceleration.z - gravity.z)
    const x = acceleration.x - gravity.x
    const y = acceleration.y - gravity.y
    const z = acceleration.z - gravity.z
    const magnitude = Math.sqrt(x * x + y * y + z * z)
    filtered = filtered * 0.62 + magnitude * 0.38

    // Count a rising acceleration peak, with a short debounce for pocket movement.
    if (!aboveThreshold && filtered > 1.15) {
      aboveThreshold = true
      if (now - lastStepAt >= 280) {
        lastStepAt = now
        onStep()
      }
    } else if (aboveThreshold && filtered < 0.38) {
      aboveThreshold = false
    }
  }
  window.addEventListener('devicemotion', listener, { passive: true })
  return () => window.removeEventListener('devicemotion', listener)
}

export function motionCounterDeviceId() {
  const key = 'opengym:motion-counter-device'
  try {
    let id = localStorage.getItem(key)
    if (!id) {
      id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
      localStorage.setItem(key, id)
    }
    return id
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  }
}
