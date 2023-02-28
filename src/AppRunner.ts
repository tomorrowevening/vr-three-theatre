// Libs
import { createRafDriver, getProject, IRafDriver, types } from '@theatre/core'
import { CubeTexture, CubeTextureLoader, GridHelper, Mesh, MeshNormalMaterial, Object3D, PerspectiveCamera, Scene, TorusKnotGeometry, WebGLRenderer } from 'three'
import { degToRad } from 'three/src/math/MathUtils'
// Animation
import animation from './animation.json'

export default class AppRunner {
  renderer: WebGLRenderer
  scene: Scene
  camera: PerspectiveCamera
  container: Object3D
  rafDriver!: IRafDriver

  constructor() {
    const canvas = document.querySelector('canvas')! as HTMLCanvasElement
    this.renderer = new WebGLRenderer({
      antialias: true,
      canvas: canvas,
    })
    this.renderer.setPixelRatio(devicePixelRatio)
    this.renderer.xr.enabled = true

    this.scene = new Scene()

    this.container = new Object3D()
    this.scene.add(this.container)

    this.camera = new PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000)
    this.camera.position.y = 6
  }

  init() {
    window.addEventListener('resize', this.resize, false)
    this.createDriver()
    this.initScene()
    this.initAnimation()
  }

  private initScene = () => {
    const grid = new GridHelper(1000, 100)
    this.scene.add(grid)

    const mesh = new Mesh(new TorusKnotGeometry(5, 1, 100, 16), new MeshNormalMaterial())
    mesh.position.set(0, 0, -50)
    this.container.add(mesh)

    new CubeTextureLoader()
      .setPath('MilkyWay/')
      .loadAsync(['px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg'])
      .then((texture: CubeTexture) => {
        this.scene.background = texture
      })
  }

  private initAnimation = () => {
    const project = getProject('VR Example', { state: animation })
    project.ready.then(() => {
      const sheet = project.sheet('Scene')
      sheet.object('Camera Container', {
        position: {
          x: this.container.position.x,
          y: this.container.position.y,
          z: this.container.position.z,
        },
        rotation: {
          x: types.number(this.camera.rotation.x, { range: [-180, 180] }),
          y: types.number(this.camera.rotation.y, { range: [-180, 180] }),
          z: types.number(this.camera.rotation.z, { range: [-180, 180] }),
        },
      }).onValuesChange((values: any) => {
        this.container.position.set(values.position.x, values.position.y, values.position.z)
        this.container.rotation.set(
          degToRad(values.rotation.x),
          degToRad(values.rotation.y),
          degToRad(values.rotation.z),
        )
      })

      // Use custom RAF Driver
      sheet.sequence.play({ iterationCount: Infinity, rafDriver: this.rafDriver, range: [0, 4] })
    })
  }

  private createDriver = () => {
    let started = false

    const start = (): void => {
      if (started) return
      this.renderer.setAnimationLoop(() => {
        this.rafDriver.tick(performance.now())
        this.cycle()
      });

    }

    const stop = (): void => {
      started = false
      this.renderer.setAnimationLoop(null)
    }

    this.rafDriver = createRafDriver({ name: 'CustomRafDriver', start, stop })
  }

  dispose() {
    window.removeEventListener('resize', this.resize)
  }

  resize = () => {
    const width = window.innerWidth
    const height = window.innerHeight
    const aspect = width / height
    this.camera.aspect = aspect
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(width, height)
  }

  // Per-frame updates

  update() {
    //
  }

  draw() {
    this.renderer.render(this.scene, this.camera)
  }

  cycle = () => {
    this.update()
    this.draw()
  }

  // Standalone loop

  play() {
    this.renderer.setAnimationLoop(this.cycle)
  }

  stop() {
    this.renderer.setAnimationLoop(null)
  }
}
