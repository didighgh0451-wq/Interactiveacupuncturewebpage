import img991 from "figma:asset/5dfb652518773eb5df52c829cc7a916e05104066.png";

function Frame() {
  return (
    <div className="absolute h-[1006px] left-0 top-0 w-[1422px]">
      <div className="absolute h-[1006px] left-0 top-0 w-[1422px]" data-name="99 1">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none size-full" src={img991} />
      </div>
    </div>
  );
}

export default function Frame1() {
  return (
    <div className="relative size-full">
      <Frame />
    </div>
  );
}