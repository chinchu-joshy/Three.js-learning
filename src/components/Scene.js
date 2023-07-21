import { useEffect } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Pathfinding, PathfindingHelper } from "three-pathfinding";
function Scene() {
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
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight.position.x = 20;
    directionalLight.position.y = 50;
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
  
    const texture = new THREE.TextureLoader().load('texture/wall.avif' ); 
    
    texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
texture.repeat.set( 4, 4 );
    loader.load("model/demo-level.glb", (object) => {
      object.scene.traverse((child)=>{
        if(child.isMesh){
          
          child.material.map = texture
          // child.material.color = new THREE.Color('#ffffff')
          child.material.needsUpdate = true
          console.log(child)
        }
      })

      scene.add(object.scene);
    });

    const pathfinding = new Pathfinding();
    const pathfindingHelper = new PathfindingHelper();
    scene.add(pathfindingHelper);
    const zone = "level1";
    let navmesh;
    let groupId;
    let navPath;
    const SPEED = 5;
    loader.load("model/demo-level-navmesh.glb", (gltf) => {
      // scene.add(gltf.scene);
      gltf.scene.traverse((node) => {
        if (
          !navmesh &&
          node.isObject3D &&
          node.children &&
          node.children.length > 0
        ) {
          navmesh = node.children[0];
          pathfinding.setZoneData(
            zone,
            Pathfinding.createZone(navmesh.geometry)
          );
        }
      });
    });

    /* ------------------------------- raycasting ------------------------------- */

    const raycaster = new THREE.Raycaster();
    const clickMouse = new THREE.Vector2();
    function intersect(pos) {
      raycaster.setFromCamera(pos, camera);
      return raycaster.intersectObjects(scene.children);
  }
    window.addEventListener("click", (e) => {
      clickMouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      clickMouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(clickMouse, camera);
      const found = intersect(clickMouse)
      
      if (found.length > 0) {
        let target = found[0].point;
       
        groupId = pathfinding.getGroup(zone, agentGroup?.position);
        
        const closest = pathfinding.getClosestNode(
          agentGroup.position,
          zone,
          groupId
        );
        navPath = pathfinding.findPath(closest.centroid, target, zone, groupId);
        if (navPath) {
        
          pathfindingHelper.reset();
          pathfindingHelper.setPlayerPosition(agentGroup.position);
          pathfindingHelper.setTargetPosition(target);
          pathfindingHelper.setPath(navPath);
        }
      }
    });


    /* --------------------------- moving the cylinder -------------------------- */
    const clock = new THREE.Clock();
    function move ( delta ) {
      if ( !navPath || navPath.length <= 0 ) return
  
      let targetPosition = navPath[ 0 ];
      const distance = targetPosition.clone().sub( agentGroup.position );
  
      if (distance.lengthSq() > 0.05 * 0.05) {
          distance.normalize();
          // Move player to target
          agentGroup.position.add( distance.multiplyScalar( delta * SPEED ) );
      } else {
          // Remove node from the path we calculated
          navPath.shift();
      }
  }

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
      move(clock.getDelta())
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

export default Scene;
