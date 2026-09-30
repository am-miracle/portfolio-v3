import {
  BufferAttribute,
  Color,
  Group,
  LinearFilter,
  Mesh,
  PerspectiveCamera,
  PlaneGeometry,
  Points,
  SRGBColorSpace,
  Scene,
  ShaderMaterial,
  Texture,
  TextureLoader,
  Vector2,
  WebGLRenderer,
} from 'three';



const noiseGLSL = /* glsl */ `
  float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
  float noise(vec2 p){
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1,0)), u.x), mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), u.x), u.y);
  }
`;

const meshVertex = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform float uTime;
  uniform float uExplode;
  attribute vec3 aRandom;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    vec3 p = position;
    p.z += d * uDepthScale;
    // slow breathing across the chest
    p.z += sin(uTime * 1.4 + uv.y * 5.0) * 0.006 * d;
    // shatter outward on scroll
    p += (aRandom - 0.5) * vec3(1.6, 1.2, 2.2) * uExplode * uExplode;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const meshFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform sampler2D uDepth;
  uniform vec2 uTexel;
  uniform vec2 uLight;
  uniform vec3 uAccent;
  uniform float uReveal;
  uniform float uExplode;
  uniform float uTime;
  varying vec2 vUv;
  ${noiseGLSL}
  void main() {
    vec4 c = texture2D(uMap, vUv);

    // bottom-up scan with a ragged edge
    float n = noise(vUv * vec2(18.0, 10.0) + uTime * 0.4) * 0.06;
    float edge = uReveal * 1.12 - 0.06 - uExplode * 1.2;
    float y = vUv.y + n;
    if (y > edge) discard;
    float band = smoothstep(edge - 0.035, edge, y);

    // surface normal from the depth map
    float dx = texture2D(uDepth, vUv + vec2(uTexel.x, 0.0)).r - texture2D(uDepth, vUv - vec2(uTexel.x, 0.0)).r;
    float dy = texture2D(uDepth, vUv + vec2(0.0, uTexel.y)).r - texture2D(uDepth, vUv - vec2(0.0, uTexel.y)).r;
    vec3 N = normalize(vec3(-dx * 9.0, -dy * 9.0, 1.0));
    vec3 L = normalize(vec3(uLight, 0.9));
    float diff = max(dot(N, L), 0.0);
    float rim = pow(1.0 - max(N.z, 0.0), 2.5);

    vec3 col = c.rgb * (0.72 + 0.42 * diff);
    col += uAccent * rim * 0.12 * smoothstep(0.9, 1.0, c.a);
    col = mix(col, uAccent, band);

    gl_FragColor = vec4(col, smoothstep(0.3, 0.7, c.a));
    #include <colorspace_fragment>
  }
`;

const pointsVertex = /* glsl */ `
  uniform sampler2D uDepth;
  uniform float uDepthScale;
  uniform float uAssemble;
  uniform float uExplode;
  uniform float uTime;
  uniform float uSize;
  attribute vec3 aRandom;
  varying vec2 vUv;
  varying float vT;
  void main() {
    vUv = uv;
    float d = texture2D(uDepth, uv).r;
    vec3 target = position;
    target.z += d * uDepthScale;

    // staggered arrival: bottom rows + random jitter first
    float delay = aRandom.x * 0.28 + (1.0 - uv.y) * 0.22;
    float t = clamp((uAssemble - delay) / 0.5, 0.0, 1.0);
    t = 1.0 - pow(1.0 - t, 4.0);

    // start as a scattered spherical cloud, spiralling in around the Y axis
    vec3 dir = normalize(aRandom * 2.0 - 1.0 + 0.0001);
    vec3 start = dir * (1.8 + aRandom.z * 2.4);
    start.z = min(start.z, 1.2) - 0.6;
    float spin = (1.0 - t) * (2.5 + aRandom.y * 2.0);
    float cs = cos(spin), sn = sin(spin);
    start.xz = mat2(cs, -sn, sn, cs) * start.xz;
    vec3 p = mix(start, target, t);

    // explode on scroll
    float e = uExplode;
    p += (aRandom - 0.5) * vec3(3.0, 2.4, 4.0) * e * (0.6 + e);
    p.y += e * e * aRandom.y * 0.8;

    // idle shimmer once assembled
    p.z += sin(uTime * 2.0 + aRandom.x * 40.0) * 0.004 * t;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (1.0 + (1.0 - t) * 1.6 + e * 2.0) / -mv.z;
    vT = t * (1.0 - e);
  }
