import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  EventEmitter,
  Output,
} from '@angular/core';
import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, AfterViewInit {
  name = 'Angular - Three.js';

  @ViewChild('mainCanvas', { static: false }) rendererContainer: ElementRef;

  cameraDefaults = {
    posCamera: new THREE.Vector3(0.0, 25.0, 0.0),
    posCameraTarget: new THREE.Vector3(0, 0, 0),
    near: 0.1,
    far: 10000,
    fov: 45,
    aspectRatio: 4 / 3,
  };

  renderer: THREE.Renderer = null;
  scene: THREE.Scene = null;
  camera: THREE.PerspectiveCamera = null;
  controls: OrbitControls = null;

  //#region CAM animation
  enCamAnim = 0;
  camPosIndex: number = 0;
  cameraAnimationTime = 60 * 1.2 /* s */;
  cameraCurve = new THREE.CubicBezierCurve3(
    new THREE.Vector3(0, 25, 0),
    new THREE.Vector3(0, 25, 10),
    new THREE.Vector3(0, 25, 20),
    new THREE.Vector3(30, 25, 30)
  );
  //#endregion CAM animation

  constructor() {
    // this.initGL();
  }

  STLViewer(model: any, elementID: any) {
    var elem = document.getElementById(elementID);
    var camera = new THREE.PerspectiveCamera(
      70,
      elem.clientWidth / elem.clientHeight,
      1,
      1000
    );
    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(elem.clientWidth, elem.clientHeight);
    elem.appendChild(renderer.domElement);
    window.addEventListener(
      'resize',
      function () {
        renderer.setSize(elem.clientWidth, elem.clientHeight);
        camera.aspect = elem.clientWidth / elem.clientHeight;
        camera.updateProjectionMatrix();
      },
      false
    );
    // var controls = new OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    // controls.rotateSpeed = 0.05;
    // controls.dampingFactor = 0.1;
    // controls.enableZoom = true;
    // controls.autoRotate = true;
    // controls.autoRotateSpeed = 0.75;

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.screenSpacePanning = true;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = 400;
    controls.autoRotate = false;

    // controls.minPolarAngle = 0.0 * Math.PI;
    // controls.maxPolarAngle = 0.4 * Math.PI;
    // controls.minAzimuthAngle = -0.25 * Math.PI;
    // controls.maxAzimuthAngle = 0.25 * Math.PI;

    var scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 1.5));

    new STLLoader().load(model, function (geometry: any) {
      var material = new THREE.MeshPhongMaterial({
        color: 0xff5533,
        specular: 100,
        shininess: 100,
      });
      var mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      var middle = new THREE.Vector3();
      geometry.computeBoundingBox();
      geometry.boundingBox.getCenter(middle);
      new THREE.Matrix4().makeTranslation(-middle.x, -middle.y, -middle.z);

      var largestDimension = Math.max(
        geometry.boundingBox.max.x,
        geometry.boundingBox.max.y,
        geometry.boundingBox.max.z
      );
      camera.position.z = largestDimension * 1.5;

      var animate = function () {
        requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };

      animate();
    });
  }

  ngOnInit() {
    /**
     * 1: Sphere
     * 2: Lights
     * 3: gridHelper
     * 4: cam anim
     * 5: obj loader
     * 6: OrbitControls
     * 7: texture
     */
  }

  ngAfterViewInit() {
    this.STLViewer('assets/H-1-R.Final.stl', 'model');
    // this.renderer = new THREE.WebGLRenderer({
    //   canvas: this.rendererContainer.nativeElement,
    //   antialias: true,
    //   alpha: true,
    // });
    // this.renderer.setSize(800, 600, false);
    // this.setOrbitcontrols();
    // this.animate();
  }

  initGL() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      this.cameraDefaults.fov,
      this.cameraDefaults.aspectRatio,
      this.cameraDefaults.near,
      this.cameraDefaults.far
    );
    this.camera.position.copy(this.cameraDefaults.posCamera);
    this.camera.lookAt(this.cameraDefaults.posCameraTarget);
    this.camera.updateProjectionMatrix();

    this.addElements();
    this.setLights();
    this.addGridHelper();
  }

  animate() {
    if (this.renderer) {
      window.requestAnimationFrame(() => this.animate());
      this.controls.update();

      //#region CAM animation
      if (
        this.enCamAnim &&
        this.camPosIndex != null &&
        this.camPosIndex++ < this.cameraAnimationTime
      ) {
        // ease fn
        const camPos = this.cameraCurve.getPoint(
          1 - (1 - this.camPosIndex / this.cameraAnimationTime) ** 2
        );
        this.camera.position.set(camPos.x, camPos.y, camPos.z);
        this.camera.lookAt(this.cameraDefaults.posCameraTarget);
      }
      //#endregion CAM animation

      this.renderer.render(this.scene, this.camera);
    }
  }

  addElements() {
    const path = new THREE.Path();

    path.lineTo(0, 0.8);
    path.quadraticCurveTo(0, 1, 0.2, 1);
    path.lineTo(1, 1);
    path.lineTo(15, 15);

    const points = path.getPoints();
    // const points = [];
    // points.push(new THREE.Vector3(-10, 0, 0));
    // points.push(new THREE.Vector3(0, 10, 0));
    // points.push(new THREE.Vector3(10, 0, 0));

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0x000 });

    const line = new THREE.Line(geometry, material);
    this.scene.add(line);

    var geometry1 = new THREE.SphereGeometry(2, 8, 8);
    var material1 = new THREE.MeshPhongMaterial({
      color: 0x156289,
      emissive: 0x072534,
      side: THREE.DoubleSide,
      flatShading: true,
    });
    var sphere = new THREE.Mesh(geometry1, material1);
    this.scene.add(sphere);
  }

  setLights() {
    this.scene.add(new THREE.AmbientLight(0xaaaaaa));
    const light1 = new THREE.PointLight(0xc0c090, 0.33);
    const light2 = new THREE.PointLight(0xc0c090, 0.33);
    const light3 = new THREE.PointLight(0xc0c090, 0.33);
    light1.position.set(-300, 100, -300);
    light2.position.set(300, 100, -300);
    light3.position.set(-300, -100, 300);
    this.scene.add(light1);
    this.scene.add(light2);
    this.scene.add(light3);
  }

  addGridHelper() {
    var size = 10;
    var divisions = 10;

    var gridHelper = new THREE.GridHelper(size, divisions);
    this.scene.add(gridHelper);
  }

  setOrbitcontrols() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.screenSpacePanning = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 10;
    this.controls.maxDistance = 400;
    this.controls.autoRotate = false;

    this.controls.minPolarAngle = 0.0 * Math.PI;
    this.controls.maxPolarAngle = 0.4 * Math.PI;
    this.controls.minAzimuthAngle = -0.25 * Math.PI;
    this.controls.maxAzimuthAngle = 0.25 * Math.PI;
  }

  addObjElements() {
    let objLoader = new OBJLoader();
    objLoader.load('assets/scene.obj', (o) => {
      for (let ch of o.children) {
        (ch as THREE.Mesh).material = new THREE.MeshPhongMaterial({
          color: ~~(Math.random() * 0xffffff),
        });
      }
      this.scene.add(o);
    });
  }
}
