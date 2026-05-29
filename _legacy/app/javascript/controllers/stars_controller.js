import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.createStars()
    this.animateStars()
  }

  disconnect() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
    }
  }

  createStars() {
    const starCount = 300
    this.stars = []
    
    // Create three layers of stars for depth
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div')
      star.className = 'absolute rounded-full pointer-events-none'
      
      // Determine depth layer (0 = far, 1 = mid, 2 = near)
      const layer = Math.floor(Math.random() * 3)
      
      // Size and opacity based on layer (far stars are smaller and dimmer)
      const baseSize = [0.3, 0.6, 1.2][layer]
      const size = baseSize + Math.random() * baseSize * 0.5
      
      const baseOpacity = [0.3, 0.5, 0.8][layer]
      const opacity = baseOpacity + Math.random() * 0.2
      
      // Position stars randomly across the screen
      const x = Math.random() * 100
      const y = Math.random() * 100
      
      // Speed based on layer (parallax effect - near stars move faster)
      const baseSpeed = [0.02, 0.04, 0.08][layer]
      const speed = baseSpeed + Math.random() * baseSpeed * 0.5
      
      // Color variation - slight blue tint for some stars
      const colorVariation = Math.random()
      let color = '#ffffff'
      if (colorVariation > 0.7) {
        color = '#e6f3ff' // Slight blue tint
      } else if (colorVariation > 0.9) {
        color = '#ffe6e6' // Slight red tint
      }
      
      star.style.width = size + 'px'
      star.style.height = size + 'px'
      star.style.left = x + '%'
      star.style.top = y + '%'
      star.style.opacity = opacity
      star.style.backgroundColor = color
      star.style.boxShadow = `0 0 ${size * 2}px ${color}`
      
      this.element.appendChild(star)
      
      this.stars.push({
        element: star,
        x: x,
        y: y,
        baseX: x,
        baseY: y,
        size: size,
        opacity: opacity,
        speed: speed,
        layer: layer,
        angle: Math.random() * Math.PI * 2,
        angleSpeed: (Math.random() - 0.5) * 0.001,
        twinkleSpeed: Math.random() * 0.01 + 0.002,
        twinklePhase: Math.random() * Math.PI * 2
      })
    }
  }

  animateStars() {
    const animate = () => {
      this.stars.forEach(star => {
        // Create a subtle drift effect with slight curve
        star.angle += star.angleSpeed
        
        // Move primarily from bottom-right to top-left with slight variation
        star.x -= star.speed * 0.7
        star.y -= star.speed * 0.5
        
        // Add subtle sine wave movement for more organic feel
        const wobbleX = Math.sin(star.angle) * 0.02
        const wobbleY = Math.cos(star.angle) * 0.02
        
        // When star goes off screen, reset from opposite side
        if (star.x < -5) {
          star.x = 105 + Math.random() * 10
          star.y = Math.random() * 110
        }
        if (star.y < -5) {
          star.y = 105 + Math.random() * 10
          star.x = Math.random() * 110
        }
        
        star.element.style.left = (star.x + wobbleX) + '%'
        star.element.style.top = (star.y + wobbleY) + '%'
        
        // Subtle twinkling
        star.twinklePhase += star.twinkleSpeed
        const twinkle = (Math.sin(star.twinklePhase) + 1) / 2
        star.element.style.opacity = star.opacity * (0.7 + twinkle * 0.3)
      })
      
      this.animationFrame = requestAnimationFrame(animate)
    }
    
    animate()
  }
}