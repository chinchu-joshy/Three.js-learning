import { useEffect } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pathfinding, PathfindingHelper } from "three-pathfinding";
function NewBurry() {
  useEffect(() => {
    /* ---------------------------- Basic scene setup --------------------------- */

    const scene = new THREE.Scene();
    const canvas = document.querySelector("#canvas");

    const camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.y = 10;
    camera.position.z = 10;
    camera.position.x = 33;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;

   

    /* ------------------------ Add lighting to the scene ----------------------- */

    const light = new THREE.AmbientLight(0xffffff, 0.7); // soft white light
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.x = 20;
    directionalLight.positiony = 30;
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 4096;
    directionalLight.shadow.mapSize.height = 4096;
    const d = 35;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    scene.add(directionalLight);

    /* ---------------------------- Loading 3D model ---------------------------- */
const loader = new FBXLoader()
loader.load('model/NewburyCabinet.fbx',(object)=>{
    object.scale.set(0.05,0.05,0.05)
    scene.add(object)
})
   
   
   
   

    /* ------------------------------- raycasting ------------------------------- */

   
    /* ----------------------------- Orbit controls ----------------------------- */

    const orbitControls = new OrbitControls(camera, renderer.domElement);

    orbitControls.enableDamping = true;
    orbitControls.enablePan = true;
    orbitControls.minDistance = 5;
    orbitControls.maxDistance = 60;
    orbitControls.maxPolarAngle = Math.PI / 2 - 0.05;
    orbitControls.minPolarAngle = Math.PI / 4;
    orbitControls.update();

    /* ----------------------------- Animation frame ---------------------------- */

    function animate() {
      requestAnimationFrame(animate);
   
      window.addEventListener("resize", onWindowResize);
      orbitControls.update();
      renderer.render(scene, camera);
    }
    function onWindowResize() {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate();
  }, []);

  return (
    <div>
      <canvas id="canvas"> </canvas>
    </div>
  );
}

export default NewBurry;
