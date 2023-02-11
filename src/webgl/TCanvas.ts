import * as THREE from 'three'
import { gl } from './core/WebGL'
import { Assets, loadAssets } from './utils/assetLoader'
import { controls } from './utils/OrbitControls'
import vertexShader from './shaders/vertex.glsl'
import fragmentShader from './shaders/fragment.glsl'
import 'glsl-noise/simplex/2d.glsl'
import { GUIController } from './utils/gui'

const colorDummy = new THREE.Color()

const uniforms = {
  color: 0x51b1f5,
  lightIntensity: 0.7,
  noiseFactor: 2.0,
  rotate: false,
  elapsed: 0,
}

export class TCanvas {
  private assets: Assets = {
    // https://sketchfab.com/3d-models/deer-sculpture-e97f99c0216a4cae9a8b11d044d2694a
    model: { path: '/resources/deer.glb' },
  }

  constructor(private parentNode: ParentNode) {
    loadAssets(this.assets).then(() => {
      this.init()
      this.initControls()
      this.createObjects()
      gl.requestAnimationFrame(this.anime)
    })
  }

  private init() {
    gl.setup(this.parentNode.querySelector('.three-container')!)
    gl.scene.background = new THREE.Color('#fff')
    gl.camera.position.set(-0.95, 1.57, 2.34)
  }

  // lil-gui
  private initControls() {
    const gui = GUIController.instance
    gui.addNumericSlider(uniforms, 'lightIntensity', 0.55, 0.75, 0.01)
    gui.addNumericSlider(uniforms, 'noiseFactor', 0.1, 5, 0.01)
    gui.addColor(uniforms, 'color')
    gui.addCheckBox(uniforms, 'rotate')
  }

  private createObjects() {
    const material = new THREE.ShaderMaterial({
      uniforms: {
        //uColor: { value: new THREE.Color(0x51b1f5) },
        uColor: { value: new THREE.Color(0x313131) },
        // position of spotlight
        uLightPos: {
          value: new THREE.Vector3(0, 3, 5),
        },
        // default light color
        uLightColor: {
          value: new THREE.Color(0xffffff),
        },
        uLightIntensity: {
          value: uniforms.lightIntensity,
        },
        uNoiseFactor: {
          value: uniforms.noiseFactor,
        },
      },
      vertexShader,
      fragmentShader,
    })

    // --------------------
    // deer model
    const model = (this.assets.model.data as any).scene.children[0] as THREE.Mesh
    model.geometry.applyMatrix4(new THREE.Matrix4().makeTranslation(0, -0.75, 0))
    model.material = material
    model.name = 'deer'
    gl.scene.add(model)

    const plane = new THREE.PlaneGeometry(100, 100, 10, 10)
    const planeMesh = new THREE.Mesh(plane, material)
    planeMesh.name = 'floor'
    planeMesh.position.set(0, -0.75, 0)
    planeMesh.rotation.set(-Math.PI / 2, 0, 0)
    gl.scene.add(planeMesh)
  }

  // ----------------------------------
  // animation
  private anime = () => {
    const model = gl.getMesh<THREE.ShaderMaterial>('deer')

    if (uniforms.rotate) {
      uniforms.elapsed += gl.time.delta
      model.material.uniforms.uLightPos.value = model.material.uniforms.uLightPos.value
        .clone()
        .set(Math.sin(uniforms.elapsed) * 5, 3, Math.cos(uniforms.elapsed) * 5)
    }

    model.material.uniforms.uColor.value = colorDummy.setHex(uniforms.color)
    model.material.uniforms.uLightIntensity.value = uniforms.lightIntensity
    model.material.uniforms.uNoiseFactor.value = uniforms.noiseFactor

    controls.update()
    gl.render()
  }

  // ----------------------------------
  // dispose
  dispose() {
    gl.dispose()
  }
}