`;

const pointsFragment = /* glsl */ `
  uniform sampler2D uMap;
  uniform vec3 uAccent;
  uniform float uReveal;
  uniform float uExplode;
  varying vec2 vUv;
  varying float vT;
  void main() {
    vec4 c = texture2D(uMap, vUv);
    if (c.a < 0.5) discard;
    vec3 col = mix(uAccent, c.rgb, smoothstep(0.2, 0.95, vT));
    // hand over to the solid mesh once it is scanned in; come back when exploding
    float alpha = mix(1.0, 0.0, smoothstep(0.55, 1.0, uReveal)) + uExplode;
    if (alpha <= 0.01) discard;
    gl_FragColor = vec4(col, clamp(alpha, 0.0, 1.0));
    #include <colorspace_fragment>
  }
`;

export interface PortraitHandle {
  intro(): void;
  setExplode(v: number): void;
  destroy(): void;
}

interface Options {
  color: string;
  depth: string;
  accent?: string;
  reducedMotion?: boolean;
  onReady?: () => void;
}

const loadTexture = (loader: TextureLoader, url: string) =>
  new Promise<Texture>((resolve, reject) => loader.load(url, resolve, undefined, reject));

function randomAttribute(count: number) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < arr.length; i++) arr[i] = Math.random();
  return new BufferAttribute(arr, 3);
}

export function supportsWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!c.getContext('webgl2');
  } catch {
    return false;
  }
}

export function createPortrait(container: HTMLElement, opts: Options): PortraitHandle {
  const isSmall = window.matchMedia('(max-width: 767px)').matches;
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.75 : 2));
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  renderer.domElement.className = 'absolute inset-0 size-full';
  renderer.domElement.setAttribute('aria-hidden', 'true');
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  const group = new Group();
  scene.add(group);

  const accent = new Color(opts.accent ?? '#d7ff3e');
  const state = {
    assemble: opts.reducedMotion ? 1 : 0,
    reveal: opts.reducedMotion ? 1 : 0,
    explode: 0,
    mouse: new Vector2(),
    smooth: new Vector2(),
    drag: 0,
    visible: true,
    raf: 0,
    ready: false,
    aspect: 958 / 1400,
    destroyed: false,
  };

  const uniforms = {
    uMap: { value: null as Texture | null },
    uDepth: { value: null as Texture | null },
    uDepthScale: { value: 0.42 },
    uTexel: { value: new Vector2(1 / 479, 1 / 700) },
    uLight: { value: new Vector2(0.3, 0.4) },
    uAccent: { value: accent },
    uAssemble: { value: state.assemble },
    uReveal: { value: state.reveal },
    uExplode: { value: 0 },
    uTime: { value: 0 },
    uSize: { value: 0 },
  };

  let mesh: Mesh<PlaneGeometry, ShaderMaterial> | undefined;
  let points: Points<PlaneGeometry, ShaderMaterial> | undefined;

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // fit the 2-unit-tall plane: by height, or by width on narrow boxes
    const fitH = 1 / Math.tan((camera.fov * Math.PI) / 360);
    const fitW = fitH * (state.aspect / camera.aspect);
    camera.position.z = Math.max(fitH, fitW) * 1.08 + 0.2;
    camera.updateProjectionMatrix();
    uniforms.uSize.value = (h / 320) * renderer.getPixelRatio() * (isSmall ? 3.2 : 2.6);
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const io = new IntersectionObserver(([entry]) => {
    state.visible = !!entry?.isIntersecting;
    if (state.visible && !state.raf) loop();
  });
  io.observe(container);

  const onPointer = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    state.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -(((e.clientY - r.top) / r.height) * 2 - 1));
    state.mouse.clampScalar(-1.4, 1.4);
  };
  window.addEventListener('pointermove', onPointer, { passive: true });

  const loader = new TextureLoader();
  Promise.all([loadTexture(loader, opts.color), loadTexture(loader, opts.depth)])
    .then(([map, depth]) => {
      if (state.destroyed) return;
      map.colorSpace = SRGBColorSpace;
      map.anisotropy = renderer.capabilities.getMaxAnisotropy();
      depth.minFilter = depth.magFilter = LinearFilter;
      depth.generateMipmaps = false;
      uniforms.uMap.value = map;
      uniforms.uDepth.value = depth;
      const img = map.image as HTMLImageElement;
      state.aspect = img.width / img.height;
      uniforms.uTexel.value.set(1 / (depth.image as HTMLImageElement).width, 1 / (depth.image as HTMLImageElement).height);

      const w = state.aspect * 2;
      const meshGeo = new PlaneGeometry(w, 2, isSmall ? 130 : 210, isSmall ? 190 : 306);
      meshGeo.setAttribute('aRandom', randomAttribute(meshGeo.attributes.position!.count));
      mesh = new Mesh(
        meshGeo,
        new ShaderMaterial({
          uniforms,
          vertexShader: meshVertex,
          fragmentShader: meshFragment,
          transparent: false,
          alphaToCoverage: true,
        }),
      );

      const ptsGeo = new PlaneGeometry(w, 2, isSmall ? 100 : 170, isSmall ? 146 : 248);
      ptsGeo.setAttribute('aRandom', randomAttribute(ptsGeo.attributes.position!.count));
      points = new Points(
        ptsGeo,
        new ShaderMaterial({
          uniforms,
          vertexShader: pointsVertex,
          fragmentShader: pointsFragment,
          transparent: true,
          depthWrite: false,
        }),
      );
      points.renderOrder = 1;

      group.add(mesh, points);
      resize();
      state.ready = true;
      if (wantIntro) introStart = performance.now();
      opts.onReady?.();
    })
    .catch((err) => console.warn('[portrait] failed to load', err));

  const start = performance.now();
  let introStart = -1;
  let wantIntro = false;

  const loop = () => {
    state.raf = 0;
    if (state.destroyed || !state.visible) return;
    state.raf = requestAnimationFrame(loop);
    const t = (performance.now() - start) / 1000;
    uniforms.uTime.value = t;

    // intro choreography: particles converge (0→2.2s), then the skin scans in (1.7→3.4s)
    if (introStart >= 0 && !opts.reducedMotion) {
      const k = (performance.now() - introStart) / 1000;
      state.assemble = Math.min(k / 2.2, 1);
      state.reveal = Math.min(Math.max((k - 1.7) / 1.7, 0), 1);
    }
    uniforms.uAssemble.value = state.assemble;
    uniforms.uReveal.value = state.reveal * (1 - Math.min(state.explode * 2.5, 1));
    uniforms.uExplode.value = state.explode;

    // follow the pointer with easing + a lazy idle sway
    const sway = opts.reducedMotion ? 0 : Math.sin(t * 0.5) * 0.12;
    state.smooth.lerp(state.mouse, 0.06);
    group.rotation.y = state.smooth.x * 0.42 + sway;
    group.rotation.x = -state.smooth.y * 0.14;
    group.position.y = opts.reducedMotion ? 0 : Math.sin(t * 0.9) * 0.015;
    uniforms.uLight.value.set(0.35 + state.smooth.x * 0.9, 0.45 + state.smooth.y * 0.6);

    if (state.ready) renderer.render(scene, camera);
  };
  loop();

  return {
    intro() {
      if (opts.reducedMotion) return;
      wantIntro = true;
      if (state.ready) introStart = performance.now();
    },
    setExplode(v: number) {
      state.explode = Math.min(Math.max(v, 0), 1);
    },
    destroy() {
      state.destroyed = true;
      cancelAnimationFrame(state.raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      mesh?.geometry.dispose();
      mesh?.material.dispose();
      points?.geometry.dispose();
      points?.material.dispose();
      uniforms.uMap.value?.dispose();
      uniforms.uDepth.value?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
