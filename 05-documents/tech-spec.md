# 极光职途 — 技术规格文档

## 依赖清单

| 包名 | 版本 | 用途 |
|------|------|------|
| react | ^18.2 | UI 框架 |
| react-dom | ^18.2 | DOM 渲染 |
| three | ^0.160 | 3D 引擎（星域粒子系统） |
| @react-three/fiber | ^8.15 | React 声明式 Three.js 渲染 |
| @react-three/drei | ^9.92 | Three.js 辅助工具（OrbitControls 等） |
| framer-motion | ^11.0 | React 动画（悬浮卡片漂移、页面切换） |
| lenis | ^1.0 | 平滑滚动引擎（核心依赖，驱动速度扭曲特效） |
| tailwindcss | ^3.4 | 原子化 CSS |
| typescript | ^5.3 | 类型系统 |
| vite | ^5.0 | 构建工具 |
| @types/three | ^0.160 | Three.js 类型定义 |

## 组件清单

### shadcn/ui (内置)
通过 init-webapp.sh 已预装 40+ 组件，本项目直接使用：
- `Button` — 主要行动按钮
- `Card` — 功能卡片容器
- `Badge` — 标签/状态标记
- `Dialog` — 弹窗（简历上传确认等）
- `Input` / `Textarea` — 表单输入
- `Tabs` — 功能区切换
- `Progress` — 简历评分进度条
- `ScrollArea` — 长文本滚动区域

### 自定义组件

| 组件名 | 位置 | 说明 |
|--------|------|------|
| StarfieldWave | `components/StarfieldWave.tsx` | Three.js 全屏粒子系统，固定在最底层 |
| CrystalCard | `components/CrystalCard.tsx` | 液态水晶质感卡片，含自定义 Shader Material |
| VelocitySkewText | `components/VelocitySkewText.tsx` | 速度扭曲文本组件，监听 Lenis velocity |
| FloatingNav | `components/FloatingNav.tsx` | 左侧悬浮导航线 |
| LoadingScreen | `components/LoadingScreen.tsx` | 加载动画（发光多面体爆裂效果） |
| ResumeAnalyzer | `sections/ResumeAnalyzer.tsx` | 简历分析功能区 |
| InterviewCoach | `sections/InterviewCoach.tsx` | 模拟面试功能区 |
| JobRadar | `sections/JobRadar.tsx` | 岗位雷达功能区 |
| SkillMap | `sections/SkillMap.tsx` | 技能图谱功能区 |

## 动画实现表

| 动画 | 库 | 实现方式 | 复杂度 |
|------|-----|---------|--------|
| 星域波浪宇宙 (4500粒子) | Three.js 原生 Shader | BufferGeometry + 自定义 Vertex/Fragment Shader，双图层正弦波 | 🔒 High |
| 鼠标视差倾斜 | Three.js (useFrame) | 在 R3F 的 useFrame 中根据鼠标位置插值旋转相机 | Medium |
| 滚轮Z轴穿梭 | Lenis + Three.js | Lenis scroll 事件映射到相机 Z 轴位置 | Medium |
| 液态水晶边缘流光 | Three.js Shader | 自定义 ShaderMaterial，边缘 smoothstep 环形 + glow | 🔒 High |
| 鼠标驱动水波形变 | Three.js Shader | Shader 中根据 u_mouse 做 UV 偏移 | Medium |
| 点击涟漪扩散 | Raycaster + Shader | 获取击中点写入 u_hitPoint，片元着色器做距离衰减 | Medium |
| 卡片悬浮漂移 | Framer Motion | animate x/y 缓慢正弦漂移，hover 时增强发光 | Low |
| 极速扭曲滚动 | Lenis + CSS | lenis.on('scroll') 映射 velocity → skewX/scaleY/scaleX + CSS 变量伪元素残影 | 🔒 High |
| 加载动画爆裂 | Framer Motion | 发光多面体旋转 → scale(20) + opacity(0) 消散 | Medium |
| 页面平滑切换 | Lenis | lerp: 0.1 全局接管 | Low |

