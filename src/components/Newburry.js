import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
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

    /* ------------------ Adding a simple geometry to the scene ----------------- */

    const agentHeight = 1.0;
    const agentRadius = 0.25;
    const agent = new THREE.Mesh(
      new THREE.CylinderGeometry(agentRadius, agentRadius, agentHeight),
      new THREE.MeshPhongMaterial({ color: "green" })
    );
    agent.position.y = agentHeight / 2;
    const agentGroup = new THREE.Group();
    agentGroup.add(agent);
    agentGroup.position.z = 0;
    agentGroup.position.x = 0;
    agentGroup.position.y = 1;
    scene.add(agentGroup);

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

    const loader = new GLTFLoader();

    loader.load("model/demo-level.glb", (object) => {
      scene.add(object.scene);
    });
    const pathfinding = new Pathfinding();
    const pathfindingHelper = new PathfindingHelper();
    scene.add(pathfindingHelper);
   
   

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
