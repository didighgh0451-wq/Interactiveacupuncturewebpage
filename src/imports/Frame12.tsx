import img1772364216790019Ca9237290729AB46E633977Ec497B1 from "figma:asset/02c3896894b3f4036ae6b5d52f7811bf461985ed.png";

function Frame() {
  return (
    <div className="relative size-[1024px]">
      <div className="absolute left-0 size-[1024px] top-0" data-name="1772364216790-019ca923-7290-729a-b46e-633977ec497b 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img1772364216790019Ca9237290729AB46E633977Ec497B1} />
      </div>
    </div>
  );
}

function Frame1() {
  return (
    <div className="absolute left-0 size-[1024px] top-0">
      <div className="absolute flex items-center justify-center left-0 size-[1024px] top-0">
        <div className="-scale-y-100 flex-none rotate-180">
          <Frame />
        </div>
      </div>
    </div>
  );
}

export default function Frame2() {
  return (
    <div className="relative size-full">
      <Frame1 />
    </div>
  );
}