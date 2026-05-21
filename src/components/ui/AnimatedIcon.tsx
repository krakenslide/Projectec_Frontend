import { useEffect, useMemo, useRef } from "react";
import LottieImport, { type LottieRefCurrentProps } from "lottie-react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Lottie = (LottieImport as any).default ?? LottieImport;

export type AnimatedIconName =
  | "alert"
  | "arrow"
  | "board"
  | "brand"
  | "calendar"
  | "check"
  | "close"
  | "collapse"
  | "done"
  | "drag"
  | "edit"
  | "empty"
  | "expand"
  | "eye"
  | "eyeOff"
  | "flag"
  | "grid"
  | "list"
  | "loading"
  | "lock"
  | "logout"
  | "mail"
  | "menu"
  | "plus"
  | "progress"
  | "projects"
  | "search"
  | "todo"
  | "trash";

interface AnimatedIconProps {
  className?: string;
  loop?: boolean;
  name: AnimatedIconName;
  play?: boolean;
  size?: number;
}

type Point = [number, number];
type Stroke = { color: number[]; width: number };
type LottieShape = Record<string, unknown> & { _stroke?: Stroke; nm?: string };

const teal = [0.078, 0.722, 0.651, 1];
const muted = [0.616, 0.651, 0.69, 1];
const danger = [0.957, 0.247, 0.369, 1];
const warning = [0.961, 0.62, 0.043, 1];
const success = [0.133, 0.773, 0.369, 1];

const baseTransform = {
  p: { a: 0, k: [0, 0] },
  a: { a: 0, k: [0, 0] },
  s: { a: 0, k: [100, 100] },
  r: { a: 0, k: 0 },
  o: { a: 0, k: 100 },
  sk: { a: 0, k: 0 },
  sa: { a: 0, k: 0 },
  nm: "Transform",
};

function opacityKeyframes(from = 72, to = 100) {
  return {
    a: 1,
    k: [
      { t: 0, s: [from], e: [to] },
      { t: 24, s: [to], e: [from] },
      { t: 48, s: [from] },
    ],
  };
}

function line(name: string, points: Point[], color = muted, width = 4): LottieShape {
  return {
    ty: "sh",
    nm: `${name} Path`,
    ks: {
      a: 0,
      k: {
        i: points.map(() => [0, 0]),
        o: points.map(() => [0, 0]),
        v: points,
        c: false,
      },
    },
    _stroke: { color, width },
  };
}

function circle(
  name: string,
  position: Point,
  size: Point,
  color = teal,
  width = 4
): LottieShape {
  return {
    ty: "el",
    nm: `${name} Ellipse`,
    p: { a: 0, k: position },
    s: { a: 0, k: size },
    _stroke: { color, width },
  };
}

function rect(
  name: string,
  position: Point,
  size: Point,
  color = muted,
  width = 4
): LottieShape {
  return {
    ty: "rc",
    nm: `${name} Rect`,
    p: { a: 0, k: position },
    s: { a: 0, k: size },
    r: { a: 0, k: 5 },
    _stroke: { color, width },
  };
}

function layer(name: string, rawShapes: LottieShape[], rotate = false, pulse = false) {
  const shapes = rawShapes.map((shape) => ({
    ty: "gr",
    nm: shape.nm,
    np: 3,
    it: [
      Object.fromEntries(
        Object.entries(shape).filter(([key]) => !key.startsWith("_"))
      ),
      {
        ty: "st",
        c: { a: 0, k: shape._stroke?.color || muted },
        o: { a: 0, k: 100 },
        w: { a: 0, k: shape._stroke?.width || 4 },
        lc: 2,
        lj: 2,
        nm: `${shape.nm} Stroke`,
      },
      { ty: "tr", ...baseTransform },
    ],
  }));

  return {
    ddd: 0,
    ind: 1,
    ty: 4,
    nm: name,
    sr: 1,
    ks: {
      o: pulse ? opacityKeyframes() : { a: 0, k: 100 },
      r: rotate
        ? {
          a: 1,
          k: [
            { t: 0, s: [0], e: [6] },
            { t: 24, s: [6], e: [0] },
            { t: 48, s: [0] },
          ],
        }
        : { a: 0, k: 0 },
      p: { a: 0, k: [32, 32, 0] },
      a: { a: 0, k: [0, 0, 0] },
      s: { a: 0, k: [100, 100, 100] },
    },
    ao: 0,
    shapes,
    ip: 0,
    op: 48,
    st: 0,
    bm: 0,
  };
}