## 状态与逻辑规划

### Lenis 全局实例管理
Lenis 实例必须在根组件（App.tsx）创建，通过 React Context 向下传递。原因：
- `VelocitySkewText` 需要监听 `lenis.on('scroll')` 获取 velocity
- `StarfieldWave` 需要读取 scroll position 映射相机 Z 轴
- 所有页面切换都依赖 Lenis 的 `scrollTo()`

### Three.js ↔ React 状态桥接
R3F 的 `useThree()` 获取的相机/渲染器只在 Canvas 内部可用。StarfieldWave 的相机 Z 轴位移由外部 Lenis 驱动，需要：
- 在 App 中维护 `scrollProgress` ref
- 通过 R3F 的 `useFrame` 每帧读取该 ref 更新相机

### CrystalCard Shader Uniforms 管理
每张水晶卡片独立维护一组 Shader Uniforms：
- `u_time`: 全局时间（所有卡片共享一个时钟）
- `u_mouse`: 鼠标在卡片上的归一化位置 (0-1)
- `u_intensity`: 根据鼠标距离计算的发光强度
- `u_hitPoint`: 点击涟漪触发点（局部坐标）

使用 `useRef` + `useFrame` 模式，避免 React 重渲染。

## 项目文件结构

```
/mnt/agents/output/app/
├── src/
│   ├── components/
│   │   ├── StarfieldWave.tsx      # Three.js 全屏星域粒子系统
│   │   ├── CrystalCard.tsx         # 液态水晶卡片（含自定义 Shader）
│   │   ├── VelocitySkewText.tsx    # 速度扭曲文本
│   │   ├── FloatingNav.tsx         # 左侧悬浮导航
│   │   └── LoadingScreen.tsx       # 加载动画
│   ├── sections/
│   │   ├── HeroSection.tsx         # 首屏（标题 + 水晶集群）
│   │   ├── ResumeAnalyzer.tsx      # 简历智析功能区
│   │   ├── InterviewCoach.tsx      # 模拟面试功能区
│   │   ├── JobRadar.tsx            # 岗位雷达功能区
│   │   └── SkillMap.tsx            # 技能图谱功能区
│   ├── hooks/
│   │   ├── useLenis.ts             # Lenis 实例访问 Hook
│   │   └── useMousePosition.ts     # 全局鼠标位置追踪
│   ├── shaders/
│   │   ├── starfield.vert.glsl     # 星域顶点着色器
│   │   ├── starfield.frag.glsl     # 星域片元着色器
│   │   ├── crystal.vert.glsl       # 水晶顶点着色器
│   │   └── crystal.frag.glsl       # 水晶片元着色器
│   ├── App.tsx                     # 根组件（Lenis + 三层结构）
│   ├── main.tsx                    # 入口文件
│   └── index.css                   # 全局样式 + 速度扭曲 CSS 变量
├── public/
│   └── images/                     # 生成资源
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

## 关键实现决策

1. **Three.js 原生 vs R3F**: StarfieldWave 使用 R3F 封装（`<Canvas>` + `<points>`），但 Shader 使用原生 Three.js ShaderMaterial（非 @react-three/drei 的 shaderMaterial helper），以获得最大控制权。

2. **Lenis 版本**: 使用 `lenis` v1.x（非 `@studio-freight/lenis`），新包名，API 更稳定。

3. **CSS 变量驱动扭曲**: VelocitySkewText 的伪元素残影效果通过 CSS 变量 `--skew` 和 `--x` 驱动，而非 Framer Motion。原因：每帧 60fps 更新 CSS 变量比调用动画库开销更小。

4. **纹理加载**: 水晶卡片的焦散纹理使用程序化生成（shader 内计算），无需外部图片资源，减少加载时间。
