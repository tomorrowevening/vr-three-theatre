// CSS
import './style.css'
// Libs
import studio from '@theatre/studio'
import { VRButton } from 'three/examples/jsm/webxr/VRButton'
// Controllers
import AppRunner from './AppRunner'

let app: AppRunner | null = null

window.onload = () => {
  app = new AppRunner()
  app.init()
  app.resize()

  document.body.appendChild(VRButton.createButton(app.renderer))

  studio.initialize({
    __experimental_rafDriver: app.rafDriver,
  })
}