function shapesFor(name: AnimatedIconName) {
  switch (name) {
    case "brand":
      return [circle("brand", [0, 0], [34, 34], teal), line("stack", [[-10, 0], [0, -8], [10, 0], [0, 8], [-10, 0]], teal)];
    case "projects":
      return [line("tab", [[-16, -10], [-6, -10], [-2, -5], [16, -5]]), rect("folder", [0, 4], [38, 26], teal)];
    case "board":
      return [rect("board", [0, 0], [38, 32], teal), line("divider1", [[-6, -16], [-6, 16]]), line("divider2", [[7, -16], [7, 16]])];
    case "search":
      return [circle("lens", [-4, -4], [24, 24], teal), line("handle", [[8, 8], [18, 18]], teal)];
    case "grid":
      return [rect("a", [-9, -9], [12, 12], teal), rect("b", [9, -9], [12, 12]), rect("c", [-9, 9], [12, 12]), rect("d", [9, 9], [12, 12], teal)];
    case "list":
      return [line("row1", [[-14, -10], [16, -10]], teal), line("row2", [[-14, 0], [16, 0]]), line("row3", [[-14, 10], [16, 10]])];
    case "plus":
      return [line("v", [[0, -14], [0, 14]], teal), line("h", [[-14, 0], [14, 0]], teal)];
    case "close":
      return [line("x1", [[-12, -12], [12, 12]], danger), line("x2", [[12, -12], [-12, 12]], danger)];
    case "edit":
      return [line("pen", [[-12, 12], [10, -10]], teal), line("tip", [[8, -14], [14, -8]]), line("base", [[-14, 15], [-4, 12]])];
    case "trash":
      return [line("lid", [[-14, -12], [14, -12]], danger), rect("bin", [0, 4], [24, 30], danger), line("slot", [[0, -16], [0, -12]], danger)];
    case "calendar":
      return [rect("calendar", [0, 2], [34, 32], teal), line("top", [[-17, -7], [17, -7]]), line("rings", [[-8, -16], [-8, -10], [8, -16], [8, -10]])];
    case "arrow":
      return [line("shaft", [[-14, 0], [12, 0]], teal), line("head", [[4, -8], [12, 0], [4, 8]], teal)];
    case "mail":
      return [rect("mail", [0, 0], [38, 28], teal), line("flap", [[-19, -10], [0, 4], [19, -10]])];
    case "lock":
      return [rect("lock", [0, 6], [30, 24], teal), line("shackle", [[-10, -6], [-10, -14], [10, -14], [10, -6]], teal)];
    case "eye":
      return [line("eye", [[-18, 0], [-8, -9], [0, -11], [8, -9], [18, 0], [8, 9], [0, 11], [-8, 9], [-18, 0]], teal), circle("pupil", [0, 0], [8, 8], teal)];
    case "eyeOff":
      return [line("eye", [[-18, 0], [-8, -9], [0, -11], [8, -9], [18, 0]], muted), line("slash", [[-16, 16], [16, -16]], danger)];
    case "logout":
      return [line("door", [[-14, -14], [-2, -14], [-2, 14], [-14, 14]], muted), line("arrow", [[-2, 0], [16, 0], [8, -8], [16, 0], [8, 8]], danger)];
    case "menu":
      return [line("top", [[-15, -9], [15, -9]], teal), line("mid", [[-15, 0], [15, 0]]), line("bot", [[-15, 9], [15, 9]], teal)];
    case "collapse":
      return [line("panel", [[-10, -16], [-10, 16]]), line("arrow", [[8, -10], [-2, 0], [8, 10]], teal)];
    case "expand":
      return [line("panel", [[-10, -16], [-10, 16]]), line("arrow", [[-2, -10], [8, 0], [-2, 10]], teal)];
    case "flag":
      return [line("pole", [[-12, -16], [-12, 16]], warning), line("flag", [[-12, -14], [12, -10], [-12, -3]], warning)];
    case "todo":
      return [circle("todo", [0, 0], [30, 30], muted)];
    case "progress":
      return [circle("progress", [0, 0], [30, 30], warning), line("hand", [[0, 0], [0, -10], [8, -4]], warning)];
    case "done":
    case "check":
      return [circle("done", [0, 0], [32, 32], success), line("check", [[-10, 0], [-2, 8], [12, -8]], success)];
    case "drag":
      return [circle("d1", [-6, -10], [3, 3]), circle("d2", [6, -10], [3, 3]), circle("d3", [-6, 0], [3, 3]), circle("d4", [6, 0], [3, 3]), circle("d5", [-6, 10], [3, 3]), circle("d6", [6, 10], [3, 3])];
    case "alert":
      return [line("tri", [[0, -16], [17, 14], [-17, 14], [0, -16]], danger), line("bang", [[0, -6], [0, 4]], danger), circle("dot", [0, 10], [3, 3], danger)];
    case "empty":
      return [rect("box", [0, 4], [34, 24], muted), line("lid", [[-12, -10], [12, -10]], teal)];
    case "loading":
      return [circle("load", [0, 0], [32, 32], teal)];
    default:
      return [circle("default", [0, 0], [30, 30], teal)];
  }
}

function createIconData(name: AnimatedIconName) {
  return {
    v: "5.7.4",
    fr: 30,
    ip: 0,
    op: 48,
    w: 64,
    h: 64,
    nm: name,
    ddd: 0,
    assets: [],
    layers: [
      layer(
        name,
        shapesFor(name),
        ["brand", "loading", "progress"].includes(name),
        ["search", "mail", "lock", "empty"].includes(name)
      ),
    ],
  };
}

export function AnimatedIcon({
  className = "",
  loop = false,
  name,
  play = false,
  size = 20,
}: AnimatedIconProps) {
  const lottieRef = useRef<LottieRefCurrentProps>(null);
  const animationData = useMemo(() => createIconData(name), [name]);
  const shouldLoop = loop || name === "loading" || name === "brand";

  useEffect(() => {
    const timer = setTimeout(() => {
      if (play || shouldLoop) {
        lottieRef.current?.play();
      } else {
        lottieRef.current?.goToAndStop(0, true);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [play, shouldLoop]);

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      onFocus={() => lottieRef.current?.play()}
      onMouseEnter={() => lottieRef.current?.play()}
      onMouseLeave={() => {
        if (!shouldLoop && !play) lottieRef.current?.goToAndStop(0, true);
      }}
      style={{ width: size, height: size }}
    >
      <Lottie
        animationData={animationData}
        autoplay={play || shouldLoop}
        loop={shouldLoop}
        lottieRef={lottieRef}
        style={{ width: size, height: size }}
      />
    </span>
  );
}
